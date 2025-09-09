"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  Calendar,
  MessageCircle,
  Bell,
  Code,
  ChevronRight,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Bot,
  GraduationCap,
} from "lucide-react"

export default function StudentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Static stats to prevent infinite loops
  const stats = {
    totalAssignments: 5,
    completedAssignments: 3,
    pendingTasks: 2,
    studyHours: 24,
  }

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

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (currentUser) {
      // Load published assignments for this student
      const savedAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      const studentAssignments = savedAssignments.filter((assignment: any) => 
        assignment.status === "published" && 
        assignment.department === currentUser.department && 
        assignment.year === currentUser.year
      )
      setAssignments(studentAssignments)
    }
  }, [currentUser])

  // Today's Hub data - faculty posts and notifications with real assignment data
  const todaysHubItems = [
    ...assignments.slice(0, 2).map((assignment, index) => ({
      id: `assignment_${assignment.id}`,
      type: "assignment",
      title: assignment.title,
      description: `Due: ${new Date(assignment.due_date).toLocaleDateString()} - ${assignment.ai_generated ? '🤖 AI Generated' : ''} ${assignment.difficulty ? `(${assignment.difficulty})` : ''}`,
      author: "Faculty",
      time: "Recently published",
      urgent: new Date(assignment.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000, // Due within 3 days
      department: assignment.department,
      assignment_id: assignment.id
    })),
    {
      id: 1,
      type: "assignment",
      title: "Data Structures Assignment 3",
      description: "Complete the binary tree implementation by Friday",
      author: "Dr. Smith",
      time: "2 hours ago",
      urgent: true,
      department: currentUser?.department || "CSE"
    },
    {
      id: 2,
      type: "announcement",
      title: "Mid-term Exam Schedule Released",
      description: "Check your exam timetable on the portal",
      author: "Academic Office",
      time: "4 hours ago",
      urgent: false,
      department: "All"
    },
    {
      id: 3,
      type: "event",
      title: "Tech Fest 2024 Registration Open",
      description: "Register for coding competitions and workshops",
      author: "Student Council",
      time: "6 hours ago",
      urgent: false,
      department: "All"
    },
    {
      id: 4,
      type: "lost_found",
      title: "Lost: Black Laptop Bag",
      description: "Found near library, contact if yours",
      author: "Security Desk",
      time: "1 day ago",
      urgent: false,
      department: "All"
    }
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

  const upcomingDeadlines: any[] = [
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
            <div className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.percentage !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stat.percentage}% Complete</p>
                      </div>
                    )}
                    {stat.change && <p className={`text-sm text-gray-500`}>{stat.change} from last month</p>}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Today's Hub */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Hub</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {todaysHubItems.map((item, index) => (
              <motion.div key={item.id} variants={item}>
                <div className={`p-4 rounded-lg border-l-4 ${
                  item.urgent ? 'border-red-500 bg-red-50' :
                  item.type === 'assignment' ? 'border-green-500 bg-green-50' :
                  item.type === 'announcement' ? 'border-blue-500 bg-blue-50' :
                  item.type === 'event' ? 'border-purple-500 bg-purple-50' :
                  'border-gray-500 bg-gray-50'
                } hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'assignment' ? 'bg-green-100 text-green-700' :
                          item.type === 'announcement' ? 'bg-blue-100 text-blue-700' :
                          item.type === 'event' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' ')}
                        </span>
                        {item.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {item.type === 'assignment' && <BookOpen className="h-5 w-5 text-green-600" />}
                      {item.type === 'announcement' && <Bell className="h-5 w-5 text-blue-600" />}
                      {item.type === 'event' && <Calendar className="h-5 w-5 text-purple-600" />}
                      {item.type === 'lost_found' && <AlertCircle className="h-5 w-5 text-gray-600" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* View All Button */}
            <motion.div variants={item} className="text-center pt-4">
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors">
                View All Notifications
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h2>
          <div className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold">Tasks & Assignments</h3>
            </div>
            <div className="p-6 pt-2 space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
