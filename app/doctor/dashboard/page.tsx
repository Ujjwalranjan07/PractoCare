"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Bell,
  ChevronRight,
  Eye,
  Edit,
  X,
  Phone,
  Video,
  Building,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import "../../styles/doctor-dashboard.css"
import "../../styles/jessica-fix.css"
import "../../styles/hover-fix.css"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return

    try {
      const appointmentsData = await appointmentsAPI.getByDoctorId(user.id)
      setAppointments(appointmentsData || [])

      // Calculate stats
      const stats = {
        total: appointmentsData?.length || 0,
        pending: appointmentsData?.filter((a) => a.status === "pending").length || 0,
        confirmed: appointmentsData?.filter((a) => a.status === "confirmed").length || 0,
        completed: appointmentsData?.filter((a) => a.status === "completed").length || 0,
      }

      setStats(stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayAppointments = appointments.filter((appointment) => {
    let appointmentDate = appointment.date
    if (appointmentDate instanceof Date) {
      appointmentDate = appointmentDate.toISOString().split("T")[0]
    }
    if (typeof appointmentDate === "string" && appointmentDate.includes("T")) {
      appointmentDate = appointmentDate.split("T")[0]
    }
    return appointmentDate === getTodayString()
  })

  const upcomingAppointments = appointments
    .filter((apt) => {
      let aptDate = apt.date
      if (aptDate instanceof Date) {
        aptDate = aptDate.toISOString().split("T")[0]
      }
      if (typeof aptDate === "string" && aptDate.includes("T")) {
        aptDate = aptDate.split("T")[0]
      }
      return new Date(aptDate) >= new Date(getTodayString()) && apt.status === "confirmed"
    })
    .slice(0, 5)

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return

    setIsRescheduling(true)
    try {
      await appointmentsAPI.reschedule(selectedAppointment.id, rescheduleDate, rescheduleTime)

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, date: rescheduleDate, time: rescheduleTime } : apt,
        ),
      )

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully!",
      })

      setSelectedAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, "cancelled")

      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)))

      toast({
        title: "Success",
        description: "Appointment cancelled successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (appointmentId: string, status: Appointment["status"]) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, status)

      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt)))

      toast({
        title: "Success",
        description: `Appointment ${status} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    }
  }

  const StatCard = ({ title, value, description, icon: Icon, color, onClick }: any) => (
    <Card
      className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-blue-100 bg-white/90 backdrop-blur-sm cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-800">{title}</CardTitle>
        <div
          className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 transition-all duration-300 group-hover:scale-110">
          {isLoading ? <div className="h-6 sm:h-8 w-12 sm:w-16 bg-blue-100 rounded animate-pulse" /> : value}
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )

  const AppointmentCard = ({
    appointment,
    index,
    showActions = true,
  }: { appointment: Appointment; index: number; showActions?: boolean }) => (
    <div
      className="group p-4 sm:p-6 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 appointment-card"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm sm:text-lg font-bold">
                {appointment.patientName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "P"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-gray-800 font-semibold text-base sm:text-xl group-hover:text-blue-600 transition-colors">
              {appointment.patientName || "Unknown Patient"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-500 text-xs sm:text-sm mt-1 space-y-1 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{appointment.time || "No time set"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{appointment.date}</span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          className={`${
            appointment.status === "confirmed"
              ? "bg-green-100 text-green-700 border-green-200"
              : appointment.status === "pending"
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : appointment.status === "cancelled"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
          } transition-all duration-300 group-hover:scale-105 px-2 sm:px-3 py-1 text-xs sm:text-sm`}
        >
          {appointment.status}
        </Badge>
      </div>

      {/* Consultation Type */}
      <div className="flex items-center space-x-2 mb-4">
        {appointment.consultationType === "video" && <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
        {appointment.consultationType === "call" && <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />}
        {appointment.consultationType === "clinic" && <Building className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />}
        <span className="text-slate-300 text-xs sm:text-sm capitalize">
          {appointment.consultationType} Consultation
        </span>
      </div>

      {showActions && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 appointment-actions">
            {appointment.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                variant="outline"
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(appointment.id)}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </>
          )}

          {appointment.status === "confirmed" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, "completed")}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm mb-3 sm:mb-0"
                variant="outline"
              >
                Complete
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAppointment(appointment)}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm mb-3 sm:mb-0"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Reschedule</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-blue-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-gray-800">Reschedule Appointment</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Change the date and time for {appointment.patientName}'s appointment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date" className="text-gray-700">
                        New Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="bg-white border-gray-200 text-gray-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-gray-700">
                        New Time
                      </Label>
                      <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                        <SelectTrigger className="bg-white border-gray-200 text-gray-800">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="09:00">09:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="14:00">02:00 PM</SelectItem>
                          <SelectItem value="15:00">03:00 PM</SelectItem>
                          <SelectItem value="16:00">04:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleReschedule}
                        disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        {isRescheduling ? "Rescheduling..." : "Reschedule"}
                      </Button>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-gray-200 text-gray-700 bg-transparent">
                          Cancel
                        </Button>
                      </DialogTrigger>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(appointment.id)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent sm:w-auto w-full mb-3 sm:mb-0"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <ModernNavbar />
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 dashboard-container">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 border border-blue-200">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Welcome back, Dr. {user?.name?.split(" ")[1] || user?.name}
            </h1>
            <p className="text-gray-600 text-base sm:text-xl max-w-2xl mx-auto">
              Manage your practice efficiently with real-time insights and patient management tools
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <StatCard
              title="Total Appointments"
              value={stats.total}
              description="All time appointments"
              icon={Calendar}
              color="from-blue-500 to-blue-600"
              onClick={() => router.push("/doctor/appointments")}
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pending}
              description="Awaiting confirmation"
              icon={Clock}
              color="from-yellow-500 to-orange-500"
              onClick={() => router.push("/doctor/appointments?filter=pending")}
            />
            <StatCard
              title="Confirmed Today"
              value={todayAppointments.filter((apt) => apt.status === "confirmed").length}
              description="Ready to see patients"
              icon={Users}
              color="from-green-500 to-emerald-500"
              onClick={() => router.push("/doctor/appointments?filter=confirmed")}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              description="Successfully treated"
              icon={TrendingUp}
              color="from-purple-500 to-pink-500"
              onClick={() => router.push("/doctor/appointments?filter=completed")}
            />
          </div>
          
          {/* Reviews Button */}
          <div className="mb-8 sm:mb-12">
            <Button 
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent py-6"
              onClick={() => router.push("/doctor/reviews")}
            >
              <div className="flex items-center justify-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-lg font-bold">View Patient Reviews</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Today's Appointments */}
            <div className="xl:col-span-2">
              <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-lg">
                <CardHeader className="border-b border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                        Today's Schedule
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2 text-sm sm:text-base">
                        {todayAppointments.length} appointments scheduled for today
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                      onClick={loadAppointments}
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-lg animate-pulse"
                        >
                          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3 mb-2" />
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No appointments today</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        {appointments.length > 0
                          ? `You have ${appointments.length} total appointments, but none for today`
                          : "No appointments scheduled yet"}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/doctor/appointments")}
                        className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View All Appointments
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {todayAppointments.map((appointment, index) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} index={index} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Upcoming */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border border-blue-100 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                    onClick={() => router.push("/doctor/appointments")}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    View All Appointments
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                    onClick={() => router.push("/doctor/patients")}
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Patient Records
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                    onClick={() => router.push("/doctor/analytics")}
                  >
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm"
                    onClick={() => router.push("/doctor/schedule")}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Manage Schedule
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="border border-blue-100 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">Upcoming</CardTitle>
                  <CardDescription className="text-gray-600 text-sm">Next confirmed appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-600 text-center py-4 text-sm">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-lg hover:bg-blue-100/50 transition-colors cursor-pointer"
                          onClick={() => router.push("/doctor/appointments")}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                            {appointment.patientName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "P"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-xs sm:text-sm font-medium truncate">
                              {appointment.patientName}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
