"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  MessageSquare,
  FileText,
  AlertTriangle,
  Search,
  Plus,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [publishedAssignments, setPublishedAssignments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAssignments: 0,
    pendingReviews: 0,
    completionRate: 0,
  })

  useEffect(() => {
    const loadUserData = () => {
      try {
        const facultyData = localStorage.getItem("facultySession")
        if (facultyData) {
          const user = JSON.parse(facultyData)
          setCurrentUser(user)
          loadStats(user)
          loadPublishedAssignments(user)
          loadNotifications()
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const loadStats = async (user: any) => {
    try {
      const mockStats = {
        totalStudents: 45,
        activeAssignments: 8,
        pendingReviews: 12,
        completionRate: 78,
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStats(mockStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const loadPublishedAssignments = (user: any) => {
    const savedAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
    const published = savedAssignments.filter((assignment: any) => 
      assignment.status === "published" && assignment.faculty_id === user.id
    )
    setPublishedAssignments(published)
  }

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        type: "query",
        title: "Student Query",
        message: "New question from John Doe about Data Structures assignment",
        time: "2 hours ago",
        unread: true,
      },
      {
        id: 2,
        type: "submission",
        title: "Assignment Submission",
        message: "5 new submissions for Machine Learning project",
        time: "4 hours ago",
        unread: true,
      },
      {
        id: 3,
        type: "grievance",
        title: "Grievance Report",
        message: "New grievance submitted by student",
        time: "1 day ago",
        unread: false,
      },
    ]
    setNotifications(mockNotifications)
  }

  const todaysHubItems = [
    {
      id: 1,
      type: "student_query",
      title: "New Query from Rahul Sharma",
      description: "Question about Data Structures assignment - Binary Trees implementation",
      author: "Rahul Sharma (2024CSE0045)",
      time: "5 minutes ago",
      urgent: true,
      department: currentUser?.department || "CSE"
    },
    {
      id: 2,
      type: "assignment_submission",
      title: "Assignment Submission",
      description: "3 new submissions for 'Database Management Systems' assignment",
      author: "Multiple Students",
      time: "15 minutes ago",
      urgent: false,
      department: currentUser?.department || "CSE"
    },
    {
      id: 3,
      type: "lecture_reminder",
      title: "Upcoming Lecture",
      description: "Data Structures lecture in Room 301 at 2:00 PM",
      author: "Timetable System",
      time: "30 minutes ago",
      urgent: true,
      department: currentUser?.department || "CSE"
    },
    {
      id: 4,
      type: "grievance",
      title: "New Grievance Submitted",
      description: "Student complaint about laboratory equipment",
      author: "Anonymous Student",
      time: "1 hour ago",
      urgent: false,
      department: currentUser?.department || "CSE"
    },
    {
      id: 5,
      type: "lost_found",
      title: "Lost Item Report",
      description: "Student lost calculator in Computer Lab",
      author: "Priya Patel (2024CSE0023)",
      time: "2 hours ago",
      urgent: false,
      department: currentUser?.department || "CSE"
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'student_query': return <MessageCircle className="h-4 w-4" />
      case 'assignment_submission': return <BookOpen className="h-4 w-4" />
      case 'lecture_reminder': return <Clock className="h-4 w-4" />
      case 'grievance': return <AlertCircle className="h-4 w-4" />
      case 'lost_found': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600 bg-red-50 border-red-200'
    switch (type) {
      case 'student_query': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'assignment_submission': return 'text-green-600 bg-green-50 border-green-200'
      case 'lecture_reminder': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'grievance': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'lost_found': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

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
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentActivities: any[] = [
    // This will be populated with real activity data
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
        {/* Today's Hub */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              Today's Hub
            </h2>
            <span className="text-sm text-gray-500">{todaysHubItems.length} notifications</span>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {todaysHubItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.id * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${getNotificationColor(item.type, item.urgent)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.title}
                        {item.urgent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{item.author}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              View All Notifications
            </button>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Published Assignments Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Published Assignments
            </h3>
            <div className="space-y-3">
              {publishedAssignments.length === 0 ? (
                <p className="text-sm text-gray-500">No published assignments</p>
              ) : (
                publishedAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 text-sm">{assignment.title}</h4>
                    <p className="text-xs text-green-700">{assignment.department} - Year {assignment.year}</p>
                    <p className="text-xs text-gray-600 mt-1">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                ))
              )}
              {publishedAssignments.length > 3 && (
                <Link href="/dashboard/assignments" className="text-sm text-green-600 hover:text-green-700">
                  View all {publishedAssignments.length} assignments →
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/dashboard/assignments/create" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Create Assignment</span>
                </div>
              </Link>
              <Link href="/dashboard/announcements" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Post Announcement</span>
                </div>
              </Link>
              <Link href="/dashboard/study-material" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Upload Materials</span>
                </div>
              </Link>
              <Link href="/dashboard/timetable" className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Manage Timetable</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Assignment Completion</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.completionRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Student Engagement</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
