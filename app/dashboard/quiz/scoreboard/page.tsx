"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users,
  Clock,
  Target,
  Award,
  Download,
  Filter,
  Calendar,
  Eye,
  RefreshCw,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

const QuizScoreboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [faculty, setFaculty] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    fetchData()
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // Auto refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get faculty data
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (facultyData) {
        setFaculty(facultyData)
      }

      // Get all quizzes by this faculty
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('faculty_id', facultyData?.id)
        .order('created_at', { ascending: false })

      setQuizzes(quizzesData || [])

      // Get all attempts for these quizzes
      const quizIds = quizzesData?.map(q => q.id) || []
      if (quizIds.length > 0) {
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('*')
          .in('quiz_id', quizIds)

        setAttempts(attemptsData || [])
      }

      // Get all students
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')

      setStudents(studentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate real stats from data
  const overallStats = {
    totalQuizzes: quizzes.length,
    totalStudents: new Set(attempts.map(a => a.student_id)).size,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) / attempts.length)
      : 0,
    completionRate: attempts.length > 0 
      ? Math.round((attempts.filter(a => a.completed_at).length / attempts.length) * 100)
      : 0,
    topScore: attempts.length > 0 
      ? Math.max(...attempts.map(a => a.marks_obtained || 0))
      : 0,
    participationRate: students.length > 0 
      ? Math.round((new Set(attempts.map(a => a.student_id)).size / students.length) * 100)
      : 0
  }

  const quizPerformance = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(a => a.quiz_id === quiz.id)
    const scores = quizAttempts.map(a => a.marks_obtained || 0)
    
    return {
      id: quiz.id,
      title: quiz.title,
      participants: quizAttempts.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      completionRate: quizAttempts.length > 0 
        ? Math.round((quizAttempts.filter(a => a.completed_at).length / quizAttempts.length) * 100)
        : 0,
      difficulty: quiz.difficulty || 'medium',
      date: quiz.created_at
    }
  })

  const departmentStats = [
    { department: 'CSE', students: students.filter(s => s.department === 'cse').length, averageScore: 0, participation: 0 },
    { department: 'AIDS', students: students.filter(s => s.department === 'aids').length, averageScore: 0, participation: 0 },
    { department: 'AIML', students: students.filter(s => s.department === 'aiml').length, averageScore: 0, participation: 0 },
    { department: 'CYBER', students: students.filter(s => s.department === 'cyber').length, averageScore: 0, participation: 0 }
  ].map(dept => {
    const deptAttempts = attempts.filter(a => a.department === dept.department.toLowerCase())
    const deptStudents = students.filter(s => s.department === dept.department.toLowerCase())
    
    return {
      ...dept,
      students: deptStudents.length,
      averageScore: deptAttempts.length > 0 
        ? Math.round(deptAttempts.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) / deptAttempts.length)
        : 0,
      participation: deptStudents.length > 0 
        ? Math.round((new Set(deptAttempts.map(a => a.student_id)).size / deptStudents.length) * 100)
        : 0
    }
  })

  const timeAnalytics = {
    averageTimeSpent: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + (a.time_taken || 0), 0) / attempts.length / 60)
      : 0,
    fastestCompletion: attempts.length > 0 
      ? Math.round(Math.min(...attempts.map(a => a.time_taken || Infinity)) / 60)
      : 0,
    slowestCompletion: attempts.length > 0 
      ? Math.round(Math.max(...attempts.map(a => a.time_taken || 0)) / 60)
      : 0,
    timeEfficiency: 0
  }

  const difficultyAnalysis = [
    { level: 'Easy', count: quizzes.filter(q => q.difficulty === 'easy').length, averageScore: 0, color: 'bg-green-500' },
    { level: 'Medium', count: quizzes.filter(q => q.difficulty === 'medium').length, averageScore: 0, color: 'bg-yellow-500' },
    { level: 'Hard', count: quizzes.filter(q => q.difficulty === 'hard').length, averageScore: 0, color: 'bg-red-500' }
  ]

  // Calculate top performers from real data
  const topPerformers = attempts
    .filter(a => a.marks_obtained !== null && a.total_marks > 0)
    .map(a => ({
      name: a.student_name,
      score: Math.round((a.marks_obtained / a.total_marks) * 100),
      quiz: quizzes.find(q => q.id === a.quiz_id)?.title || ''
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const recentActivity = attempts.slice(0, 5).map(a => ({
    student: a.student_name,
    quiz: quizzes.find(q => q.id === a.quiz_id)?.title || 'Unknown',
    score: a.marks_obtained || 0,
    time: new Date(a.completed_at).toLocaleString()
  }))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Scoreboard
              </h1>
              <p className="mt-2 text-gray-600">
                Real-time analytics and performance insights
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button 
                variant="outline" 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 border-green-300' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalQuizzes}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Students</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{overallStats.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{overallStats.topScore}%</div>
              <div className="text-sm text-gray-600">Top Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overallStats.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{overallStats.participationRate}%</div>
              <div className="text-sm text-gray-600">Participation</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz</label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  {quizPerformance.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Main Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Live Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz Performance */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Quiz Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quizPerformance.map((quiz, index) => (
                        <div key={quiz.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                            <Badge className={getDifficultyColor(quiz.difficulty)}>
                              {quiz.difficulty}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Participants:</span>
                              <span className="font-medium ml-2">{quiz.participants}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Avg Score:</span>
                              <span className="font-medium ml-2">{quiz.averageScore}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Highest:</span>
                              <span className="font-medium ml-2">{quiz.highestScore}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Completion:</span>
                              <span className="font-medium ml-2">{quiz.completionRate}%</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Progress value={quiz.averageScore} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Department Statistics */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      Department Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departmentStats.map((dept, index) => (
                        <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-gray-900">{dept.department}</h3>
                            <p className="text-sm text-gray-600">{dept.students} students</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{dept.averageScore}%</div>
                            <div className="text-sm text-gray-500">{dept.participation}% participation</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difficulty Analysis */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-purple-600" />
                      Difficulty Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {difficultyAnalysis.map((level, index) => (
                        <div key={level.level} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{level.level}</span>
                            <span className="text-sm text-gray-600">{level.count} quizzes</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${level.color}`}
                                style={{ width: `${level.averageScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{level.averageScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Analytics */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-600" />
                      Time Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">Average Time</span>
                        <span className="font-semibold text-blue-600">{timeAnalytics.averageTimeSpent} min</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">Fastest Completion</span>
                        <span className="font-semibold text-green-600">{timeAnalytics.fastestCompletion} min</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-700">Slowest Completion</span>
                        <span className="font-semibold text-red-600">{timeAnalytics.slowestCompletion} min</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700">Time Efficiency</span>
                        <span className="font-semibold text-purple-600">{timeAnalytics.timeEfficiency}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Performance trend chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-600" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.length > 0 ? (
                        topPerformers.map((performer, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <span className="text-sm font-medium">{performer.name}</span>
                                {performer.quiz && (
                                  <p className="text-xs text-gray-500">{performer.quiz}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold text-green-600">{performer.score}%</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No quiz attempts yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{activity.student}</h3>
                          <p className="text-sm text-gray-600">Completed: {activity.quiz}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{activity.score}%</div>
                          <div className="text-sm text-gray-500">{activity.time}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default QuizScoreboard
