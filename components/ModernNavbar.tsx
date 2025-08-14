"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, Video, Phone, User, LogOut, Menu, X, Calendar, BarChart, FileText, Users, Layout } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function ModernNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Check if we're in the doctor section
  const isDoctorSection = pathname?.includes('/doctor')

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <motion.nav
      className="bg-[#f8fafc] backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isDoctorSection ? "/doctor/dashboard" : "/"} className="flex items-center space-x-2">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isDoctorSection ? "DocBook" : "PractoCare"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {isDoctorSection && user?.role === "doctor" ? (
              // Doctor section navigation
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Layout className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/patients"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Users className="w-4 h-4" />
                    <span>Patients</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/prescriptions"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Prescriptions</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/analytics"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <BarChart className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/doctor/schedule"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </Link>
                </motion.div>
              </>
            ) : (
              // Regular navigation
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/find-doctors"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">Find Doctor</span>
                    <span className="xl:hidden">Find</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/consultations/video"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Video className="w-4 h-4" />
                    <span className="hidden xl:inline">Video Call</span>
                    <span className="xl:hidden">Video</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/consultations/call"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden xl:inline">Phone Call</span>
                    <span className="xl:hidden">Call</span>
                  </Link>
                </motion.div>

                {user && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/appointments"
                      className="flex items-center space-x-2 text-gray-700 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden xl:inline">Appointments</span>
                      <span className="xl:hidden">Appts</span>
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      Appointments
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "doctor" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/doctor/dashboard">
                          <Heart className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/doctor/reviews">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Reviews
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth">
                    <Button variant="outline" className="border-gray-300 text-indigo-600 hover:bg-gray-100 bg-transparent">
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative text-gray-700 hover:text-indigo-700 hover:bg-gray-100"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-gray-700" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6 text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white backdrop-blur-lg border-t border-gray-200">
                {isDoctorSection && user?.role === "doctor" ? (
                  // Doctor section mobile navigation
                  <>
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <Link
                        href="/doctor/dashboard"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Layout className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                      <Link
                        href="/doctor/profile"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <Link
                        href="/doctor/patients"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Patients</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                      <Link
                        href="/doctor/prescriptions"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Prescriptions</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <Link
                        href="/doctor/analytics"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart className="w-5 h-5" />
                        <span className="font-medium">Analytics</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                      <Link
                        href="/doctor/schedule"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Schedule</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  // Regular mobile navigation
                  <>
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <Link
                        href="/find-doctors"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Find Doctor</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <Link
                        href="/consultations/video"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Video className="w-5 h-5" />
                        <span className="font-medium">Video Consultation</span>
                      </Link>
                    </motion.div>

                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <Link
                        href="/consultations/call"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Phone className="w-5 h-5" />
                        <span className="font-medium">Call Consultation</span>
                      </Link>
                    </motion.div>

                    {user && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          href="/appointments"
                          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Calendar className="w-5 h-5" />
                          <span className="font-medium">My Appointments</span>
                        </Link>
                      </motion.div>
                    )}
                  </>
                )}

                {user ? (
                  <div className="space-y-1 pt-2 border-t border-gray-200">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-indigo-900 hover:bg-indigo-100 transition-all duration-200 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left rounded-lg"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-3 px-3 py-4 border-t border-gray-200"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link href="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-indigo-600 hover:bg-gray-100 bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
