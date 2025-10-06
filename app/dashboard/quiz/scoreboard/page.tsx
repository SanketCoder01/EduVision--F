"use client"

import React, { useState } from "react"
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
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const QuizScoreboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const overallStats = {
    totalQuizzes: 15,
    totalStudents: 156,
    averageScore: 78.5,
    completionRate: 91.2,
    topScore: 95.8,
    participationRate: 94.2
  }

  const quizPerformance = [
    {
      id: '1',
      title: 'Data Structures Fundamentals',
      participants: 45,
      averageScore: 84.2,
      highestScore: 95,
      lowestScore: 62,
      completionRate: 95.7,
      difficulty: 'medium',
      date: '2024-01-20'
    },
    {
      id: '2',
      title: 'Algorithm Analysis',
      participants: 38,
      averageScore: 76.8,
      highestScore: 92,
      lowestScore: 45,
      completionRate: 84.4,
      difficulty: 'hard',
      date: '2024-01-18'
    },
    {
      id: '3',
      title: 'Database Systems',
      participants: 52,
      averageScore: 81.5,
      highestScore: 98,
      lowestScore: 58,
      completionRate: 98.1,
      difficulty: 'easy',
      date: '2024-01-15'
    }
  ]

  const departmentStats = [
    { department: 'CSE', students: 65, averageScore: 82.3, participation: 96.9 },
    { department: 'AIDS', students: 42, averageScore: 79.1, participation: 92.8 },
    { department: 'AIML', students: 38, averageScore: 85.7, participation: 97.4 },
    { department: 'CYBER', students: 11, averageScore: 77.8, participation: 90.9 }
  ]

  const timeAnalytics = {
    averageTimeSpent: 42,
    fastestCompletion: 28,
    slowestCompletion: 58,
    timeEfficiency: 78.5
  }

  const difficultyAnalysis = [
    { level: 'Easy', count: 5, averageScore: 87.2, color: 'bg-green-500' },
    { level: 'Medium', count: 7, averageScore: 76.8, color: 'bg-yellow-500' },
    { level: 'Hard', count: 3, averageScore: 68.4, color: 'bg-red-500' }
  ]

  const recentActivity = [
    { student: 'Arjun Patel', quiz: 'Data Structures', score: 92, time: '2 hours ago' },
    { student: 'Priya Singh', quiz: 'Algorithms', score: 88, time: '3 hours ago' },
    { student: 'Rahul Kumar', quiz: 'Database', score: 85, time: '5 hours ago' },
    { student: 'Sneha Sharma', quiz: 'Data Structures', score: 79, time: '6 hours ago' }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                      {['Arjun Patel', 'Priya Singh', 'Rahul Kumar', 'Sneha Sharma', 'Vikram Joshi'].map((name, index) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{95 - index * 2}%</span>
                        </div>
                      ))}
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
