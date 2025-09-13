"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Award,
  TrendingUp,
  Clock,
  Code,
  Target,
  Calendar,
  Download,
  Eye,
  Star,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function StudentScorecardPage() {
  const { toast } = useToast()
  const [studentData, setStudentData] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    const loadStudentData = () => {
      // Load student submissions
      const storedSubmissions = JSON.parse(localStorage.getItem("coding_submissions") || "[]")
      
      // Add sample data if none exists
      if (storedSubmissions.length === 0) {
        const sampleSubmissions = [
          {
            id: "sub_001",
            assignmentId: "assignment-1",
            assignmentTitle: "Data Structures Implementation",
            code: "class BST { /* implementation */ }",
            language: "cpp",
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            grade: 85,
            aiEvaluation: { score: 85, feedback: ["Good implementation", "Missing edge cases"] },
            timeSpent: 45,
            status: "graded"
          },
          {
            id: "sub_002",
            assignmentId: "assignment-2",
            assignmentTitle: "Algorithm Optimization",
            code: "def quicksort(arr): /* implementation */",
            language: "python",
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            grade: 92,
            aiEvaluation: { score: 92, feedback: ["Excellent optimization", "Clean code"] },
            timeSpent: 60,
            status: "graded"
          },
          {
            id: "sub_003",
            assignmentId: "assignment-3",
            assignmentTitle: "Web API Development",
            code: "app.get('/api/users', (req, res) => { /* implementation */ })",
            language: "javascript",
            submittedAt: new Date(Date.now() - 259200000).toISOString(),
            grade: 78,
            aiEvaluation: { score: 78, feedback: ["Good structure", "Needs error handling"] },
            timeSpent: 90,
            status: "graded"
          }
        ]
        localStorage.setItem("coding_submissions", JSON.stringify(sampleSubmissions))
        setSubmissions(sampleSubmissions)
      } else {
        setSubmissions(storedSubmissions)
      }

      // Load assignments
      const storedAssignments = JSON.parse(localStorage.getItem("coding_assignments") || "[]")
      setAssignments(storedAssignments)

      // Calculate student performance data
      const totalSubmissions = storedSubmissions.length || sampleSubmissions.length
      const gradedSubmissions = (storedSubmissions.length > 0 ? storedSubmissions : sampleSubmissions).filter((s: any) => s.status === "graded")
      const averageGrade = gradedSubmissions.length > 0 
        ? Math.round(gradedSubmissions.reduce((sum: number, sub: any) => sum + (sub.grade || 0), 0) / gradedSubmissions.length)
        : 0
      const totalTimeSpent = gradedSubmissions.reduce((sum: number, sub: any) => sum + (sub.timeSpent || 0), 0)

      setStudentData({
        name: "Current Student",
        id: "student_123",
        totalSubmissions,
        gradedSubmissions: gradedSubmissions.length,
        averageGrade,
        totalTimeSpent,
        strongestLanguage: "C++",
        improvementAreas: ["Error Handling", "Code Documentation"],
        achievements: ["First Submission", "High Scorer", "Consistent Performer"]
      })
    }

    loadStudentData()
  }, [])

  const generateReport = () => {
    const reportData = {
      studentInfo: studentData,
      submissions: submissions,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssignments: assignments.length,
        completedAssignments: submissions.length,
        averageGrade: studentData?.averageGrade || 0,
        totalTimeSpent: studentData?.totalTimeSpent || 0,
        performanceTrend: "Improving"
      }
    }

    // Simulate report generation
    toast({
      title: "Generating Report...",
      description: "Creating your comprehensive performance report.",
    })

    setTimeout(() => {
      // In a real app, this would generate and download a PDF
      const reportJson = JSON.stringify(reportData, null, 2)
      const blob = new Blob([reportJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student_report_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Generated!",
        description: "Your performance report has been downloaded.",
      })
    }, 2000)
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 90) return "default"
    if (grade >= 80) return "secondary"
    if (grade >= 70) return "outline"
    return "destructive"
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading your scorecard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Scorecard</h1>
            <p className="text-gray-600 mt-1">Track your coding performance and progress</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className={`text-2xl font-bold ${getGradeColor(studentData.averageGrade)}`}>
                    {studentData.averageGrade}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{studentData.gradedSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold">{Math.round(studentData.totalTimeSpent / 60)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Trend</p>
                  <p className="text-2xl font-bold text-green-600">↗ Improving</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Performance</span>
                      <span className="font-medium">{studentData.averageGrade}%</span>
                    </div>
                    <Progress value={studentData.averageGrade} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{submissions.filter(s => s.grade >= 80).length}</p>
                      <p className="text-sm text-green-700">High Scores (80%+)</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{Math.round(studentData.totalTimeSpent / submissions.length)}m</p>
                      <p className="text-sm text-blue-700">Avg. Time per Assignment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{submission.assignmentTitle}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {submission.timeSpent}m
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {submission.language.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getGradeBadgeVariant(submission.grade)}>
                          {submission.grade}%
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strengths & Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Strengths & Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Strongest Language
                  </h4>
                  <Badge className="bg-green-100 text-green-800">
                    {studentData.strongestLanguage}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-1">
                    {studentData.improvementAreas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline" className="block w-fit">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentData.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">
                    {Math.round((submissions.filter(s => s.grade >= 70).length / submissions.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Grade:</span>
                  <span className="font-medium text-green-600">
                    {Math.max(...submissions.map(s => s.grade))}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Languages Used:</span>
                  <span className="font-medium">
                    {new Set(submissions.map(s => s.language)).size}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Submissions:</span>
                  <span className="font-medium">{submissions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
