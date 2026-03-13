"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Camera,
  Mic,
  Shield,
  CheckCircle,
  Circle,
  XCircle,
  Send,
  Save,
  Smartphone,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Question {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'fill_blanks' | 'descriptive'
  question: string
  options?: { A: string; B: string; C: string; D: string } | null
  points: number
  answered: boolean
  flagged: boolean
  answer?: string | number
  correctAnswer?: string
}

const QuizTakingInterface = () => {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(3600)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [violationCount, setViolationCount] = useState(0)
  const [cameraPermission, setCameraPermission] = useState(false)
  const [micPermission, setMicPermission] = useState(false)
  const [isProctoring, setIsProctoring] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [faceDetected, setFaceDetected] = useState(true)
  const [faceWarning, setFaceWarning] = useState('')
  const [mobileDetected, setMobileDetected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [questions, setQuestions] = useState<Question[]>([])

  // Fetch quiz and questions from Supabase
  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get student data
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (studentData) {
        setStudent(studentData)
      }

      // Check if student already attempted this quiz and exceeded max attempts
      const { data: existingAttempts } = await supabase
        .from('quiz_attempts')
        .select('id, completed_at')
        .eq('quiz_id', quizId)
        .eq('student_id', studentData?.id)
        .not('completed_at', 'is', null)

      // Get quiz data first to check max_attempts
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      const maxAttempts = quizData.max_attempts || 1
      const completedAttempts = existingAttempts?.length || 0

      console.log('Completed attempts:', completedAttempts, 'Max attempts:', maxAttempts)

      if (completedAttempts >= maxAttempts) {
        toast({
          title: "No Attempts Remaining",
          description: `You have used all ${maxAttempts} attempt(s) for this quiz. View your results instead.`,
          variant: "destructive"
        })
        router.push(`/student-dashboard/quiz/results/${quizId}`)
        return
      }

      // Show remaining attempts
      if (completedAttempts > 0) {
        toast({
          title: "Previous Attempt Found",
          description: `This is attempt ${completedAttempts + 1} of ${maxAttempts}. Best of luck!`,
        })
      }

      // Check if proctoring is enabled
      setIsProctoring(quizData.proctoring_enabled || false)

      // Set timer from quiz duration
      setTimeRemaining((quizData.duration_minutes || 60) * 60)

      // Fetch all questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true })

      if (questionsError) throw questionsError

      // Transform questions - deduplicate by ID
      const uniqueQuestions = new Map<string, any>()
      ;(questionsData || []).forEach(q => {
        if (!uniqueQuestions.has(q.id)) {
          uniqueQuestions.set(q.id, q)
        }
      })
      
      const transformedQuestions: Question[] = Array.from(uniqueQuestions.values()).map(q => ({
        id: q.id,
        type: q.question_type as 'mcq' | 'true_false' | 'fill_blank' | 'descriptive',
        question: q.question_text,
        options: q.options,
        points: q.marks,
        answered: false,
        flagged: false,
        correctAnswer: q.correct_answer
      }))

      console.log('Loaded questions:', transformedQuestions.length, 'types:', transformedQuestions.map(q => q.type))
      setQuestions(transformedQuestions)
      
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const quizInfo = {
    title: quiz?.title || 'Loading...',
    totalQuestions: questions.length,
    totalMarks: quiz?.total_marks || questions.reduce((sum, q) => sum + q.points, 0),
    duration: quiz?.duration_minutes || 60,
    subject: quiz?.subject || '',
    faculty: quiz?.faculty_name || ''
  }

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleAutoSubmit()
    }
  }, [timeRemaining, isSubmitted])

  // Camera and microphone setup with face detection
  useEffect(() => {
    if (isProctoring && quiz) {
      setupCamera()
      setupMicrophone()
      detectMobileDevice()
    }
    
    // Tab visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount(prev => prev + 1)
        setViolationCount(prev => {
          const newCount = prev + 1
          if (newCount > 3) {
            toast({
              title: "🚫 Quiz Auto-Submitted",
              description: "Too many violations detected. Your quiz has been automatically submitted.",
              variant: "destructive"
            })
            handleAutoSubmit()
            return newCount
          }
          toast({
            title: "⚠️ Tab Switch Detected!",
            description: `Violation ${newCount}/3. One more violation will auto-submit your quiz.`,
            variant: "destructive"
          })
          return newCount
        })
      }
    }

    // Dev tools detection (F12, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
        setViolationCount(prev => {
          const newCount = prev + 1
          if (newCount > 3) {
            toast({
              title: "🚫 Quiz Auto-Submitted",
              description: "Too many violations detected. Your quiz has been automatically submitted.",
              variant: "destructive"
            })
            handleAutoSubmit()
            return newCount
          }
          toast({
            title: "🚫 Developer Tools Blocked!",
            description: `Violation ${newCount}/3. One more violation will auto-submit your quiz.`,
            variant: "destructive"
          })
          return newCount
        })
      }
    }

    // Window resize detection (possible dev tools opening)
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight
    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth)
      const heightDiff = Math.abs(window.innerHeight - lastHeight)
      
      // Significant resize without normal window resize pattern
      if (heightDiff > 100 && widthDiff < 50 && !isSubmitted) {
        setViolationCount(prev => {
          const newCount = prev + 1
          if (newCount > 3) {
            toast({
              title: "🚫 Quiz Auto-Submitted",
              description: "Too many violations detected. Your quiz has been automatically submitted.",
              variant: "destructive"
            })
            handleAutoSubmit()
            return newCount
          }
          toast({
            title: "⚠️ Suspicious Activity Detected",
            description: `Violation ${newCount}/3. One more violation will auto-submit your quiz.`,
            variant: "destructive"
          })
          return newCount
        })
      }
      lastWidth = window.innerWidth
      lastHeight = window.innerHeight
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (faceCheckIntervalRef.current) {
        clearInterval(faceCheckIntervalRef.current)
      }
    }
  }, [isProctoring, tabSwitchCount, isSubmitted, quiz])

  const detectMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    if (isMobile) {
      setMobileDetected(true)
      toast({
        title: "📱 Mobile Device Detected",
        description: "Using mobile devices for quizzes may be flagged for review.",
        variant: "default"
      })
    }
  }

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: false 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setCameraPermission(true)
      
      // Start face detection after camera is ready
      videoRef.current?.addEventListener('loadeddata', () => {
        startFaceDetection()
      })
    } catch (error) {
      console.error('Camera access denied:', error)
      setCameraPermission(false)
      toast({
        title: "🚫 Camera Required",
        description: "Please enable camera access for proctoring. Quiz cannot start without camera.",
        variant: "destructive"
      })
    }
  }

  const startFaceDetection = () => {
    let lastFrameData: ImageData | null = null
    let noFaceCount = 0
    let lookingAwayCount = 0
    let faceWarningShown = false
    let lookingAwayWarningShown = false
    
    faceCheckIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !videoRef.current.videoWidth || isSubmitted) return
      
      // Stop checking if already 3 violations
      if (violationCount >= 3) {
        if (faceCheckIntervalRef.current) {
          clearInterval(faceCheckIntervalRef.current)
        }
        return
      }
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      ctx.drawImage(videoRef.current, 0, 0)
      
      // Send frame to database for faculty monitoring (every 2 seconds)
      // Only send if proctoring is enabled and camera is active
      if (student && quiz && isProctoring && videoRef.current && videoRef.current.srcObject) {
        const frameData = canvas.toDataURL('image/jpeg', 0.5) // Compressed JPEG
        sendCameraFrame(frameData, true)
      }
      
      try {
        const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // Simple face presence detection using motion/variation analysis
        const faceRegion = analyzeFrameForFace(currentFrameData, lastFrameData, canvas.width, canvas.height)
        
        if (!faceRegion.hasFace) {
          noFaceCount++
          if (noFaceCount > 30 && !faceWarningShown) { // ~3 seconds without face
            setFaceDetected(false)
            setFaceWarning('No face detected! Please position yourself in front of the camera.')
            setViolationCount(prev => {
              const newCount = prev + 1
              if (newCount > 3) {
                handleAutoSubmit()
              }
              return newCount
            })
            toast({
              title: "👤 Face Not Detected",
              description: "Please ensure your face is visible in the camera.",
              variant: "destructive"
            })
            faceWarningShown = true
          }
        } else if (faceRegion.lookingAway) {
          lookingAwayCount++
          if (lookingAwayCount > 20 && !lookingAwayWarningShown) { // ~2 seconds looking away
            setFaceWarning('Looking away detected! Please face the screen.')
            setViolationCount(prev => {
              const newCount = prev + 1
              if (newCount > 3) {
                handleAutoSubmit()
              }
              return newCount
            })
            toast({
              title: "👀 Looking Away Detected",
              description: "Please face the screen while taking the quiz.",
              variant: "destructive"
            })
            lookingAwayWarningShown = true
          }
        } else {
          noFaceCount = 0
          lookingAwayCount = 0
          faceWarningShown = false
          lookingAwayWarningShown = false
          setFaceDetected(true)
          setFaceWarning('')
        }
        
        lastFrameData = currentFrameData
      } catch (e) {
        // Canvas security error, ignore
      }
    }, 100) // Check every 100ms
  }

  const analyzeFrameForFace = (current: ImageData, previous: ImageData | null, width: number, height: number) => {
    // Analyze center region of the frame for face-like patterns
    const centerX = width / 2
    const centerY = height / 2
    const faceRegionSize = Math.min(width, height) * 0.4
    
    let skinTonePixels = 0
    let totalPixels = 0
    let leftSideMotion = 0
    let rightSideMotion = 0
    
    // Sample pixels in the face region
    for (let y = centerY - faceRegionSize/2; y < centerY + faceRegionSize/2; y += 4) {
      for (let x = centerX - faceRegionSize/2; x < centerX + faceRegionSize/2; x += 4) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4
        const r = current.data[i]
        const g = current.data[i + 1]
        const b = current.data[i + 2]
        
        // Simple skin tone detection
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15 &&
            r - g > 15 && r - b > 15) {
          skinTonePixels++
        }
        
        // Motion detection for looking away
        if (previous) {
          const diff = Math.abs(current.data[i] - previous.data[i]) +
                      Math.abs(current.data[i + 1] - previous.data[i + 1]) +
                      Math.abs(current.data[i + 2] - previous.data[i + 2])
          
          if (x < centerX) leftSideMotion += diff
          else rightSideMotion += diff
        }
        
        totalPixels++
      }
    }
    
    const skinRatio = skinTonePixels / totalPixels
    const hasFace = skinRatio > 0.15 // At least 15% skin-tone pixels in face region
    
    // Detect looking away by asymmetric motion
    const motionRatio = leftSideMotion / (rightSideMotion + 1)
    const lookingAway = hasFace && (motionRatio > 2 || motionRatio < 0.5)
    
    return { hasFace, lookingAway }
  }

  const setupMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission(true)
    } catch (error) {
      console.error('Microphone access denied:', error)
      setMicPermission(false)
    }
  }

  // Send camera frame to database for faculty monitoring
  const lastFrameSentRef = useRef<number>(0)
  const sendCameraFrame = async (frameData: string, faceDetected: boolean) => {
    if (!student || !quiz) return
    
    // Throttle to send max once every 2 seconds
    const now = Date.now()
    if (now - lastFrameSentRef.current < 2000) return
    lastFrameSentRef.current = now
    
    try {
      await supabase
        .from('quiz_camera_frames')
        .insert({
          quiz_id: quizId,
          student_id: student.id,
          student_name: student.name,
          frame_data: frameData,
          face_detected: faceDetected
        })
    } catch (error) {
      console.error('Error sending camera frame:', error)
    }
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

  const handleAnswerChange = (answer: string | number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      answer,
      answered: true
    }
    setQuestions(updatedQuestions)
    
    // Auto-save
    toast({
      title: "Answer Saved",
      description: "Your answer has been automatically saved.",
    })
  }

  const toggleFlag = () => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].flagged = !updatedQuestions[currentQuestionIndex].flagged
    setQuestions(updatedQuestions)
  }

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleAutoSubmit = () => {
    setIsSubmitted(true)
    toast({
      title: "Time's Up!",
      description: "Quiz has been automatically submitted.",
      variant: "destructive"
    })
    // Redirect to results page
    setTimeout(() => {
      router.push(`/student-dashboard/quiz/results/${params.id}`)
    }, 2000)
  }

  const handleManualSubmit = async () => {
    if (!student || !quiz) return
    
    const answeredCount = questions.filter(q => q.answered).length
    const unansweredCount = questions.length - answeredCount
    
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      )
      if (!confirmSubmit) return
    }
    
    try {
      // Calculate score for auto-gradable questions
      let marksObtained = 0
      questions.forEach(q => {
        if (q.answer && q.correctAnswer) {
          // For fill_blank, do case-insensitive comparison and trim whitespace
          if (q.type === 'fill_blank') {
            const userAnswer = String(q.answer).toLowerCase().trim()
            const correctAnswer = String(q.correctAnswer).toLowerCase().trim()
            if (userAnswer === correctAnswer) {
              marksObtained += q.points
            }
          } else if (q.answer === q.correctAnswer) {
            marksObtained += q.points
          }
        }
      })

      console.log('Submitting quiz attempt for student:', student.id, 'quiz:', quizId)

      // Save quiz attempt to Supabase
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: student.id,
          student_name: student.name,
          student_email: student.email,
          department: student.department,
          year: student.year,
          answers: questions.map(q => ({
            question_id: q.id,
            answer: q.answer || '',
            correct: q.type === 'fill_blank' 
              ? String(q.answer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()
              : q.answer === q.correctAnswer
          })),
          marks_obtained: marksObtained,
          total_marks: quiz.total_marks,
          time_taken: (quiz.duration_minutes * 60) - timeRemaining,
          tab_switches: tabSwitchCount,
          violations: violationCount,
          completed_at: new Date().toISOString()
        })

      if (attemptError) {
        console.error('Submit error:', attemptError)
        throw attemptError
      }

      console.log('Quiz submitted successfully')
      setIsSubmitted(true)
      toast({
        title: "Quiz Submitted",
        description: `Your score: ${marksObtained}/${quiz.total_marks}`,
      })
      
      // Redirect to results page
      setTimeout(() => {
        router.push(`/student-dashboard/quiz/results/${quizId}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error Submitting Quiz",
        description: error?.message || "Failed to submit quiz. Please check your connection and try again.",
        variant: "destructive"
      })
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = questions.filter(q => q.answered).length
  const flaggedCount = questions.filter(q => q.flagged).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const renderQuestion = () => {
    if (!currentQuestion) return null
    
    switch (currentQuestion.type) {
      case 'mcq':
        const optionKeys = ['A', 'B', 'C', 'D'] as const
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <div className="space-y-3">
              {optionKeys.map((key) => {
                const optionText = currentQuestion.options?.[key]
                if (!optionText) return null
                
                return (
                  <label
                    key={key}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentQuestion.answer === key
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={key}
                      checked={currentQuestion.answer === key}
                      onChange={() => handleAnswerChange(key)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentQuestion.answer === key
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300'
                    }`}>
                      {currentQuestion.answer === key && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{key}. {optionText}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => handleAnswerChange('true')}
                className={`flex-1 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentQuestion.answer === 'true'
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className={`w-8 h-8 ${currentQuestion.answer === 'true' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-xl font-semibold ${currentQuestion.answer === 'true' ? 'text-green-700' : 'text-gray-700'}`}>True</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleAnswerChange('false')}
                className={`flex-1 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentQuestion.answer === 'false'
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <XCircle className={`w-8 h-8 ${currentQuestion.answer === 'false' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`text-xl font-semibold ${currentQuestion.answer === 'false' ? 'text-red-700' : 'text-gray-700'}`}>False</span>
                </div>
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">Select True or False</p>
          </div>
        )

      case 'fill_blank':
      case 'fill_blanks':
        // Parse question to show blanks visually
        const fillQuestionText = currentQuestion.question || 'Fill in the blank:'
        // Replace underscores with blank indicators, or show the question as-is
        const fillDisplayText = fillQuestionText.replace(/_{3,}/g, '_____')
        
        console.log('Rendering fill_blank question:', currentQuestion)
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {fillDisplayText}
            </h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <Label className="text-sm text-blue-700 mb-2 block">Your Answer:</Label>
              <Input
                id={`fill-blank-${currentQuestion.id}`}
                placeholder="Type your answer here..."
                value={(currentQuestion.answer as string) || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="text-lg p-4 bg-white border-blue-300 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Save and move to next question
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                }}
                className="flex-1"
                disabled={!currentQuestion.answer}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Continue
              </Button>
              {currentQuestionIndex < questions.length - 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Skip
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Type your answer in the box above. Make sure to check spelling.
            </p>
          </div>
        )

      case 'descriptive':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <Textarea
              placeholder="Write your detailed answer here..."
              value={currentQuestion.answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="min-h-[200px] text-base"
            />
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Quiz not found or no questions available.</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Submitted!</h2>
          <p className="text-gray-600">Your answers have been recorded successfully.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header with Timer and Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quizInfo.title}</h1>
              <p className="text-gray-600">{quizInfo.subject} • {quizInfo.faculty}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Proctoring Status */}
              {isProctoring && (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${cameraPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Camera className="w-4 h-4 text-gray-600" />
                  <div className={`w-3 h-3 rounded-full ${micPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Mic className="w-4 h-4 text-gray-600" />
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* End Quiz Button */}
              <Button 
                onClick={handleManualSubmit}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                End Quiz
              </Button>
              
              {/* Submit Button */}
              <Button 
                onClick={handleManualSubmit}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {answeredCount}/{questions.length} questions answered</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 mb-4">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => navigateToQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-all relative ${
                        currentQuestionIndex === index
                          ? 'bg-emerald-600 text-white'
                          : question.answered
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                      {question.flagged && (
                        <Flag className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Answered:</span>
                    <Badge variant="secondary">{answeredCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flagged:</span>
                    <Badge variant="outline">{flaggedCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <Badge variant="outline">{questions.length - answeredCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proctoring Camera */}
            {isProctoring && cameraPermission && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Proctoring Active
                    </div>
                    <div className="flex items-center gap-2">
                      {faceDetected ? (
                        <Badge className="bg-green-100 text-green-800">Face Detected</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">No Face</Badge>
                      )}
                      {mobileDetected && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Smartphone className="w-3 h-3 mr-1" />
                          Mobile
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-32 bg-gray-200 rounded-lg object-cover"
                    />
                    {/* Face overlay indicator */}
                    <div className={`absolute inset-0 rounded-lg border-4 ${
                      faceDetected ? 'border-green-500' : 'border-red-500'
                    } pointer-events-none transition-colors`} />
                  </div>
                  
                  {faceWarning && (
                    <Alert className="mt-2 bg-red-50 border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-700 text-xs">
                        {faceWarning}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Violations:</span>
                      <Badge variant={violationCount > 0 ? "destructive" : "secondary"}>
                        {violationCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Tab Switches:</span>
                      <Badge variant={tabSwitchCount > 0 ? "destructive" : "secondary"}>
                        {tabSwitchCount}
                      </Badge>
                    </div>
                    {violationCount >= 3 && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Warning: High violation count may result in auto-submission!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Main Question Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">{currentQuestion.type.replace('_', ' ').toUpperCase()}</Badge>
                      <Badge>{currentQuestion.points} points</Badge>
                      {currentQuestion.answered && (
                        <Badge className="bg-green-100 text-green-800">Answered</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlag}
                    className={currentQuestion.flagged ? 'text-red-600 border-red-300' : ''}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {currentQuestion.flagged ? 'Unflag' : 'Flag'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                {renderQuestion()}
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Auto-saved
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Proctoring Violation Warning
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Multiple tab switches have been detected. Continued violations may result in automatic quiz submission.</p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Violations detected:</strong> {violationCount}<br />
                <strong>Tab switches:</strong> {tabSwitchCount}
              </p>
            </div>
            <Button onClick={() => setShowWarning(false)} className="w-full">
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizTakingInterface
