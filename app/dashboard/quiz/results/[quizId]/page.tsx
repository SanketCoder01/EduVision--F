"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface QuizAttempt {
  id: string
  student_id: string
  quiz_id: string
  marks_obtained: number
  total_marks: number
  score_percentage: number
  time_taken_seconds: number
  status: string
  submitted_at: string
  student_name?: string
  student_email?: string
  answers?: any
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

interface QuestionAnalysis {
  question_id: string
  question_text: string
  correct_count: number
  incorrect_count: number
  total_attempts: number
  accuracy: number
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAttempts: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
    avgTime: 0
  })

  // Fetch initial data
  useEffect(() => {
    fetchQuizData()
    fetchAttempts()
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`quiz-results-${quizId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `quiz_id=eq.${quizId}`
        },
        (payload) => {
          console.log('New attempt:', payload)
          fetchAttempts()
          toast({
            title: "New Submission",
            description: "A student has submitted their quiz",
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (error) throw error
      setQuiz(data)
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive"
      })
    }
  }

  const fetchAttempts = async () => {
    setIsLoading(true)
    try {
      // Fetch attempts with student info
      const { data: attemptsData, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          student_id,
          quiz_id,
          marks_obtained,
          total_marks,
          score_percentage,
          time_taken_seconds,
          status,
          submitted_at,
          answers
        `)
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      // Get student names
      const studentIds = attemptsData?.map(a => a.student_id) || []
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, email')
        .in('id', studentIds)

      // Merge student data with attempts
      const mergedAttempts = attemptsData?.map(attempt => {
        const student = studentsData?.find(s => s.id === attempt.student_id)
        return {
          ...attempt,
          student_name: student?.name || 'Unknown',
          student_email: student?.email || 'Unknown'
        }
      }) || []

      setAttempts(mergedAttempts)
      calculateStats(mergedAttempts)
      
      // Fetch question analysis
      await fetchQuestionAnalysis(mergedAttempts)
    } catch (error) {
      console.error('Error fetching attempts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (attempts: QuizAttempt[]) => {
    if (attempts.length === 0) {
      setStats({
        totalAttempts: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        avgTime: 0
      })
      return
    }

    const scores = attempts.map(a => a.marks_obtained)
    const percentages = attempts.map(a => a.score_percentage || (a.marks_obtained / a.total_marks * 100))
    const times = attempts.map(a => a.time_taken_seconds || 0)
    const passingAttempts = attempts.filter(a => (a.score_percentage || (a.marks_obtained / a.total_marks * 100)) >= 40)

    setStats({
      totalAttempts: attempts.length,
      avgScore: percentages.reduce((a, b) => a + b, 0) / percentages.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (passingAttempts.length / attempts.length) * 100,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length
    })
  }

  const fetchQuestionAnalysis = async (attempts: QuizAttempt[]) => {
    try {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id, question, correct_answer')
        .eq('quiz_id', quizId)

      if (!questions || questions.length === 0) return

      const analysis: QuestionAnalysis[] = questions.map(q => {
        let correct = 0
        let incorrect = 0

        attempts.forEach(attempt => {
          if (attempt.answers) {
            const answer = attempt.answers[q.id]
            if (answer === q.correct_answer) {
              correct++
            } else {
              incorrect++
            }
          }
        })

        return {
          question_id: q.id,
          question_text: q.question,
          correct_count: correct,
          incorrect_count: incorrect,
          total_attempts: attempts.length,
          accuracy: attempts.length > 0 ? (correct / attempts.length) * 100 : 0
        }
      })

      setQuestionAnalysis(analysis)
    } catch (error) {
      console.error('Error fetching question analysis:', error)
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

  const exportResults = () => {
    const csv = [
      ['Student Name', 'Email', 'Score', 'Percentage', 'Time Taken', 'Submitted At'].join(','),
      ...attempts.map(a => [
        a.student_name,
        a.student_email,
        `${a.marks_obtained}/${a.total_marks}`,
        `${a.score_percentage?.toFixed(2) || ((a.marks_obtained / a.total_marks) * 100).toFixed(2)}%`,
        formatTime(a.time_taken_seconds || 0),
        formatDate(a.submitted_at)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-${quizId}-results.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported",
      description: "Results exported as CSV"
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz?.title} - Results</h1>
            <p className="text-gray-500">
              {quiz?.department} | {quiz?.target_years?.join(', ')} Year
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAttempts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Attempts</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalAttempts}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Average Score</p>
                  <p className="text-3xl font-bold text-green-900">{stats.avgScore.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Pass Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.passRate.toFixed(1)}%</p>
                </div>
                <Trophy className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Avg Time</p>
                  <p className="text-3xl font-bold text-orange-900">{formatTime(stats.avgTime)}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { range: '90-100%', label: 'Excellent', color: 'bg-green-500' },
              { range: '70-89%', label: 'Good', color: 'bg-blue-500' },
              { range: '50-69%', label: 'Average', color: 'bg-yellow-500' },
              { range: '30-49%', label: 'Below Average', color: 'bg-orange-500' },
              { range: '0-29%', label: 'Poor', color: 'bg-red-500' }
            ].map(range => {
              const count = attempts.filter(a => {
                const pct = a.score_percentage || (a.marks_obtained / a.total_marks * 100)
                const [min, max] = range.range.split('-').map(s => parseInt(s))
                return pct >= min && pct <= max
              }).length
              const percentage = stats.totalAttempts > 0 ? (count / stats.totalAttempts) * 100 : 0

              return (
                <div key={range.range} className="flex items-center gap-4">
                  <div className="w-24 text-sm">{range.range}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${range.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm">{count} students</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Student Results</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Rank</th>
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Score</th>
                      <th className="text-left p-3">Percentage</th>
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts
                      .sort((a, b) => b.marks_obtained - a.marks_obtained)
                      .map((attempt, index) => {
                        const percentage = attempt.score_percentage || (attempt.marks_obtained / attempt.total_marks * 100)
                        return (
                          <motion.tr
                            key={attempt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{attempt.student_name}</p>
                                <p className="text-sm text-gray-500">{attempt.student_email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              {attempt.marks_obtained}/{attempt.total_marks}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Progress value={percentage} className="w-20" />
                                <span className="text-sm">{percentage.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {formatTime(attempt.time_taken_seconds || 0)}
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant={percentage >= 40 ? "default" : "destructive"}
                                className={percentage >= 40 ? "bg-green-600" : ""}
                              >
                                {percentage >= 40 ? 'Pass' : 'Fail'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {formatDate(attempt.submitted_at)}
                            </td>
                          </motion.tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionAnalysis.map((q, index) => (
                  <motion.div
                    key={q.question_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge 
                            className={
                              q.accuracy >= 70 ? "bg-green-100 text-green-800" :
                              q.accuracy >= 40 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }
                          >
                            {q.accuracy.toFixed(1)}% accuracy
                          </Badge>
                        </div>
                        <p className="text-sm">{q.question_text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{q.correct_count} correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{q.incorrect_count} incorrect</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts
                  .sort((a, b) => b.marks_obtained - a.marks_obtained)
                  .slice(0, 10)
                  .map((attempt, index) => {
                    const percentage = attempt.score_percentage || (attempt.marks_obtained / attempt.total_marks * 100)
                    return (
                      <motion.div
                        key={attempt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? "bg-yellow-50 border-2 border-yellow-400" :
                          index === 1 ? "bg-gray-50 border-2 border-gray-400" :
                          index === 2 ? "bg-orange-50 border-2 border-orange-400" :
                          "bg-white border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-yellow-500 text-white" :
                            index === 1 ? "bg-gray-400 text-white" :
                            index === 2 ? "bg-orange-400 text-white" :
                            "bg-gray-200"
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{attempt.student_name}</p>
                            <p className="text-sm text-gray-500">{attempt.student_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{attempt.marks_obtained}/{attempt.total_marks}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time indicator */}
      <div className="fixed bottom-4 right-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600 animate-pulse" />
            <span className="text-sm text-green-800">Live Updates Active</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
