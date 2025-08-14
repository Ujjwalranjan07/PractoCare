"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import "../../../../styles/hover-fix.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, User, ArrowLeft, Download, Filter } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

type Medicine = {
  name: string
  dosage: string
  duration: string
}

type Prescription = {
  id: string
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  appointmentId: string
  date: string
  medicines: Medicine[]
  notes: string
}

type Appointment = {
  id: string
  doctorId: string
  patientId: string
  doctorName: string
  patientName: string
  specialty: string
  date: string
  time: string
  status: string
  consultationType: string
  symptoms: string
  diagnosis?: string
  fee: number
}

type HistoryItem = {
  date: string
  type: string
  details: Appointment | null
  prescriptions: Prescription[]
}

type MedicalHistory = {
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
  history: HistoryItem[]
  stats: {
    totalAppointments: number
    totalPrescriptions: number
  }
}

export default function PatientMedicalHistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const { toast } = useToast()
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/patients/${patientId}/medical-history`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch medical history')
        }
        
        const data = await response.json()
        setMedicalHistory(data)
        setFilteredHistory(data.history)
      } catch (err) {
        setError('Error loading medical history')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    if (patientId) {
      fetchMedicalHistory()
    }
  }, [patientId])

  const applyDateFilter = () => {
    if (!medicalHistory) return
    
    if (!startDate && !endDate) {
      setFilteredHistory(medicalHistory.history)
      return
    }
    
    const filtered = medicalHistory.history.filter(item => {
      const itemDate = new Date(item.date)
      const start = startDate ? new Date(startDate) : new Date(0)
      const end = endDate ? new Date(endDate) : new Date(8640000000000000) // Max date
      
      return itemDate >= start && itemDate <= end
    })
    
    setFilteredHistory(filtered)
  }

  const resetFilters = () => {
    setStartDate('')
    setEndDate('')
    if (medicalHistory) {
      setFilteredHistory(medicalHistory.history)
    }
  }

  const handleDownloadPDF = async () => {
      if (!pdfRef.current || !medicalHistory) return;
      
      try {
        toast({
          title: "Preparing PDF",
          description: "Please wait while we generate the medical history PDF...",
        });
        
        const content = pdfRef.current;
        
        // Create PDF with proper configuration
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        // Add title and header on first page
        pdf.setFontSize(18);
        pdf.setTextColor(0, 128, 128); // Teal color
        pdf.text(`Medical History: ${medicalHistory.patient.name}`, 14, 15);
        
        // Add patient info
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Email: ${medicalHistory.patient.email}`, 14, 25);
        pdf.text(`Phone: ${medicalHistory.patient.phone}`, 14, 32);
        pdf.text(`Total Appointments: ${medicalHistory.stats.totalAppointments}`, 14, 39);
        pdf.text(`Total Prescriptions: ${medicalHistory.stats.totalPrescriptions}`, 14, 46);
        
        // Add a separator line
        pdf.setDrawColor(0, 128, 128);
        pdf.line(14, 50, 196, 50);
        
        // Add medical history title
        pdf.setFontSize(16);
        pdf.setTextColor(0, 128, 128);
        pdf.text("Medical Timeline", 14, 60);
        
        // Start position for history items
        let yPosition = 70;
        const pageHeight = pdf.internal.pageSize.height;
        
        // Process each history item
        filteredHistory.forEach((item, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20; // Reset position for new page
          }
          
          // Add item type and date
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${new Date(item.date).toLocaleDateString()}`
            , 14, yPosition);
          yPosition += 7;
          
          if (item.details) {
            // Add details
            pdf.setFontSize(10);
            pdf.text(`Doctor: ${item.details.doctorName}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Specialty: ${item.details.specialty}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Type: ${item.details.consultationType}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Status: ${item.details.status}`, 20, yPosition);
            yPosition += 6;
            
            // Add symptoms and diagnosis if available
            if (item.details.symptoms) {
              pdf.text(`Symptoms: ${item.details.symptoms}`, 20, yPosition);
              yPosition += 6;
            }
            
            if (item.details.diagnosis) {
              pdf.text(`Diagnosis: ${item.details.diagnosis}`, 20, yPosition);
              yPosition += 6;
            }
          }
          
          // Add prescriptions if available
          if (item.prescriptions && item.prescriptions.length > 0) {
            pdf.setFontSize(12);
            pdf.setTextColor(0, 100, 100);
            pdf.text("Prescriptions:", 14, yPosition);
            yPosition += 7;
            
            item.prescriptions.forEach((prescription, idx) => {
              // Check if we need a new page
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20; // Reset position for new page
              }
              
              // Add medicines
              pdf.setFontSize(10);
              pdf.setTextColor(0, 0, 0);
              pdf.text("Medicines:", 20, yPosition);
              yPosition += 6;
              
              prescription.medicines.forEach((medicine, midx) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 20) {
                  pdf.addPage();
                  yPosition = 20; // Reset position for new page
                }
                
                pdf.text(`- ${medicine.name}: ${medicine.dosage}, ${medicine.duration}`, 25, yPosition);
                yPosition += 6;
              });
              
              // Add notes if available
              if (prescription.notes) {
                // Check if we need a new page
                if (yPosition > pageHeight - 20) {
                  pdf.addPage();
                  yPosition = 20; // Reset position for new page
                }
                
                pdf.text("Doctor's Notes:", 20, yPosition);
                yPosition += 6;
                pdf.text(prescription.notes, 25, yPosition);
                yPosition += 6;
              }
            });
          }
          
          // Add spacing between history items
          yPosition += 10;
          
          // Add a separator line between items (except for the last one)
          if (index < filteredHistory.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.line(14, yPosition - 5, 196, yPosition - 5);
          }
        });
        
        // Generate filename with patient name and date
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        pdf.save(`medical_history_${medicalHistory.patient.name.replace(/\s+/g, '_')}_${timestamp}.pdf`);
        
        toast({
          title: "Success",
          description: "Complete medical history has been downloaded as PDF",
        });
      } catch (err) {
        console.error('Error generating PDF:', err);
        toast({
          title: "Download Failed",
          description: "There was an error generating the PDF",
          variant: "destructive",
        });
      }
    }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
          <ModernNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-slate-500">Loading medical history...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !medicalHistory) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
          <ModernNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">{error || 'Failed to load medical history'}</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <ModernNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/doctor/patients')}
                className="mr-4 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 text-slate-700 group-hover:text-slate-900" />
                Back to Patients
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                  Medical History
                </h1>
                <p className="text-slate-500 text-lg mt-2">
                  {medicalHistory.patient.name}'s complete medical records
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter by date range</h4>
                    <div className="space-y-2">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={applyDateFilter}>
                        Apply Filter
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={handleDownloadPDF} className="bg-teal-600 hover:bg-teal-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Patient Info Card and Medical History - Wrapped in a div for PDF generation */}
          <div ref={pdfRef}>
            {/* Patient Info Card */}
            <Card className="mb-8 border border-teal-100 bg-gradient-to-br from-white to-teal-50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{medicalHistory.patient.name}</h2>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-slate-500">
                      <span>{medicalHistory.patient.email}</span>
                      <span>{medicalHistory.patient.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center px-4 py-2 bg-teal-50 rounded-lg">
                    <span className="block text-2xl font-bold text-teal-600">{medicalHistory.stats.totalAppointments}</span>
                    <span className="text-xs text-slate-500">Appointments</span>
                  </div>
                  <div className="text-center px-4 py-2 bg-cyan-50 rounded-lg">
                    <span className="block text-2xl font-bold text-cyan-600">{medicalHistory.stats.totalPrescriptions}</span>
                    <span className="text-xs text-slate-500">Prescriptions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History Timeline */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Medical Timeline</h2>
            
            {filteredHistory.length === 0 ? (
              <Card className="border border-slate-200 bg-white">
                <CardContent className="p-6 text-center text-slate-500">
                  No medical records found for the selected date range.
                </CardContent>
              </Card>
            ) : (
              filteredHistory.map((item, index) => (
                <Card key={index} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          item.type === 'appointment' ? 'bg-teal-100 text-teal-600' : 'bg-cyan-100 text-cyan-600'
                        }`}>
                          {item.type === 'appointment' ? (
                            <Calendar className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {item.type === 'appointment' ? 'Appointment' : 'Prescription'}
                          </CardTitle>
                          <div className="text-sm text-slate-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {item.details?.time && (
                              <>
                                <span className="mx-1">•</span>
                                <Clock className="w-3 h-3 mr-1" />
                                {item.details.time}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {item.details?.status && (
                        <Badge className={`${
                          item.details.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          item.details.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                          'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        }`}>
                          {item.details.status.charAt(0).toUpperCase() + item.details.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.details && (
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-500">Doctor</p>
                            <p className="text-slate-900">{item.details.doctorName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Specialty</p>
                            <p className="text-slate-900">{item.details.specialty}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Consultation Type</p>
                            <p className="text-slate-900 capitalize">{item.details.consultationType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Fee</p>
                            <p className="text-slate-900">${item.details.fee}</p>
                          </div>
                          {item.details.symptoms && (
                            <div>
                              <p className="text-sm font-medium text-slate-500">Symptoms</p>
                              <p className="text-slate-900">{item.details.symptoms}</p>
                            </div>
                          )}
                          {item.details.diagnosis && (
                            <div>
                              <p className="text-sm font-medium text-slate-500">Diagnosis</p>
                              <p className="text-slate-900">{item.details.diagnosis}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.prescriptions.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <h3 className="font-medium text-slate-900 mb-3">Prescriptions</h3>
                        {item.prescriptions.map((prescription, idx) => (
                          <div key={idx} className="space-y-3">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-500">Medicines</h4>
                              <ul className="space-y-2">
                                {prescription.medicines.map((medicine, midx) => (
                                  <li key={midx} className="bg-slate-50 p-3 rounded-md">
                                    <p className="font-medium text-slate-900">{medicine.name}</p>
                                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-slate-500 mt-1">
                                      <span>Dosage: {medicine.dosage}</span>
                                      <span>Duration: {medicine.duration}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {prescription.notes && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-500">Doctor's Notes</h4>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-md mt-1">{prescription.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          </div> {/* Close the PDF ref wrapper div */}
        </div>
      </div>
    </ProtectedRoute>
  )
}