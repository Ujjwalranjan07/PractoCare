"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, User, ArrowLeft, Phone, Mail, Activity } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import "../../../styles/hover-fix.css"

type Patient = {
  id: string
  name: string
  email: string
  phone: string
  lastVisit?: string
  totalAppointments?: number
  status?: string
}

export default function PatientDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  const { toast } = useToast()
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use hardcoded data based on the ID
    const fetchPatient = () => {
      setLoading(true)
      
      // Simulating API call with timeout
      setTimeout(() => {
        if (patientId === "1") {
          setPatient({
            id: "1",
            name: "Emma Thompson",
            email: "emma@healthplus.com",
            phone: "+1-555-1001",
            lastVisit: "2024-01-15",
            totalAppointments: 5,
            status: "Active",
          })
        } else if (patientId === "2") {
          setPatient({
            id: "2",
            name: "Jessica Miller",
            email: "jessica@example.com",
            phone: "+1 (555) 987-6543",
            lastVisit: "2024-01-10",
            totalAppointments: 3,
            status: "Active",
          })
        } else {
          // Handle unknown patient ID
          toast({
            title: "Error",
            description: "Patient not found",
            variant: "destructive",
          })
          router.push("/doctor/patients")
        }
        
        setLoading(false)
      }, 500) // Simulate network delay
    }
    
    fetchPatient()
  }, [patientId, router, toast])

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <ModernNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/doctor/patients")}
              className="mr-4 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-slate-700 group-hover:text-slate-900" />
              Back to Patients
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                Patient Details
              </h1>
              <p className="text-slate-500 text-lg mt-2">View and manage patient information</p>
            </div>
          </div>

          {loading ? (
            // Loading state
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          ) : patient ? (
            // Patient details
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patient Info Card */}
              <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-slate-800">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-teal-100 rounded-full mb-2">
                      <User className="w-10 h-10 text-teal-600" />
                    </div>
                    
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                      <Badge variant="outline" className="mt-1 bg-teal-50 text-teal-700 border-teal-200">
                        {patient.status}
                      </Badge>
                    </div>
                    
                    <Separator className="bg-slate-100" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Patient ID:</span>
                        <span className="font-medium text-slate-800">{patient.id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800">{patient.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800">{patient.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800">Last Visit: {patient.lastVisit}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800">{patient.totalAppointments} Appointments</span>
                      </div>
                    </div>
                    
                    <Separator className="bg-slate-100" />
                    
                    <div className="pt-2 space-y-3">
                      <Button 
                        className="w-full bg-teal-500 hover:bg-teal-600"
                        onClick={() => router.push(`/doctor/patients/${patient.id}/medical-history`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Medical History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Additional patient information would go here */}
              <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-800">Patient Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-2">Recent Activity</h3>
                      <p className="text-slate-600 text-sm">
                        This section would display recent appointments, prescriptions, and other patient activities.
                        In a complete implementation, this would be populated with real data from the database.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-2">Medical Notes</h3>
                      <p className="text-slate-600 text-sm">
                        This section would contain medical notes and observations from previous appointments.
                        In a complete implementation, this would be populated with real data from the database.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-2">Upcoming Appointments</h3>
                      <p className="text-slate-600 text-sm">
                        This section would show any scheduled upcoming appointments for this patient.
                        In a complete implementation, this would be populated with real data from the database.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Error state - should not reach here due to redirect in useEffect
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-bold text-red-500">Patient Not Found</h2>
                <p className="text-slate-600 mt-2">The requested patient could not be found.</p>
                <Button 
                  className="mt-4 bg-teal-500 hover:bg-teal-600"
                  onClick={() => router.push("/doctor/patients")}
                >
                  Return to Patients List
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}