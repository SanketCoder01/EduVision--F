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
  Send,
  Save
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"

interface Question {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: string[]
  points: number
  answered: boolean
  flagged: boolean
  answer?: string | number
}

const QuizTakingInterface = () => {
  const params = useParams()
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [violationCount, setViolationCount] = useState(0)
  const [cameraPermission, setCameraPermission] = useState(false)
  const [micPermission, setMicPermission] = useState(false)
  const [isProctoring, setIsProctoring] = useState(true)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'mcq',
      question: 'What is the time complexity of binary search in a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      points: 2,
      answered: false,
      flagged: false
    },
    {
      id: '2',
      type: 'true_false',
      question: 'A stack follows LIFO (Last In First Out) principle.',
      points: 1,
      answered: false,
      flagged: false
    },
    {
      id: '3',
      type: 'fill_blank',
      question: 'The worst-case time complexity of quicksort is _____.',
      points: 2,
      answered: false,
      flagged: false
    },
    {
      id: '4',
      type: 'descriptive',
      question: 'Explain the difference between BFS and DFS traversal algorithms with examples.',
      points: 5,
      answered: false,
      flagged: false
    },
    {
      id: '5',
      type: 'mcq',
      question: 'Which data structure is used to implement recursion?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      points: 2,
      answered: false,
      flagged: false
    }
  ])

  const quizInfo = {
    title: 'Data Structures Fundamentals',
    totalQuestions: questions.length,
    totalMarks: questions.reduce((sum, q) => sum + q.points, 0),
    duration: 60,
    subject: 'Data Structures',
    faculty: 'Dr. Amruta Pankade'
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

  // Camera and microphone setup
  useEffect(() => {
    if (isProctoring) {
      setupCamera()
      setupMicrophone()
    }
    
    // Tab visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount(prev => prev + 1)
        setViolationCount(prev => prev + 1)
        toast({
          title: "Warning",
          description: "Tab switching detected! This has been recorded.",
          variant: "destructive"
        })
        
        if (tabSwitchCount >= 2) {
          setShowWarning(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isProctoring, tabSwitchCount, isSubmitted])

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setCameraPermission(true)
    } catch (error) {
      console.error('Camera access denied:', error)
      setCameraPermission(false)
      toast({
        title: "Camera Required",
        description: "Please enable camera access for proctoring.",
        variant: "destructive"
      })
    }
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

  const handleManualSubmit = () => {
    const answeredCount = questions.filter(q => q.answered).length
    const unansweredCount = questions.length - answeredCount
    
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      )
      if (!confirmSubmit) return
    }
    
    setIsSubmitted(true)
    toast({
      title: "Quiz Submitted",
      description: "Your answers have been submitted successfully.",
    })
    
    // Redirect to results page
    setTimeout(() => {
      router.push(`/student-dashboard/quiz/results/${params.id}`)
    }, 2000)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = questions.filter(q => q.answered).length
  const flaggedCount = questions.filter(q => q.flagged).length
  const progressPercentage = (answeredCount / questions.length) * 100

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentQuestion.answer === index
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={currentQuestion.answer === index}
                    onChange={() => handleAnswerChange(index)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    currentQuestion.answer === index
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-300'
                  }`}>
                    {currentQuestion.answer === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{String.fromCharCode(65 + index)}. {option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <div className="flex space-x-4">
              {['true', 'false'].map((option) => (
                <label
                  key={option}
                  className={`flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentQuestion.answer === option
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={currentQuestion.answer === option}
                    onChange={() => handleAnswerChange(option)}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            <Input
              placeholder="Enter your answer..."
              value={currentQuestion.answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="text-lg p-4"
            />
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
                  <CardTitle className="text-sm flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Proctoring Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-24 bg-gray-200 rounded-lg object-cover"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Violations: {violationCount}
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
