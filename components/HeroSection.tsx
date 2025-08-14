"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Video, Phone, ArrowRight, Heart, Shield, Star, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const floatingElements = [
  { icon: Heart, position: "top-10 left-10", delay: 0, color: "text-red-400" },
  { icon: Shield, position: "top-20 right-20", delay: 0.5, color: "text-blue-400" },
  { icon: Star, position: "bottom-20 left-20", delay: 1, color: "text-yellow-400" },
  { icon: Users, position: "bottom-10 right-10", delay: 1.5, color: "text-green-400" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-green-300 to-blue-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>
      </div>

      {/* Floating Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.position} ${element.color} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            rotate: 0,
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            delay: element.delay,
            y: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <element.icon className="w-8 h-8 sm:w-12 sm:h-12" />
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Hero Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex mb-6"
          >
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-blue-500/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Heart className="w-4 h-4 mr-2" />
              India's #1 Healthcare Platform 🇮🇳
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 sm:mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Our Priority
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Connect with qualified doctors instantly. Book appointments, get online consultations, and take control of
            your health journey with our premium healthcare platform.
          </motion.p>
        </motion.div>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Find Doctor Nearby */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border border-blue-100 bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-blue-800 text-xl sm:text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  Find Doctor Nearby
                </CardTitle>
                <CardDescription className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Discover qualified doctors in your area with ratings and reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/find-doctors">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 hover:border-blue-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent transition-colors duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl">
                      Explore Doctors
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Video Consultation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-emerald-800 text-xl sm:text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                  Video Consultation
                </CardTitle>
                <CardDescription className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Get instant medical advice through secure video calls
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/consultations/video">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 hover:border-emerald-300 group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:border-transparent transition-colors duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl">
                      Start Video Call
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call Consultation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ y: -10 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="group relative overflow-hidden border border-purple-100 bg-gradient-to-br from-white to-purple-50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-purple-800 text-xl sm:text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors duration-300">
                  Call Consultation
                </CardTitle>
                <CardDescription className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Quick medical consultation over phone calls
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/consultations/call">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 hover:border-purple-300 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white group-hover:border-transparent transition-colors duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl">
                      Make a Call
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center space-x-6 bg-white backdrop-blur-sm rounded-full px-4 sm:px-6 py-3 sm:py-4 border border-slate-200 shadow-md">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="text-sm sm:text-base font-medium text-slate-700">100% Secure</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-sm sm:text-base font-medium text-slate-700">Trusted by Millions</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-sm sm:text-base font-medium text-slate-700">Top Rated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
