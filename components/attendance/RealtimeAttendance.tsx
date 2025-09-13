"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Loader2,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase-realtime"
import { toast } from "@/hooks/use-toast"

interface AttendanceSession {
  id: string
  subject: string
  session_date: string
  session_time: string
  location?: string
  status: 'active' | 'closed' | 'expired'
  duration_minutes?: number
  auto_close_time?: string
  faculty?: {
    name: string
    email: string
  }
  attendance_records?: AttendanceRecord[]
}

interface AttendanceRecord {
  id: string
  student_id: string
  status: 'present' | 'absent' | 'late'
  marked_at: string
  location_data?: any
  face_confidence?: number
  notes?: string
}

interface RealtimeAttendanceProps {
  userId: string
  userType: 'student' | 'faculty'
  department: string
  year?: string
}

export default function RealtimeAttendance({ userId, userType, department, year }: RealtimeAttendanceProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [showMarkDialog, setShowMarkDialog] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [notes, setNotes] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    loadAttendanceSessions()
    setupRealtimeSubscriptions()
  }, [])

  const loadAttendanceSessions = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        user_id: userId,
        user_type: userType,
        department
      })
      
      if (year) params.append('year', year)

      const response = await fetch(`/api/attendance?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance sessions')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load sessions')
      }
      
      setSessions(result.data || [])
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('Error loading attendance sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load attendance sessions. Please try refreshing.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to attendance sessions changes
    const sessionsChannel = supabase
      .channel('attendance_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions'
        },
        (payload) => {
          console.log('Attendance session change:', payload)
          loadAttendanceSessions()
          
          if (payload.eventType === 'INSERT' && payload.new.status === 'active') {
            toast({
              title: "New Attendance Session",
              description: `Attendance is now open for ${payload.new.subject}`,
            })
          }
        }
      )
      .subscribe()

    // Subscribe to attendance records changes
    const recordsChannel = supabase
      .channel('attendance_records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        (payload) => {
          console.log('Attendance record change:', payload)
          loadAttendanceSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sessionsChannel)
      supabase.removeChannel(recordsChannel)
    }
  }

  const startAttendanceMarking = async (session: AttendanceSession) => {
    setSelectedSession(session)
    setShowMarkDialog(true)
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      setCameraStream(stream)
      
      // Get location
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error('Location error:', error)
      )
    } catch (error) {
      console.error('Camera error:', error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const markAttendance = async (status: 'present' | 'late') => {
    if (!selectedSession) return
    
    try {
      setIsMarkingAttendance(true)
      
      // Simulate face recognition (in real app, this would process the camera feed)
      const faceConfidence = Math.random() * 0.3 + 0.7 // 70-100%
      
      const attendanceData = {
        status,
        location_data: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        } : null,
        face_confidence: faceConfidence,
        notes: notes.trim() || undefined
      }

      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: selectedSession.id,
          student_id: userId,
          attendance_data: attendanceData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark attendance')
      }

      toast({
        title: "Attendance Marked",
        description: `Successfully marked as ${status}`,
      })

      setShowMarkDialog(false)
      cleanupCamera()
      loadAttendanceSessions()
      
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark attendance",
        variant: "destructive"
      })
    } finally {
      setIsMarkingAttendance(false)
    }
  }

  const cleanupCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setLocation(null)
    setNotes("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isSessionExpired = (session: AttendanceSession) => {
    if (!session.auto_close_time) return false
    return new Date() > new Date(session.auto_close_time)
  }

  const getStudentAttendanceStatus = (session: AttendanceSession) => {
    const record = session.attendance_records?.find(r => r.student_id === userId)
    return record?.status || null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Sessions</h2>
          <p className="text-gray-600">
            {userType === 'student' ? 'Mark your attendance for active sessions' : 'Manage attendance sessions'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadAttendanceSessions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sessions Found</h3>
              <p className="text-gray-500">
                {userType === 'student' 
                  ? 'No attendance sessions are currently active for your department.'
                  : 'You haven\'t created any attendance sessions yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const studentStatus = userType === 'student' ? getStudentAttendanceStatus(session) : null
            const expired = isSessionExpired(session)
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`${session.status === 'active' && !expired ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {session.subject}
                      </CardTitle>
                      <Badge className={getStatusColor(expired ? 'expired' : session.status)}>
                        {expired ? 'Expired' : session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.session_date).toLocaleDateString()} at {session.session_time}
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </div>
                        )}
                        {session.faculty && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.faculty.name}
                          </div>
                        )}
                      </div>

                      {userType === 'student' && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          {studentStatus ? (
                            <div className="flex items-center gap-2">
                              {getStatusIcon(studentStatus)}
                              <span className="text-sm font-medium capitalize">
                                Marked as {studentStatus}
                              </span>
                            </div>
                          ) : session.status === 'active' && !expired ? (
                            <Button
                              onClick={() => startAttendanceMarking(session)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Mark Attendance
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {expired ? 'Session expired' : 'Session not active'}
                            </span>
                          )}
                        </div>
                      )}

                      {userType === 'faculty' && session.attendance_records && (
                        <div className="flex items-center gap-4 pt-2 border-t text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {session.attendance_records.filter(r => r.status === 'present').length} Present
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            {session.attendance_records.filter(r => r.status === 'late').length} Late
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-500" />
                            {session.attendance_records.filter(r => r.status === 'absent').length} Absent
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Attendance Marking Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={(open) => {
        setShowMarkDialog(open)
        if (!open) cleanupCamera()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSession && (
              <div className="text-sm text-gray-600">
                <p><strong>Subject:</strong> {selectedSession.subject}</p>
                <p><strong>Time:</strong> {selectedSession.session_time}</p>
                {selectedSession.location && (
                  <p><strong>Location:</strong> {selectedSession.location}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your attendance..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => markAttendance('present')}
                disabled={isMarkingAttendance}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isMarkingAttendance ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Present
              </Button>
              <Button
                onClick={() => markAttendance('late')}
                disabled={isMarkingAttendance}
                variant="outline"
                className="flex-1"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Late
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
