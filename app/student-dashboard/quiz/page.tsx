"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  Clock, 
  Trophy, 
  BarChart3, 
  Users, 
  Calendar,
  Brain,
  Target,
  Award,
  CheckCircle,
  XCircle,
  Timer,
  BookOpen,
  Star,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { realtimeService, RealtimePayload } from "@/lib/realtime-service"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Quiz {
  id: string
  title: string
  subject: string
  faculty: string
  duration: number
  totalQuestions: number
  totalMarks: number
  difficulty: 'easy' | 'medium' | 'hard'
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed' | 'missed'
  attempts: number
  maxAttempts: number
  bestScore?: number
  averageScore?: number
  description: string
}

const StudentQuizDashboard = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'completed' | 'leaderboard'>('available')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const subscriptionsRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    fetchStudentData()
    
    return () => {
      if (subscriptionsRef.current) {
        subscriptionsRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (student) {
      fetchQuizzes()
      setupRealtimeSubscriptions()
    }
  }, [student])

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single()

      if (studentData) {
        setStudent(studentData)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuizzes = async () => {
    if (!student) return
    
    try {
      // Fetch published quizzes for student's department
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('department', student.department)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter by target_years containing student's year
      const filteredData = (data || []).filter(q => {
        if (!q.target_years || q.target_years.length === 0) return true
        return q.target_years.includes(student.year)
      })

      // Get student's quiz attempts with count per quiz
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, marks_obtained, total_marks, completed_at')
        .eq('student_id', student.id)

      // Count attempts per quiz
      const attemptCountMap = new Map<string, number>()
      const attemptDataMap = new Map<string, { marks: number | null, total: number, completed: boolean }>()
      
      attempts?.forEach(a => {
        // Count only completed attempts
        if (a.completed_at) {
          const count = attemptCountMap.get(a.quiz_id) || 0
          attemptCountMap.set(a.quiz_id, count + 1)
          
          // Store best score data
          if (!attemptDataMap.has(a.quiz_id) || (a.marks_obtained && attemptDataMap.get(a.quiz_id)?.marks && a.marks_obtained > attemptDataMap.get(a.quiz_id)!.marks!)) {
            attemptDataMap.set(a.quiz_id, { marks: a.marks_obtained, total: a.total_marks, completed: true })
          }
        }
      })

      console.log('Attempt counts:', Object.fromEntries(attemptCountMap))
      console.log('Attempt data:', Object.fromEntries(attemptDataMap))

      // Transform data to match Quiz interface
      const transformedQuizzes: Quiz[] = filteredData.map(q => {
        const attemptCount = attemptCountMap.get(q.id) || 0
        const maxAttempts = q.max_attempts || 1
        const attemptData = attemptDataMap.get(q.id)
        const timeStatus = getQuizStatus(q.start_time, q.end_time)
        const isCompleted = attemptData?.completed || false
        const noAttemptsLeft = attemptCount >= maxAttempts
        
        return {
          id: q.id,
          title: q.title,
          subject: q.subject,
          faculty: q.faculty_name,
          duration: q.duration_minutes,
          totalQuestions: q.total_questions || 0,
          totalMarks: q.total_marks,
          difficulty: q.difficulty,
          startDate: q.start_time,
          endDate: q.end_time,
          status: isCompleted || noAttemptsLeft ? 'completed' : timeStatus,
          attempts: attemptCount,
          maxAttempts: maxAttempts,
          bestScore: attemptData?.marks || undefined,
          averageScore: attemptData && attemptData.marks ? Math.round((attemptData.marks / attemptData.total) * 100) : undefined,
          description: q.description || ''
        }
      })

      setQuizzes(transformedQuizzes)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    }
  }

  const getQuizStatus = (startDate: string | null, endDate: string | null): 'upcoming' | 'active' | 'completed' | 'missed' => {
    const now = new Date()
    
    // If no dates, quiz is always active
    if (!startDate && !endDate) return 'active'
    
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    // Handle timezone - dates from Supabase are in UTC, convert to local for comparison
    if (start && now < start) return 'upcoming'
    if (start && end && now >= start && now <= end) return 'active'
    if (end && now > end) return 'completed'
    if (start && now > start && !end) return 'active'
    
    return 'active'
  }

  const setupRealtimeSubscriptions = () => {
    if (!student) return
    
    // Clean up previous subscriptions
    if (subscriptionsRef.current) {
      subscriptionsRef.current.unsubscribe()
    }
    
    // Subscribe to quizzes with department + year filtering
    subscriptionsRef.current = realtimeService.subscribeToQuizzes(
      { department: student.department, year: student.year },
      (payload: RealtimePayload) => {
        console.log('Quiz update:', payload)
        fetchQuizzes()
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Quiz Available",
            description: `Quiz "${payload.new.title}" has been published.`,
          })
        } else if (payload.eventType === 'UPDATE') {
          toast({
            title: "Quiz Updated",
            description: `Quiz "${payload.new.title}" has been modified.`,
          })
        }
      }
    )

    // Also subscribe to own quiz_attempts to update attempt count in real-time
    const attemptsChannel = supabase
      .channel(`student-attempts-${student.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_attempts',
        filter: `student_id=eq.${student.id}`
      }, (payload) => {
        console.log('New attempt recorded:', payload.new)
        // Refresh quizzes to update attempt count
        fetchQuizzes()
        
        toast({
          title: "Quiz Submitted",
          description: "Your quiz has been submitted successfully!",
        })
      })
      .subscribe()
  }

  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [studentStats, setStudentStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    rank: 0,
    totalStudents: 0,
    streakDays: 0
  })

  // Fetch real leaderboard data
  const fetchLeaderboard = async () => {
    if (!student) return
    
    try {
      const { data, error } = await supabase
        .from('quiz_leaderboard')
        .select('*')
        .eq('department', student.department)
        .eq('year', student.year)
        .order('department_rank', { ascending: true })
        .limit(10)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  // Fetch real student stats
  const fetchStudentStats = async () => {
    if (!student) return

    try {
      // Get student's quiz attempts
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('marks_obtained, total_marks, quiz_id')
        .eq('student_id', student.id)

      const completedQuizzes = attempts?.length || 0
      const totalMarksObtained = attempts?.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) || 0
      const totalMaxMarks = attempts?.reduce((sum, a) => sum + (a.total_marks || 0), 0) || 0
      const avgScore = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0

      // Get rank from leaderboard view
      const { data: rankData } = await supabase
        .from('quiz_leaderboard')
        .select('department_rank')
        .eq('student_id', student.id)
        .single()

      // Get total students in same dept/year
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('department', student.department)
        .eq('year', student.year)

      setStudentStats({
        totalQuizzes: quizzes.length,
        completedQuizzes,
        averageScore: avgScore,
        rank: rankData?.department_rank || 0,
        totalStudents: count || 0,
        streakDays: 0
      })
    } catch (error) {
      console.error('Error fetching student stats:', error)
    }
  }

  useEffect(() => {
    if (student && quizzes.length > 0) {
      fetchLeaderboard()
      fetchStudentStats()
    }
  }, [student, quizzes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'missed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Always Available'
    
    // Parse the date and convert to local timezone for display
    const date = new Date(dateString)
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Center</h1>
          <p className="text-gray-600 mt-1">Test your knowledge and track progress</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{studentStats.rank}</div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{studentStats.averageScore}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Quizzes", value: studentStats.totalQuizzes.toString(), icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
          { title: "Completed", value: studentStats.completedQuizzes.toString(), icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
          { title: "Average Score", value: `${studentStats.averageScore}%`, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
          { title: "Class Rank", value: `#${studentStats.rank}`, icon: Trophy, color: "text-orange-600", bgColor: "bg-orange-50" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex space-x-1">
            {[
              { id: 'available', label: 'Available Quizzes', icon: Brain },
              { id: 'completed', label: 'Completed', icon: CheckCircle },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.filter(quiz => quiz.status !== 'completed').map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -2 }}
            >
              <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                        {quiz.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(quiz.status)}>
                          {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                        </Badge>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subject:</span>
                      <span className="font-medium">{quiz.subject}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Faculty:</span>
                      <span className="font-medium">{quiz.faculty}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {quiz.duration} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{quiz.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Marks:</span>
                      <span className="font-medium">{quiz.totalMarks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Attempts:</span>
                      <span className="font-medium">{quiz.attempts}/{quiz.maxAttempts}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Available:</span>
                      <span className="font-medium">{formatDate(quiz.startDate)} - {formatDate(quiz.endDate)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    {quiz.status === 'active' && quiz.attempts < quiz.maxAttempts ? (
                      <Link href={`/student-dashboard/quiz/take/${quiz.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
                        </Button>
                      </Link>
                    ) : quiz.status === 'upcoming' ? (
                      <Button disabled className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Starts {formatDate(quiz.startDate)}
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        No Attempts Left
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          {quizzes.filter(quiz => quiz.status === 'completed').map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                        <p className="text-gray-600">{quiz.subject} • {quiz.faculty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{quiz.bestScore}%</div>
                        <div className="text-sm text-gray-500">Your Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{quiz.averageScore}%</div>
                        <div className="text-sm text-gray-500">Class Avg</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{quiz.totalMarks}</div>
                        <div className="text-sm text-gray-500">Total Marks</div>
                      </div>
                      
                      <Link href={`/student-dashboard/quiz/results/${quiz.id}`}>
                        <Button variant="outline">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
              Class Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No quiz attempts yet. Be the first to complete a quiz!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.department_rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.department_rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.department_rank === 2 ? 'bg-gray-400 text-white' :
                        entry.department_rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.department_rank}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{entry.student_name}</h3>
                        <p className="text-sm text-gray-600">{entry.total_quizzes_completed || 0} quizzes completed</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{entry.average_score || 0}%</div>
                        <div className="text-sm text-gray-500">Average Score</div>
                      </div>
                      {entry.department_rank <= 3 && (
                        <Award className={`w-6 h-6 ${
                          entry.department_rank === 1 ? 'text-yellow-500' :
                          entry.department_rank === 2 ? 'text-gray-400' :
                          'text-orange-500'
                        }`} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StudentQuizDashboard