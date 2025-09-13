"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import AssignmentAnalytics from "@/components/analytics/AssignmentAnalytics"
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Check, 
  AlertTriangle, 
  Search, 
  BarChart3,
  FileUp,
  Users,
  Clock,
  GraduationCap,
  FileCheck,
  FileX,
  Shield,
  TrendingUp,
  Eye,
  Star,
  Award
} from "lucide-react"

interface Submission {
  id: string
  student_id: string
  assignment_id: string
  submission_type: string
  status: string
  submitted_at: string
  graded_at?: string
  grade?: number
  feedback?: string
  plagiarism_score?: number
  is_late?: boolean
  submission_text?: string
  files: Array<{
    id?: string
    file_name: string
    file_url?: string
    file_type: string
    file_size: number
  }>
}

interface Student {
  id: string
  name: string
  email: string
  class: string
  prn: string
}

export default function AssignmentSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState("")
  const [grade, setGrade] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoGrading, setIsAutoGrading] = useState(false)

  const handleAutoGrade = async (submission: Submission) => {
    setIsAutoGrading(true)
    try {
      // Call auto-grading API
      const response = await fetch('/api/ai/auto-grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_text: submission.submission_text,
          assignment_questions: assignment.questions,
          max_marks: assignment.max_marks,
          assignment_type: assignment.assignment_type
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update submission with auto-generated grade
        const { error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            grade: result.grade,
            feedback: result.feedback,
            status: 'graded',
            graded_at: new Date().toISOString(),
            auto_graded: true
          })
          .eq('id', submission.id)
        
        if (updateError) throw updateError
        
        // Update local state
        const updatedSubmissions = submissions.map(sub => 
          sub.id === submission.id 
            ? { ...sub, grade: result.grade, feedback: result.feedback, status: "graded" as const, graded_at: new Date().toISOString() }
            : sub
        )
        setSubmissions(updatedSubmissions)
        
        toast.success(`Auto-grading complete: ${result.grade}/${assignment.max_marks} marks`)
      } else {
        throw new Error('Auto-grading failed')
      }
    } catch (error) {
      console.error('Error auto-grading:', error)
      toast.error("Failed to auto-grade assignment. Please grade manually.")
    } finally {
      setIsAutoGrading(false)
    }
  }

  const loadAssignmentData = async () => {
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          )
        `)
        .eq('id', params.id)
        .single()
      
      if (assignmentError) {
        console.error('Error loading assignment:', assignmentError)
        toast({
          title: "Error",
          description: "Assignment not found.",
          variant: "destructive"
        })
        router.push('/dashboard/assignments')
        return null
      }
      
      return assignmentData
    } catch (error) {
      console.error('Error loading assignment:', error)
      return null
    }
  }

  const loadSubmissionsData = async (assignmentId: string) => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          submission_files (
            id,
            file_name,
            file_url,
            file_size,
            file_type
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })
      
      if (submissionsError) {
        console.error('Error loading submissions:', submissionsError)
        return []
      }
      
      return submissionsData || []
    } catch (error) {
      console.error('Error loading submissions:', error)
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentData = await loadAssignmentData()
        if (assignmentData) {
          setAssignment(assignmentData)
          const submissionsData = await loadSubmissionsData(params.id as string)
          setSubmissions(submissionsData)
          
          // Load students from all department tables
          await loadAllStudents()
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])
  
  const loadAllStudents = async () => {
    try {
      const tables = [
        'students_cse_1st_year', 'students_cse_2nd_year', 'students_cse_3rd_year', 'students_cse_4th_year',
        'students_cyber_1st_year', 'students_cyber_2nd_year', 'students_cyber_3rd_year', 'students_cyber_4th_year',
        'students_aids_1st_year', 'students_aids_2nd_year', 'students_aids_3rd_year', 'students_aids_4th_year',
        'students_aiml_1st_year', 'students_aiml_2nd_year', 'students_aiml_3rd_year', 'students_aiml_4th_year'
      ]
      
      let allStudents: Student[] = []
      
      for (const table of tables) {
        const { data: studentsData } = await supabase
          .from(table)
          .select('*')
        
        if (studentsData) {
          const formattedStudents = studentsData.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            class: `${student.year} ${student.department}`,
            prn: student.prn,
            department: student.department,
            year: student.year
          }))
          allStudents = [...allStudents, ...formattedStudents]
        }
      }
      
      setStudents(allStudents)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800"
      case "graded": return "bg-green-100 text-green-800"
      case "late": return "bg-red-100 text-red-800"
      case "returned": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPlagiarismColor = (score: number) => {
    if (score < 5) return "text-green-600"
    if (score < 15) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const student = students.find(s => s.id === sub.student_id)
    const matchesSearch = !searchTerm || 
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.prn.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleSubmitGrade = async () => {
    if (!selectedSubmission || !grade) return
    
    setIsSubmitting(true)
    try {
      // Update submission in Supabase
      const { error: updateError } = await supabase
        .from('assignment_submissions')
        .update({
          grade: parseFloat(grade),
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id)
      
      if (updateError) throw updateError
      
      // Update local state
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade: parseFloat(grade), feedback, status: "graded" as const, graded_at: new Date().toISOString() }
          : sub
      )
      setSubmissions(updatedSubmissions)
      
      // Create notification for student
      const student = students.find(s => s.id === selectedSubmission.student_id)
      if (student && assignment) {
        await supabase.from('notifications').insert([{
          type: "grade",
          title: "Assignment Graded",
          message: `Your assignment "${assignment.title}" has been graded: ${grade}/${assignment.max_marks}`,
          assignment_id: assignment.id,
          student_id: student.id,
          faculty_id: assignment.faculty_id,
          department: assignment.department,
          created_at: new Date().toISOString(),
          read: false
        }])
      }
      
      toast.success("Grade and feedback have been saved successfully.")
      
      setSelectedSubmission(null)
      setGrade("")
      setFeedback("")
    } catch (error) {
      console.error('Error submitting grade:', error)
      toast.error("Failed to submit grade. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate submission statistics
  const totalStudents = students.length
  const submittedCount = submissions.length
  const gradedCount = submissions.filter(s => s.status === 'graded').length
  const lateCount = submissions.filter(s => s.status === 'late').length
  const submissionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0
  const averageGrade = gradedCount > 0 
    ? (submissions.reduce((sum, sub) => sum + (sub.grade ? parseFloat(sub.grade) : 0), 0) / gradedCount).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-full px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment.title} - Submissions
          </h1>
          <p className="text-muted-foreground">
            Manage and review student submissions for this assignment
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <AssignmentAnalytics 
        submissions={submissions}
        assignment={assignment}
        students={students}
      />

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCount}/{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {submissionRate}% submission rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Graded
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedCount}</div>
            <p className="text-xs text-muted-foreground">
              {gradedCount > 0 ? `${Math.round((gradedCount / submittedCount) * 100)}% of submissions` : 'No grades yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Grade
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradedCount > 0 ? `${averageGrade}/${assignment.max_marks}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {gradedCount > 0 ? 'Based on graded submissions' : 'No grades yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Late Submissions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateCount}</div>
            <p className="text-xs text-muted-foreground">
              {submittedCount > 0 ? `${Math.round((lateCount / submittedCount) * 100)}% of submissions` : 'No submissions yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Student Submissions</CardTitle>
              <CardDescription>
                Review and grade student submissions for this assignment
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>PRN</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Plagiarism</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => {
                    const student = students.find(s => s.id === submission.student_id)
                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {student?.name || 'Unknown Student'}
                        </TableCell>
                        <TableCell>{student?.prn || 'N/A'}</TableCell>
                        <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.grade ? (
                            <span className="font-medium">{submission.grade}/{assignment.max_marks}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.plagiarism_score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className={getPlagiarismColor(submission.plagiarism_score)}>
                                {submission.plagiarism_score}%
                              </span>
                              {submission.plagiarism_score >= 15 && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Checking...</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {submission.status !== 'graded' && assignment.auto_grading_enabled && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoGrade(submission)}
                                disabled={isAutoGrading}
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              >
                                {isAutoGrading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                                    <span>Grading...</span>
                                  </div>
                                ) : (
                                  <>🤖 Auto Grade</>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setGrade(submission.grade?.toString() || "")
                                setFeedback(submission.feedback || "")
                              }}
                            >
                              {submission.status === 'graded' ? 'View Details' : 'Grade'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Add functionality to download submission files
                              }}
                            >
                              Download Files
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No submissions found
                    </TableCell>
{{ ... }}
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Submission Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedSubmission.status === 'graded' ? 'View Submission' : 'Grade Submission'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedSubmission(null)
                  setFeedback("")
                  setGrade("")
                }}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Student</h3>
                <p className="text-sm text-muted-foreground">
                  {students.find(s => s.id === selectedSubmission.student_id)?.name || 'Unknown Student'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Submitted Files</h3>
                <div className="space-y-2">
                  {selectedSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded border p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Grade</h3>
                {selectedSubmission.status === 'graded' ? (
                  <p className="text-lg font-semibold">
                    {selectedSubmission.grade}/{assignment.max_marks}
                  </p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter grade"
                      className="w-24"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min={0}
                      max={assignment.max_marks}
                    />
                    <span className="text-sm text-muted-foreground">
                      / {assignment.max_marks} points
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Feedback</h3>
                {selectedSubmission.status === 'graded' ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedSubmission.feedback || 'No feedback provided.'}
                  </p>
                ) : (
                  <Textarea
                    placeholder="Add feedback for the student..."
                    className="min-h-[100px]"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                )}
              </div>
              
              {selectedSubmission.plagiarism_score !== undefined && (
                <div>
                  <h3 className="font-medium mb-1">Plagiarism Check</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Similarity Score</span>
                        <span className={getPlagiarismColor(selectedSubmission.plagiarism_score)}>
                          {selectedSubmission.plagiarism_score}%
                        </span>
                      </div>
                      <Progress 
                        value={selectedSubmission.plagiarism_score} 
                        className={`h-2 ${
                          selectedSubmission.plagiarism_score < 5 ? 'bg-green-100' :
                          selectedSubmission.plagiarism_score < 15 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedSubmission.plagiarism_score < 5 ? 'Low similarity' :
                         selectedSubmission.plagiarism_score < 15 ? 'Moderate similarity' : 'High similarity'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedSubmission.status !== 'graded' && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSubmission(null)
                      setFeedback("")
                      setGrade("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitGrade}
                    disabled={!grade || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Grade'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
