"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { SupabaseRealtimeService, Student } from "@/lib/supabase-realtime"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Student | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingTasks: 0,
    studyHours: 0,
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const studentSession = localStorage.getItem("studentSession")
        const currentUserData = localStorage.getItem("currentUser")
        
        let user = null
        if (studentSession) {
          user = JSON.parse(studentSession)
        } else if (currentUserData) {
          user = JSON.parse(currentUserData)
        }
        
        if (user) {
          setCurrentUser(user)
          await loadDashboardData(user)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const loadDashboardData = async (user: Student) => {
    try {
      const data = await SupabaseRealtimeService.getTodaysHubData(user)
      
      setAssignments(data.assignments)
      setAnnouncements(data.announcements)
      setEvents(data.events)
      setStudyGroups(data.studyGroups)
      setAttendance(data.attendance)
      
      // Calculate stats from real data
      const totalAssignments = data.assignments.length
      const completedAssignments = 0 // This would come from submission data
      const pendingTasks = data.assignments.filter(a => new Date(a.due_date) > new Date()).length
      
      setStats({
        totalAssignments,
        completedAssignments,
        pendingTasks,
        studyHours: 0 // This would come from study tracking
      })
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions(user)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }
  
  const setupRealtimeSubscriptions = (user: Student) => {
    // Subscribe to real-time changes for assignments
    SupabaseRealtimeService.subscribeToTable('assignments', () => {
      loadDashboardData(user)
    })
    
    // Subscribe to announcements
    SupabaseRealtimeService.subscribeToTable('announcements', () => {
      loadDashboardData(user)
    })
    
    // Subscribe to events
    SupabaseRealtimeService.subscribeToTable('events', () => {
      loadDashboardData(user)
    })
    
    SupabaseRealtimeService.subscribeToTable('announcements', () => {
      loadDashboardData(user)
    })
    
    SupabaseRealtimeService.subscribeToTable('events', () => {
      loadDashboardData(user)
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  interface TodaysHubItem {
    id: string
    type: string
    title: string
    description: string
    author: string
    time: string
    urgent: boolean
    department: string
    assignment_id?: string
  }

  // Today's Hub data from real Supabase data
  const todaysHubItems: TodaysHubItem[] = [
    // Real assignments
    ...assignments.slice(0, 3).map((assignment): TodaysHubItem => ({
      id: `assignment_${assignment.id}`,
      type: "assignment",
      title: assignment.title,
      description: `Due: ${new Date(assignment.due_date).toLocaleDateString()} - ${assignment.assignment_type}`,
      author: assignment.faculty?.name || "Faculty",
      time: getRelativeTime(assignment.created_at),
      urgent: new Date(assignment.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000,
      department: assignment.department,
      assignment_id: assignment.id
    })),
    // Real announcements
    ...announcements.slice(0, 2).map((announcement): TodaysHubItem => ({
      id: `announcement_${announcement.id}`,
      type: "announcement",
      title: announcement.title,
      description: announcement.content.substring(0, 100) + '...',
      author: announcement.faculty?.name || "Faculty",
      time: getRelativeTime(announcement.created_at),
      urgent: announcement.priority === 'urgent' || announcement.priority === 'high',
      department: announcement.department || "All"
    })),
    // Real events
    ...events.slice(0, 2).map((event): TodaysHubItem => ({
      id: `event_${event.id}`,
      type: "event",
      title: event.title,
      description: `${event.description.substring(0, 80)}... - ${new Date(event.event_date).toLocaleDateString()}`,
      author: event.faculty?.name || "Event Organizer",
      time: getRelativeTime(event.created_at),
      urgent: new Date(event.event_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000,
      department: event.department || "All"
    }))
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

  // Real upcoming deadlines from assignments
  const upcomingDeadlines = assignments
    .filter(assignment => new Date(assignment.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)
    .map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      subject: assignment.assignment_type,
      dueDate: new Date(assignment.due_date).toLocaleDateString(),
      urgent: new Date(assignment.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000
    }))

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-none mx-auto space-y-4 md:space-y-6 lg:space-y-8">
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome back, {currentUser?.name || currentUser?.full_name || "Student"}</h1>
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Today's Hub */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Hub</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {todaysHubItems.map((hubItem, index) => (
              <motion.div key={hubItem.id} variants={item}>
                <div 
                  className={`p-4 rounded-lg border-l-4 cursor-pointer ${
                    hubItem.urgent ? 'border-red-500 bg-red-50' :
                    hubItem.type === 'assignment' ? 'border-green-500 bg-green-50' :
                    hubItem.type === 'announcement' ? 'border-blue-500 bg-blue-50' :
                    hubItem.type === 'event' ? 'border-purple-500 bg-purple-50' :
                    'border-gray-500 bg-gray-50'
                  } hover:shadow-md transition-shadow`}
                  onClick={() => {
                    if (hubItem.type === 'assignment') {
                      router.push(`/student-dashboard/assignments/${hubItem.id}`)
                    } else if (hubItem.type === 'announcement') {
                      router.push(`/student-dashboard/announcements/${hubItem.id}`)
                    } else if (hubItem.type === 'event') {
                      router.push(`/student-dashboard/events/${hubItem.id}`)
                    } else {
                      router.push('/student-dashboard/todays-hub')
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          hubItem.type === 'assignment' ? 'bg-green-100 text-green-700' :
                          hubItem.type === 'announcement' ? 'bg-blue-100 text-blue-700' :
                          hubItem.type === 'event' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {hubItem.type.charAt(0).toUpperCase() + hubItem.type.slice(1).replace('_', ' ')}
                        </span>
                        {hubItem.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{hubItem.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{hubItem.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {hubItem.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {hubItem.time}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {hubItem.type === 'assignment' && <BookOpen className="h-5 w-5 text-green-600" />}
                      {hubItem.type === 'announcement' && <Bell className="h-5 w-5 text-blue-600" />}
                      {hubItem.type === 'event' && <Calendar className="h-5 w-5 text-purple-600" />}
                      {hubItem.type === 'lost_found' && <AlertCircle className="h-5 w-5 text-gray-600" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
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
                    key={deadline.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                      deadline.urgent ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                    }`}
                    onClick={() => router.push(`/student-dashboard/assignments/${deadline.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{deadline.title}</h4>
                        <p className="text-sm text-gray-600">{deadline.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {deadline.dueDate}</p>
                        {deadline.urgent && (
                          <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Due Soon!
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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
