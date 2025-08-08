"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, User, Calendar, Home, Menu, Activity, Users, Clock, Bell, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (!user) return null

  // Navigation items based on user role
  const patientNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/appointments", label: "Appointments", icon: Calendar },
  ]

  const doctorNavItems = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Home },
    { href: "/doctor/profile", label: "Profile", icon: User },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/doctor/analytics", label: "Analytics", icon: Activity },
    { href: "/doctor/schedule", label: "Schedule", icon: Clock },
  ]

  const navigationItems = user.role === "doctor" ? doctorNavItems : patientNavItems

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-blue-900 backdrop-blur-lg border-b border-blue-800/40 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href={user.role === "doctor" ? "/doctor/dashboard" : "/"}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent hover:from-blue-300 hover:to-teal-200 transition-colors duration-300"
            >
              DocBook
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-100 hover:text-teal-300 hover:bg-blue-800/40 transition-colors px-4 py-2 text-base"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side - User Info & Mobile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Desktop User Info & Logout */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Notifications - Hidden on mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-blue-100 hover:text-teal-300 hover:bg-blue-800/40 relative p-3"
              >
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 border-0" />
              </Button>

              <div className="hidden md:block text-blue-100 text-base font-medium">Welcome, {user.name}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-blue-400/30 text-blue-100 hover:bg-blue-800/40 hover:border-blue-400/60 bg-transparent px-4 py-2 text-base"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-white hover:text-teal-300 hover:bg-blue-800/40 p-3"
                >
                  <Menu className="w-6 h-6 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border-blue-100 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b border-blue-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-800">{user.name}</p>
                        <Badge variant="outline" className="text-xs border-teal-500/50 text-teal-600 mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 py-6">
                    <div className="space-y-2 px-4">
                      {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50 h-14 text-base"
                          >
                            <item.icon className="w-6 h-6 mr-4" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Notifications */}
                    <div className="px-4 mt-8">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50 h-14 relative text-base"
                      >
                        <Bell className="w-6 h-6 mr-4" />
                        Notifications
                        <Badge className="ml-auto w-2 h-2 p-0 bg-red-500 border-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Footer - Logout */}
                  <div className="border-t border-blue-100 p-6">
                    <Button
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-14 text-base"
                    >
                      <LogOut className="w-6 h-6 mr-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
