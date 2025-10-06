"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Plus, Calendar, Clock, FileText, BarChart3, TrendingUp, CheckCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseAttendanceService } from "@/lib/supabase-attendance"
import { supabase } from "@/lib/supabase"

export default function AttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [facultySessions, setFacultySessions] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentFaculty, setCurrentFaculty] = useState<any>(null)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      // Get current faculty from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find faculty in faculty table
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (facultyData) {
          setCurrentFaculty(facultyData)
          await loadDashboardData(facultyData)
        }
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async (faculty: any) => {
    try {
      // Load recent sessions
      const sessions = await SupabaseAttendanceService.getFacultyAttendanceSessions(faculty.email)
      setFacultySessions(sessions.slice(0, 5)) // Show only recent 5 sessions

      // Calculate basic stats
      const totalSessions = sessions.length
      const activeSessions = sessions.filter(s => s.is_active === true).length
      const closedSessions = sessions.filter(s => s.is_active === false).length
      
      setAttendanceStats({
        totalSessions,
        activeSessions,
        closedSessions,
        thisWeekSessions: sessions.filter(s => {
          const sessionDate = new Date(s.session_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return sessionDate >= weekAgo
        }).length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">Attendance Management</h1>
          <p className="text-gray-600 font-sans">Create sessions, track attendance, and view reports</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/attendance/create')}>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold font-sans">Create New Session</h3>
              <p className="text-sm text-gray-600 font-sans">Start a new attendance session for your class</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/attendance/records')}>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold font-sans">View Records</h3>
              <p className="text-sm text-gray-600 font-sans">View and manage attendance records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/attendance/settings')}>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold font-sans">Settings</h3>
              <p className="text-sm text-gray-600 font-sans">Manage student lists and configurations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-sans">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600 font-sans">{attendanceStats.totalSessions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-sans">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600 font-sans">{attendanceStats.activeSessions}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-sans">Completed</p>
                  <p className="text-2xl font-bold text-gray-600 font-sans">{attendanceStats.closedSessions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-sans">This Week</p>
                  <p className="text-2xl font-bold text-purple-600 font-sans">{attendanceStats.thisWeekSessions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-sans">Recent Sessions</CardTitle>
              <CardDescription className="font-sans">Your latest attendance sessions</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/attendance/records')}
              className="font-sans"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {facultySessions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-sans">No Sessions Yet</h3>
              <p className="text-gray-500 font-sans mb-4">Create your first attendance session to get started</p>
              <Button onClick={() => router.push('/dashboard/attendance/create')} className="font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {facultySessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium font-sans">{session.subject}</h4>
                      <p className="text-sm text-gray-600 font-sans">
                        {session.class_name} • {formatDate(session.session_date)}
                      </p>
                      <p className="text-sm text-gray-500 font-sans">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)} ({session.duration_minutes} min)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={session.is_active ? 'default' : 'secondary'}
                        className={session.is_active ? 'bg-green-100 text-green-800' : ''}
                      >
                        {session.is_active ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {session.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

