"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Star,
  MoreVertical,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface Assignment {
  id: string
  title: string
  description: string
  selectedClass: string
  dueDate: Date
  totalMarks: number
  allowResubmission: boolean
  maxAttempts: number
  allowedFileTypes: string[]
  isPublished: boolean
  createdAt: string
  createdBy: string
  submissions: any[]
}

interface Submission {
  id: string
  studentName: string
  studentEmail: string
  submittedAt: string
  files: { name: string; size: string; type: string }[]
  content?: string
  status: "submitted" | "graded" | "late"
  grade?: string
  feedback?: string
}

const classOptions = [
  { value: "first-year", label: "First Year", students: 120 },
  { value: "second-year", label: "Second Year", students: 95 },
  { value: "third-year", label: "Third Year", students: 80 },
  { value: "fourth-year", label: "Fourth Year", students: 65 },
]

// Mock submissions data
const mockSubmissions: Submission[] = [
  {
    id: "1",
    studentName: "John Doe",
    studentEmail: "john.doe@example.com",
    submittedAt: "2024-01-15T10:30:00Z",
    files: [
      { name: "assignment1.pdf", size: "2.5 MB", type: "application/pdf" },
      { name: "code.zip", size: "1.2 MB", type: "application/zip" },
    ],
    status: "submitted",
  },
  {
    id: "2",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@example.com",
    submittedAt: "2024-01-14T15:45:00Z",
    files: [{ name: "report.docx", size: "3.1 MB", type: "application/docx" }],
    status: "graded",
    grade: "A",
    feedback: "Excellent work! Your analysis was thorough and well-presented.",
  },
  {
    id: "3",
    studentName: "Mike Johnson",
    studentEmail: "mike.johnson@example.com",
    submittedAt: "2024-01-16T09:15:00Z",
    files: [{ name: "late_submission.pdf", size: "1.8 MB", type: "application/pdf" }],
    status: "late",
  },
]

export default function AssignmentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions)
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(mockSubmissions)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    loadAssignment()
  }, [params.id])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter])

  const loadAssignment = () => {
    try {
      const storedAssignments = localStorage.getItem("assignments")
      if (storedAssignments) {
        const assignments = JSON.parse(storedAssignments)
        const foundAssignment = assignments.find((a: any) => a.id === params.id)
        if (foundAssignment) {
          setAssignment({
            ...foundAssignment,
            dueDate: new Date(foundAssignment.dueDate),
          })
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
      console.error("Error loading assignment:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const handleGradeSubmission = () => {
    if (!selectedSubmission || !grade.trim()) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive",
      })
      return
    }

    const updatedSubmissions = submissions.map((submission) =>
      submission.id === selectedSubmission.id
        ? { ...submission, status: "graded" as const, grade, feedback }
        : submission,
    )

    setSubmissions(updatedSubmissions)
    setGradeDialogOpen(false)
    setSelectedSubmission(null)
    setGrade("")
    setFeedback("")

    toast({
      title: "Grade Submitted",
      description: "The grade has been saved successfully.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        )
      case "graded":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Star className="h-3 w-3 mr-1" />
            Graded
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Late
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("doc")) return "📝"
    if (type.includes("zip")) return "🗜️"
    if (type.includes("image")) return "🖼️"
    return "📎"
  }

  const getClassInfo = (classValue: string) => {
    return classOptions.find((option) => option.value === classValue)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/assignments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
      </div>
    )
  }

  const classInfo = getClassInfo(assignment.selectedClass)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/assignments")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">Assignment Details & Submissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Submissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Assignment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Assignment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Class</h4>
                  <p className="text-gray-600">{classInfo?.label}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Total Marks</h4>
                  <p className="text-gray-600">{assignment.totalMarks}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Due Date</h4>
                  <p className="text-gray-600">{assignment.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                  <Badge
                    className={assignment.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {assignment.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              {assignment.allowedFileTypes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Allowed File Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {assignment.allowedFileTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        .{type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Submission Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
                  <p className="text-sm text-blue-600">Total Submissions</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {submissions.filter((s) => s.status === "graded").length}
                  </p>
                  <p className="text-sm text-green-600">Graded</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {submissions.filter((s) => s.status === "late").length}
                  </p>
                  <p className="text-sm text-orange-600">Late</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{(classInfo?.students || 0) - submissions.length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Student Submissions
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more submissions."
                  : "Students haven't submitted their assignments yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {submission.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{submission.studentName}</p>
                            <p className="text-sm text-gray-500">{submission.studentEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {submission.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span>{getFileIcon(file.type)}</span>
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <span className="text-gray-500">({file.size})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.grade ? (
                          <Badge className="bg-green-100 text-green-800">{submission.grade}</Badge>
                        ) : (
                          <span className="text-gray-400">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setGrade(submission.grade || "")
                              setFeedback(submission.feedback || "")
                              setGradeDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Submission Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedSubmission.studentName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.studentEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submitted Files</h4>
                <div className="space-y-2">
                  {selectedSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <span>{getFileIcon(file.type)}</span>
                      <span className="flex-1">{file.name}</span>
                      <span className="text-sm text-gray-500">{file.size}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade (e.g., A, B+, 85)"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="mt-2">{getStatusBadge(selectedSubmission.status)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGradeSubmission} className="bg-green-600 hover:bg-green-700">
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
