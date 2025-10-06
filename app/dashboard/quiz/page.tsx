"use client"

import React from "react"
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
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const QuizDashboard = () => {
  const quizStats = {
    totalQuizzes: 12,
    activeQuizzes: 5,
    completedQuizzes: 7,
    totalStudents: 156,
    avgScore: 78.5,
    topScore: 95
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
      features: ["AI Question Generator", "Question Bank", "Timer Settings", "Randomization"]
    },
    {
      title: "Submissions",
      description: "Review student submissions, auto-grading for objective questions & manual grading",
      icon: FileText,
      href: "/dashboard/quiz/submissions",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      features: ["Auto Grading", "Manual Review", "Plagiarism Check", "Detailed Reports"]
    },
    {
      title: "Rankings",
      description: "View student rankings, performance analytics and detailed score breakdowns",
      icon: Trophy,
      href: "/dashboard/quiz/rankings",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      features: ["Leaderboards", "Performance Trends", "Class Analytics", "Individual Reports"]
    },
    {
      title: "Scoreboard",
      description: "Real-time scoreboard, analytics dashboard with comprehensive insights",
      icon: BarChart3,
      href: "/dashboard/quiz/scoreboard",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      features: ["Real-time Updates", "Visual Analytics", "Export Reports", "Comparison Tools"]
    }
  ]

  const quickActions = [
    {
      title: "Question Bank",
      description: "Manage your question library",
      icon: Brain,
      href: "/dashboard/quiz/question-bank",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "AI Proctoring",
      description: "Monitor quiz sessions",
      icon: Zap,
      href: "/dashboard/quiz/proctoring",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Analytics",
      description: "Detailed performance insights",
      icon: Target,
      href: "/dashboard/quiz/analytics",
      color: "from-teal-500 to-teal-600"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-1">Create and manage comprehensive assessments</p>
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
          { title: "Total Quizzes", value: quizStats.totalQuizzes.toString(), icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
          { title: "Active Quizzes", value: quizStats.activeQuizzes.toString(), icon: Clock, color: "text-green-600", bgColor: "bg-green-50" },
          { title: "Completed", value: quizStats.completedQuizzes.toString(), icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-50" },
          { title: "Avg Score", value: `${quizStats.avgScore}%`, icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" }
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
                      <div className="text-xl font-bold text-gray-900">
                        {feature.title === 'Create Quiz' ? '12' : 
                         feature.title === 'Submissions' ? '45' :
                         feature.title === 'Rankings' ? '156' : '8'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {feature.title === 'Create Quiz' ? 'Drafts' : 
                         feature.title === 'Submissions' ? 'Pending' :
                         feature.title === 'Rankings' ? 'Students' : 'Reports'}
                      </div>
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
          <div className="space-y-4">
            {[
              { title: "Data Structures Quiz", students: 45, status: "Active", time: "2 hours ago", icon: Brain },
              { title: "Algorithm Analysis", students: 38, status: "Completed", time: "1 day ago", icon: Trophy },
              { title: "Database Systems", students: 52, status: "Draft", time: "3 days ago", icon: FileText }
            ].map((quiz, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <quiz.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.students} students • {quiz.time}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    quiz.status === 'Active' ? 'bg-green-100 text-green-800' :
                    quiz.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {quiz.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizDashboard
