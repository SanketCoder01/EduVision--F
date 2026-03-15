"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Submission {
  id: string
  assignment_id: string
  code: string
  language: string
  output: string
  status: string
  marks_obtained: number
  feedback: string
  submitted_at: string
  assignment_title: string
  total_marks: number
  faculty_name: string
}

export default function StudentScorecardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingCode, setViewingCode] = useState<Submission | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('student_code_submissions')
        .select(`
          *,
          compiler_assignments!inner(title, total_marks, faculty_name)
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      
      const formattedSubmissions = (data || []).map((s: any) => ({
        ...s,
        assignment_title: s.compiler_assignments?.title || 'Unknown',
        total_marks: s.compiler_assignments?.total_marks || 100,
        faculty_name: s.compiler_assignments?.faculty_name || 'Unknown'
      }))
      
      setSubmissions(formattedSubmissions)
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getGradePercentage = (obtained: number, total: number) => {
    if (total === 0) return 0
    return Math.round((obtained / total) * 100)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent'
    if (percentage >= 75) return 'Good'
    if (percentage >= 60) return 'Average'
    if (percentage >= 40) return 'Pass'
    return 'Fail'
  }

  // Calculate stats
  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter(s => s.status === 'graded')
  const averagePercentage = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + getGradePercentage(s.marks_obtained, s.total_marks), 0) / gradedSubmissions.length)
    : 0
  const totalMarksObtained = gradedSubmissions.reduce((acc, s) => acc + s.marks_obtained, 0)
  const totalMarksPossible = gradedSubmissions.reduce((acc, s) => acc + s.total_marks, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push('/student-dashboard/compiler')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              My Scorecard
            </h1>
            <p className="text-gray-600">View your coding assignment results and grades</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{gradedSubmissions.length}</div>
              <div className="text-sm text-gray-600">Graded</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${getGradeColor(averagePercentage)}`}>
                {averagePercentage}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">
                {totalMarksObtained}/{totalMarksPossible}
              </div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600 mb-4">Complete coding assignments to see your results here.</p>
              <Button onClick={() => router.push('/student-dashboard/compiler/assignments')}>
                View Assignments
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Submission History</h2>
            
            {submissions.map((submission, index) => {
              const percentage = getGradePercentage(submission.marks_obtained, submission.total_marks)
              
              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white border-gray-200 ${
                    submission.status === 'graded' ? 'border-l-4 border-l-green-500' :
                    'border-l-4 border-l-blue-500'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            submission.status === 'graded' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {submission.status === 'graded' ? (
                              <CheckCircle className={`w-6 h-6 ${getGradeColor(percentage)}`} />
                            ) : (
                              <Clock className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{submission.assignment_title}</h4>
                            <p className="text-sm text-gray-500">{submission.faculty_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <Badge variant="outline" className="border-blue-500 text-blue-600 mb-1">
                              {submission.language}
                            </Badge>
                            <p className="text-sm text-gray-500">
                              {formatDate(submission.submitted_at)}
                            </p>
                          </div>
                          
                          {submission.status === 'graded' ? (
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                                {submission.marks_obtained}/{submission.total_marks}
                              </div>
                              <div className="text-sm text-gray-500">{getGradeLabel(percentage)}</div>
                            </div>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">
                              Pending Review
                            </Badge>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingCode(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      
                      {submission.status === 'graded' && submission.feedback && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Feedback: </span>
                          <span className="text-sm text-gray-600">{submission.feedback}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Code Viewer Dialog */}
        <Dialog open={!!viewingCode} onOpenChange={() => setViewingCode(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingCode?.assignment_title}</DialogTitle>
              <DialogDescription>
                Submitted on {viewingCode?.submitted_at && formatDate(viewingCode.submitted_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {viewingCode?.language}
                </Badge>
                {viewingCode?.status === 'graded' && (
                  <Badge className="bg-green-100 text-green-800">
                    Graded: {viewingCode.marks_obtained}/{viewingCode.total_marks}
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Your Code</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {viewingCode?.code || 'No code'}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Execution Output</h4>
                <div className={`p-4 rounded-lg ${
                  viewingCode?.output?.includes('error') || viewingCode?.output?.includes('Error')
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {viewingCode?.output?.includes('error') || viewingCode?.output?.includes('Error') ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 font-medium">Execution Failed</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">Execution Successful</span>
                      </>
                    )}
                  </div>
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {viewingCode?.output || 'No output'}
                  </pre>
                </div>
              </div>

              {viewingCode?.status === 'graded' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">Your Grade</span>
                    <span className={`text-2xl font-bold ${getGradeColor(getGradePercentage(viewingCode.marks_obtained, viewingCode.total_marks))}`}>
                      {viewingCode.marks_obtained}/{viewingCode.total_marks}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 mb-1">
                    {getGradeLabel(getGradePercentage(viewingCode.marks_obtained, viewingCode.total_marks))} ({getGradePercentage(viewingCode.marks_obtained, viewingCode.total_marks)}%)
                  </div>
                  {viewingCode.feedback && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <span className="text-sm font-medium text-blue-800">Faculty Feedback: </span>
                      <span className="text-sm text-blue-700">{viewingCode.feedback}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
