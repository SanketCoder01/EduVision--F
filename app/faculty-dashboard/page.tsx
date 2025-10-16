"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  Calendar,
  Bell,
  Upload,
  ClipboardCheck,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import SupabaseAPI from "@/lib/supabase-api"
import { getAccessibleDepartments } from "@/lib/department-security"

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  designation?: string
  accessible_departments?: string[]
}

export default function FacultyDashboardPage() {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingSubmissions: 0,
    totalStudents: 0,
    upcomingClasses: 0
  })
  const [recentAssignments, setRecentAssignments] = useState<any[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
  const [accessibleDepartments, setAccessibleDepartments] = useState<string[]>([])

  useEffect(() => {
    loadFacultyData()
  }, [])

  const loadFacultyData = async () => {
    try {
      const facultySession = localStorage.getItem("facultySession")
      const currentUser = localStorage.getItem("currentUser")
      
      let user = null
      if (facultySession) {
        user = JSON.parse(facultySession)
      } else if (currentUser) {
        user = JSON.parse(currentUser)
      }

      if (!user) {
        router.push('/login')
        return
      }

      // Get faculty details from database
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (facultyData) {
        setFaculty(facultyData)
        
        // Set accessible departments based on faculty department
        const accessible = getAccessibleDepartments(facultyData.department)
        setAccessibleDepartments(accessible)

        // Load dashboard data
        await loadDashboardStats(facultyData)
      }
    } catch (error) {
      console.error('Error loading faculty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async (facultyData: Faculty) => {
    try {
      // Get assignments created by faculty
      const { data: assignments } = await SupabaseAPI.Assignment.getFacultyAssignments(facultyData.id)
      
      // Get recent submissions
      const allSubmissions: any[] = []
      if (assignments) {
        for (const assignment of assignments.slice(0, 5)) {
          const { data: subs } = await SupabaseAPI.Assignment.getAssignmentSubmissions(assignment.id)
          if (subs) {
            allSubmissions.push(...subs.map(s => ({ ...s, assignment_title: assignment.title })))
          }
        }
      }

      // Get student count for accessible departments
      let studentCount = 0
      for (const dept of getAccessibleDepartments(facultyData.department)) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept)
        studentCount += count || 0
      }

      setStats({
        totalAssignments: assignments?.length || 0,
        pendingSubmissions: allSubmissions.filter(s => s.status === 'submitted').length,
        totalStudents: studentCount,
        upcomingClasses: 0
      })

      setRecentAssignments(assignments?.slice(0, 5) || [])
      setRecentSubmissions(allSubmissions.slice(0, 5))

      // Set up real-time subscriptions
      setupRealtimeSubscriptions(facultyData)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const setupRealtimeSubscriptions = (facultyData: Faculty) => {
    // Subscribe to new submissions
    const assignmentsChannel = supabase
      .channel('faculty-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_submissions'
        },
        (payload) => {
          console.log('New submission received:', payload)
          loadDashboardStats(facultyData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(assignmentsChannel)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-32 bg-gray-200 rounded-xl mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
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
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome, {faculty?.name}!</h1>
          <p className="text-white/90 text-lg">
            {faculty?.designation} • {faculty?.department} Department
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {accessibleDepartments.map(dept => (
              <span key={dept} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Access: {dept}
              </span>
            ))}
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
        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalAssignments}</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingSubmissions}</p>
                </div>
                <div className="p-3 bg-orange-600 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-green-600 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.upcomingClasses}</p>
                </div>
                <div className="p-3 bg-purple-600 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button
              onClick={() => router.push('/faculty-dashboard/assignments/create')}
              className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Assignment</span>
            </Button>
            
            <Button
              onClick={() => router.push('/faculty-dashboard/announcements/create')}
              className="h-24 flex-col gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Bell className="h-6 w-6" />
              <span className="text-sm">Announce</span>
            </Button>
            
            <Button
              onClick={() => router.push('/faculty-dashboard/attendance')}
              className="h-24 flex-col gap-2 bg-green-600 hover:bg-green-700"
            >
              <ClipboardCheck className="h-6 w-6" />
              <span className="text-sm">Attendance</span>
            </Button>
            
            <Button
              onClick={() => router.push('/faculty-dashboard/materials/upload')}
              className="h-24 flex-col gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Upload Material</span>
            </Button>
            
            <Button
              onClick={() => router.push('/faculty-dashboard/events/create')}
              className="h-24 flex-col gap-2 bg-pink-600 hover:bg-pink-700"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Create Event</span>
            </Button>
            
            <Button
              onClick={() => router.push('/faculty-dashboard/quiz/create')}
              className="h-24 flex-col gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Create Quiz</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No assignments yet</p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => router.push(`/faculty-dashboard/assignments/${assignment.id}`)}
                  >
                    <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">{assignment.department} - {assignment.year}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => router.push('/faculty-dashboard/assignments')}
              variant="outline"
              className="w-full mt-4"
            >
              View All Assignments
            </Button>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No submissions yet</p>
              ) : (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900">{submission.assignment_title}</h4>
                    <p className="text-sm text-gray-600">{submission.student?.name || 'Unknown Student'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      submission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => router.push('/faculty-dashboard/submissions')}
              variant="outline"
              className="w-full mt-4"
            >
              View All Submissions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

