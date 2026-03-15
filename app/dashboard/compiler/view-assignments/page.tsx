"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { 
  ArrowLeft,
  Download,
  Eye,
  Users,
  Clock,
  CheckCircle,
  X,
  Code,
  Calendar,
  Play,
  AlertTriangle,
  Trash2,
  Edit
} from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Assignment {
  id: string
  title: string
  faculty_name: string
  department: string
  studying_year: string
  language: string
  created_at: string
  due_date: string
  total_marks: number
  status: string
  description: string
  instructions: string
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

export default function ViewAssignments() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [gradeData, setGradeData] = useState({ marks: 0, feedback: "" })

  useEffect(() => {
    loadAssignments()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('compiler-assignments-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'compiler_assignments' },
        () => loadAssignments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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

  const exportToExcel = (assignment: Assignment) => {
    const data = submissions.map(s => ({
      Name: s.student_name,
      Email: s.student_email,
      Status: s.status,
      Score: s.marks_obtained || 'N/A',
      Feedback: s.feedback || 'N/A',
      SubmittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleString() : 'Not submitted'
    }))

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assignment.title}-submissions.csv` 
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Assignment submission data exported successfully"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const submittedStudents = submissions.filter(s => s.status === 'submitted' || s.status === 'graded')
  const notSubmittedStudents = submissions.filter(s => s.status === 'pending')

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
              <Eye className="w-6 h-6 text-blue-600" />
              {selectedAssignment ? selectedAssignment.title : 'View Assignments'}
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
              <Badge variant="outline" className="text-gray-600">
                {assignments.length} Assignments
              </Badge>
              <Button onClick={() => router.push('/dashboard/compiler/create-assignment')}>
                Create New Assignment
              </Button>
            </div>

            {assignments.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="py-12 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {assignment.department} - {assignment.studying_year} | {assignment.language}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              {assignment.language}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              {assignment.total_marks} marks
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Due: {formatDate(assignment.due_date)}</span>
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
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 mb-4">
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
                
                {selectedAssignment.description && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Description:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.description}</p>
                  </div>
                )}

                {selectedAssignment.instructions && (
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => exportToExcel(selectedAssignment)} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submissions */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <Tabs defaultValue="submitted" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="submitted" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Submitted ({submittedStudents.length})
                    </TabsTrigger>
                    <TabsTrigger value="not-submitted" className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Not Submitted ({notSubmittedStudents.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="submitted" className="mt-6">
                    {submittedStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>No submissions yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submittedStudents.map((submission) => (
                          <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
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
                                    {submission.submitted_at ? formatDate(submission.submitted_at) : 'N/A'}
                                  </p>
                                  <Badge className={
                                    submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }>
                                    {submission.status === 'graded' ? `Graded: ${submission.marks_obtained}/${selectedAssignment.total_marks}` : 'Pending Review'}
                                  </Badge>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    <Code className="w-4 h-4 mr-1" />
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
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="not-submitted" className="mt-6">
                    {notSubmittedStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500" />
                        <p>All students have submitted!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notSubmittedStudents.map((submission) => (
                          <div key={submission.id} className="border rounded-lg p-4 bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-red-600 font-medium">
                                    {submission.student_name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                                  <p className="text-sm text-gray-500">{submission.student_email}</p>
                                </div>
                              </div>
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Code Viewer Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Code Submission - {selectedSubmission?.student_name}</DialogTitle>
              <DialogDescription>
                Submitted on {selectedSubmission?.submitted_at && formatDate(selectedSubmission.submitted_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {selectedSubmission?.language}
                </Badge>
                {selectedSubmission?.status === 'graded' && (
                  <Badge className="bg-green-100 text-green-800">
                    Graded: {selectedSubmission.marks_obtained}/{selectedAssignment?.total_marks}
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Submitted Code</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {selectedSubmission?.code || 'No code submitted'}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Execution Output</h4>
                <div className={`p-4 rounded-lg ${
                  selectedSubmission?.output?.includes('error') || selectedSubmission?.output?.includes('Error')
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedSubmission?.output?.includes('error') || selectedSubmission?.output?.includes('Error') ? (
                      <>
                        <X className="w-4 h-4 text-red-600" />
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
                    {selectedSubmission?.output || 'No output'}
                  </pre>
                </div>
              </div>

              {selectedSubmission?.status === 'graded' && selectedSubmission.feedback && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Faculty Feedback: </span>
                  <span className="text-sm text-blue-700">{selectedSubmission.feedback}</span>
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
