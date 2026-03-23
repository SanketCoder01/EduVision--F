"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Users, Clock, CheckCircle, XCircle, Eye, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Assignment {
  id: string
  title: string
  language: string
  department: string
  studying_year: string
  due_date: string
  status: string
  total_marks: number
  created_at: string
}

interface Submission {
  id: string
  student_id: string
  assignment_id: string
  code: string
  language: string
  output: string
  status: string
  marks_obtained: number
  feedback: string
  submitted_at: string
  student_name: string
  student_email: string
}

export default function FacultyCompilerAssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingCode, setViewingCode] = useState<Submission | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [gradeData, setGradeData] = useState({ marks: 0, feedback: "" })

  useEffect(() => {
    loadAssignments()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('compiler-submissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'student_code_submissions' },
        () => {
          if (selectedAssignment) {
            loadSubmissions(selectedAssignment.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedAssignment?.id])

  const loadAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('compiler_assignments')
        .select('*')
        .eq('faculty_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_code_submissions')
        .select(`
          *,
          students!inner(name, email)
        `)
        .eq('assignment_id', assignmentId)

      if (error) throw error
      
      const formattedSubmissions = (data || []).map((s: any) => ({
        ...s,
        student_name: s.students?.name || 'Unknown',
        student_email: s.students?.email || 'N/A'
      }))
      
      setSubmissions(formattedSubmissions)
    } catch (error) {
      console.error("Error loading submissions:", error)
    }
  }

  const handleViewAssignment = async (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    await loadSubmissions(assignment.id)
  }

  const handleGradeSubmission = async () => {
    if (!gradingSubmission) return

    try {
      const { error } = await supabase
        .from('student_code_submissions')
        .update({
          marks_obtained: gradeData.marks,
          feedback: gradeData.feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', gradingSubmission.id)

      if (error) throw error

      toast({
        title: "Graded Successfully",
        description: `Submission has been graded with ${gradeData.marks} marks.`
      })

      setGradingSubmission(null)
      if (selectedAssignment) {
        await loadSubmissions(selectedAssignment.id)
      }
    } catch (error) {
      console.error("Error grading submission:", error)
      toast({
        title: "Error",
        description: "Failed to grade submission.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('compiler_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error

      toast({
        title: "Deleted",
        description: "Assignment has been deleted."
      })

      setAssignments(prev => prev.filter(a => a.id !== assignmentId))
      setSelectedAssignment(null)
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assignment.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => selectedAssignment ? setSelectedAssignment(null) : router.push('/dashboard/compiler')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {selectedAssignment ? 'Back to Assignments' : 'Back'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              {selectedAssignment ? selectedAssignment.title : 'Compiler Assignments'}
            </h1>
            <p className="text-gray-600">
              {selectedAssignment 
                ? `${selectedAssignment.department} - ${selectedAssignment.studying_year} | ${selectedAssignment.language}`
                : 'Manage and review coding assignments'
              }
            </p>
          </div>
        </div>

        {!selectedAssignment ? (
          /* Assignment List */
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-gray-600">
                  {assignments.length} Assignments
                </Badge>
              </div>
              <Button onClick={() => router.push('/dashboard/compiler/create-assignment')}>
                Create New Assignment
              </Button>
            </div>

            {assignments.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Created</h3>
                  <p className="text-gray-600 mb-4">You haven't created any coding assignments yet.</p>
                  <Button onClick={() => router.push('/dashboard/compiler/create-assignment')}>
                    Create Your First Assignment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment, index) => {
                  const daysRemaining = getDaysRemaining(assignment.due_date)
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                        assignment.status === 'draft' ? 'border-l-4 border-l-gray-400' :
                        daysRemaining < 0 ? 'border-l-4 border-l-red-500' :
                        daysRemaining <= 2 ? 'border-l-4 border-l-yellow-500' :
                        'border-l-4 border-l-green-500'
                      }`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-gray-900 text-lg">{assignment.title}</CardTitle>
                            <Badge className={
                              assignment.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              assignment.status === 'published' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {assignment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              {assignment.language}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              {assignment.department}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              {assignment.studying_year}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Due: {formatDate(assignment.due_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{assignment.total_marks} marks</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            {daysRemaining < 0 ? (
                              <span className="text-red-600 font-medium">Overdue</span>
                            ) : daysRemaining === 0 ? (
                              <span className="text-red-600 font-medium">Due today</span>
                            ) : (
                              <span className="text-gray-600">{daysRemaining} days remaining</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              className="flex-1"
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/dashboard/compiler/edit-assignment/${assignment.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Assignment Details with Submissions */
          <div className="space-y-6">
            {/* Assignment Info */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <Label className="text-gray-500 text-sm">Department</Label>
                    <p className="font-medium text-gray-900">{selectedAssignment.department}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Year</Label>
                    <p className="font-medium text-gray-900">{selectedAssignment.studying_year}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Language</Label>
                    <p className="font-medium text-gray-900">{selectedAssignment.language}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Total Marks</Label>
                    <p className="font-medium text-gray-900">{selectedAssignment.total_marks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Student Submissions</h2>
                <Badge variant="outline" className="text-gray-600">
                  {submissions.length} Submissions
                </Badge>
              </div>

              {submissions.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="py-8 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600">No submissions yet. Students will appear here once they submit their code.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`bg-white border-gray-200 ${
                        submission.status === 'graded' ? 'border-l-4 border-l-green-500' :
                        submission.status === 'submitted' ? 'border-l-4 border-l-blue-500' :
                        'border-l-4 border-l-gray-400'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {submission.student_name?.charAt(0)?.toUpperCase() || 'S'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                                <p className="text-sm text-gray-500">{submission.student_email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {formatDate(submission.submitted_at)}
                                </p>
                                <Badge className={
                                  submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {submission.status}
                                </Badge>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setViewingCode(submission)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Code
                                </Button>
                                {submission.status !== 'graded' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setGradingSubmission(submission)
                                      setGradeData({ marks: 0, feedback: "" })
                                    }}
                                  >
                                    Grade
                                  </Button>
                                )}
                                {submission.status === 'graded' && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-700">
                                      {submission.marks_obtained}/{selectedAssignment.total_marks}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Code Viewer Dialog */}
        <Dialog open={!!viewingCode} onOpenChange={() => setViewingCode(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Code Submission - {viewingCode?.student_name}</DialogTitle>
              <DialogDescription>
                Submitted on {viewingCode?.submitted_at && formatDate(viewingCode.submitted_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Language</Label>
                <Badge variant="outline" className="ml-2 border-blue-500 text-blue-600">
                  {viewingCode?.language}
                </Badge>
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Submitted Code</Label>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {viewingCode?.code || 'No code submitted'}
                </pre>
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Execution Output</Label>
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
                    <span className="font-medium text-blue-800">Grade</span>
                    <span className="text-xl font-bold text-blue-700">
                      {viewingCode.marks_obtained}/{selectedAssignment?.total_marks}
                    </span>
                  </div>
                  {viewingCode.feedback && (
                    <div>
                      <span className="text-sm text-blue-700">Feedback: </span>
                      <span className="text-sm text-blue-600">{viewingCode.feedback}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Grading Dialog */}
        <Dialog open={!!gradingSubmission} onOpenChange={() => setGradingSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission - {gradingSubmission?.student_name}</DialogTitle>
              <DialogDescription>
                Enter marks and feedback for this submission
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">
                  Marks (out of {selectedAssignment?.total_marks})
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={selectedAssignment?.total_marks || 100}
                  value={gradeData.marks}
                  onChange={(e) => setGradeData(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Feedback</Label>
                <Input
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Enter feedback for the student"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </Button>
                <Button onClick={handleGradeSubmission}>
                  Submit Grade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
