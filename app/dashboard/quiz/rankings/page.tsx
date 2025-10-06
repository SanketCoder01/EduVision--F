"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Users,
  BarChart3,
  Target,
  Clock,
  Star,
  Crown,
  Filter,
  Download,
  Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface StudentRanking {
  rank: number
  studentName: string
  studentId: string
  department: string
  year: string
  totalQuizzes: number
  averageScore: number
  totalScore: number
  maxScore: number
  trend: 'up' | 'down' | 'stable'
  badges: string[]
  lastActive: string
}

const QuizRankings = () => {
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  const quizzes = [
    { id: 'all', title: 'All Quizzes' },
    { id: '1', title: 'Data Structures Fundamentals' },
    { id: '2', title: 'Algorithm Analysis' },
    { id: '3', title: 'Database Systems' }
  ]

  const departments = ['All Departments', 'CSE', 'AIDS', 'AIML', 'CYBER']
  const years = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year']

  const rankings: StudentRanking[] = [
    {
      rank: 1,
      studentName: 'Arjun Patel',
      studentId: 'CSE001',
      department: 'CSE',
      year: '3rd Year',
      totalQuizzes: 12,
      averageScore: 92.5,
      totalScore: 1110,
      maxScore: 1200,
      trend: 'up',
      badges: ['Top Performer', 'Consistent', 'Speed Master'],
      lastActive: '2024-01-20'
    },
    {
      rank: 2,
      studentName: 'Priya Singh',
      studentId: 'CSE002',
      department: 'CSE',
      year: '3rd Year',
      totalQuizzes: 11,
      averageScore: 89.2,
      totalScore: 981,
      maxScore: 1100,
      trend: 'up',
      badges: ['Rising Star', 'Analytical'],
      lastActive: '2024-01-19'
    },
    {
      rank: 3,
      studentName: 'Rahul Kumar',
      studentId: 'CSE003',
      department: 'CSE',
      year: '3rd Year',
      totalQuizzes: 10,
      averageScore: 87.8,
      totalScore: 878,
      maxScore: 1000,
      trend: 'stable',
      badges: ['Steady Performer'],
      lastActive: '2024-01-18'
    },
    {
      rank: 4,
      studentName: 'Sneha Sharma',
      studentId: 'AIDS001',
      department: 'AIDS',
      year: '3rd Year',
      totalQuizzes: 9,
      averageScore: 85.6,
      totalScore: 770,
      maxScore: 900,
      trend: 'up',
      badges: ['Improving'],
      lastActive: '2024-01-17'
    },
    {
      rank: 5,
      studentName: 'Vikram Joshi',
      studentId: 'CSE004',
      department: 'CSE',
      year: '3rd Year',
      totalQuizzes: 8,
      averageScore: 83.4,
      totalScore: 667,
      maxScore: 800,
      trend: 'down',
      badges: ['Needs Focus'],
      lastActive: '2024-01-16'
    }
  ]

  const overallStats = {
    totalStudents: 156,
    activeStudents: 142,
    averageScore: 78.5,
    topScore: 92.5,
    completionRate: 91.0
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Award className="w-6 h-6 text-orange-500" />
      default: return <Trophy className="w-6 h-6 text-blue-500" />
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Performer': return 'bg-yellow-100 text-yellow-800'
      case 'Rising Star': return 'bg-purple-100 text-purple-800'
      case 'Consistent': return 'bg-green-100 text-green-800'
      case 'Speed Master': return 'bg-blue-100 text-blue-800'
      case 'Analytical': return 'bg-indigo-100 text-indigo-800'
      case 'Steady Performer': return 'bg-gray-100 text-gray-800'
      case 'Improving': return 'bg-emerald-100 text-emerald-800'
      case 'Needs Focus': return 'bg-red-100 text-red-800'
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
                Quiz Rankings
              </h1>
              <p className="mt-2 text-gray-600">
                Student performance rankings and leaderboards
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Rankings
              </Button>
              <Link href="/dashboard/quiz/analytics">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Detailed Analytics
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.activeStudents}</div>
              <div className="text-sm text-gray-600">Active</div>
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
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz</label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept.toLowerCase().replace(' ', '_')}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toLowerCase().replace(' ', '_')}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankings.slice(0, 3).map((student, index) => (
              <motion.div
                key={student.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative ${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
              >
                <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  student.rank === 1 ? 'ring-2 ring-yellow-400' : ''
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${
                        student.rank === 1 ? 'from-yellow-400 to-yellow-600' :
                        student.rank === 2 ? 'from-gray-300 to-gray-500' :
                        'from-orange-400 to-orange-600'
                      } flex items-center justify-center`}>
                        {getRankIcon(student.rank)}
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        student.rank === 1 ? 'bg-yellow-500' :
                        student.rank === 2 ? 'bg-gray-400' :
                        'bg-orange-500'
                      }`}>
                        {student.rank}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{student.studentName}</h3>
                    <p className="text-sm text-gray-600 mb-3">{student.studentId} • {student.department}</p>
                    
                    <div className="text-3xl font-bold text-blue-600 mb-2">{student.averageScore}%</div>
                    <div className="text-sm text-gray-500 mb-4">Average Score</div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quizzes:</span>
                        <span className="font-medium">{student.totalQuizzes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Score:</span>
                        <span className="font-medium">{student.totalScore}/{student.maxScore}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Progress value={(student.totalScore / student.maxScore) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-4">
                      {student.badges.slice(0, 2).map((badge, badgeIndex) => (
                        <Badge key={badgeIndex} className={`text-xs ${getBadgeColor(badge)}`}>
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                Complete Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                      student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          student.rank === 1 ? 'bg-yellow-500' :
                          student.rank === 2 ? 'bg-gray-400' :
                          student.rank === 3 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          {student.rank}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                          <p className="text-sm text-gray-600">{student.studentId} • {student.department} • {student.year}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getTrendIcon(student.trend)}
                            <span className="text-xs text-gray-500">Last active: {student.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{student.averageScore}%</div>
                          <div className="text-sm text-gray-500">Avg Score</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{student.totalQuizzes}</div>
                          <div className="text-sm text-gray-500">Quizzes</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{student.totalScore}</div>
                          <div className="text-sm text-gray-500">Total Score</div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {student.badges.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} className={`text-xs ${getBadgeColor(badge)}`}>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default QuizRankings
