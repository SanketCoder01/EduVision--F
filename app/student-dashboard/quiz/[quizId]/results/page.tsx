"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface QuizResult {
  id: string
  quiz_id: string
  marks_obtained: number
  total_marks: number
  score_percentage: number
  time_taken_seconds: number
  status: string
  submitted_at: string
  answers: Record<string, string>
}

interface QuizData {
  id: string
  title: string
  department: string
  target_years: string[]
  total_marks: number
  duration: number
  start_time: string
  end_time: string
  faculty_name: string
}

interface Question {
  id: string
  question: string
  type: string
  options?: string[]
  correct_answer: string
  points: number
}

interface LeaderboardEntry {
  student_id: string
  student_name: string
  marks_obtained: number
  total_marks: number
  rank: number
}

export default function StudentQuizResultPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [studentId, setStudentId] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchStudentAndResults()
    
    // Set up realtime subscription for leaderboard updates
    const channel = supabase
      .channel(`quiz-leaderboard-${quizId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `quiz_id=eq.${quizId}`
        },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [quizId])

  const fetchStudentAndResults = async () => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setStudentId(user.id)

      // Fetch quiz data
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizData) setQuiz(quizData)

      // Fetch questions
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)

      if (questionsData) setQuestions(questionsData)

      // Fetch student's result
      const { data: resultData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .single()

      if (resultData) setResult(resultData)

      // Fetch leaderboard
      await fetchLeaderboard()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz results",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('student_id, marks_obtained, total_marks')
        .eq('quiz_id', quizId)
        .order('marks_obtained', { ascending: false })

      if (!attempts) return

      const studentIds = attempts.map(a => a.student_id)
      const { data: students } = await supabase
        .from('students')
        .select('id, name')
        .in('id', studentIds)

      const leaderboardData = attempts.map((a, index) => ({
        student_id: a.student_id,
        student_name: students?.find(s => s.id === a.student_id)?.name || 'Unknown',
        marks_obtained: a.marks_obtained,
        total_marks: a.total_marks,
        rank: index + 1
      }))

      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getMyRank = () => {
    if (!studentId || !leaderboard) return null
    return leaderboard.find(e => e.student_id === studentId)?.rank || null
  }

  const getAnswerStatus = (questionId: string) => {
    if (!result || !questions) return null
    
    const question = questions.find(q => q.id === questionId)
    if (!question) return null

    const myAnswer = result.answers?.[questionId]
    const isCorrect = myAnswer === question.correct_answer

    return {
      myAnswer,
      correctAnswer: question.correct_answer,
      isCorrect
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
            <p className="text-gray-500 mb-4">You haven't completed this quiz yet.</p>
            <Button onClick={() => router.push(`/student-dashboard/quiz/${quizId}`)}>
              Take Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = result.score_percentage || (result.marks_obtained / result.total_marks * 100)
  const myRank = getMyRank()
  const correctCount = questions.filter(q => {
    const status = getAnswerStatus(q.id)
    return status?.isCorrect
  }).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{quiz?.title} - Your Results</h1>
          <p className="text-gray-500">Submitted on {formatDate(result.submitted_at)}</p>
        </div>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className={`${
          percentage >= 80 ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300" :
          percentage >= 60 ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300" :
          percentage >= 40 ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300" :
          "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
        }`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{result.marks_obtained}</span>
                    <span className="text-2xl text-gray-500">/ {result.total_marks}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={percentage >= 40 ? "default" : "destructive"}
                    className={percentage >= 40 ? "bg-green-600 text-white" : ""}
                  >
                    {percentage >= 80 ? "Excellent" :
                     percentage >= 60 ? "Good" :
                     percentage >= 40 ? "Pass" : "Fail"}
                  </Badge>
                  <span className="text-lg">{percentage.toFixed(1)}%</span>
                </div>

                {myRank && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span>Rank #{myRank} out of {leaderboard.length}</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={percentage >= 80 ? "#22c55e" :
                              percentage >= 60 ? "#3b82f6" :
                              percentage >= 40 ? "#eab308" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(percentage / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Correct Answers</p>
                <p className="text-2xl font-bold">{correctCount}/{questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Incorrect Answers</p>
                <p className="text-2xl font-bold">{questions.length - correctCount}/{questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Taken</p>
                <p className="text-2xl font-bold">{formatTime(result.time_taken_seconds || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Question Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const status = getAnswerStatus(question.id)
              if (!status) return null

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    status.isCorrect 
                      ? "border-green-200 bg-green-50" 
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge variant="outline">{question.points} pts</Badge>
                      {status.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <p className="font-medium mb-3">{question.question}</p>

                  {question.options && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {question.options.map((option, optIndex) => {
                        const optionKey = optIndex.toString()
                        const isMyAnswer = status.myAnswer === optionKey
                        const isCorrectAnswer = status.correctAnswer === optionKey

                        return (
                          <div
                            key={optIndex}
                            className={`p-2 rounded border text-sm ${
                              isCorrectAnswer
                                ? "bg-green-100 border-green-400 font-medium"
                                : isMyAnswer && !isCorrectAnswer
                                  ? "bg-red-100 border-red-400"
                                  : "bg-white"
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                            {isCorrectAnswer && (
                              <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                            )}
                            {isMyAnswer && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 inline ml-2 text-red-600" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Your answer: </span>
                    <Badge variant={status.isCorrect ? "default" : "destructive"}>
                      {question.type === 'true_false' 
                        ? status.myAnswer 
                        : question.options?.[parseInt(status.myAnswer)] || status.myAnswer}
                    </Badge>
                    {!status.isCorrect && (
                      <>
                        <span className="text-gray-500">Correct: </span>
                        <Badge className="bg-green-600">
                          {question.type === 'true_false'
                            ? status.correctAnswer
                            : question.options?.[parseInt(status.correctAnswer)] || status.correctAnswer}
                        </Badge>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry) => (
              <div
                key={entry.student_id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.student_id === studentId
                    ? "bg-blue-50 border-2 border-blue-400"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1 ? "bg-yellow-500 text-white" :
                    entry.rank === 2 ? "bg-gray-400 text-white" :
                    entry.rank === 3 ? "bg-orange-400 text-white" :
                    "bg-gray-200"
                  }`}>
                    {entry.rank}
                  </div>
                  <span className={entry.student_id === studentId ? "font-bold" : ""}>
                    {entry.student_name}
                    {entry.student_id === studentId && " (You)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{entry.marks_obtained}/{entry.total_marks}</span>
                  <span className="text-sm text-gray-500">
                    {((entry.marks_obtained / entry.total_marks) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
