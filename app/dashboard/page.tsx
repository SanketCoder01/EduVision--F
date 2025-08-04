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
  UserCheck,
  Bell,
  Code,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAssignments: 0,
    pendingReviews: 0,
    completionRate: 0,
  })

  useEffect(() => {
    // Get user data from localStorage
    const facultySession = localStorage.getItem("facultySession")
    const currentUserData = localStorage.getItem("currentUser")

    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing faculty session:", error)
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
      // Get students from the same department
      const allStudents = JSON.parse(localStorage.getItem("universityStudents") || "[]")
      const departmentStudents = currentUser?.department
        ? allStudents.filter((student: any) => student.department === currentUser.department)
        : []

      // Get assignments created by this faculty
      const allAssignments = JSON.parse(localStorage.getItem("facultyAssignments") || "[]")
      const facultyAssignments = allAssignments.filter((assignment: any) => assignment.facultyId === currentUser?.id)

      // Get submissions
      const allSubmissions = JSON.parse(localStorage.getItem("assignmentSubmissions") || "[]")
      const pendingSubmissions = allSubmissions.filter(
        (submission: any) => submission.status === "submitted" && !submission.graded,
      )

      setStats({
        totalStudents: departmentStudents.length,
        activeAssignments: facultyAssignments.filter((a: any) => a.status === "published").length,
        pendingReviews: pendingSubmissions.length,
        completionRate:
          facultyAssignments.length > 0
            ? Math.round(
                (allSubmissions.filter((s: any) => s.status === "graded").length / facultyAssignments.length) * 100,
              )
            : 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const menuItems = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Assignments",
      description: "Create and manage student assignments",
      href: "/dashboard/assignments",
      color: "from-blue-500 to-blue-700",
      count: `${stats.activeAssignments} Active`,
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Study Groups",
      href: "/dashboard/study-groups",
      description: "Organize and monitor study groups",
      color: "from-blue-500 to-blue-700",
      count: "Available",
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Events",
      href: "/dashboard/events",
      description: "Manage event registrations and attendance",
      color: "from-green-500 to-green-700",
      count: "Available",
    },
    {
      icon: <Video className="h-8 w-8 text-red-600" />,
      title: "Virtual Classroom",
      href: "/dashboard/virtual-classroom",
      description: "Schedule and conduct online classes",
      color: "from-red-500 to-red-700",
      count: "Available",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-yellow-600" />,
      title: "Student Queries",
      href: "/dashboard/queries",
      description: "Answer student questions and concerns",
      color: "from-yellow-500 to-yellow-700",
      count: "Available",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-indigo-600" />,
      title: "Mentorship",
      href: "/dashboard/mentorship",
      description: "Schedule and track mentorship sessions",
      color: "from-indigo-500 to-indigo-700",
      count: `${stats.totalStudents} Students`,
    },
    {
      icon: <Bell className="h-8 w-8 text-pink-600" />,
      title: "Announcements",
      href: "/dashboard/announcements",
      description: "Post important notifications",
      color: "from-pink-500 to-pink-700",
      count: "Available",
    },
    {
      icon: <Code className="h-8 w-8 text-teal-600" />,
      title: "Compiler",
      href: "/dashboard/compiler",
      description: "Access online coding environment",
      color: "from-teal-500 to-teal-700",
      count: "Available",
    },
    {
      icon: <Settings className="h-8 w-8 text-purple-600" />,
      title: "Other Services",
      href: "/dashboard/other-services",
      description: "Access additional campus services and resources",
      color: "from-purple-500 to-purple-700",
      count: "New",
    },
  ]

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      change: "+0%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Assignments",
      value: stats.activeAssignments.toString(),
      change: "+0",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews.toString(),
      change: "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      change: "+0%",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const recentActivities = [
    // This will be populated with real data when activities are implemented
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
        className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-white/60" />
          </motion.div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {currentUser?.name || "Faculty Member"}</h1>
          <p className="text-white/90 text-lg">
            {currentUser?.designation || "Professor"} • {currentUser?.department || "Department"}
          </p>
          <div className="mt-4 flex items-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">System Status: All services operational</span>
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
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm text-gray-500`}>{stat.change} from last month</p>
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

        {/* Recent Activities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Latest Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400">Activities will appear here as you use the system</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-gray-50`}>
                      <CheckCircle className={`h-4 w-4 text-green-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
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
