"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Shield,
  Trophy,
  XCircle
} from "lucide-react"

interface Question {
  id: string
  question_text: string
  question_type: string
  options?: any
  correct_answer: string
  points: number
  difficulty: string
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  duration_minutes: number
  total_marks: number
  passing_marks: number
  proctoring_enabled: boolean
  max_violations_allowed: number
  show_results: boolean
  allow_review: boolean
  start_time: string | null
  end_time: string | null
}

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [started, setStarted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [violationCount, setViolationCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  
  // Countdown for scheduled quizzes
  const [countdownToStart, setCountdownToStart] = useState<number | null>(null)
  const [quizNotYetAvailable, setQuizNotYetAvailable] = useState(false)
  
  // Results state
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastViolationTime = useRef<number>(0)
  const fullscreenRetryCount = useRef<number>(0)

  // Fetch quiz data
  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  // Check if quiz is available (scheduled time)
  useEffect(() => {
    if (!quiz || started) return
    
    if (quiz.start_time) {
      const startTime = new Date(quiz.start_time).getTime()
      const now = Date.now()
      
      if (now < startTime) {
        // Quiz not yet available - show countdown
        setQuizNotYetAvailable(true)
        setCountdownToStart(Math.floor((startTime - now) / 1000))
      } else {
        setQuizNotYetAvailable(false)
      }
    }
  }, [quiz, started])

  // Countdown timer for scheduled quiz start
  useEffect(() => {
    if (countdownToStart === null || countdownToStart <= 0) return
    
    const timer = setInterval(() => {
      setCountdownToStart(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          setQuizNotYetAvailable(false)
          toast({
            title: "Quiz Available!",
            description: "The quiz is now available. Click Start to begin.",
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdownToStart])

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit("Time expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started, timeLeft])

  // AI Proctoring - Tab/Window switch detection
  useEffect(() => {
    if (!started) return

    // Always enter fullscreen for all quizzes
    const enterFullscreen = () => {
      const elem = document.documentElement
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
          console.log('Fullscreen error:', err)
          // Retry after a short delay
          if (fullscreenRetryCount.current < 3) {
            fullscreenRetryCount.current++
            setTimeout(enterFullscreen, 500)
          }
        })
      }
    }
    
    enterFullscreen()

    const handleFullscreenExit = () => {
      if (!started) return
      
      // Immediately re-enter fullscreen
      enterFullscreen()
      
      // Log violation if proctoring enabled
      if (quiz?.proctoring_enabled) {
        handleViolation('fullscreen_exit', 'You exited fullscreen mode - re-enabling...')
      } else {
        toast({
          title: "Fullscreen Required",
          description: "Quiz must be taken in fullscreen mode",
          variant: "destructive"
        })
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenExit)

    // Proctoring-specific listeners
    if (quiz?.proctoring_enabled) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          handleViolation('tab_switch', 'You switched to another tab')
        }
      }

      const handleBlur = () => {
        handleViolation('window_blur', 'You switched to another window')
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        // Block common shortcuts
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault()
          handleViolation('shortcut_used', 'Alt+Tab shortcut blocked')
        }
        if (e.ctrlKey && e.key === 'Tab') {
          e.preventDefault()
          handleViolation('shortcut_used', 'Ctrl+Tab shortcut blocked')
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          handleViolation('escape_pressed', 'Escape key blocked')
        }
        if (e.key === 'F11') {
          e.preventDefault()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('blur', handleBlur)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('blur', handleBlur)
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('fullscreenchange', handleFullscreenExit)
      }
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenExit)
    }
  }, [started, quiz?.proctoring_enabled])

  const handleViolation = useCallback(async (type: string, message: string) => {
    // Debounce violations (max 1 per second)
    const now = Date.now()
    if (now - lastViolationTime.current < 1000) return
    lastViolationTime.current = now

    const newCount = violationCount + 1
    setViolationCount(newCount)
    
    // Show warning
    setWarningMessage(`${message} (Violation ${newCount}/${quiz?.max_violations_allowed || 3})`)
    setShowWarning(true)
    
    // Hide warning after 3 seconds
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false)
    }, 3000)

    // Log violation to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('email', user?.email)
        .single()

      await supabase.from('proctoring_violations').insert({
        quiz_attempt_id: attemptId,
        student_id: studentData?.id,
        quiz_id: quizId,
        violation_type: type,
        details: { message, timestamp: new Date().toISOString() },
        action_taken: newCount >= (quiz?.max_violations_allowed || 3) ? 'auto_submit' : 'warning'
      })
    } catch (err) {
      console.error('Error logging violation:', err)
    }

    // Auto-submit if max violations reached
    if (newCount >= (quiz?.max_violations_allowed || 3)) {
      await handleAutoSubmit(`Maximum violations (${quiz?.max_violations_allowed || 3}) exceeded`)
    }
  }, [violationCount, quiz?.max_violations_allowed, attemptId, quizId])

  const fetchQuiz = async () => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true })

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      setTimeLeft(quizData.duration_minutes * 60)
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get student ID by email
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!studentData) {
        toast({
          title: "Error",
          description: "Student profile not found",
          variant: "destructive"
        })
        return
      }

      // Create attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: studentData.id,
          total_marks: quiz?.total_marks || 0,
          marks_obtained: 0,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (attemptError) throw attemptError
      setAttemptId(attempt.id)
      setStarted(true)

      toast({
        title: "Quiz Started",
        description: quiz?.proctoring_enabled 
          ? "AI Proctoring is active. Do not switch tabs or windows." 
          : "Good luck!"
      })
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive"
      })
    }
  }

  const handleAutoSubmit = async (reason: string) => {
    toast({
      title: "Quiz Auto-Submitted",
      description: reason,
      variant: "destructive"
    })
    await submitQuiz(true, reason)
  }

  const submitQuiz = async (autoSubmitted = false, reason = "") => {
    if (submitting) return
    setSubmitting(true)

    try {
      // Calculate score
      let marksObtained = 0
      let correctCount = 0
      let incorrectCount = 0
      
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          marksObtained += q.points
          correctCount++
        } else if (answers[q.id]) {
          incorrectCount++
        }
      })

      const percentage = (marksObtained / (quiz?.total_marks || 1)) * 100
      const passed = marksObtained >= (quiz?.passing_marks || 0)

      // Update attempt
      const { error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
          marks_obtained: marksObtained,
          score_percentage: percentage,
          status: autoSubmitted ? 'auto_submitted' : 'submitted',
          submitted_at: new Date().toISOString(),
          time_taken_seconds: (quiz?.duration_minutes || 0) * 60 - timeLeft
        })
        .eq('id', attemptId)

      if (updateError) throw updateError

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }

      // Show results
      setResults({
        marksObtained,
        totalMarks: quiz?.total_marks,
        percentage,
        passed,
        correctCount,
        incorrectCount,
        unanswered: questions.length - correctCount - incorrectCount,
        passingMarks: quiz?.passing_marks,
        autoSubmitted,
        reason
      })
      setShowResults(true)

    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
            <p className="text-gray-600 mb-4">This quiz may not exist or you don't have access.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              results.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {results.passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl mt-4">
              {results.passed ? 'Congratulations! You Passed!' : 'Better Luck Next Time'}
            </CardTitle>
            {results.autoSubmitted && (
              <Badge className="bg-red-100 text-red-700 mt-2">
                Auto-submitted: {results.reason}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-green-600">{results.marksObtained}/{results.totalMarks}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-2xl font-bold text-blue-600">{results.percentage.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-purple-600">{results.correctCount}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">{results.incorrectCount}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${results.passed ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Passing Marks:</span>
                <span className="font-bold">{results.passingMarks}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium">Your Score:</span>
                <span className={`font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {results.marksObtained}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium">Status:</span>
                <Badge className={results.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {results.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>

            <Button 
              onClick={() => router.push('/student-dashboard/quiz')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Countdown screen for scheduled quizzes
  if (quizNotYetAvailable && countdownToStart && countdownToStart > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-2xl">Quiz Starts In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-mono font-bold text-purple-600 mb-6">
              {formatTime(countdownToStart)}
            </div>
            <p className="text-gray-600 mb-4">
              <strong>{quiz.title}</strong> is scheduled to start at{' '}
              {new Date(quiz.start_time!).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              This page will automatically update when the quiz becomes available.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-bold">{quiz.duration_minutes} min</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Questions</p>
                <p className="font-bold">{questions.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="font-bold">{quiz.total_marks}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Passing Marks</p>
                <p className="font-bold">{quiz.passing_marks}</p>
              </div>
            </div>

            {quiz.proctoring_enabled && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-red-700">AI Proctoring Enabled</h3>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Do not switch tabs or windows</li>
                  <li>• Do not exit fullscreen mode</li>
                  <li>• Do not use keyboard shortcuts (Alt+Tab, etc.)</li>
                  <li>• Maximum {quiz.max_violations_allowed || 3} violations allowed</li>
                  <li>• Quiz will auto-submit on violation limit</li>
                </ul>
              </div>
            )}

            <Button 
              onClick={startQuiz}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz in progress
  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Proctoring Warning */}
      {showWarning && quiz.proctoring_enabled && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-50 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold">{warningMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-40 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg">{quiz.title}</h1>
          <div className="flex items-center gap-4">
            {quiz.proctoring_enabled && (
              <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Proctoring Active
              </Badge>
            )}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto p-4">
        <Progress 
          value={((currentQuestion + 1) / questions.length) * 100} 
          className="h-2 mb-6"
        />
        <p className="text-sm text-gray-600 text-center mb-4">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentQ.question_type.toUpperCase()}</Badge>
              <Badge className={
                currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQ.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {currentQ.difficulty}
              </Badge>
              <Badge variant="secondary">{currentQ.points} pts</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{currentQ.question_text}</p>

            {/* MCQ */}
            {currentQ.question_type === 'mcq' && currentQ.options && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentQ.id]: value }))}
              >
                {Object.entries(currentQ.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                    <RadioGroupItem value={key} id={`option-${key}`} />
                    <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{key}.</span> {String(value)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQ.question_type === 'true_false' && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentQ.id]: value }))}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                  <RadioGroupItem value="true" id="option-true" />
                  <Label htmlFor="option-true" className="cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                  <RadioGroupItem value="false" id="option-false" />
                  <Label htmlFor="option-false" className="cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {/* Fill in blanks */}
            {currentQ.question_type === 'fill_blank' && (
              <Input
                placeholder="Enter your answer"
                value={answers[currentQ.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                className="text-lg"
              />
            )}

            {/* Descriptive */}
            {currentQ.question_type === 'descriptive' && (
              <Textarea
                placeholder="Enter your answer"
                value={answers[currentQ.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                className="min-h-[150px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={() => submitQuiz()}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-3">Question Navigator</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={currentQuestion === idx ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 p-0 ${
                  answers[q.id] ? 'bg-green-100 border-green-500' : ''
                }`}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
