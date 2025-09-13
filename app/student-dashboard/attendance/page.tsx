"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Eye, Navigation, Wifi, WifiOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import SubjectWiseAttendance from "@/components/attendance/SubjectWiseAttendance"
import { SupabaseAttendanceService } from "@/lib/supabase-attendance"
import { getStudentSession } from "@/lib/student-auth"

export default function StudentAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [availableAttendance, setAvailableAttendance] = useState<any[]>([])
  const [myAttendanceRecords, setMyAttendanceRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFaceScanDialog, setShowFaceScanDialog] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'valid' | 'invalid' | 'error'>('checking')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    initializeAttendanceData()
  }, [])

  const initializeAttendanceData = async () => {
    try {
      // Get current user session
      const student = await getStudentSession()
      
      if (student) {
        console.log('DEBUG: Student authenticated for attendance:', student)
        setCurrentUser(student)
        await loadAttendanceData(student)
        
        // Set up real-time subscription
        const subscription = SupabaseAttendanceService.subscribeToAttendanceUpdates(
          student.department,
          student.year,
          (payload) => {
            console.log('DEBUG: Real-time attendance update:', payload)
            loadAttendanceData(student)
            
            if (payload.eventType === 'INSERT' && payload.table === 'attendance_sessions') {
              toast({
                title: "New Attendance Session",
                description: `${payload.new.subject} attendance is now active`,
              })
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } else {
        toast({
          title: "Authentication Required",
          description: "Please log in to access attendance.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error initializing attendance data:', error)
      toast({
        title: "Error",
        description: "Failed to load attendance data.",
        variant: "destructive"
      })
    }
  }

  const loadAttendanceData = async (user: any) => {
    try {
      setIsLoading(true)
      console.log('DEBUG: Loading real-time attendance data for:', user)
      
      // Fetch active attendance sessions from Supabase
      const activeSessions = await SupabaseAttendanceService.getActiveAttendanceSessions(
        user.department, 
        user.year
      )
      
      // Fetch student's attendance history from Supabase
      const attendanceHistory = await SupabaseAttendanceService.getStudentAttendanceHistory(user.id)
      
      // Fetch attendance statistics
      const stats = await SupabaseAttendanceService.getStudentAttendanceStats(
        user.id, 
        user.department
      )
      
      console.log('DEBUG: Loaded data:', {
        activeSessions: activeSessions.length,
        history: attendanceHistory.length,
        stats
      })
      
      // Transform data for UI compatibility
      const transformedSessions = activeSessions.map(session => ({
        id: session.id,
        subject: session.subject,
        department: session.department,
        studyingYear: session.target_years.join(', '),
        date: session.date,
        timing: `${session.start_time} - ${session.end_time}`,
        floor: session.floor,
        classroom: session.classroom,
        facultyName: session.faculty?.name || 'Faculty',
        status: session.status,
        totalStudents: session.total_students || 0
      }))
      
      const transformedHistory = attendanceHistory.map(record => ({
        id: record.id,
        attendanceId: record.session_id,
        studentId: record.student_id,
        studentName: user.name,
        subject: record.session?.subject || 'Unknown Subject',
        department: record.session?.department || user.department,
        studyingYear: user.year,
        date: record.session?.date || record.marked_at,
        timing: record.session ? `${record.session.start_time} - ${record.session.end_time}` : 'N/A',
        floor: record.session?.floor || 'N/A',
        classroom: record.session?.classroom || 'N/A',
        status: record.status,
        markedAt: record.marked_at,
        faceVerified: record.face_verified
      }))
      
      setAvailableAttendance(transformedSessions)
      setMyAttendanceRecords(transformedHistory)
      setAttendanceStats(stats)
    } catch (error) {
      console.error("Error loading attendance data:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAttendance = async (attendance: any) => {
    setSelectedAttendance(attendance)
    setShowFaceScanDialog(true)
    await checkLocationAndStartCamera(attendance)
  }

  const submitAttendance = async () => {
    if (!selectedAttendance || !currentUser) return

    try {
      setIsScanning(true)
      
      // Simulate face capture and verification
      const faceConfidence = Math.random() * 30 + 70 // 70-100% confidence
      const locationData = currentLocation ? {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        accuracy: 10,
        timestamp: new Date().toISOString()
      } : null

      // Mark attendance in Supabase
      const result = await SupabaseAttendanceService.markAttendance(
        selectedAttendance.id,
        currentUser.id,
        'present',
        true, // face verified
        locationStatus === 'valid', // location verified
        faceConfidence,
        locationData
      )

      if (result.success) {
        toast({
          title: "Attendance Marked",
          description: `Successfully marked present for ${selectedAttendance.subject}`,
        })
        
        // Refresh attendance data
        await loadAttendanceData(currentUser)
        
        // Close dialog
        setShowFaceScanDialog(false)
        await stopCamera()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const checkLocationAndStartCamera = async (attendance: any) => {
    setLocationStatus('checking')
    
    try {
      // Get user's current location
      const position = await getCurrentPosition()
      setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
      
      // Get classroom location based on floor and room
      const classroomLocation = getClassroomLocation(attendance.floor, attendance.classroom)
      
      // Check if user is within valid range (50 meters)
      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        classroomLocation.lat,
        classroomLocation.lng
      )
      
      if (distance <= 50) {
        setLocationStatus('valid')
        await startCamera()
      } else {
        setLocationStatus('invalid')
        toast({
          title: "Location Invalid",
          description: `You must be within 50m of ${attendance.classroom}. Current distance: ${Math.round(distance)}m`,
          variant: "destructive",
        })
      }
    } catch (error) {
      setLocationStatus('error')
      toast({
        title: "Location Error",
        description: "Unable to access your location. Please enable location services.",
        variant: "destructive",
      })
    }
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  const getClassroomLocation = (floor: string, classroom: string) => {
    // Mock classroom coordinates - in real implementation, this would come from database
    const classroomCoordinates: {[key: string]: {lat: number, lng: number}} = {
      '301': { lat: 19.0760, lng: 72.8777 }, // Floor 3, Room 301
      '302': { lat: 19.0761, lng: 72.8778 }, // Floor 3, Room 302
      '205': { lat: 19.0759, lng: 72.8776 }, // Floor 2, Room 205
      '201': { lat: 19.0758, lng: 72.8775 }, // Floor 2, Room 201
      '105': { lat: 19.0757, lng: 72.8774 }, // Floor 1, Room 105
    }
    
    return classroomCoordinates[classroom] || { lat: 19.0760, lng: 72.8777 }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lng2-lng1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      setCameraStream(stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please allow camera permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const captureImage = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        return canvas.toDataURL('image/jpeg', 0.8)
      }
    }
    return null
  }

  const startFaceScan = async () => {
    if (locationStatus !== 'valid') {
      toast({
        title: "Location Required",
        description: "You must be in the correct location to mark attendance.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    
    try {
      // Capture image from camera
      const imageData = captureImage()
      if (!imageData) {
        throw new Error("Failed to capture image")
      }

      // Simulate face recognition API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulate face recognition result (90% success rate for demo)
      const faceRecognitionResult = await simulateFaceRecognition(imageData)
      
      if (faceRecognitionResult.success) {
        await markAttendanceSuccess(faceRecognitionResult.confidence)
      } else {
        throw new Error(faceRecognitionResult.error || "Face recognition failed")
      }
    } catch (error) {
      toast({
        title: "Face Scan Failed",
        description: error instanceof Error ? error.message : "Face recognition unsuccessful. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const simulateFaceRecognition = async (imageData: string): Promise<{success: boolean, confidence?: number, error?: string}> => {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate different scenarios
    const random = Math.random()
    
    if (random > 0.9) {
      return { success: false, error: "No face detected in image" }
    } else if (random > 0.8) {
      return { success: false, error: "Face does not match registered profile" }
    } else if (random > 0.7) {
      return { success: false, error: "Image quality too low for recognition" }
    } else {
      return { success: true, confidence: Math.round((0.85 + Math.random() * 0.14) * 100) }
    }
  }

  const markAttendanceSuccess = async (confidence: number = 95) => {
    if (!selectedAttendance) return

    try {
      // Create student attendance record
      const attendanceRecord = {
        id: `student_att_${Date.now()}`,
        attendanceId: selectedAttendance.id,
        studentId: "student_123", // Current student ID
        studentName: "Current Student", // Current student name
        subject: selectedAttendance.subject,
        department: selectedAttendance.department,
        studyingYear: selectedAttendance.studyingYear,
        date: selectedAttendance.date,
        timing: selectedAttendance.timing,
        floor: selectedAttendance.floor,
        classroom: selectedAttendance.classroom,
        status: "present",
        markedAt: new Date().toISOString(),
        faceVerified: true,
        faceConfidence: confidence,
        location: currentLocation,
        locationVerified: locationStatus === 'valid'
      }

      // Save to student's attendance history
      const existingHistory = JSON.parse(localStorage.getItem("student_attendance_history") || "[]")
      const updatedHistory = [...existingHistory, attendanceRecord]
      localStorage.setItem("student_attendance_history", JSON.stringify(updatedHistory))

      // Update faculty attendance record
      const facultyRecords = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      const updatedFacultyRecords = facultyRecords.map((record: any) => {
        if (record.id === selectedAttendance.id) {
          const updatedStudents = [...(record.students || []), attendanceRecord]
          return {
            ...record,
            students: updatedStudents,
            presentCount: updatedStudents.length,
            absentCount: record.totalStudents - updatedStudents.length
          }
        }
        return record
      })
      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedFacultyRecords))

      // Remove from available attendance (already marked)
      setAvailableAttendance(prev => prev.filter(att => att.id !== selectedAttendance.id))
      setMyAttendanceRecords(prev => [...prev, attendanceRecord])

      toast({
        title: "Attendance Marked",
        description: `Successfully marked present for ${selectedAttendance.subject}`,
      })

      setShowFaceScanDialog(false)
      setSelectedAttendance(null)
      stopCamera()
      setLocationStatus('checking')
      setCurrentLocation(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAttendanceStats = () => {
    const totalSessions = myAttendanceRecords.length
    const presentSessions = myAttendanceRecords.filter(record => record.status === "present").length
    const attendanceRate = totalSessions > 0 ? ((presentSessions / totalSessions) * 100).toFixed(1) : "0"
    
    return {
      totalSessions,
      presentSessions,
      absentSessions: totalSessions - presentSessions,
      attendanceRate
    }
  }

  const stats = getAttendanceStats()

  if (isLoading) {
    return (
      <div className="w-full max-w-none mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Attendance</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Attendance</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentSessions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentSessions}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Attendance ({availableAttendance.length})</TabsTrigger>
          <TabsTrigger value="history">My Records ({myAttendanceRecords.length})</TabsTrigger>
          <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {availableAttendance.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active attendance sessions</h3>
                  <p className="text-gray-500">Check back later for new attendance sessions from your faculty.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAttendance.map((attendance) => (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{attendance.subject}</CardTitle>
                          <CardDescription>
                            {attendance.department} - Year {attendance.studyingYear}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(attendance.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {attendance.timing}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          Floor {attendance.floor}, Room {attendance.classroom}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleMarkAttendance(attendance)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Mark Attendance
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {myAttendanceRecords.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
                  <p className="text-gray-500">Your attendance history will appear here once you start marking attendance.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAttendanceRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{record.subject}</h3>
                        <p className="text-sm text-gray-600">
                          {record.department} - Year {record.studyingYear}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {record.timing}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Floor {record.floor}, Room {record.classroom}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={record.status === "present" 
                            ? "bg-green-50 text-green-700" 
                            : "bg-red-50 text-red-700"
                          }
                        >
                          {record.status === "present" ? "Present" : "Absent"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/student-dashboard/attendance/view/${record.id}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectWiseAttendance />
        </TabsContent>
      </Tabs>

      {/* Face Scan Dialog */}
      <Dialog open={showFaceScanDialog} onOpenChange={(open) => {
        setShowFaceScanDialog(open)
        if (!open) {
          stopCamera()
          setLocationStatus('checking')
          setCurrentLocation(null)
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Verification</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            {selectedAttendance && (
              <div className="text-center mb-6">
                <h3 className="font-medium mb-2">{selectedAttendance.subject}</h3>
                <p className="text-sm text-gray-600">
                  {selectedAttendance.department} - Floor {selectedAttendance.floor}, Room {selectedAttendance.classroom}
                </p>
              </div>
            )}
            
            {/* Location Status */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {locationStatus === 'checking' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Checking location...</span>
                  </>
                )}
                {locationStatus === 'valid' && (
                  <>
                    <Navigation className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Location verified ✓</span>
                  </>
                )}
                {locationStatus === 'invalid' && (
                  <>
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Invalid location ✗</span>
                  </>
                )}
                {locationStatus === 'error' && (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Location error</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Camera Feed */}
            <div className="flex flex-col items-center">
              {cameraStream ? (
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-80 h-60 bg-gray-900 rounded-lg object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-pulse mb-2">
                          <Camera className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm">Analyzing face...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-80 h-60 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-4 border-dashed border-gray-300">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Camera loading...</p>
                  </div>
                </div>
              )}
              
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Processing face recognition...</p>
                  <p className="text-xs text-gray-500 mt-1">Please hold still</p>
                </div>
              ) : cameraStream ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Position your face in the camera frame</p>
                  <p className="text-xs text-gray-500">Ensure good lighting and look directly at camera</p>
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowFaceScanDialog(false)
                stopCamera()
                setLocationStatus('checking')
                setCurrentLocation(null)
              }}
              disabled={isScanning}
            >
              Cancel
            </Button>
            <Button 
              onClick={startFaceScan}
              disabled={isScanning || locationStatus !== 'valid' || !cameraStream}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? "Processing..." : "Verify & Mark Present"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
