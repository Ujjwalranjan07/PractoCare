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
    console.log("Download started", selectedPrescription);
    console.log("Prescription ref exists:", !!prescriptionRef.current);
    console.log("Prescription ref details:", prescriptionRef.current ? "Has content" : "Empty ref");
    
    if (!selectedPrescription) {
      console.error("Missing prescription");
      toast({
        title: "Error",
        description: "Unable to generate prescription: No prescription selected.",
        variant: "destructive"
      });
      return;
    }
    
    if (!prescriptionRef.current) {
      console.error("Missing ref");
      toast({
        title: "Error",
        description: "Unable to generate prescription: Reference element not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Prescription element found, proceeding with PDF generation");
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your prescription...",
      });

      // Add a small delay to ensure the prescription template is fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const prescriptionElement = prescriptionRef.current;
      
      // Enhanced html2canvas configuration for better compatibility
      const canvas = await html2canvas(prescriptionElement, {
        scale: 2, // Higher scale for better quality
        backgroundColor: "#ffffff", // White background
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow tainted canvas
        scrollX: 0,
        scrollY: 0,
        logging: false, // Disable logging for production
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            images[i].crossOrigin = 'anonymous';
          }
          return clonedDoc;
        }
      })

      // Use a more reliable image format with better quality
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      // Create PDF with proper configuration
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add the image to the PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      
      // Force download with a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`Prescription_${selectedPrescription.id}_${timestamp}.pdf`)

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
    <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-xl overflow-hidden w-full">
      <CardHeader className="border-b border-blue-100 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Pill className="w-6 h-6 mr-3 text-blue-600" />
              My Prescriptions
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-lg">
              View and manage your medical prescriptions
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-base">
              {prescriptions.length} Total
            </Badge>
            <Button
              variant="outline" 
              size="default" 
              className="border-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white bg-white shadow-md w-full sm:w-auto px-6 py-5 transition-colors"
              onClick={handleNewPrescription}
            >
              <Plus className="w-5 h-5 mr-2" /> New Prescription
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 sm:p-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-6"></div>
            <p className="text-gray-600 text-lg">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-5" />
            <h3 className="text-xl font-medium text-gray-700 mb-3">No Prescriptions Found</h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              You don't have any prescriptions yet. They will appear here after your doctor creates them.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1">
            {prescriptions.map((prescription) => (
              <motion.div
                key={prescription.id}
                className="bg-white rounded-lg p-8 border border-blue-100 hover:border-blue-300 transition-colors duration-300 h-full flex flex-col shadow-lg overflow-hidden"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-gray-800 font-medium text-xl mb-3 flex items-center flex-wrap">
                      <span className="mr-2 truncate">{prescription.doctorName.startsWith('Dr.') ? prescription.doctorName : `Dr. ${prescription.doctorName}`}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 whitespace-nowrap">
                        {prescription.medicines.length} Medicines
                      </Badge>
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{formatDate(prescription.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="outline"
                      size="default"
                      className="border-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white bg-white shadow-md hover:shadow-lg w-full sm:w-auto min-w-[140px] py-5 transition-colors"
                      onClick={() => handleViewDetails(prescription)}
                      type="button"
                    >
                      <FileText className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">View Details</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-700 hover:text-white bg-white shadow-md hover:shadow-lg w-full sm:w-auto min-w-[140px] py-5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // First set the selected prescription and open the dialog
                        setSelectedPrescription(prescription);
                        setIsDetailsOpen(true);
                        
                        // Force a repaint and ensure dialog is fully rendered before downloading
                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            setTimeout(() => {
                              if (prescriptionRef.current) {
                                handleDownloadPrescription();
                              } else {
                                console.error("Prescription ref not available after delay");
                                toast({
                                  title: "Error",
                                  description: "Unable to generate prescription. Please try using the Download button inside the details view.",
                                  variant: "destructive"
                                });
                              }
                            }, 3000);
                          });
                        });
                      }}
                      type="button"
                    >
                      <Download className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Download</span>
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
            
            <div className="p-6">
              {selectedPrescription && (
                <div 
                  ref={prescriptionRef}
                  onLoad={() => console.log("Prescription ref loaded")}
                >
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
                </div>
              )}
            </div>
            
            {/* Download Button */}
            <div className="flex justify-end p-6 pt-0">
              <Button 
                onClick={() => {
                  // Add a longer delay to ensure the dialog is fully rendered
                  if (!prescriptionRef.current) {
                    console.error("Prescription ref not available");
                    toast({
                      title: "Error",
                      description: "Please wait for the prescription to load completely and try again.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // Force a repaint before downloading
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        handleDownloadPrescription();
                      }, 1500);
                    });
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-colors"
                size="lg"
                type="button"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}