"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  Calendar,
  Video,
  MessageCircle,
  Bell,
  Code,
  ChevronRight,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Coins,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingTasks: 0,
    studyHours: 0,
  })

  useEffect(() => {
    // Get user data from localStorage
    const studentSession = localStorage.getItem("studentSession")
    const currentUserData = localStorage.getItem("currentUser")

    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Load dynamic stats
    loadStats()

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const loadStats = () => {
    try {
      // Get assignments for this student's department
      const allAssignments = JSON.parse(localStorage.getItem("facultyAssignments") || "[]")
      const departmentAssignments = currentUser?.department
        ? allAssignments.filter((assignment: any) => assignment.department === currentUser.department)
        : []

      // Get student's submissions
      const allSubmissions = JSON.parse(localStorage.getItem("assignmentSubmissions") || "[]")
      const studentSubmissions = allSubmissions.filter((submission: any) => submission.studentId === currentUser?.id)

      setStats({
        totalAssignments: departmentAssignments.length,
        completedAssignments: studentSubmissions.filter((s: any) => s.status === "submitted" || s.status === "graded")
          .length,
        pendingTasks: departmentAssignments.length - studentSubmissions.length,
        studyHours: 0, // This would be tracked separately
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const menuItems = [
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Assignments",
      href: "/student-dashboard/assignments",
      description: "View and submit your assignments",
      color: "from-green-500 to-green-700",
      count: `${stats.pendingTasks} Pending`,
    },
    {
      icon: <Code className="h-8 w-8 text-teal-600" />,
      title: "Compiler",
      href: "/student-dashboard/compiler",
      description: "Access online coding environment",
      color: "from-teal-500 to-teal-700",
      count: "Available",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Study Groups",
      href: "/student-dashboard/study-groups",
      description: "Join and participate in study groups",
      color: "from-blue-500 to-blue-700",
      count: "Available",
    },
    {
      icon: <Video className="h-8 w-8 text-red-600" />,
      title: "Virtual Classroom",
      href: "/student-dashboard/virtual-classroom",
      description: "Attend online classes and lectures",
      color: "from-red-500 to-red-700",
      count: "Available",
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Events",
      href: "/student-dashboard/events",
      description: "View and register for upcoming events",
      color: "from-orange-500 to-orange-700",
      count: "Available",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-yellow-600" />,
      title: "Queries",
      href: "/student-dashboard/queries",
      description: "Ask questions and get help from faculty",
      color: "from-yellow-500 to-yellow-700",
      count: "Available",
    },
    {
      icon: <Bell className="h-8 w-8 text-pink-600" />,
      title: "Announcements",
      href: "/student-dashboard/announcements",
      description: "View important announcements",
      color: "from-pink-500 to-pink-700",
      count: "Available",
    },
    {
      icon: <Coins className="h-8 w-8 text-cyan-600" />,
      title: "Web3",
      href: "/student-dashboard/web3",
      description: "Explore blockchain and Web3 features",
      color: "from-cyan-500 to-cyan-700",
      count: "New",
    },
  ]

  const statsCards = [
    {
      title: "Assignments Completed",
      value: stats.completedAssignments.toString(),
      total: stats.totalAssignments.toString(),
      percentage:
        stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Current CGPA",
      value: "0.0",
      change: "+0.0",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      change: "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Study Hours",
      value: `${stats.studyHours}h`,
      change: "+0h",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const upcomingDeadlines = [
    // This will be populated with real assignment deadlines
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Award className="h-8 w-8 text-white/60" />
          </motion.div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {currentUser?.name || "Student"}</h1>
          <p className="text-white/90 text-lg">
            PRN: {currentUser?.prn || "N/A"} • {currentUser?.year || "Year"}
          </p>
          <p className="text-white/80 text-sm mt-1">{currentUser?.department || "Department"}</p>
          <div className="mt-4 flex items-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Academic Status: Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.percentage !== undefined && (
                      <div className="mt-2">
                        <Progress value={stat.percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{stat.percentage}% Complete</p>
                      </div>
                    )}
                    {stat.change && <p className={`text-sm text-gray-500`}>{stat.change} from last month</p>}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Menu Items */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {menuItems.map((menuItem, index) => (
              <motion.div key={index} variants={item}>
                <Link href={menuItem.href}>
                  <Card className="group hover:shadow-xl transition-all duration-300 h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer">
                    <CardContent className="p-6 flex flex-col h-full relative overflow-hidden">
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${menuItem.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>

                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors duration-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {menuItem.icon}
                        </motion.div>
                        <Badge variant="secondary" className="text-xs">
                          {menuItem.count}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-grow relative z-10">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-gray-800 transition-colors">
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
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h2>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Tasks & Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming deadlines</p>
                  <p className="text-sm text-gray-400">Assignments will appear here when available</p>
                </div>
              ) : (
                upcomingDeadlines.map((deadline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 border-green-500 bg-green-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{deadline.title}</h4>
                        <p className="text-sm text-gray-600">{deadline.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">Due in {deadline.dueDate}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
