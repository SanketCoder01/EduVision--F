"use client"

import React, { useState } from "react"
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
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

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

  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Data Structures Fundamentals',
      subject: 'Data Structures',
      faculty: 'Dr. Amruta Pankade',
      duration: 60,
      totalQuestions: 25,
      totalMarks: 50,
      difficulty: 'medium',
      startDate: '2024-01-20T09:00:00',
      endDate: '2024-01-20T18:00:00',
      status: 'active',
      attempts: 0,
      maxAttempts: 2,
      description: 'Test your knowledge on arrays, linked lists, stacks, and queues'
    },
    {
      id: '2',
      title: 'Algorithm Analysis',
      subject: 'Algorithms',
      faculty: 'Prof. Rajesh Kumar',
      duration: 45,
      totalQuestions: 20,
      totalMarks: 40,
      difficulty: 'hard',
      startDate: '2024-01-22T10:00:00',
      endDate: '2024-01-22T16:00:00',
      status: 'upcoming',
      attempts: 0,
      maxAttempts: 1,
      description: 'Time complexity, space complexity, and algorithm optimization'
    },
    {
      id: '3',
      title: 'Database Basics',
      subject: 'Database Systems',
      faculty: 'Dr. Priya Sharma',
      duration: 30,
      totalQuestions: 15,
      totalMarks: 30,
      difficulty: 'easy',
      startDate: '2024-01-15T14:00:00',
      endDate: '2024-01-15T17:00:00',
      status: 'completed',
      attempts: 1,
      maxAttempts: 1,
      bestScore: 85,
      averageScore: 72,
      description: 'SQL queries, normalization, and ER diagrams'
    }
  ]

  const studentStats = {
    totalQuizzes: 15,
    completedQuizzes: 8,
    averageScore: 78.5,
    rank: 12,
    totalStudents: 156,
    streakDays: 5
  }

  const leaderboard = [
    { rank: 1, name: 'Arjun Patel', score: 92.5, quizzes: 12 },
    { rank: 2, name: 'Priya Singh', score: 89.2, quizzes: 11 },
    { rank: 3, name: 'Rahul Kumar', score: 87.8, quizzes: 10 },
    { rank: 4, name: 'Sneha Sharma', score: 85.6, quizzes: 9 },
    { rank: 5, name: 'Vikram Joshi', score: 83.4, quizzes: 8 }
  ]

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <div className="space-y-4">
              {leaderboard.map((student, index) => (
                <motion.div
                  key={student.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      student.rank === 1 ? 'bg-yellow-500 text-white' :
                      student.rank === 2 ? 'bg-gray-400 text-white' :
                      student.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {student.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.quizzes} quizzes completed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{student.score}%</div>
                      <div className="text-sm text-gray-500">Average Score</div>
                    </div>
                    {student.rank <= 3 && (
                      <Award className={`w-6 h-6 ${
                        student.rank === 1 ? 'text-yellow-500' :
                        student.rank === 2 ? 'text-gray-400' :
                        'text-orange-500'
                      }`} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StudentQuizDashboard