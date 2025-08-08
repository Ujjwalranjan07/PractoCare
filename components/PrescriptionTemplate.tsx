"use client"

import React, { useRef } from "react"
import { Medicine, Prescription } from "@/lib/prescriptions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileText, Calendar, User, UserRound, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

interface PrescriptionTemplateProps {
  prescription: Prescription
  hospitalName?: string
  hospitalAddress?: string
  hospitalContact?: string
  doctorQualifications?: string
  doctorRegistrationNumber?: string
  doctorDepartment?: string
  patientAge?: string
  patientGender?: string
  patientId?: string
  onDownload?: () => void
}

const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({
  prescription,
  hospitalName = "HealthPlus Medical Center",
  hospitalAddress = "123 Healthcare Avenue, Medical District",
  hospitalContact = "+1 (555) 123-4567 | info@healthplus.com",
  doctorQualifications = "MD, MBBS",
  doctorRegistrationNumber = "REG12345",
  doctorDepartment = "General Medicine",
  patientAge = "35",
  patientGender = "Male",
  patientId = "PAT-" + (typeof prescription.patientId === 'string' ? prescription.patientId.substring(0, 6) : prescription.patientId.toString()),
  onDownload
}) => {
  const prescriptionRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const handleDownloadPrescription = async () => {
    if (!prescriptionRef.current) return

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
      pdf.save(`Prescription_${prescription.id.toString()}.pdf`)

      toast({
        title: "Success",
        description: "Prescription downloaded successfully!",
      })

      if (onDownload) {
        onDownload()
      }
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
    <div className="flex flex-col space-y-6">
      {/* Prescription Template */}
      <div 
        ref={prescriptionRef} 
        className="bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden"
        style={{ minHeight: "297mm", width: "100%", maxWidth: "210mm" }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="text-[300px] font-bold text-gray-500 rotate-45">Rx</div>
        </div>

        {/* Hospital Logo and Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 border-b border-gray-200 pb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
            <div className="mb-3 sm:mb-0 sm:mr-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                H+
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800">{hospitalName}</h1>
              <p className="text-sm sm:text-base text-gray-600">{hospitalAddress}</p>
              <p className="text-sm sm:text-base text-gray-600">{hospitalContact}</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Dr. {prescription.doctorName}</h2>
            <p className="text-sm sm:text-base text-gray-600">{doctorQualifications}</p>
            <p className="text-sm sm:text-base text-gray-600">Reg. No: {doctorRegistrationNumber}</p>
            <p className="text-sm sm:text-base text-gray-600">{doctorDepartment}</p>
          </div>
        </div>

        {/* Rx Symbol and Date */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-blue-800 mr-2">Rx</div>
            <div className="h-8 sm:h-10 w-px bg-gray-300 mx-2 sm:mx-4 hidden sm:block"></div>
            <div className="text-gray-600 flex items-center text-sm sm:text-base">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Date: {formatDate(prescription.date)}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500">Prescription ID</p>
            <p className="text-gray-800 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100 text-xs sm:text-sm">
              {typeof prescription.id === 'string' ? prescription.id.substring(0, 8) : prescription.id.toString()}
            </p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 flex items-center">
            <UserRound className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-gray-700 sm:w-20 mb-1 sm:mb-0">Name:</span>
              <span className="text-gray-800">{prescription.patientName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-gray-700 sm:w-20 mb-1 sm:mb-0">Patient ID:</span>
              <span className="text-gray-800">{patientId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-gray-700 sm:w-20 mb-1 sm:mb-0">Age:</span>
              <span className="text-gray-800">{patientAge}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-gray-700 sm:w-20 mb-1 sm:mb-0">Gender:</span>
              <span className="text-gray-800">{patientGender}</span>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="mb-8">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center border-b border-gray-200 pb-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Prescribed Medicines
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {prescription.medicines.map((medicine, index) => (
              <div 
                key={index} 
                className="p-3 sm:p-4 bg-white rounded-lg border-l-4 border-blue-500 border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <h4 className="text-base sm:text-lg font-medium text-gray-800">{medicine.name}</h4>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 sm:w-20 text-sm mb-1 sm:mb-0">Dosage:</span>
                    <Badge variant="outline" className="font-normal bg-blue-50 text-blue-800 border-blue-200 text-xs sm:text-sm w-fit">
                      {medicine.dosage}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 sm:w-20 text-sm mb-1 sm:mb-0">Duration:</span>
                    <Badge variant="outline" className="font-normal bg-blue-50 text-blue-800 border-blue-200 text-xs sm:text-sm w-fit">
                      {medicine.duration}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Instructions */}
        {prescription.notes && (
          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3 flex items-center border-b border-gray-200 pb-2">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Notes & Instructions
            </h3>
            <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{prescription.notes}</p>
            </div>
          </div>
        )}

        {/* Footer with Signature */}
        <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-0">
          <div className="max-w-md text-xs text-gray-500 text-center sm:text-left">
            <p className="font-medium text-gray-700 mb-1">Disclaimer:</p>
            <p>This prescription is valid for 30 days from the date of issue. Please follow the dosage instructions carefully. Contact your doctor if you experience any adverse effects.</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="font-serif italic text-blue-800 text-base sm:text-lg border-b-2 border-blue-800 inline-block pb-1">
              Dr. {prescription.doctorName}
            </div>
            <div className="text-xs text-gray-500 mt-1">Digital Signature</div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center px-4 sm:px-0">
        <Button 
          onClick={handleDownloadPrescription}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          size="lg"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          Download Prescription
        </Button>
      </div>
    </div>
  )
}

export default PrescriptionTemplate