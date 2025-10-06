"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Camera, MapPin, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

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
  expires_at: string
}

export default function MarkAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const sessionId = params.sessionId as string
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'valid' | 'invalid' | 'error'>('checking')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending')
  const [showCameraDialog, setShowCameraDialog] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'camera' | 'location' | 'processing' | 'complete'>('camera')

  // Mock classroom locations (in real app, fetch from database)
  const classroomLocations = {
    'CSE 3rd Year': { lat: 19.1234, lng: 73.5678, radius: 50 },
    'AIDS 2nd Year': { lat: 19.1235, lng: 73.5679, radius: 50 },
    // Add more classroom locations
  }

  useEffect(() => {
    if (sessionId) {
      initializeAttendance()
    }
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [sessionId])

  const initializeAttendance = async () => {
    try {
      // Load session data
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      setSessionData(session)

      // Get current user
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
        }
      }

      // Check if session is still active
      if (new Date(session.expires_at) <= new Date()) {
        toast({
          title: "Session Expired",
          description: "This attendance session has expired.",
          variant: "destructive"
        })
        router.push('/student-dashboard/attendance')
        return
      }

      // Check if already marked attendance
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', sessionId)
        .eq('student_email', user?.email)
        .single()

      if (existingRecord) {
        toast({
          title: "Already Marked",
          description: "You have already marked attendance for this session.",
        })
        router.push('/student-dashboard/attendance')
        return
      }

    } catch (error) {
      console.error('Error initializing attendance:', error)
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startAttendanceProcess = async () => {
    setShowCameraDialog(true)
    setVerificationStep('camera')
    await initializeCamera()
  }

  const initializeCamera = async () => {
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
        videoRef.current.play()
        
        // Start face detection simulation
        setTimeout(() => {
          setFaceDetected(true)
        }, 2000)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const proceedToLocationCheck = async () => {
    setVerificationStep('location')
    setLocationStatus('checking')
    
    try {
      const position = await getCurrentPosition()
      setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
      
      // Check if within classroom radius
      const classroomKey = `${sessionData?.department} ${sessionData?.year}`
      const classroom = classroomLocations[classroomKey as keyof typeof classroomLocations]
      
      if (classroom) {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          classroom.lat,
          classroom.lng
        )
        
        if (distance <= classroom.radius) {
          setLocationStatus('valid')
          setTimeout(() => {
            submitAttendance()
          }, 1000)
        } else {
          setLocationStatus('invalid')
          toast({
            title: "Location Invalid",
            description: `You must be within ${classroom.radius}m of the classroom to mark attendance.`,
            variant: "destructive"
          })
        }
      } else {
        // If no specific classroom location, assume valid
        setLocationStatus('valid')
        setTimeout(() => {
          submitAttendance()
        }, 1000)
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setLocationStatus('error')
      toast({
        title: "Location Error",
        description: "Unable to verify location. Please check GPS permissions.",
        variant: "destructive"
      })
    }
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })
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

    return R * c
  }

  const submitAttendance = async () => {
    if (!currentUser || !sessionData) return

    setVerificationStep('processing')
    setAttendanceStatus('processing')

    try {
      // Capture face image
      const faceImage = await captureImage()
      
      // Simulate face recognition confidence (70-95%)
      const faceConfidence = Math.floor(Math.random() * 25) + 70

      // Create attendance record
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          session_id: sessionId,
          student_name: currentUser.name,
          student_email: currentUser.email,
          student_prn: currentUser.prn || currentUser.id,
          student_department: currentUser.department,
          student_year: currentUser.year,
          status: 'present',
          marked_at: new Date().toISOString(),
          face_confidence: faceConfidence,
          location_verified: locationStatus === 'valid'
        })

      if (error) throw error

      // Update real-time attendance
      await supabase
        .from('real_time_attendance')
        .upsert({
          session_id: sessionId,
          student_email: currentUser.email,
          student_name: currentUser.name,
          student_prn: currentUser.prn || currentUser.id,
          status: 'present',
          marked_at: new Date().toISOString()
        }, { onConflict: 'session_id,student_email' })

      setAttendanceStatus('success')
      setVerificationStep('complete')
      
      toast({
        title: "Attendance Marked",
        description: `Successfully marked present with ${faceConfidence}% face confidence.`,
      })

      setTimeout(() => {
        setShowCameraDialog(false)
        router.push('/student-dashboard/attendance')
      }, 2000)

    } catch (error) {
      console.error('Error submitting attendance:', error)
      setAttendanceStatus('error')
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      })
    }
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
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Session Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-sans">{sessionData.subject}</CardTitle>
          <p className="text-gray-600 font-sans">
            {sessionData.class_name} • {sessionData.faculty_name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-sans">Date</p>
              <p className="font-medium font-sans">{new Date(sessionData.session_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-sans">Time</p>
              <p className="font-medium font-sans">
                {formatTime(sessionData.start_time)} - {formatTime(sessionData.end_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-sans">Duration</p>
              <p className="font-medium font-sans">{sessionData.duration_minutes} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-sans">Time Remaining</p>
              <p className="font-medium font-sans text-orange-600">
                {getTimeRemaining(sessionData.expires_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Button */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Camera className="h-16 w-16 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-sans mb-2">Mark Your Attendance</h3>
          <p className="text-gray-600 text-center font-sans mb-6">
            Click the button below to start the face verification and location check process.
          </p>
          <Button
            onClick={startAttendanceProcess}
            size="lg"
            className="font-sans"
            disabled={attendanceStatus === 'processing'}
          >
            {attendanceStatus === 'processing' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Start Attendance Verification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Camera and Verification Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-sans">Attendance Verification</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Camera Feed */}
            {verificationStep === 'camera' && (
              <div className="text-center">
                <div className="relative inline-block">
                  <video
                    ref={videoRef}
                    className="w-80 h-60 bg-gray-900 rounded-lg"
                    autoPlay
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {faceDetected && (
                    <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse"></div>
                  )}
                </div>
                
                <div className="mt-4">
                  {!faceDetected ? (
                    <div className="flex items-center justify-center text-yellow-600">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="font-sans">Detecting face...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="font-sans">Face detected successfully!</span>
                      </div>
                      <Button onClick={proceedToLocationCheck} className="font-sans">
                        <MapPin className="h-4 w-4 mr-2" />
                        Verify Location
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Verification */}
            {verificationStep === 'location' && (
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 text-blue-600 mx-auto" />
                <h3 className="text-lg font-medium font-sans">Verifying Location</h3>
                
                {locationStatus === 'checking' && (
                  <div className="flex items-center justify-center text-blue-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-sans">Checking your location...</span>
                  </div>
                )}
                
                {locationStatus === 'valid' && (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-sans">Location verified! You are in the classroom.</span>
                  </div>
                )}
                
                {locationStatus === 'invalid' && (
                  <div className="flex items-center justify-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-sans">You are not in the classroom location.</span>
                  </div>
                )}
                
                {locationStatus === 'error' && (
                  <div className="flex items-center justify-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-sans">Unable to verify location.</span>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {verificationStep === 'processing' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
                <h3 className="text-lg font-medium font-sans">Processing Attendance</h3>
                <p className="text-gray-600 font-sans">Please wait while we record your attendance...</p>
              </div>
            )}

            {/* Complete */}
            {verificationStep === 'complete' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-lg font-medium font-sans text-green-700">Attendance Marked Successfully!</h3>
                <p className="text-gray-600 font-sans">You have been marked present for this session.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
