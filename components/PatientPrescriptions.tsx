"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { prescriptionsAPI, Prescription } from "@/lib/prescriptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pill, Calendar, Clock, FileText, AlertCircle, Plus, Download, X } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import PrescriptionTemplate from "@/components/PrescriptionTemplate"

export function PatientPrescriptions({ prescriptions: propPrescriptions, onViewDetails }: { prescriptions?: Prescription[], onViewDetails?: (prescription: Prescription) => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(propPrescriptions ? false : true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const prescriptionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If prescriptions are provided as props, use them
    if (propPrescriptions) {
      setPrescriptions(propPrescriptions)
      setLoading(false)
      return
    }
    
    // Otherwise fetch prescriptions from API
    const fetchPrescriptions = async () => {
      if (user?.id) {
        try {
          setLoading(true)
          const data = await prescriptionsAPI.getByPatientId(user.id)
          setPrescriptions(data)
        } catch (error) {
          console.error("Error fetching prescriptions:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPrescriptions()
  }, [user?.id, propPrescriptions])

  const handleViewDetails = (prescription: Prescription) => {
    if (onViewDetails) {
      // If onViewDetails prop is provided, use it
      onViewDetails(prescription)
    } else {
      // Otherwise use the default behavior
      setSelectedPrescription(prescription)
      setIsDetailsOpen(true)
    }
  }

  const handleNewPrescription = () => {
    // Redirect to the doctor's new prescription page
    try {
      router.push('/doctor/prescriptions/new')
    } catch (error) {
      console.error("Error navigating to new prescription page:", error)
      toast({
        title: "Navigation Error",
        description: "Could not navigate to the new prescription page. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const handleDownloadPrescription = async () => {
    if (!selectedPrescription || !prescriptionRef.current) return

    try {
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your prescription...",
      })

      const prescriptionElement = prescriptionRef.current
      const canvas = await html2canvas(prescriptionElement, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff", // White background
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Prescription_${selectedPrescription.id}.pdf`)

      toast({
        title: "Success",
        description: "Prescription downloaded successfully!",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download prescription. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <CardHeader className="border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-blue-600" />
              My Prescriptions
            </CardTitle>
            <CardDescription className="text-gray-600">
              View and manage your medical prescriptions
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {prescriptions.length} Total
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white/80 backdrop-blur-sm shadow-md"
              onClick={handleNewPrescription}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Prescriptions Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You don't have any prescriptions yet. They will appear here after your doctor creates them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <motion.div
                key={prescription.id}
                className="bg-white/80 rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-gray-800 font-medium mb-1 flex items-center">
                      <span className="mr-2">Dr. {prescription.doctorName}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {prescription.medicines.length} Medicines
                      </Badge>
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                        {formatDate(prescription.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white/80 backdrop-blur-sm shadow-md"
                      onClick={() => handleViewDetails(prescription)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 backdrop-blur-sm shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrescription(prescription);
                        setTimeout(handleDownloadPrescription, 100);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Prescription Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg text-gray-900 max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Prescription Details
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsDetailsOpen(false)}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription className="text-gray-600">
                View your complete prescription details
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6" ref={prescriptionRef}>
              {selectedPrescription && (
                <PrescriptionTemplate 
                  prescription={selectedPrescription}
                  hospitalName="HealthPlus Medical Center"
                  hospitalAddress="123 Healthcare Avenue, Medical District"
                  hospitalContact="+1 (555) 123-4567 | info@healthplus.com"
                  doctorQualifications="MD, MBBS"
                  doctorRegistrationNumber="REG12345"
                  doctorDepartment="General Medicine"
                  patientAge="35"
                  patientGender="Female"
                  patientId={selectedPrescription.patientId || "PAT-" + Math.floor(Math.random() * 100000)}
                />
              )}
            </div>
            
            {/* Download Button */}
            <div className="flex justify-end p-6 pt-0">
              <Button 
                onClick={handleDownloadPrescription}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}