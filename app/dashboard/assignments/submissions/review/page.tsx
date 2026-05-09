"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  Download,
  MessageSquare,
  Bot,
  Award,
  TrendingUp,
  FileText,
  Play,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"

export default function FacultySubmissionReviewPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showGradingDialog, setShowGradingDialog] = useState(false)
  const [manualGrade, setManualGrade] = useState("")
  const [facultyFeedback, setFacultyFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch all assignments created by this faculty
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title')
          .eq('faculty_id', user.id)

        if (!assignments || assignments.length === 0) {
          setSubmissions([])
          return
        }

        const assignmentIds = assignments.map(a => a.id)

        // Fetch all submissions for those assignments
        const { data: rawSubmissions } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            profiles!student_id(full_name),
            assignments!assignment_id(title)
          `)
          .in('assignment_id', assignmentIds)

        if (rawSubmissions) {
          const mapped = rawSubmissions.map(sub => ({
            id: sub.id,
            assignmentId: sub.assignment_id,
            assignmentTitle: sub.assignments?.title || "Unknown Assignment",
            studentId: sub.student_id,
            studentName: sub.profiles?.full_name || "Unknown Student",
            code: sub.content || "",
            language: "Code",
            submittedAt: sub.submitted_at,
            warnings: 0,
            status: sub.grade ? "reviewed" : "submitted",
            aiEvaluation: { score: sub.grade || 0, feedback: ["Manual grading mode"] },
            grade: sub.grade || 0,
            facultyFeedback: sub.feedback,
            facultyReviewed: !!sub.grade
          }))
          setSubmissions(mapped)
        }
      } catch (err) {
        console.error("Error loading submissions:", err)
      }
    }

    loadSubmissions()
  }, [])

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission)
    setManualGrade(submission.grade?.toString() || "")
    setFacultyFeedback("")
    setShowGradingDialog(true)
  }

  const submitGrade = async () => {
    if (!manualGrade || !facultyFeedback) {
      toast({
        title: "Missing Information",
        description: "Please provide both grade and feedback.",
        variant: "destructive",
      })
      return
    }

    try {
      await SupabaseAssignmentService.gradeSubmission(
        selectedSubmission.id,
        parseInt(manualGrade),
        facultyFeedback
      )

      const updatedSubmissions = submissions.map(sub =>
        sub.id === selectedSubmission.id
          ? {
            ...sub,
            grade: parseInt(manualGrade),
            facultyFeedback,
            facultyReviewed: true,
            reviewedAt: new Date().toISOString()
          }
          : sub
      )

      setSubmissions(updatedSubmissions)

      toast({
        title: "Grade Submitted",
        description: `Grade ${manualGrade}/100 assigned to ${selectedSubmission.studentName}`,
      })

      setShowGradingDialog(false)
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Error Assigning Grade",
        description: e.message || "Failed to submit grade.",
        variant: "destructive"
      })
    }
  }

  const runCode = (code: string, language: string) => {
    toast({
      title: "Code Execution",
      description: "Simulating code execution...",
    })

    setTimeout(() => {
      toast({
        title: "Execution Complete",
        description: "Code executed successfully with sample output.",
      })
    }, 2000)
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === "all") return true
    if (filterStatus === "reviewed") return sub.facultyReviewed
    if (filterStatus === "pending") return !sub.facultyReviewed
    return true
  })

  const averageGrade = submissions.length > 0
    ? Math.round(submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / submissions.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Submissions Review</h1>
            <p className="text-gray-600 mt-1">Review and grade student code submissions with AI assistance</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-2xl font-bold">{submissions.filter(s => s.facultyReviewed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{submissions.filter(s => !s.facultyReviewed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">{averageGrade}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="grid gap-6">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Found</h3>
                <p className="text-gray-600">No submissions match the current filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Student Info & AI Analysis */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{submission.studentName}</h3>
                          <p className="text-sm text-gray-600">{submission.assignmentTitle}</p>
                        </div>
                        <Badge variant={submission.facultyReviewed ? "default" : "secondary"}>
                          {submission.facultyReviewed ? "Reviewed" : "Pending"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Submitted:</span>
                          <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Spent:</span>
                          <span>{submission.timeSpent} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Language:</span>
                          <Badge variant="outline">{submission.language.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Warnings:</span>
                          <Badge variant={submission.warnings > 0 ? "destructive" : "default"}>
                            {submission.warnings}
                          </Badge>
                        </div>
                      </div>

                      {/* AI Evaluation */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">AI Analysis</h4>
                          <Badge variant="outline" className="bg-blue-100">
                            {submission.aiEvaluation.score}/100
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {submission.aiEvaluation.feedback.map((feedback: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {feedback.startsWith("✓") ? (
                                <ThumbsUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className={feedback.startsWith("✓") ? "text-green-700" : "text-red-700"}>
                                {feedback}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="lg:w-2/3 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Submitted Code
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runCode(submission.code, submission.language)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Run Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {submission.facultyReviewed ? "Update Grade" : "Grade"}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-80 overflow-y-auto">
                        <pre>{submission.code}</pre>
                      </div>

                      {submission.facultyReviewed && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <h5 className="font-semibold text-green-900">Faculty Review</h5>
                            <Badge className="bg-green-100 text-green-800">
                              {submission.grade}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700">{submission.facultyFeedback}</p>
                          <p className="text-xs text-green-600 mt-2">
                            Reviewed on {new Date(submission.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Grading Dialog */}
        <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Grade Submission - {selectedSubmission?.studentName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Recommendation</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    AI suggests: {selectedSubmission?.aiEvaluation.score}/100
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  {selectedSubmission?.aiEvaluation.feedback.join(", ")}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualGrade">Final Grade (0-100) *</Label>
                <Input
                  id="manualGrade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter grade"
                  value={manualGrade}
                  onChange={(e) => setManualGrade(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyFeedback">Faculty Feedback *</Label>
                <Textarea
                  id="facultyFeedback"
                  placeholder="Provide detailed feedback for the student..."
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitGrade}>
                Submit Grade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
