"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  FileText, 
  Trophy, 
  BarChart3, 
  Users, 
  Clock, 
  Target,
  Brain,
  Zap,
  Award,
  CheckCircle,
  TrendingUp,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  Eye,
  Radio
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Quiz {
  id: string
  title: string
  subject: string
  department: string
  is_published: boolean
  start_time: string
  end_time: string
  total_marks: number
  created_at: string
  faculty_name: string
  target_years: string[]
}

interface QuizStats {
  totalQuizzes: number
  activeQuizzes: number
  completedQuizzes: number
  draftQuizzes: number
  totalStudents: number
  avgScore: number
  pendingSubmissions: number
}

const QuizDashboard = () => {
  const router = useRouter()
  const [faculty, setFaculty] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    draftQuizzes: 0,
    totalStudents: 0,
    avgScore: 0,
    pendingSubmissions: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFacultyData()
  }, [])

  useEffect(() => {
    if (faculty) {
      fetchQuizData()
    }
  }, [faculty])

  const fetchFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?type=faculty')
        return
      }

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (facultyData) {
        setFaculty(facultyData)
      } else {
        // Not a faculty, redirect to student
        router.push('/student-dashboard')
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuizData = async () => {
    if (!faculty) return

    try {
      // Fetch quizzes created by this faculty
      const { data: quizzesData, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('faculty_id', faculty.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setQuizzes(quizzesData || [])

      // Calculate stats
      const now = new Date()
      const activeQuizzes = (quizzesData || []).filter(q => {
        const start = new Date(q.start_time)
        const end = new Date(q.end_time)
        return q.is_published && now >= start && now <= end
      })
      
      const completedQuizzes = (quizzesData || []).filter(q => {
        const end = new Date(q.end_time)
        return q.is_published && now > end
      })

      const draftQuizzes = (quizzesData || []).filter(q => !q.is_published)

      // Get total students who attempted
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('student_id, marks_obtained, total_marks')
        .in('quiz_id', (quizzesData || []).map(q => q.id))

      const uniqueStudents = new Set((attempts || []).map(a => a.student_id)).size
      
      const avgScore = attempts && attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + ((a.marks_obtained / a.total_marks) * 100), 0) / attempts.length)
        : 0

      // Get pending submissions (quiz attempts without marks)
      const pendingSubmissions = (attempts || []).filter(a => a.marks_obtained === null).length

      setStats({
        totalQuizzes: quizzesData?.length || 0,
        activeQuizzes: activeQuizzes.length,
        completedQuizzes: completedQuizzes.length,
        draftQuizzes: draftQuizzes.length,
        totalStudents: uniqueStudents,
        avgScore,
        pendingSubmissions
      })
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    }
  }

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete quiz questions first (cascade should handle this, but be safe)
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId)

      // Delete quiz attempts
      await supabase
        .from('quiz_attempts')
        .delete()
        .eq('quiz_id', quizId)

      // Delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) throw error

      toast({
        title: "Quiz Deleted",
        description: `"${quizTitle}" has been deleted successfully.`,
      })

      // Refresh quiz list
      fetchQuizData()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast({
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date()
    const start = new Date(quiz.start_time)
    const end = new Date(quiz.end_time)
    
    if (!quiz.is_published) return 'Draft'
    if (now < start) return 'Scheduled'
    if (now >= start && now <= end) return 'Active'
    return 'Completed'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-blue-100 text-blue-800'
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const mainFeatures = [
    {
      title: "Create Quiz",
      description: "Design comprehensive quizzes with MCQ, True/False, Fill blanks & Descriptive questions",
      icon: Plus,
      href: "/dashboard/quiz/create",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      features: ["AI Question Generator", "Question Bank", "Timer Settings", "Randomization"],
      count: stats.draftQuizzes,
      countLabel: "Drafts"
    },
    {
      title: "Submissions",
      description: "Review student submissions, auto-grading for objective questions & manual grading",
      icon: FileText,
      href: "/dashboard/quiz/submissions",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      features: ["Auto Grading", "Manual Review", "Plagiarism Check", "Detailed Reports"],
      count: stats.pendingSubmissions,
      countLabel: "Pending"
    },
    {
      title: "Rankings",
      description: "View student rankings, performance analytics and detailed score breakdowns",
      icon: Trophy,
      href: "/dashboard/quiz/rankings",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      features: ["Leaderboards", "Performance Trends", "Class Analytics", "Individual Reports"],
      count: stats.totalStudents,
      countLabel: "Students"
    },
    {
      title: "Scoreboard",
      description: "Real-time scoreboard, analytics dashboard with comprehensive insights",
      icon: BarChart3,
      href: "/dashboard/quiz/scoreboard",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      features: ["Real-time Updates", "Visual Analytics", "Export Reports", "Comparison Tools"],
      count: stats.completedQuizzes,
      countLabel: "Reports"
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-1">Welcome, {faculty?.name || 'Faculty'}</p>
        </div>
        <Link href="/dashboard/quiz/create">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Quizzes", value: stats.totalQuizzes, icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
          { title: "Active Quizzes", value: stats.activeQuizzes, icon: Clock, color: "text-green-600", bgColor: "bg-green-50" },
          { title: "Completed", value: stats.completedQuizzes, icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-50" },
          { title: "Avg Score", value: `${stats.avgScore}%`, icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" }
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -2 }}
          >
            <Link href={feature.href}>
              <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{feature.count}</div>
                      <div className="text-xs text-gray-500">{feature.countLabel}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-1 mb-4">
                    {feature.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {feat}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Access →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Recent Quiz Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No quizzes yet. Create your first quiz!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.slice(0, 5).map((quiz, index) => {
                const status = getQuizStatus(quiz)
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600">
                          {quiz.target_years?.join(', ') || 'All years'} • {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/quiz/monitor/${quiz.id}`} className="flex items-center">
                              <Radio className="w-4 h-4 mr-2" />
                              Monitor Quiz
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/quiz/edit/${quiz.id}`} className="flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Quiz
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/quiz/submissions?quizId=${quiz.id}`} className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View Submissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizDashboard
