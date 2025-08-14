"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, X, FileText, User, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import { prescriptionsAPI, type Prescription, type Medicine } from "@/lib/prescriptions"
import { medicineCategories } from "@/lib/medicines"
import "../../../styles/hover-fix.css"

export default function NewPrescriptionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", dosage: "", duration: "" }])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (user && appointmentId) {
      loadAppointment()
    } else if (!appointmentId) {
      setIsLoading(false)
    }
  }, [user, appointmentId])

  const loadAppointment = async () => {
    if (!appointmentId) return
    
    try {
      setIsLoading(true)
      const appointmentData = await appointmentsAPI.getById(appointmentId)
      console.log("Loaded appointment data:", appointmentData)
      setAppointment(appointmentData)
    } catch (error) {
      console.error("Failed to load appointment:", error)
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "" }])
  }

  const removeMedicine = (index: number) => {
    const updatedMedicines = [...medicines]
    updatedMedicines.splice(index, 1)
    setMedicines(updatedMedicines)
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updatedMedicines = [...medicines]
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value }
    setMedicines(updatedMedicines)
  }

  const handleSave = async () => {
    if (medicines.some(med => !med.name || !med.dosage || !med.duration)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for medicines",
        variant: "destructive",
      })
      return
    }

    if (!appointment && !appointmentId) {
      toast({
        title: "Error",
        description: "No appointment selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      
      // If appointment is not loaded, we need to fetch it again
      let apt = appointment;
      if (!apt && appointmentId) {
        try {
          apt = await appointmentsAPI.getById(appointmentId);
          console.log("Fetched appointment for save:", apt);
        } catch (error) {
          console.error("Failed to fetch appointment for save:", error);
          toast({
            title: "Error",
            description: "Failed to load appointment details for prescription",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }
      
      // Ensure we have valid appointment data
      if (!apt) {
        toast({
          title: "Error",
          description: "No valid appointment data available",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const newPrescription: Omit<Prescription, "id"> = {
        doctorId: user?.id || "",
        doctorName: user?.name || "",
        patientId: apt.patientId || "",
        patientName: apt.patientName || "",
        appointmentId: apt.id || appointmentId || "",
        date: new Date().toISOString().split("T")[0],
        medicines: medicines,
        notes: notes,
      }
      
      console.log("Saving prescription:", newPrescription);

      await prescriptionsAPI.create(newPrescription)
      
      toast({
        title: "Success",
        description: "Prescription created successfully",
      })
      
      // Navigate back to prescriptions list
      router.push("/doctor/prescriptions")
    } catch (error) {
      console.error("Failed to create prescription:", error)
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <ModernNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-slate-700 group-hover:text-slate-900" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                New Prescription
              </h1>
              <p className="text-slate-600 mt-2">
                Create a new prescription for your patient
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Appointment Info Card */}
              {appointment && (
                <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-slate-800 text-xl">Appointment Details</CardTitle>
                    <CardDescription className="text-slate-600">
                      Prescription for the following appointment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-slate-800 font-medium">{appointment.patientName}</h3>
                        <p className="text-slate-500 text-sm">Patient</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-teal-100">
                        <Calendar className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-slate-800 font-medium">
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at {appointment.time}
                        </h3>
                        <p className="text-slate-500 text-sm">Appointment Date & Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prescription Form */}
              <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100 shadow-md">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-xl">Prescription Details</CardTitle>
                  <CardDescription className="text-slate-600">
                    Add medicines and instructions for the patient
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Medicines Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-800 text-lg">Medicines</Label>
                      <div className="flex items-center space-x-2">
                        <Select
                          onValueChange={(value) => {
                            const medicine = medicineCategories
                              .flatMap(c => c.medicines)
                              .find(m => m.name === value);
                            
                            if (medicine) {
                              addMedicine();
                              const lastIndex = medicines.length;
                              updateMedicine(lastIndex, "name", medicine.name);
                              if (medicine.commonDosages.length > 0) {
                                updateMedicine(lastIndex, "dosage", medicine.commonDosages[0]);
                              }
                              if (medicine.commonDurations.length > 0) {
                                updateMedicine(lastIndex, "duration", medicine.commonDurations[0]);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white border-slate-200 text-slate-800 w-[180px]">
                            <SelectValue placeholder="Quick add..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-800 max-h-[300px]">
                            {medicineCategories.map((category) => (
                              <div key={category.category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-600">
                                  {category.category}
                                </div>
                                {category.medicines.map((med) => (
                                  <SelectItem key={med.name} value={med.name}>
                                    {med.name}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addMedicine}
                          className="border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Medicine
                        </Button>
                      </div>
                    </div>
                    
                    {medicines.map((medicine, index) => (
                      <div key={index} className="space-y-3 p-4 bg-white rounded-md relative border border-slate-200 shadow-sm">
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-slate-500 hover:text-red-500 h-6 w-6"
                            onClick={() => removeMedicine(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor={`medicine-name-${index}`} className="text-slate-800">Medicine Name</Label>
                            <Select
                              value={medicine.name || ""}
                              onValueChange={(value) => updateMedicine(index, "name", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-200 text-slate-800 mt-1">
                                <SelectValue placeholder="Select a medicine" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200 text-slate-800 max-h-[300px]">
                                {medicineCategories.map((category) => (
                                  <div key={category.category}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-600">
                                      {category.category}
                                    </div>
                                    {category.medicines.map((med) => (
                                      <SelectItem key={med.name} value={med.name}>
                                        {med.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="mt-2">
                              <Input
                                value={medicine.name}
                                onChange={(e) => updateMedicine(index, "name", e.target.value)}
                                className="bg-white border-slate-200 text-slate-800"
                                placeholder="Or type medicine name"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`medicine-dosage-${index}`} className="text-slate-800">Dosage</Label>
                              <Select
                                value={medicine.dosage || ""}
                                onValueChange={(value) => updateMedicine(index, "dosage", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-800 mt-1">
                                  <SelectValue placeholder="Select dosage" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-800">
                                  {medicine.name && medicineCategories
                                    .flatMap(c => c.medicines)
                                    .find(m => m.name === medicine.name)?.commonDosages
                                    .map((dosage) => (
                                      <SelectItem key={dosage} value={dosage}>
                                        {dosage}
                                      </SelectItem>
                                    )) || (
                                      <SelectItem key="no-medicine" value="no-medicine-selected" disabled>
                                        Select a medicine first
                                      </SelectItem>
                                    )}
                                </SelectContent>
                              </Select>
                              <div className="mt-2">
                                <Input
                                  id={`medicine-dosage-${index}`}
                                  value={medicine.dosage}
                                  onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                                  className="bg-white border-slate-200 text-slate-800"
                                  placeholder="Or type custom dosage"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`medicine-duration-${index}`} className="text-slate-800">Duration</Label>
                              <Select
                                value={medicine.duration || ""}
                                onValueChange={(value) => updateMedicine(index, "duration", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-200 text-slate-800 mt-1">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-800">
                                  {medicine.name && medicineCategories
                                    .flatMap(c => c.medicines)
                                    .find(m => m.name === medicine.name)?.commonDurations
                                    .map((duration) => (
                                      <SelectItem key={duration} value={duration}>
                                        {duration}
                                      </SelectItem>
                                    )) || (
                                      <SelectItem key="no-medicine" value="no-medicine-selected" disabled>
                                        Select a medicine first
                                      </SelectItem>
                                    )}
                                </SelectContent>
                              </Select>
                              <div className="mt-2">
                                <Input
                                  id={`medicine-duration-${index}`}
                                  value={medicine.duration}
                                  onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                                  className="bg-white border-slate-200 text-slate-800"
                                  placeholder="Or type custom duration"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-800 text-lg">Additional Notes & Instructions</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-white border-slate-200 text-slate-800 min-h-[120px]"
                      placeholder="Add any additional instructions or notes for the patient..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Save Prescription
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}