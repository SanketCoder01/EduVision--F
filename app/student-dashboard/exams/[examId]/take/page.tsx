"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Clock,
  Camera,
  Mic,
  Monitor,
  AlertTriangle,
  Send,
  Save,
  Eye,
  EyeOff,
  Shield,
  Code,
  Play,
  Square
} from "lucide-react"

interface ExamData {
  id: string
  title: string
  facultyName: string
  examDate: string
  startTime: string
  duration: string
  department: string
  studyingYear: string
  language: string
  description: string
  instructions: string
  totalMarks: string
  enableSecurity: boolean
  enableCamera: boolean
  enableMicrophone: boolean
  enableScreenShare: boolean
  allowTabSwitch: boolean
  maxTabSwitches: string
  warningThreshold: string
}

interface SecurityViolation {
  type: 'tab_switch' | 'camera_off' | 'mic_off' | 'fullscreen_exit' | 'suspicious_activity'
  timestamp: Date
  description: string
}

export default function TakeExamPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const examId = params.examId as string

  const [exam, setExam] = useState<ExamData | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [tabSwitches, setTabSwitches] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showCamera, setShowCamera] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const examStartTime = useRef<Date | null>(null)

  useEffect(() => {
    // Load exam data
    const storedExams = JSON.parse(localStorage.getItem("coding_exams") || "[]")
    const examData = storedExams.find((e: any) => e.id === examId)
    
    if (!examData) {
      toast({
        title: "Exam Not Found",
        description: "The requested exam could not be found.",
        variant: "destructive",
      })
      router.push('/student-dashboard/exams')
      return
    }

    setExam(examData)
    setLanguage(examData.language.toLowerCase())
    
    // Calculate time remaining
    const duration = parseInt(examData.duration) * 60 // Convert to seconds
    setTimeRemaining(duration)
    examStartTime.current = new Date()

    // Initialize security features
    if (examData.enableSecurity) {
      initializeSecurity(examData)
    }

    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      cleanupStreams()
    }
  }, [examId])

  const initializeSecurity = async (examData: ExamData) => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }

      // Initialize camera
      if (examData.enableCamera) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240 } 
        })
        setCameraStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }

      // Initialize microphone
      if (examData.enableMicrophone) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicStream(stream)
      }

      // Add event listeners for security monitoring
      document.addEventListener('visibilitychange', handleVisibilityChange)
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      window.addEventListener('blur', handleWindowBlur)
      window.addEventListener('focus', handleWindowFocus)

    } catch (error) {
      console.error('Security initialization failed:', error)
      toast({
        title: "Security Setup Failed",
        description: "Could not initialize security features. Please check your camera and microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      addViolation('tab_switch', 'Student switched tabs or minimized window')
      setTabSwitches(prev => prev + 1)
    }
  }

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false)
      addViolation('fullscreen_exit', 'Student exited fullscreen mode')
    }
  }

  const handleWindowBlur = () => {
    addViolation('suspicious_activity', 'Window lost focus')
  }

  const handleWindowFocus = () => {
    // Window regained focus
  }

  const addViolation = (type: SecurityViolation['type'], description: string) => {
    const violation: SecurityViolation = {
      type,
      timestamp: new Date(),
      description
    }
    
    setViolations(prev => [...prev, violation])
    
    toast({
      title: "Security Warning",
      description: description,
      variant: "destructive",
    })

    // Check if auto-submit threshold is reached
    if (exam && violations.length + 1 >= parseInt(exam.warningThreshold)) {
      handleAutoSubmit()
    }
  }

  const cleanupStreams = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop())
    }
  }

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      handleSubmit(true)
    }
  }

  const handleSubmit = (isAuto = false) => {
    if (isSubmitted) return

    const submission = {
      examId,
      studentId: "current_student", // This would come from auth context
      code,
      language,
      submittedAt: new Date().toISOString(),
      timeSpent: exam ? (parseInt(exam.duration) * 60 - timeRemaining) : 0,
      violations,
      tabSwitches,
      isAutoSubmitted: isAuto
    }

    // Save submission to localStorage
    const existingSubmissions = JSON.parse(localStorage.getItem("exam_submissions") || "[]")
    existingSubmissions.push(submission)
    localStorage.setItem("exam_submissions", JSON.stringify(existingSubmissions))

    setIsSubmitted(true)
    cleanupStreams()

    toast({
      title: isAuto ? "Exam Auto-Submitted" : "Exam Submitted",
      description: isAuto ? "Time limit reached or violation threshold exceeded." : "Your exam has been submitted successfully.",
    })

    setTimeout(() => {
      router.push('/student-dashboard/exams')
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-red-600' // Last 5 minutes
    if (timeRemaining <= 900) return 'text-orange-600' // Last 15 minutes
    return 'text-green-600'
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Exam Submitted</h2>
            <p className="text-gray-600 mb-4">Your exam has been submitted successfully. You will be redirected shortly.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Timer and Controls */}
      <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{exam.title}</h1>
              <Badge variant="outline">{exam.language}</Badge>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Security Status */}
              {exam.enableSecurity && (
                <div className="flex items-center gap-3">
                  {exam.enableCamera && (
                    <div className="flex items-center gap-1">
                      <Camera className={`w-4 h-4 ${cameraStream ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="text-xs text-gray-600">Camera</span>
                    </div>
                  )}
                  {exam.enableMicrophone && (
                    <div className="flex items-center gap-1">
                      <Mic className={`w-4 h-4 ${micStream ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="text-xs text-gray-600">Mic</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">{violations.length} violations</span>
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className={`text-2xl font-mono font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => handleSubmit()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Coding Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Problem Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{exam.description}</p>
              </div>
              {exam.instructions && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{exam.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Camera Feed */}
          {exam.enableCamera && cameraStream && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Camera Monitor</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCamera(!showCamera)}
                  >
                    {showCamera ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showCamera && (
                <CardContent className="pt-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full rounded-lg bg-gray-900"
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Faculty:</span>
                <span className="font-medium">{exam.facultyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{exam.duration} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-medium">{exam.totalMarks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Language:</span>
                <span className="font-medium">{exam.language}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Violations */}
          {exam.enableSecurity && violations.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Security Violations ({violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {violations.slice(-3).map((violation, index) => (
                    <div key={index} className="text-xs p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-800">{violation.description}</div>
                      <div className="text-red-600">{violation.timestamp.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
                {violations.length >= parseInt(exam.warningThreshold) - 1 && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                    <strong>Warning:</strong> One more violation will auto-submit your exam.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  localStorage.setItem(`exam_${examId}_draft`, code)
                  toast({ title: "Draft Saved", description: "Your code has been saved as draft." })
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              {!isFullscreen && exam.enableSecurity && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.documentElement.requestFullscreen()}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Enter Fullscreen
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
