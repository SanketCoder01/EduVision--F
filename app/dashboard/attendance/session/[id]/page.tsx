"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, UserCheck, UserX, Clock, Calendar, Download, RefreshCw, Eye, MapPin, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import * as XLSX from 'xlsx'

interface AttendanceRecord {
  id: string
  student_name: string
  student_email: string
  student_prn: string
  status: 'present' | 'absent' | 'pending'
  marked_at: string | null
  face_confidence: number | null
  location_verified: boolean
  absence_note: string | null
}

interface SessionData {
  id: string
  subject: string
  class_name: string
  department: string
  year: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  is_active: boolean
  faculty_name: string
  student_list_id: string
}

export default function AttendanceSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [studentList, setStudentList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (sessionId) {
      loadSessionData()
      setupRealtimeSubscription()
    }
  }, [sessionId])

  const loadSessionData = async () => {
    try {
      // Load session details
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      setSessionData(session)

      // Load student list
      if (session.student_list_id) {
        const { data: students, error: studentsError } = await supabase
          .from('student_list_entries')
          .select('*')
          .eq('list_id', session.student_list_id)

        if (studentsError) throw studentsError
        setStudentList(students || [])

        // Initialize attendance records for all students
        await initializeAttendanceRecords(session.id, students || [])
      }

      // Load existing attendance records
      await loadAttendanceRecords()
    } catch (error) {
      console.error('Error loading session data:', error)
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAttendanceRecords = async (sessionId: string, students: any[]) => {
    try {
      // Check if records already exist
      const { data: existingRecords } = await supabase
        .from('attendance_records')
        .select('student_email')
        .eq('session_id', sessionId)

      const existingEmails = existingRecords?.map(r => r.student_email) || []
      
      // Create records for students who don't have them yet
      const newRecords = students
        .filter(student => !existingEmails.includes(student.email))
        .map(student => ({
          session_id: sessionId,
          student_name: student.full_name,
          student_email: student.email,
          student_prn: student.prn,
          student_department: student.department || sessionData?.department || '',
          student_year: student.year || sessionData?.year || '',
          status: 'absent' as const
        }))

      if (newRecords.length > 0) {
        await supabase
          .from('attendance_records')
          .insert(newRecords)
      }

      // Also initialize real-time tracking
      const realtimeRecords = students.map(student => ({
        session_id: sessionId,
        student_email: student.email,
        student_name: student.full_name,
        student_prn: student.prn,
        status: 'pending' as const
      }))

      await supabase
        .from('real_time_attendance')
        .upsert(realtimeRecords, { onConflict: 'session_id,student_email' })

    } catch (error) {
      console.error('Error initializing attendance records:', error)
    }
  }

  const loadAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', sessionId)
        .order('student_name')

      if (error) throw error
      setAttendanceRecords(data || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading attendance records:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('attendance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Real-time attendance update:', payload)
          loadAttendanceRecords()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'real_time_attendance',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Real-time status update:', payload)
          loadAttendanceRecords()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const exportToExcel = () => {
    if (!sessionData || attendanceRecords.length === 0) return

    const exportData = attendanceRecords.map(record => ({
      'Student Name': record.student_name,
      'PRN': record.student_prn,
      'Email': record.student_email,
      'Status': record.status.toUpperCase(),
      'Marked At': record.marked_at ? new Date(record.marked_at).toLocaleString() : 'Not Marked',
      'Face Confidence': record.face_confidence ? `${record.face_confidence}%` : 'N/A',
      'Location Verified': record.location_verified ? 'Yes' : 'No',
      'Absence Note': record.absence_note || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

    const fileName = `${sessionData.subject}_${sessionData.session_date}_Attendance.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast({
      title: "Success",
      description: "Attendance data exported successfully",
    })
  }

  const presentStudents = attendanceRecords.filter(r => r.status === 'present')
  const absentStudents = attendanceRecords.filter(r => r.status === 'absent')
  const pendingStudents = attendanceRecords.filter(r => r.status === 'pending')

  const attendanceRate = attendanceRecords.length > 0 
    ? Math.round((presentStudents.length / attendanceRecords.length) * 100) 
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 font-sans">Session Not Found</h2>
          <p className="text-gray-600 font-sans">The attendance session you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">{sessionData.subject} - Live Attendance</h1>
          <p className="text-gray-600 font-sans">
            {sessionData.class_name} • {new Date(sessionData.session_date).toLocaleDateString()} • 
            {sessionData.start_time} - {sessionData.end_time}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadAttendanceRecords}
            className="font-sans"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportToExcel}
            className="font-sans"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-sans">Total Students</p>
                <p className="text-2xl font-bold text-blue-600 font-sans">{attendanceRecords.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-sans">Present</p>
                <p className="text-2xl font-bold text-green-600 font-sans">{presentStudents.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-sans">Absent</p>
                <p className="text-2xl font-bold text-red-600 font-sans">{absentStudents.length}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-sans">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600 font-sans">{attendanceRate}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">{attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium font-sans">Live Updates Active</span>
            </div>
            <p className="text-xs text-gray-500 font-sans">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Split View: Present vs Absent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Present Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-sans text-green-700">
              <UserCheck className="h-5 w-5 mr-2" />
              Present Students ({presentStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {presentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-sans">No students marked present yet</p>
                </div>
              ) : (
                presentStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {student.student_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium font-sans text-sm">{student.student_name}</h4>
                        <p className="text-xs text-gray-600 font-sans">{student.student_prn}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {student.marked_at ? new Date(student.marked_at).toLocaleTimeString() : 'Just now'}
                      </Badge>
                      {student.face_confidence && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Camera className="h-3 w-3 mr-1" />
                          {student.face_confidence}% confidence
                        </p>
                      )}
                      {student.location_verified && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location verified
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Absent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-sans text-red-700">
              <UserX className="h-5 w-5 mr-2" />
              Absent Students ({absentStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {absentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-sans">All students are present!</p>
                </div>
              ) : (
                absentStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                          {student.student_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium font-sans text-sm">{student.student_name}</h4>
                        <p className="text-xs text-gray-600 font-sans">{student.student_prn}</p>
                        {student.absence_note && (
                          <p className="text-xs text-red-600 font-sans mt-1">
                            Note: {student.absence_note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        <UserX className="h-3 w-3 mr-1" />
                        Absent
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Students (if any) */}
      {pendingStudents.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center font-sans text-yellow-700">
              <Clock className="h-5 w-5 mr-2" />
              Pending Students ({pendingStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xs">
                      {student.student_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium font-sans text-sm">{student.student_name}</h4>
                    <p className="text-xs text-gray-600 font-sans">{student.student_prn}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
