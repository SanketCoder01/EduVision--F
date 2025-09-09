"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
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
  FileX
} from "lucide-react"

interface Submission {
  id: string
  student_id: string
  assignment_id: string
  submission_type: string
  status: string
  submitted_at: string
  graded_at?: string
  grade?: string
  feedback?: string
  plagiarism_score?: number
  files: Array<{
    name: string
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
  const { toast } = useToast()
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

  // Mock students data
  const mockStudents = [
    { id: "s1", name: "Rahul Sharma", email: "rahul.s@example.com", class: "FY CSE", prn: "PRN001" },
    { id: "s2", name: "Priya Patel", email: "priya.p@example.com", class: "FY CSE", prn: "PRN002" },
    { id: "s3", name: "Amit Kumar", email: "amit.k@example.com", class: "FY CSE", prn: "PRN003" },
    { id: "s4", name: "Sneha Gupta", email: "sneha.g@example.com", class: "FY CSE", prn: "PRN004" },
    { id: "s5", name: "Vikram Singh", email: "vikram.s@example.com", class: "FY CSE", prn: "PRN005" },
  ]

  // Mock submissions data
  const mockSubmissionsData: Submission[] = [
    {
      id: "sub1",
      student_id: "s1",
      assignment_id: params.id as string,
      submission_type: "file",
      status: "submitted",
      submitted_at: "2023-10-10T14:30:00Z",
      plagiarism_score: 3,
      files: [{ name: "assignment1_solution.pdf", file_type: "application/pdf", file_size: 1240000 }],
    },
    {
      id: "sub2",
      student_id: "s2",
      assignment_id: params.id as string,
      submission_type: "file",
      status: "graded",
      submitted_at: "2023-10-09T16:45:00Z",
      graded_at: "2023-10-12T10:20:00Z",
      grade: "18",
      feedback: "Excellent work! Your implementation is very efficient and well-documented.",
      plagiarism_score: 2,
      files: [{ name: "priya_assignment.pdf", file_type: "application/pdf", file_size: 980000 }],
    },
    {
      id: "sub3",
      student_id: "s3",
      assignment_id: params.id as string,
      submission_type: "file",
      status: "late",
      submitted_at: "2023-10-16T09:15:00Z",
      plagiarism_score: 12,
      files: [
        { name: "late_submission.pdf", file_type: "application/pdf", file_size: 1450000 },
        { name: "code_files.zip", file_type: "application/zip", file_size: 3200000 },
      ],
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        const storedAssignments = localStorage.getItem("assignments")
        if (storedAssignments) {
          const assignments = JSON.parse(storedAssignments)
          const foundAssignment = assignments.find((a: any) => a.id.toString() === params.id)
          
          if (foundAssignment) {
            setAssignment(foundAssignment)
            setSubmissions(mockSubmissionsData)
            setStudents(mockStudents)
          } else {
            toast({
              title: "Assignment not found",
              description: "The assignment you're looking for doesn't exist.",
              variant: "destructive",
            })
            router.push("/dashboard/assignments")
          }
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
  }, [params.id, router, toast])

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
      // Update submission with grade and feedback
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade, feedback, status: "graded", graded_at: new Date().toISOString() }
          : sub
      )
      setSubmissions(updatedSubmissions)
      
      toast({
        title: "Grade Submitted",
        description: "The grade has been successfully submitted.",
      })
      
      setSelectedSubmission(null)
      setGrade("")
      setFeedback("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive",
      })
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
    <div className="space-y-6">
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

      {/* Analytics Cards */}
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
              {gradedCount > 0 ? `${averageGrade}/${assignment.total_marks}` : 'N/A'}
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
                            <span className="font-medium">{submission.grade}/{assignment.total_marks}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.plagiarism_score !== undefined ? (
                            <span className={getPlagiarismColor(submission.plagiarism_score)}>
                              {submission.plagiarism_score}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            {submission.status === 'graded' ? 'View' : 'Grade'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No submissions found
                    </TableCell>
                  </TableRow>
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
                          <p className="text-sm font-medium">{file.name}</p>
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
                    {selectedSubmission.grade}/{assignment.total_marks}
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
                      max={assignment.total_marks}
                    />
                    <span className="text-sm text-muted-foreground">
                      / {assignment.total_marks} points
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
