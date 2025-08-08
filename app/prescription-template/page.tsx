"use client"

import { useState } from "react"
import { Prescription, Medicine } from "@/lib/prescriptions"
import PrescriptionTemplate from "@/components/PrescriptionTemplate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrescriptionTemplatePage() {
  const router = useRouter()
  
  // Sample prescription data
  const [prescription] = useState<Prescription>({
    id: "PRESC-12345678",
    doctorId: "DOC-123456",
    doctorName: "John Doe",
    patientId: "PAT-123456",
    patientName: "Jane Smith",
    appointmentId: "APT-123456",
    date: new Date().toISOString(),
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg twice daily",
        duration: "7 days"
      },
      {
        name: "Ibuprofen",
        dosage: "400mg every 6 hours",
        duration: "5 days"
      },
      {
        name: "Cetirizine",
        dosage: "10mg once daily",
        duration: "10 days"
      }
    ],
    notes: "Take medications after meals. Avoid alcohol during the course of treatment. Return for follow-up in 10 days."
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-blue-700 group-hover:text-blue-800" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Prescription Template
            </h1>
            <p className="text-gray-600 mt-1">
              A professional medical prescription template in A4 format
            </p>
          </div>
        </div>

        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-xl text-gray-800">Template Preview</CardTitle>
            <CardDescription>
              This is a sample prescription template that can be used for generating professional medical prescriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <PrescriptionTemplate 
              prescription={prescription}
              hospitalName="HealthPlus Medical Center"
              hospitalAddress="123 Healthcare Avenue, Medical District"
              hospitalContact="+1 (555) 123-4567 | info@healthplus.com"
              doctorQualifications="MD, MBBS"
              doctorRegistrationNumber="REG12345"
              doctorDepartment="General Medicine"
              patientAge="35"
              patientGender="Female"
              patientId="PAT-123456"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}