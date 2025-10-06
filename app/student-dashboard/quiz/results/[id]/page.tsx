"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  TrendingUp,
  Award,
  Users,
  Brain,
  Download,
  Share2,
  ArrowLeft,
  Star,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useParams } from "next/navigation"

const QuizResults = () => {
  const params = useParams()
  
  const quizResult = {
    id: params.id,
    title: "Data Structures Fundamentals",
    subject: "Data Structures",
    faculty: "Dr. Amruta Pankade",
    completedAt: "2024-01-20T15:30:00",
    duration: 45, // minutes taken
    totalDuration: 60, // total allowed
    score: 42,
    totalMarks: 50,
    percentage: 84,
    rank: 8,
    totalStudents: 45,
    passPercentage: 60,
    status: "passed"
  }

  const questionResults = [
    {
      id: 1,
      question: "What is the time complexity of binary search in a sorted array?",
      type: "mcq",
      yourAnswer: "O(log n)",
      correctAnswer: "O(log n)",
      isCorrect: true,
      points: 2,
      maxPoints: 2,
      explanation: "Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity."
    },
    {
      id: 2,
      question: "A stack follows LIFO (Last In First Out) principle.",
      type: "true_false",
      yourAnswer: "True",
      correctAnswer: "True",
      isCorrect: true,
      points: 1,
      maxPoints: 1,
      explanation: "Stack is a LIFO data structure where the last element inserted is the first one to be removed."
    },
    {
      id: 3,
      question: "The worst-case time complexity of quicksort is _____.",
      type: "fill_blank",
      yourAnswer: "O(n²)",
      correctAnswer: "O(n²)",
      isCorrect: true,
      points: 2,
      maxPoints: 2,
      explanation: "Quicksort's worst case occurs when the pivot is always the smallest or largest element."
    },
    {
      id: 4,
      question: "Explain the difference between BFS and DFS traversal algorithms.",
      type: "descriptive",
      yourAnswer: "BFS explores level by level while DFS goes deep first",
      correctAnswer: "BFS explores nodes level by level using a queue, while DFS explores as far as possible along each branch using a stack or recursion.",
      isCorrect: false,
      points: 2,
      maxPoints: 5,
      explanation: "Your answer covers the basic concept but lacks detail about implementation and data structures used."
    },
    {
      id: 5,
      question: "Which data structure is used to implement recursion?",
      type: "mcq",
      yourAnswer: "Stack",
      correctAnswer: "Stack",
      isCorrect: true,
      points: 2,
      maxPoints: 2,
      explanation: "Recursion uses the call stack to store function calls and their local variables."
    }
  ]

  const analytics = {
    timeSpent: {
      total: 45,
      perQuestion: 9,
      efficient: true
    },
    accuracy: {
      overall: 84,
      byType: {
        mcq: 100,
        true_false: 100,
        fill_blank: 100,
        descriptive: 40
      }
    },
    strengths: ["Multiple Choice Questions", "True/False Questions", "Time Management"],
    weaknesses: ["Descriptive Answers", "Detailed Explanations"],
    recommendations: [
      "Practice writing detailed explanations for descriptive questions",
      "Focus on algorithm implementation details",
      "Review graph traversal concepts"
    ]
  }

  const classStats = {
    averageScore: 38.5,
    highestScore: 48,
    lowestScore: 22,
    passRate: 78,
    distribution: [
      { range: "90-100%", count: 3 },
      { range: "80-89%", count: 12 },
      { range: "70-79%", count: 15 },
      { range: "60-69%", count: 10 },
      { range: "Below 60%", count: 5 }
    ]
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    return "F"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/student-dashboard/quiz">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Quiz Results
                </h1>
                <p className="text-gray-600">{quizResult.title}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${getGradeColor(quizResult.percentage)}`}>
                {quizResult.percentage}%
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {getGradeLetter(quizResult.percentage)} Grade
              </div>
              <div className="text-sm text-gray-500">
                {quizResult.score}/{quizResult.totalMarks} marks
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                #{quizResult.rank}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                Class Rank
              </div>
              <div className="text-sm text-gray-500">
                out of {quizResult.totalStudents} students
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {quizResult.duration}m
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                Time Taken
              </div>
              <div className="text-sm text-gray-500">
                of {quizResult.totalDuration}m allowed
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${quizResult.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                {quizResult.status === 'passed' ? <CheckCircle className="w-10 h-10 mx-auto" /> : <XCircle className="w-10 h-10 mx-auto" />}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {quizResult.status === 'passed' ? 'Passed' : 'Failed'}
              </div>
              <div className="text-sm text-gray-500">
                Required: {quizResult.passPercentage}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="questions">Question Review</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
              <TabsTrigger value="comparison">Class Comparison</TabsTrigger>
              <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Question-wise Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {questionResults.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 border-2 rounded-lg ${
                          question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                              <Badge className={question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {question.points}/{question.maxPoints} points
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Q{question.id}. {question.question}
                            </h3>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {question.isCorrect ? 
                              <CheckCircle className="w-5 h-5 text-white" /> : 
                              <XCircle className="w-5 h-5 text-white" />
                            }
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Your Answer:</div>
                            <div className={`p-3 rounded-lg ${question.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                              {question.yourAnswer}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</div>
                            <div className="p-3 bg-green-100 rounded-lg">
                              {question.correctAnswer}
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                          <div className="text-sm text-blue-700">{question.explanation}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      Accuracy by Question Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.accuracy.byType).map(([type, accuracy]) => (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <span className="font-medium">{accuracy}%</span>
                          </div>
                          <Progress value={accuracy} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-600" />
                      Time Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Time Used</span>
                        <span className="font-semibold">{analytics.timeSpent.total} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average per Question</span>
                        <span className="font-semibold">{analytics.timeSpent.perQuestion} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Time Efficiency</span>
                        <Badge className={analytics.timeSpent.efficient ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {analytics.timeSpent.efficient ? 'Efficient' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-red-600" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Class Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Your Score</span>
                        <span className="font-semibold text-emerald-600">{quizResult.percentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Class Average</span>
                        <span className="font-semibold">{classStats.averageScore}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Highest Score</span>
                        <span className="font-semibold">{classStats.highestScore}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pass Rate</span>
                        <span className="font-semibold">{classStats.passRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {classStats.distribution.map((range, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{range.range}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(range.count / quizResult.totalStudents) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{range.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="feedback">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Powered Personalized Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Performance Summary
                      </h3>
                      <p className="text-blue-800">
                        Great job on this quiz! You scored {quizResult.percentage}% which is above the class average of {classStats.averageScore}%. 
                        Your time management was excellent, completing the quiz in {quizResult.duration} minutes. 
                        You showed strong understanding of basic concepts but need to work on providing detailed explanations.
                      </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Recommendations for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {analytics.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-green-800">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Study Resources
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-2">Recommended Topics:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Graph Traversal Algorithms</li>
                            <li>• Algorithm Analysis Techniques</li>
                            <li>• Data Structure Implementation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-2">Practice Areas:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Descriptive Question Writing</li>
                            <li>• Algorithm Explanation</li>
                            <li>• Code Complexity Analysis</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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

export default QuizResults
