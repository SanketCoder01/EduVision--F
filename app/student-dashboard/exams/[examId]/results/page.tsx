"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Trophy,
  Clock,
  Code,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  BarChart3,
  Target,
  Zap
} from "lucide-react"

interface ExamSubmission {
  examId: string
  studentId: string
  code: string
  language: string
  submittedAt: string
  timeSpent: number
  violations: Array<{
    type: string
    timestamp: Date
    description: string
  }>
  tabSwitches: number
  isAutoSubmitted: boolean
  grade?: number
  feedback?: string
  testCases?: Array<{
    input: string
    expectedOutput: string
    actualOutput: string
    passed: boolean
  }>
}

interface ExamData {
  id: string
  title: string
  facultyName: string
  totalMarks: string
  passingMarks: string
  duration: string
  language: string
}

export default function ExamResultsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.examId as string

  const [submission, setSubmission] = useState<ExamSubmission | null>(null)
  const [exam, setExam] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExamResults()
  }, [examId])

  const loadExamResults = () => {
    try {
      // Load exam data
      const storedExams = JSON.parse(localStorage.getItem("coding_exams") || "[]")
      const examData = storedExams.find((e: any) => e.id === examId)
      
      if (!examData) {
        router.push('/student-dashboard/exams')
        return
      }
      setExam(examData)

      // Load submission data
      const submissions = JSON.parse(localStorage.getItem("exam_submissions") || "[]")
      let userSubmission = submissions.find((s: ExamSubmission) => s.examId === examId)
      
      if (!userSubmission) {
        // Create mock submission for demo
        userSubmission = {
          examId,
          studentId: "current_student",
          code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Enter a number: ";
    cin >> n;
    
    if (n % 2 == 0) {
        cout << n << " is even" << endl;
    } else {
        cout << n << " is odd" << endl;
    }
    
    return 0;
}`,
          language: "cpp",
          submittedAt: new Date().toISOString(),
          timeSpent: 3600, // 1 hour
          violations: [
            {
              type: "tab_switch",
              timestamp: new Date(Date.now() - 1800000), // 30 min ago
              description: "Student switched tabs"
            }
          ],
          tabSwitches: 1,
          isAutoSubmitted: false,
          grade: 85,
          feedback: "Good solution! Your code correctly identifies even and odd numbers. Consider adding input validation for better robustness.",
          testCases: [
            {
              input: "4",
              expectedOutput: "4 is even",
              actualOutput: "4 is even",
              passed: true
            },
            {
              input: "7",
              expectedOutput: "7 is odd",
              actualOutput: "7 is odd",
              passed: true
            },
            {
              input: "0",
              expectedOutput: "0 is even",
              actualOutput: "0 is even",
              passed: true
            }
          ]
        }
      }
      
      setSubmission(userSubmission)
    } catch (error) {
      console.error('Error loading exam results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getGradeColor = (grade: number, totalMarks: number) => {
    const percentage = (grade / totalMarks) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeBadgeVariant = (grade: number, totalMarks: number) => {
    const percentage = (grade / totalMarks) * 100
    if (percentage >= 75) return 'default'
    if (percentage >= 60) return 'secondary'
    return 'destructive'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!exam || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
            <p className="text-gray-600 mb-4">Could not load exam results.</p>
            <Button onClick={() => router.push('/student-dashboard/exams')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalMarks = parseInt(exam.totalMarks)
  const passingMarks = parseInt(exam.passingMarks)
  const grade = submission.grade || 0
  const percentage = (grade / totalMarks) * 100
  const passed = grade >= passingMarks

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/student-dashboard/exams')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exams
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Results: {exam.title}
          </h1>
          <p className="text-gray-600">
            Faculty: {exam.facultyName}
          </p>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${passed ? 'ring-2 ring-green-200' : 'ring-2 ring-red-200'}`}>
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {passed ? (
                  <Trophy className={`w-6 h-6 ${passed ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">Final Grade</p>
              <p className={`text-2xl font-bold ${getGradeColor(grade, totalMarks)}`}>
                {grade}/{totalMarks}
              </p>
              <Badge variant={getGradeBadgeVariant(grade, totalMarks)} className="mt-2">
                {percentage.toFixed(1)}% - {passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Time Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(submission.timeSpent)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of {exam.duration} minutes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Language</p>
              <p className="text-2xl font-bold text-purple-600">
                {submission.language.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {submission.code.split('\n').length} lines
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${submission.violations.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${submission.violations.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Violations</p>
              <p className={`text-2xl font-bold ${submission.violations.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {submission.violations.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {submission.tabSwitches} tab switches
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="testcases">Test Cases</TabsTrigger>
              <TabsTrigger value="violations">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Score</span>
                        <span className="text-sm text-gray-600">{grade}/{totalMarks}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 75 ? 'bg-green-600' : 
                            percentage >= 60 ? 'bg-blue-600' : 
                            percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Faculty Feedback</span>
                        </div>
                        <p className="text-sm text-blue-800">{submission.feedback}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Submission Time</p>
                        <p className="font-medium">{new Date(submission.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Submission Type</p>
                        <p className="font-medium">{submission.isAutoSubmitted ? 'Auto-submitted' : 'Manual'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Submitted Code
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                      {submission.code}
                    </pre>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <span>Language: {submission.language.toUpperCase()}</span>
                    <span>Lines: {submission.code.split('\n').length}</span>
                    <span>Characters: {submission.code.length}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testcases" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Test Cases Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.testCases ? (
                    <div className="space-y-4">
                      {submission.testCases.map((testCase, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${testCase.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Test Case {index + 1}</h4>
                            <Badge variant={testCase.passed ? 'default' : 'destructive'}>
                              {testCase.passed ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {testCase.passed ? 'PASSED' : 'FAILED'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-600 mb-1">Input:</p>
                              <code className="bg-gray-100 p-2 rounded block">{testCase.input}</code>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600 mb-1">Expected:</p>
                              <code className="bg-gray-100 p-2 rounded block">{testCase.expectedOutput}</code>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600 mb-1">Your Output:</p>
                              <code className={`p-2 rounded block ${testCase.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                {testCase.actualOutput}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No test cases available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="violations" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Security Monitoring Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.violations.length > 0 ? (
                    <div className="space-y-3">
                      {submission.violations.map((violation, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-red-800">{violation.description}</span>
                            <Badge variant="destructive" className="text-xs">
                              {violation.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-red-600">
                            {new Date(violation.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Clean Exam</h3>
                      <p className="text-green-600">No security violations detected during the exam.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
