"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Users, Calendar, Video, MessageCircle, Bell, Code, ChevronRight, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function StudentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState({
    name: "Gaikwad Sanket Sunil",
    prn: "2124UCEM2059",
    programme: "Computer Science and Engineering",
    year: "Third Year",
  })

  useEffect(() => {
    // Get user data from localStorage (from face authentication)
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser({
        name: user.name, // Use exact name from ID card
        prn: user.prn,
        programme: user.programme,
        year: user.admitted_year,
      })
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const menuItems = [
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Assignments",
      href: "/student-dashboard/assignments",
      description: "View and submit your assignments",
      color: "from-green-500 to-green-700",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Study Groups",
      href: "/student-dashboard/study-groups",
      description: "Join and participate in study groups",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: <Video className="h-8 w-8 text-red-600" />,
      title: "Virtual Classroom",
      href: "/student-dashboard/virtual-classroom",
      description: "Attend online classes and lectures",
      color: "from-red-500 to-red-700",
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Events",
      href: "/student-dashboard/events",
      description: "View and register for upcoming events",
      color: "from-orange-500 to-orange-700",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-yellow-600" />,
      title: "Queries",
      href: "/student-dashboard/queries",
      description: "Ask questions and get help from faculty",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      icon: <Bell className="h-8 w-8 text-pink-600" />,
      title: "Announcements",
      href: "/student-dashboard/announcements",
      description: "View important announcements",
      color: "from-pink-500 to-pink-700",
    },
    {
      icon: <Code className="h-8 w-8 text-teal-600" />,
      title: "Compiler",
      href: "/student-dashboard/compiler",
      description: "Access online coding environment",
      color: "from-teal-500 to-teal-700",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-100">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Award className="h-8 w-8 text-green-200" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {currentUser.name}</h1>
          <p className="text-green-100 text-lg">
            PRN: {currentUser.prn} • {currentUser.year}
          </p>
          <p className="text-green-200 text-sm mt-1">{currentUser.programme}</p>
          <div className="mt-4 flex items-center gap-2 text-green-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Academic Status: Active</span>
          </div>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48">
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {menuItems.map((menuItem, index) => (
            <motion.div key={index} variants={item}>
              <Link href={menuItem.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
                  <CardContent className="p-6 flex flex-col h-full relative overflow-hidden">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${menuItem.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>

                    {/* Icon */}
                    <motion.div
                      className="mb-4 relative z-10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300">
                        {menuItem.icon}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-grow relative z-10">
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-gray-800 transition-colors">
                        {menuItem.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                        {menuItem.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-end mt-4 relative z-10">
                      <motion.div
                        className="text-gray-400 group-hover:text-gray-600"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-lg transition-all duration-300"></div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
