"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award,
  TrendingUp,
  Download,
  Share2,
  ArrowLeft,
  Star,
  BarChart3,
  Percent,
  Calendar,
  User,
  BookOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

interface QuizResult {
  quiz_id: string
  student_id: string
  marks_obtained: number
  total_marks: number
  submitted_at: string
  time_taken_seconds: number
  answers: Record<string, string>
}

interface Quiz {
  id: string
  title: string
  subject: string
  department: string
  faculty_name: string
  duration_minutes: number
  total_marks: number
  passing_marks: number
  start_time: string
  end_time: string
}

interface Question {
  id: string
  question_text: string
  question_type: string
  options: Record<string, string> | null
  correct_answer: string
  marks: number
  order_number: number
}

interface Student {
  id: string
  name: string
  email: string
  department: string
  year: string
}

export default function QuizScorecardPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [rank, setRank] = useState<number>(0)
  const [totalParticipants, setTotalParticipants] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchScorecardData()
  }, [quizId])

  const fetchScorecardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?type=student')
        return
      }

      // Get student data
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single()

      if (!studentData) {
        // Try department-year tables
        const departments = ['cse', 'cyber', 'aids', 'aiml']
        const years = ['1st', '2nd', '3rd', '4th']
        
        for (const dept of departments) {
          for (const year of years) {
            const { data } = await supabase
              .from(`students_${dept}_${year}_year`)
              .select('*')
              .eq('email', user.email)
              .single()
            
            if (data) {
              setStudent(data)
              break
            }
          }
        }
      } else {
        setStudent(studentData)
      }

      // Get quiz data
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizData) {
        setQuiz(quizData)
      }

      // Get quiz result
      const studentId = studentData?.id || student?.id
      if (studentId) {
        const { data: resultData } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId)
          .eq('student_id', studentId)
          .single()

        if (resultData) {
          setResult(resultData)
        }
      }

      // Get questions
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }

      // Get rank and total participants
      const { data: allAttempts } = await supabase
        .from('quiz_attempts')
        .select('student_id, marks_obtained')
        .eq('quiz_id', quizId)
        .order('marks_obtained', { ascending: false })

      if (allAttempts && studentId) {
        setTotalParticipants(allAttempts.length)
        const studentRank = allAttempts.findIndex(a => a.student_id === studentId) + 1
        setRank(studentRank)
      }

    } catch (error) {
      console.error('Error fetching scorecard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePercentage = () => {
    if (!result) return 0
    return Math.round((result.marks_obtained / result.total_marks) * 100)
  }

  const isPassed = () => {
    if (!quiz || !result) return false
    return result.marks_obtained >= quiz.passing_marks
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getGrade = () => {
    const percentage = calculatePercentage()
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const handleDownload = () => {
    // Generate printable scorecard
    const content = document.getElementById('scorecard-content')
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Quiz Scorecard - ${quiz?.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; }
            .score { font-size: 48px; font-weight: bold; color: ${isPassed() ? '#16a34a' : '#dc2626'}; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f4f6; }
            .correct { color: #16a34a; }
            .incorrect { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${quiz?.title}</div>
            <p>${quiz?.subject} | ${quiz?.department}</p>
          </div>
          <div style="text-align: center;">
            <div class="score">${calculatePercentage()}%</div>
            <p>Score: ${result?.marks_obtained}/${result?.total_marks}</p>
            <p>Grade: ${getGrade().grade}</p>
            <p>Rank: ${rank}/${totalParticipants}</p>
          </div>
          <h3>Student Details</h3>
          <p>Name: ${student?.name}</p>
          <p>Email: ${student?.email}</p>
          <p>Department: ${student?.department}</p>
          <h3>Question Analysis</h3>
          <table>
            <tr>
              <th>Q.No</th>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
              <th>Status</th>
            </tr>
            ${questions.map((q, i) => {
              const userAnswer = result?.answers?.[q.id] || '-'
              const isCorrect = userAnswer === q.correct_answer
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td>${q.question_text}</td>
                  <td>${userAnswer}</td>
                  <td>${q.correct_answer}</td>
                  <td class="${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct' : 'Incorrect'}</td>
                </tr>
              `
            }).join('')}
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">No Result Found</h2>
            <p className="text-gray-600 mb-4">You haven't attempted this quiz yet.</p>
            <Link href="/student-dashboard/quiz">
              <Button>Back to Quizzes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gradeInfo = getGrade()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/student-dashboard/quiz">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Quizzes
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        <div id="scorecard-content">
          {/* Main Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className={`border-0 shadow-xl ${isPassed() ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400'}`}>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                  <p className="text-gray-600">{quiz.subject} • {quiz.department}</p>
                  <p className="text-sm text-gray-500 mt-1">By {quiz.faculty_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Score Display */}
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${isPassed() ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePercentage()}%
                    </div>
                    <div className="text-lg text-gray-600 mt-1">
                      {result.marks_obtained} / {result.total_marks} marks
                    </div>
                    <Badge className={`mt-2 ${gradeInfo.bg} ${gradeInfo.color}`}>
                      Grade: {gradeInfo.grade}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {isPassed() ? (
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <span className="text-xl font-bold text-green-600">PASSED</span>
                        <span className="text-sm text-gray-500">Passing: {quiz.passing_marks} marks</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                          <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <span className="text-xl font-bold text-red-600">FAILED</span>
                        <span className="text-sm text-gray-500">Passing: {quiz.passing_marks} marks</span>
                      </div>
                    )}
                  </div>

                  {/* Rank */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <span className="text-4xl font-bold text-gray-900">#{rank}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Rank out of {totalParticipants} participants
                    </div>
                    <Progress 
                      value={totalParticipants > 0 ? ((totalParticipants - rank) / totalParticipants) * 100 : 0} 
                      className="h-2 mt-2"
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Time Taken</div>
                      <div className="font-bold">{formatTime(result.time_taken_seconds || 0)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm text-gray-600">Accuracy</div>
                      <div className="font-bold">{calculatePercentage()}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-sm text-gray-600">Correct</div>
                      <div className="font-bold">
                        {Object.entries(result.answers || {}).filter(([qId, ans]) => 
                          questions.find(q => q.id === qId)?.correct_answer === ans
                        ).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-4 text-center">
                      <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                      <div className="text-sm text-gray-600">Incorrect</div>
                      <div className="font-bold">
                        {questions.length - Object.entries(result.answers || {}).filter(([qId, ans]) => 
                          questions.find(q => q.id === qId)?.correct_answer === ans
                        ).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{student?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{student?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="font-medium">{student?.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div className="font-medium">{student?.year}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Question Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const userAnswer = result.answers?.[question.id] || '-'
                    const isCorrect = userAnswer === question.correct_answer
                    
                    return (
                      <Card 
                        key={question.id} 
                        className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant="outline">{question.marks} marks</Badge>
                            </div>
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <p className="font-medium mb-3">{question.question_text}</p>
                          
                          {question.options && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {Object.entries(question.options).map(([key, value]) => (
                                <div 
                                  key={key}
                                  className={`p-2 rounded border text-sm ${
                                    key === question.correct_answer 
                                      ? 'bg-green-100 border-green-400 font-medium' 
                                      : key === userAnswer && !isCorrect
                                        ? 'bg-red-100 border-red-400'
                                        : 'bg-gray-50'
                                  }`}
                                >
                                  <span className="font-medium">{key}.</span> {value}
                                  {key === question.correct_answer && (
                                    <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Your Answer: </span>
                              <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {userAnswer}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div>
                                <span className="text-gray-500">Correct Answer: </span>
                                <span className="text-green-600 font-medium">{question.correct_answer}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
