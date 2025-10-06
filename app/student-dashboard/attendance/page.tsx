"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Users, CheckCircle, AlertCircle, BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SupabaseAttendanceService } from "@/lib/supabase-attendance"
import { supabase } from "@/lib/supabase"

export default function StudentAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [myAttendanceHistory, setMyAttendanceHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [absenceNote, setAbsenceNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [attendanceStats, setAttendanceStats] = useState<any>(null)

  useEffect(() => {
    initializeAttendanceData()
  }, [])

  const initializeAttendanceData = async () => {
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find student in appropriate department table
        const departments = ['cse', 'cyber', 'aids', 'aiml']
        const years = ['1st', '2nd', '3rd', '4th']
        
        let studentData = null
        for (const dept of departments) {
          for (const year of years) {
            const { data } = await supabase
              .from(`students_${dept}_${year}_year`)
              .select('*')
              .eq('email', user.email)
              .single()
            
            if (data) {
              studentData = data
              break
            }
          }
          if (studentData) break
        }
        
        if (studentData) {
          setCurrentUser(studentData)
          await loadAttendanceData(studentData)
        }
      }
    } catch (error) {
      console.error('Error initializing attendance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAttendanceData = async (student: any) => {
    try {
      // Load active sessions for student's department and year
      const { data: sessions, error: sessionsError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('department', student.department.toUpperCase())
        .eq('year', student.year)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError
      setActiveSessions(sessions || [])

      // Load student's attendance history
      const { data: history, error: historyError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          session:attendance_sessions(*)
        `)
        .eq('student_email', student.email)
        .order('created_at', { ascending: false })

      if (historyError) throw historyError
      setMyAttendanceHistory(history || [])

      // Calculate attendance statistics
      const totalSessions = history?.length || 0
      const presentCount = history?.filter(r => r.status === 'present').length || 0
      const absentCount = totalSessions - presentCount
      const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

      setAttendanceStats({
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage
      })
    } catch (error) {
      console.error('Error loading attendance data:', error)
    }
  }

  const handleMarkPresent = async (session: any) => {
    if (!currentUser) return

    try {
      setIsSubmitting(true)

      const studentData = {
        student_id: currentUser.id,
        student_email: currentUser.email,
        student_name: currentUser.name,
        student_department: currentUser.department,
        student_year: currentUser.year
      }

      const result = await SupabaseAttendanceService.markAttendance(
        session.id,
        studentData,
        'present'
      )

      if (result.success) {
        toast({
          title: "Attendance Marked",
          description: "You have been marked present for this session.",
        })

        // Refresh data
        await loadAttendanceData(currentUser)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAbsent = (session: any) => {
    setSelectedSession(session)
    setShowAbsenceDialog(true)
  }

  const submitAbsence = async () => {
    if (!currentUser || !selectedSession) return

    try {
      setIsSubmitting(true)

      const studentData = {
        student_id: currentUser.id,
        student_email: currentUser.email,
        student_name: currentUser.name,
        student_department: currentUser.department,
        student_year: currentUser.year
      }

      const result = await SupabaseAttendanceService.markAttendance(
        selectedSession.id,
        studentData,
        'absent',
        absenceNote
      )

      if (result.success) {
        toast({
          title: "Absence Recorded",
          description: "Your absence has been recorded with the note.",
        })

        // Refresh data
        await loadAttendanceData(currentUser)
        setShowAbsenceDialog(false)
        setAbsenceNote("")
        setSelectedSession(null)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error recording absence:', error)
      toast({
        title: "Error",
        description: "Failed to record absence. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${minutes}m ${seconds}s remaining`
  }

  const isSessionExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  const hasMarkedAttendance = (sessionId: string) => {
    return myAttendanceHistory.some(record => record.session_id === sessionId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">Attendance</h1>
          <p className="text-gray-600 font-sans">Mark your attendance and view your records</p>
        </div>
        {attendanceStats && (
          <div className="text-right">
            <p className="text-sm text-gray-600 font-sans">Overall Attendance</p>
            <p className="text-2xl font-bold text-blue-600 font-sans">
              {attendanceStats.attendancePercentage}%
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="font-sans">Active Sessions</TabsTrigger>
          <TabsTrigger value="history" className="font-sans">My History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 font-sans">No Active Sessions</h3>
                <p className="text-gray-500 text-center font-sans">
                  There are no active attendance sessions at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeSessions.map((session) => {
                const expired = isSessionExpired(session.expires_at)
                const marked = hasMarkedAttendance(session.id)
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <Card className={`${expired ? 'opacity-60' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="font-sans">{session.subject}</CardTitle>
                            <CardDescription className="font-sans">
                              {session.class_name} • {session.faculty_name}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {marked ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Marked
                              </Badge>
                            ) : expired ? (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 font-sans">Date</p>
                            <p className="font-medium font-sans">{formatDate(session.session_date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-sans">Time</p>
                            <p className="font-medium font-sans">
                              {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-sans">Duration</p>
                            <p className="font-medium font-sans">{session.duration_minutes} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-sans">Status</p>
                            <p className="font-medium font-sans">
                              {expired ? "Expired" : getTimeRemaining(session.expires_at)}
                            </p>
                          </div>
                        </div>

                        {!marked && !expired && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => router.push(`/student-dashboard/attendance/mark/${session.id}`)}
                              disabled={isSubmitting}
                              className="flex-1 bg-green-600 hover:bg-green-700 font-sans"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Attendance
                            </Button>
                            <Button
                              onClick={() => handleMarkAbsent(session)}
                              disabled={isSubmitting}
                              variant="outline"
                              className="flex-1 font-sans"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Mark Absent (with note)
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {myAttendanceHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 font-sans">No Attendance Records</h3>
                <p className="text-gray-500 text-center font-sans">
                  Your attendance history will appear here once you start marking attendance.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attendanceStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans">Attendance Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 font-sans">{attendanceStats.totalSessions}</p>
                        <p className="text-sm text-gray-600 font-sans">Total Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 font-sans">{attendanceStats.presentCount}</p>
                        <p className="text-sm text-gray-600 font-sans">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600 font-sans">{attendanceStats.absentCount}</p>
                        <p className="text-sm text-gray-600 font-sans">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 font-sans">{attendanceStats.attendancePercentage}%</p>
                        <p className="text-sm text-gray-600 font-sans">Percentage</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {myAttendanceHistory.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium font-sans">{record.session?.subject}</h3>
                          <p className="text-sm text-gray-600 font-sans">
                            {record.session?.class_name} • {formatDate(record.session?.session_date)}
                          </p>
                          {record.absence_note && (
                            <p className="text-sm text-gray-600 mt-2 font-sans">
                              <strong>Note:</strong> {record.absence_note}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={record.status === 'present' ? 'default' : 'destructive'}
                            className={record.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {record.status === 'present' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                          {record.marked_at && (
                            <p className="text-xs text-gray-500 mt-1 font-sans">
                              {formatTime(new Date(record.marked_at).toTimeString().slice(0, 5))}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Absence Note Dialog */}
      <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Mark Absence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="absenceNote" className="font-sans">Reason for Absence (Optional)</Label>
              <Textarea
                id="absenceNote"
                value={absenceNote}
                onChange={(e) => setAbsenceNote(e.target.value)}
                placeholder="Please provide a reason for your absence..."
                className="font-sans"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAbsenceDialog(false)
                setAbsenceNote("")
                setSelectedSession(null)
              }}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button
              onClick={submitAbsence}
              disabled={isSubmitting}
              className="font-sans"
            >
              {isSubmitting ? "Recording..." : "Record Absence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
