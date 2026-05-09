"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  Code, 
  Calendar, 
  Clock, 
  Award, 
  FileText,
  Trophy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Download
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"

interface Submission {
  id: string
  type: 'assignment' | 'exam'
  title: string
  submittedAt: string
  grade?: number
  totalMarks?: number
  language: string
  status: 'pending' | 'graded' | 'late'
  timeSpent?: number
  violations?: number
  passed?: boolean
  examId?: string
}

export default function StudentSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    averageGrade: 0,
    passedExams: 0,
    totalExams: 0
  })

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const results = await SupabaseAssignmentService.getStudentAllSubmissions(user.id);

      const allSubmissions: Submission[] = results.map((sub: any) => {
          const type = (sub.assignment?.assignment_type === 'quiz' || sub.assignment?.assignment_type === 'coding') ? 'exam' : 'assignment';
          return {
            id: sub.id,
            type: type,
            title: sub.assignment?.title || 'Unknown Title',
            submittedAt: sub.submitted_at,
            grade: sub.grade,
            totalMarks: sub.assignment?.max_marks || 100,
            language: sub.language || 'text',
            status: sub.grade ? 'graded' : 'pending',
            passed: sub.grade && sub.assignment?.max_marks ? (sub.grade / sub.assignment.max_marks >= 0.4) : undefined,
            examId: sub.assignment_id
          };
      });

      setSubmissions(allSubmissions)
      
      // Calculate stats
      const gradedSubmissions = allSubmissions.filter(s => s.grade !== undefined && s.grade !== null && !isNaN(s.grade))
      const examSubs = allSubmissions.filter(s => s.type === 'exam')
      const passedExams = examSubs.filter(s => s.passed).length
      
      setStats({
        totalSubmissions: allSubmissions.length,
        averageGrade: gradedSubmissions.length > 0 ? 
          gradedSubmissions.reduce((sum, s) => sum + ((s.grade || 0) / (s.totalMarks || 100) * 100), 0) / gradedSubmissions.length : 0,
        passedExams,
        totalExams: examSubs.length
      })
    } catch (e) {
      console.error("Failed to load live submissions:", e);
    }
  }

  const handleViewSubmission = (submission: Submission) => {
    if (submission.type === 'exam' && submission.examId) {
      router.push(`/student-dashboard/exams/${submission.examId}/results`)
    } else {
      router.push(`/student-dashboard/assignments/submit/${submission.examId}`)
    }
  }

  const getGradeColor = (grade: number, totalMarks: number) => {
    const percentage = (grade / totalMarks) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (submission: Submission) => {
    if (submission.status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>
    }
    
    if (submission.type === 'exam') {
      return submission.passed ? 
        <Badge className="bg-green-100 text-green-800">Passed</Badge> :
        <Badge variant="destructive">Failed</Badge>
    }
    
    const percentage = ((submission.grade || 0) / (submission.totalMarks || 100)) * 100
    if (percentage >= 75) return <Badge>Excellent</Badge>
    if (percentage >= 60) return <Badge variant="secondary">Good</Badge>
    return <Badge variant="destructive">Needs Improvement</Badge>
  }

  const assignmentSubmissions = submissions.filter(s => s.type === 'assignment')
  const examSubmissions = submissions.filter(s => s.type === 'exam')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Submissions
          </h1>
          <p className="text-gray-600">
            Track your coding assignments and exam submissions
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-green-600">{stats.averageGrade.toFixed(1)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exams Passed</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.passedExams}/{stats.totalExams}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalExams > 0 ? ((stats.passedExams / stats.totalExams) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Submissions ({submissions.length})</TabsTrigger>
              <TabsTrigger value="assignments">Assignments ({assignmentSubmissions.length})</TabsTrigger>
              <TabsTrigger value="exams">Exams ({examSubmissions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {submissions.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-600">
                      Your coding assignments and exam submissions will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{submission.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {submission.type === 'exam' ? (
                                <Trophy className="w-3 h-3 mr-1" />
                              ) : (
                                <Code className="w-3 h-3 mr-1" />
                              )}
                              {submission.type.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Code className="h-4 w-4" />
                              {submission.language.toUpperCase()}
                            </span>
                            {submission.timeSpent && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(submission.timeSpent / 60)}m
                              </span>
                            )}
                            {submission.violations !== undefined && submission.violations > 0 && (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                {submission.violations} violations
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {submission.grade !== undefined && (
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${getGradeColor(submission.grade, submission.totalMarks || 100)}`}>
                                {submission.grade}/{submission.totalMarks}
                              </p>
                              <p className="text-xs text-gray-500">
                                {((submission.grade / (submission.totalMarks || 100)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                          
                          {getStatusBadge(submission)}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {assignmentSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{submission.title}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            {submission.language.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {submission.grade !== undefined && (
                          <div className="text-right">
                            <p className={`text-xl font-bold ${getGradeColor(submission.grade, submission.totalMarks || 100)}`}>
                              {submission.grade}%
                            </p>
                          </div>
                        )}
                        {getStatusBadge(submission)}
                        <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="exams" className="space-y-4">
              {examSubmissions.map((submission) => (
                <Card key={submission.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${submission.passed ? 'ring-2 ring-green-200' : 'ring-2 ring-red-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{submission.title}</h3>
                          {submission.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            {submission.language.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.floor((submission.timeSpent || 0) / 60)}m
                          </span>
                          {submission.violations && submission.violations > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              {submission.violations} violations
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getGradeColor(submission.grade || 0, submission.totalMarks || 100)}`}>
                            {submission.grade}/{submission.totalMarks}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(((submission.grade || 0) / (submission.totalMarks || 100)) * 100).toFixed(1)}%
                          </p>
                        </div>
                        {getStatusBadge(submission)}
                        <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
