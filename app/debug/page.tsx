"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DebugPage() {
  const [serverStatus, setServerStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [error, setError] = useState<string>("") 
  const [dbInfo, setDbInfo] = useState<{
    exists: boolean;
    doctorsCount: number;
    patientsCount: number;
    appointmentsCount: number;
  } | null>(null)

  const checkConnection = async () => {
    setServerStatus("checking")
    setError("")

    try {
      // Create controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error("Connection timeout. Server is not responding.");
      }, 5000);
      
      // Use the debug endpoint for comprehensive diagnostics
      const debugResponse = await fetch("/api/debug", {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!debugResponse.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Debug endpoint failed: ${debugResponse.status}`)
      }
      
      const debugData = await debugResponse.json()
      
      if (debugData.status !== 'ok') {
        throw new Error(debugData.message || 'Server reported an error')
      }
      
      // Set database info from debug response
      if (debugData.database) {
        setDbInfo({
          exists: true,
          doctorsCount: debugData.database.doctorsCount || 0,
          patientsCount: debugData.database.patientsCount || 0,
          appointmentsCount: debugData.database.appointmentsCount || 0
        })
      }
      
      // Test doctors endpoint
      const doctorsResponse = await fetch("/api/doctors", {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!doctorsResponse.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Doctors endpoint failed: ${doctorsResponse.status}`)
      }
      const doctorsData = await doctorsResponse.json()
      setDoctors(doctorsData)

      // Test patients endpoint
      const patientsResponse = await fetch("/api/patients", {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!patientsResponse.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Patients endpoint failed: ${patientsResponse.status}`)
      }
      const patientsData = await patientsResponse.json()
      setPatients(patientsData)

      clearTimeout(timeoutId);
      setServerStatus("connected")
    } catch (err) {
      setServerStatus("disconnected")
      setError(err instanceof Error ? err.message : "Unknown error")
      // Reset database info on error
      setDbInfo(null)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug Page</h1>

        {/* Server Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {serverStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin" />}
              {serverStatus === "connected" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {serverStatus === "disconnected" && <XCircle className="w-5 h-5 text-red-600" />}
              <span>Server Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p
                className={`font-medium ${
                  serverStatus === "connected"
                    ? "text-green-600"
                    : serverStatus === "disconnected"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                Status: {serverStatus.toUpperCase()}
              </p>

              {/* Database Status */}
              {dbInfo && serverStatus === "connected" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2">Database Status:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-500">Doctors</p>
                      <p className="text-xl font-bold">{dbInfo.doctorsCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-500">Patients</p>
                      <p className="text-xl font-bold">{dbInfo.patientsCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-500">Appointments</p>
                      <p className="text-xl font-bold">{dbInfo.appointmentsCount}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Error:</p>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <Button onClick={checkConnection} disabled={serverStatus === "checking"}>
                {serverStatus === "checking" ? "Checking..." : "Recheck Connection"}
              </Button>

              {serverStatus === "disconnected" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">Troubleshooting steps:</p>
                  <ol className="text-yellow-700 mt-2 space-y-2 list-decimal list-inside">
                    <li><strong>Check your internet connection</strong> - Ensure you have a stable connection to the internet.</li>
                    <li><strong>Clear browser cache</strong> - Try clearing your browser cache and cookies, then refresh the page.</li>
                    <li><strong>Try a different browser</strong> - If the issue persists, try accessing the application from a different browser.</li>
                    <li><strong>Check server status</strong> - The API server might be temporarily down. Wait a few minutes and try again.</li>
                    <li><strong>Verify login credentials</strong> - If you're having trouble logging in, make sure you're using the correct email and password.</li>
                    <li><strong>Contact support</strong> - If none of the above steps work, please contact our support team.</li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Doctors Data */}
        {serverStatus === "connected" && (
          <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
            <CardHeader>
              <CardTitle>Doctors ({doctors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex justify-between items-center p-3 bg-blue-50/50 rounded">
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">ID: {doctor.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patients Data */}
        {serverStatus === "connected" && (
          <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
            <CardHeader>
              <CardTitle>Patients ({patients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex justify-between items-center p-3 bg-blue-50/50 rounded">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ID: {patient.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Login */}
        {serverStatus === "connected" && (
          <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
            <CardHeader>
              <CardTitle>Test Login Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Doctor Login</h4>
                  <p className="text-sm text-blue-700">Email: sarah@example.com</p>
                  <p className="text-sm text-blue-700">Password: password123</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Patient Login</h4>
                  <p className="text-sm text-green-700">Email: john@example.com</p>
                  <p className="text-sm text-green-700">Password: password123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
