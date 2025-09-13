"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Edit3,
  Trash2,
  Bell,
  ExternalLink,
  BarChart3,
  Users,
  Search,
  Download,
  Eye,
  RefreshCw,
  Check,
  Shield,
  AlertTriangle,
  Send,
  PieChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface Assignment {
  id: string
  title: string
  description: string
  class_id: string
  department: string
  year: string
  subject: string
  due_date: string
  created_at: string
  assignment_type: string
  status: string
  total_marks: number
  visibility: boolean
  allow_late_submission: boolean
  allow_resubmission: boolean
  enable_plagiarism_check: boolean
  allow_group_submission: boolean
  word_limit?: number
  allowed_file_types?: string[]
}

interface Resource {
  id: string
  assignment_id: string
  name: string
  file_type: string
  file_url: string
}

interface Student {
  id: string
  name: string
  email: string
  prn: string
  class: string
}

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submitted_at: string
  status: string
  submission_type: string
  files?: { name: string; file_type: string; file_size: number }[]
  content?: string
  grade?: string
  feedback?: string
  plagiarism_score?: number
  graded_at?: string
}

export default function ManageAssignmentPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotifyDialog, setShowNotifyDialog] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("deadline_reminder")
  const [activeTab, setActiveTab] = useState("submissions")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")

  // Mock data
  const mockResources: Resource[] = [
    {
      id: "res1",
      assignment_id: params.id,
      name: "Priority Queue Example",
      file_type: "application/pdf",
      file_url: "#",
    },
    {
      id: "res2",
      assignment_id: params.id,
      name: "Heap Implementation Guide",
      file_type: "application/docx",
      file_url: "#",
    },
  ]

  const mockClasses = [
    { id: "1", name: "10th Grade" },
    { id: "2", name: "FY CSE" },
    { id: "3", name: "SY CSE" },
  ]

  // Get real students data from localStorage
  const getRealStudentsData = () => {
    try {
      const studentSession = localStorage.getItem('studentSession')
      const currentUser = localStorage.getItem('currentUser')
      const studentsData = localStorage.getItem('students')
      
      let students = []
      
      if (studentSession) {
        const sessionData = JSON.parse(studentSession)
        students.push({
          id: sessionData.id,
          name: sessionData.name || sessionData.full_name,
          email: sessionData.email,
          prn: sessionData.prn || sessionData.id,
          class: `${sessionData.year} ${sessionData.department}`
        })
      }
      
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        if (userData.role === 'student') {
          students.push({
            id: userData.id,
            name: userData.name || userData.full_name,
            email: userData.email,
            prn: userData.prn || userData.id,
            class: `${userData.year} ${userData.department}`
          })
        }
      }
      
      if (studentsData) {
        const studentsArray = JSON.parse(studentsData)
        studentsArray.forEach((student: any) => {
          students.push({
            id: student.id,
            name: student.name || student.full_name,
            email: student.email,
            prn: student.prn || student.id,
            class: `${student.year} ${student.department}`
          })
        })
      }
      
      return students.filter((student, index, self) => 
        index === self.findIndex(s => s.id === student.id)
      )
    } catch (error) {
      console.error('Error loading students:', error)
      return []
    }
  }

  // Get real submissions data from localStorage
  const getRealSubmissionsData = (assignmentId: string) => {
    try {
      const studentSubmissions = localStorage.getItem('studentSubmissions')
      const assignmentSubmissions = localStorage.getItem('assignmentSubmissions')
      
      let submissions = []
      
      if (studentSubmissions) {
        const submissionsData = JSON.parse(studentSubmissions)
        submissions = submissionsData.filter((sub: any) => sub.assignment_id === assignmentId)
      }
      
      if (submissions.length === 0 && assignmentSubmissions) {
        const submissionsData = JSON.parse(assignmentSubmissions)
        submissions = submissionsData.filter((sub: any) => sub.assignmentId === assignmentId)
      }
      
      return submissions.map((sub: any) => ({
        id: sub.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assignment_id: sub.assignment_id || sub.assignmentId,
        student_id: sub.student_id || sub.studentId,
        submitted_at: sub.submitted_at || sub.submittedAt || new Date().toISOString(),
        status: sub.status || 'submitted',
        submission_type: sub.submission_type || sub.submissionType || 'file',
        files: sub.files || (sub.file_name ? [{ 
          name: sub.file_name, 
          file_type: sub.file_type || 'application/pdf', 
          file_size: sub.file_size || 1240000 
        }] : []),
        content: sub.content || sub.text_content,
        grade: sub.grade,
        feedback: sub.feedback,
        plagiarism_score: sub.plagiarism_score || sub.plagiarismScore || Math.floor(Math.random() * 20),
        graded_at: sub.graded_at || sub.gradedAt
      }))
    } catch (error) {
      console.error('Error loading submissions:', error)
      return []
    }
  }

  // Fetch assignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load assignment from localStorage
        const storedAssignments = localStorage.getItem("assignments")
        if (storedAssignments) {
          const assignments = JSON.parse(storedAssignments)
          const foundAssignment = assignments.find((a: any) => a.id.toString() === params.id)
          if (foundAssignment) {
            setAssignment({
              ...foundAssignment,
              class_id: foundAssignment.department,
              due_date: foundAssignment.due_date,
              created_at: foundAssignment.created_at || new Date().toISOString(),
              visibility: foundAssignment.visibility ?? true,
              allow_late_submission: foundAssignment.allow_late_submission ?? true,
              allow_resubmission: foundAssignment.allow_resubmission ?? true,
              enable_plagiarism_check: foundAssignment.enable_plagiarism_check ?? true,
              allow_group_submission: foundAssignment.allow_group_submission ?? false,
              word_limit: foundAssignment.word_limit,
              allowed_file_types: foundAssignment.allowed_file_types,
              total_marks: foundAssignment.max_marks || 100,
              subject: foundAssignment.subject || foundAssignment.title,
              year: foundAssignment.year || foundAssignment.target_years?.[0] || 'N/A'
            })
          } else {
            toast({
              title: "Assignment not found",
              description: "The assignment you're looking for doesn't exist.",
              variant: "destructive",
            })
            router.push("/dashboard/assignments")
            return
          }
        }

        setResources(mockResources)
        setStudents(getRealStudentsData())
        setSubmissions(getRealSubmissionsData(params.id))
      } catch (error) {
        console.error("Error fetching assignment data:", error)
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
  }, [params.id, toast, router])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />
    } else if (fileType.includes("doc")) {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else if (fileType.includes("zip")) {
      return <FileText className="h-4 w-4 text-gray-500" />
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Get student by ID
  const getStudent = (studentId: string) => {
    return students.find((student) => student.id === studentId) || {
      name: "Unknown Student",
      email: "N/A",
      prn: "N/A",
      class: "N/A",
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>
      case "graded":
        return <Badge className="bg-purple-100 text-purple-800">Graded</Badge>
      case "late":
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>
      case "returned":
        return <Badge className="bg-blue-100 text-blue-800">Returned</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    setIsSubmitting(true)

    try {
      // Delete from localStorage
      const storedAssignments = localStorage.getItem("assignments")
      if (storedAssignments) {
        const assignments = JSON.parse(storedAssignments)
        const updatedAssignments = assignments.filter((a: any) => a.id.toString() !== params.id)
        localStorage.setItem("assignments", JSON.stringify(updatedAssignments))
      }

      // Also delete related submissions
      const storedSubmissions = localStorage.getItem("assignmentSubmissions")
      if (storedSubmissions) {
        const allSubmissions = JSON.parse(storedSubmissions)
        const updatedSubmissions = allSubmissions.filter((sub: any) => sub.assignmentId !== params.id)
        localStorage.setItem("assignmentSubmissions", JSON.stringify(updatedSubmissions))
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })

      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle send notification
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, send notification via API (e.g., Supabase)
      toast({
        title: "Success",
        description: "Notification sent successfully",
      })

      setShowNotifyDialog(false)
      setNotificationMessage("")
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle submit grade
  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return

    setIsSubmitting(true)

    try {
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === selectedSubmission.id
          ? { ...sub, grade, feedback, status: "graded", graded_at: new Date().toISOString() }
          : sub,
      )
      setSubmissions(updatedSubmissions)
      localStorage.setItem("assignmentSubmissions", JSON.stringify(updatedSubmissions))

      toast({
        title: "Success",
        description: "Grade and feedback submitted successfully",
      })

      setSelectedSubmission(null)
      setGrade("")
      setFeedback("")
    } catch (error) {
      console.error("Error submitting grade:", error)
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle return for resubmission
  const handleReturnForResubmission = async () => {
    if (!selectedSubmission) return

    setIsSubmitting(true)

    try {
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === selectedSubmission.id
          ? { ...sub, status: "returned", feedback, graded_at: undefined, grade: undefined }
          : sub,
      )
      setSubmissions(updatedSubmissions)
      localStorage.setItem("assignmentSubmissions", JSON.stringify(updatedSubmissions))

      toast({
        title: "Success",
        description: "Submission returned for resubmission",
      })

      setSelectedSubmission(null)
      setFeedback("")
    } catch (error) {
      console.error("Error returning submission:", error)
      toast({
        title: "Error",
        description: "Failed to return submission",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const student = getStudent(sub.student_id)
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return sub.status === filterStatus && matchesSearch
  })

  // Calculate statistics
  const submissionStats = {
    total: submissions.length,
    submitted: submissions.filter((sub) => sub.status === "submitted").length,
    graded: submissions.filter((sub) => sub.status === "graded").length,
    late: submissions.filter((sub) => sub.status === "late").length,
    returned: submissions.filter((sub) => sub.status === "returned").length,
    missing: students.length - submissions.length,
    onTime: submissions.filter((sub) => sub.status !== "late").length,
    highPlagiarism: submissions.filter((sub) => (sub.plagiarism_score || 0) > 10).length,
  }

  // Generate student report
  const generateStudentReport = (submission: Submission) => {
    const student = getStudent(submission.student_id)

    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow popups to generate the report",
        variant: "destructive",
      })
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Submission Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .report {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5em;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
              padding: 20px;
              border-radius: 10px;
              background: #f8f9fa;
              border-left: 4px solid #667eea;
            }
            .section h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 1.3em;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .grade-section {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 15px;
              margin: 20px 0;
            }
            .grade-number {
              font-size: 4em;
              font-weight: bold;
              margin: 10px 0;
            }
            .plagiarism-section {
              background: ${submission.plagiarism_score && submission.plagiarism_score > 10 ? "#fee2e2" : submission.plagiarism_score && submission.plagiarism_score > 5 ? "#fef3c7" : "#dcfce7"};
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid ${submission.plagiarism_score && submission.plagiarism_score > 10 ? "#ef4444" : submission.plagiarism_score && submission.plagiarism_score > 5 ? "#f59e0b" : "#22c55e"};
            }
            .files-list {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              border-top: 1px solid #eee;
              margin-top: 30px;
            }
            @media print {
              body { background: white; }
              .report { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <h1>📋 Student Submission Report</h1>
              <p>EduVision Learning Platform</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>👨‍🎓 Student Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span>${student.name}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">PRN:</span>
                    <span>${student.prn || "N/A"}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">College:</span>
                    <span>Universal College of Engineering</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Department:</span>
                    <span>Computer Science & Engineering</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Class:</span>
                    <span>${student.class}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span>${student.email}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>📚 Assignment Details</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Title:</span>
                    <span>${assignment?.title}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Submission Date:</span>
                    <span>${formatDate(submission.submitted_at)}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span>${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span>${submission.submission_type === "file" ? "File Upload" : "Text Submission"}</span>
                  </div>
                </div>
              </div>

              ${
                submission.grade
                  ? `
                <div class="grade-section">
                  <h2>🎯 Grade Assigned</h2>
                  <div class="grade-number">${submission.grade}</div>
                  <div style="font-size: 1.2em; margin: 10px 0;">Grade Assigned by Faculty</div>
                </div>
              `
                  : ""
              }

              <div class="plagiarism-section">
                <h3>🛡️ Plagiarism Analysis</h3>
                <div style="font-size: 2em; font-weight: bold; margin: 10px 0; color: ${submission.plagiarism_score && submission.plagiarism_score > 10 ? "#dc2626" : submission.plagiarism_score && submission.plagiarism_score > 5 ? "#d97706" : "#16a34a"};">
                  ${submission.plagiarism_score || 0}% Similarity
                </div>
                <p style="margin: 0; color: #666;">
                  ${
                    submission.plagiarism_score && submission.plagiarism_score > 10
                      ? "High similarity detected - requires review"
                      : submission.plagiarism_score && submission.plagiarism_score > 5
                        ? "Moderate similarity - acceptable range"
                        : "Low similarity - original work"
                  }
                </p>
              </div>

              ${
                submission.files && submission.files.length > 0
                  ? `
                <div class="section">
                  <h3>📎 Submitted Files</h3>
                  <div class="files-list">
                    ${submission.files
                      .map(
                        (file) => `
                      <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px;">
                        <strong>${file.name}</strong><br>
                        <small style="color: #666;">Size: ${formatFileSize(file.file_size)} | Type: ${file.file_type}</small>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }

              ${
                submission.content
                  ? `
                <div class="section">
                  <h3>📝 Text Submission</h3>
                  <div style="background: white; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: monospace;">
                    ${submission.content}
                  </div>
                </div>
              `
                  : ""
              }

              ${
                submission.feedback
                  ? `
                <div class="section">
                  <h3>💬 Faculty Feedback</h3>
                  <div style="background: white; padding: 15px; border-radius: 8px;">
                    ${submission.feedback}
                  </div>
                </div>
              `
                  : ""
              }
            </div>

            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()} | EduVision Learning Platform</p>
              <p>This is an automatically generated report</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      toast({
        title: "Success",
        description: "Student report generated successfully!",
      })
    }, 500)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/assignments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Manage Assignment</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/edit/${params.id}`)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/submissions/${params.id}`)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Submissions
          </Button>
          <Button variant="outline" onClick={() => setShowNotifyDialog(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{assignment.title}</h2>
              <p className="text-gray-500 mb-4">
                Class: {mockClasses.find((c) => c.id === assignment.class_id)?.name || assignment.department || "Unknown Class"}
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="bg-gray-100">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due: {formatDate(assignment.due_date)}
                </Badge>

                <Badge variant="outline" className="bg-gray-100">
                  <Clock className="h-3 w-3 mr-1" />
                  Created: {formatDate(assignment.created_at)}
                </Badge>

                <Badge variant="outline" className="bg-gray-100">
                  <FileText className="h-3 w-3 mr-1" />
                  Type: {assignment.assignment_type?.replace("_", " ") || "Assignment"}
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Description:</h3>
                <div className="text-gray-700 whitespace-pre-line">{assignment.description}</div>
              </div>

              {resources.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Resources:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resources.map((resource) => (
                      <Button
                        key={resource.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs bg-transparent"
                        asChild
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          {getFileIcon(resource.file_type)}
                          <span className="ml-1">{resource.name}</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium mb-3">Settings:</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{assignment.status || "Published"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{assignment.department || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{assignment.year || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{assignment.subject || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{assignment.total_marks || 100}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visibility:</span>
                  <span className="font-medium">{assignment.visibility ? "Visible to students" : "Hidden"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Late Submission:</span>
                  <span className="font-medium">{assignment.allow_late_submission ? "Allowed" : "Not allowed"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resubmission:</span>
                  <span className="font-medium">{assignment.allow_resubmission ? "Allowed" : "Not allowed"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plagiarism Check:</span>
                  <span className="font-medium">{assignment.enable_plagiarism_check ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Group Submission:</span>
                  <span className="font-medium">{assignment.allow_group_submission ? "Allowed" : "Not allowed"}</span>
                </div>

                {assignment.word_limit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Word Limit:</span>
                    <span className="font-medium">{assignment.word_limit} words</span>
                  </div>
                )}

                {assignment.allowed_file_types && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allowed File Types:</span>
                    <span className="font-medium">
                      {assignment.allowed_file_types.map((type: string) => `.${type}`).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="submissions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="submissions"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <Users className="mr-2 h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search by student name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Plagiarism</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No submissions found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions.map((submission) => {
                        const student = getStudent(submission.student_id)

                        return (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                            <TableCell>
                              {submission.submitted_at ? formatDate(submission.submitted_at) : "N/A"}
                            </TableCell>
                            <TableCell>
                              {submission.files && submission.files.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {submission.files.map((file: any, index: number) => (
                                    <div key={index} className="flex items-center">
                                      {getFileIcon(file.file_type)}
                                      <span className="ml-1">{file.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : submission.submission_type === "text" ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  Text Submission
                                </Badge>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.plagiarism_score !== undefined ? (
                                <div className="flex items-center">
                                  <div
                                    className={`h-2 w-2 rounded-full mr-1.5 ${
                                      submission.plagiarism_score > 10
                                        ? "bg-red-500"
                                        : submission.plagiarism_score > 5
                                          ? "bg-amber-500"
                                          : "bg-green-500"
                                    }`}
                                  ></div>
                                  <span
                                    className={
                                      submission.plagiarism_score > 10
                                        ? "text-red-600 font-medium"
                                        : submission.plagiarism_score > 5
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    }
                                  >
                                    {submission.plagiarism_score}%
                                  </span>
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.grade ? (
                                <Badge className="bg-purple-100 text-purple-800">{submission.grade}</Badge>
                              ) : (
                                "Not graded"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setFeedback(submission.feedback || "")
                                    setGrade(submission.grade || "")
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateStudentReport(submission)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <FileText className="mr-1 h-3 w-3" />
                                  Report
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {submissionStats.total} / {students.length}
                </div>
                <Progress value={(submissionStats.total / students.length) * 100} className="h-2 mb-2" />
                <div className="text-xs text-gray-500">{submissionStats.missing} students haven't submitted</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Grading Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {submissionStats.graded} / {submissionStats.total}
                </div>
                <Progress
                  value={submissionStats.total ? (submissionStats.graded / submissionStats.total) * 100 : 0}
                  className="h-2 mb-2"
                />
                <div className="text-xs text-gray-500">
                  {submissionStats.total - submissionStats.graded} submissions need grading
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Plagiarism Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{submissionStats.highPlagiarism}</div>
                <Progress
                  value={submissionStats.total ? (submissionStats.highPlagiarism / submissionStats.total) * 100 : 0}
                  className="h-2 mb-2 bg-red-100"
                  indicatorClassName="bg-red-500"
                />
                <div className="text-xs text-gray-500">
                  {submissionStats.highPlagiarism} submissions with high similarity ({">"}10%)
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Submission Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Submission timeline chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Submission Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Submitted On Time</span>
                      <span>{submissionStats.onTime}</span>
                    </div>
                    <Progress value={(submissionStats.onTime / students.length) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Late Submissions</span>
                      <span>{submissionStats.late}</span>
                    </div>
                    <Progress
                      value={(submissionStats.late / students.length) * 100}
                      className="h-2"
                      indicatorClassName="bg-orange-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Graded</span>
                      <span>{submissionStats.graded}</span>
                    </div>
                    <Progress
                      value={(submissionStats.graded / students.length) * 100}
                      className="h-2"
                      indicatorClassName="bg-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Returned for Revision</span>
                      <span>{submissionStats.returned}</span>
                    </div>
                    <Progress
                      value={(submissionStats.returned / students.length) * 100}
                      className="h-2"
                      indicatorClassName="bg-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Missing</span>
                      <span>{submissionStats.missing}</span>
                    </div>
                    <Progress
                      value={(submissionStats.missing / students.length) * 100}
                      className="h-2"
                      indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View/Grade Submission Dialog */}
      <Dialog open={selectedSubmission !== null} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSubmission && (
              <>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-medium">{getStudent(selectedSubmission.student_id).name}</h3>
                    <p className="text-sm text-gray-500">{getStudent(selectedSubmission.student_id).email}</p>
                  </div>

                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">Status:</div>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="bg-gray-100">
                    <Calendar className="h-3 w-3 mr-1" />
                    Submitted: {formatDate(selectedSubmission.submitted_at)}
                  </Badge>

                  {selectedSubmission.plagiarism_score !== undefined && (
                    <Badge
                      variant="outline"
                      className={
                        selectedSubmission.plagiarism_score > 10
                          ? "bg-red-100 text-red-800"
                          : selectedSubmission.plagiarism_score > 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Similarity: {selectedSubmission.plagiarism_score}%
                    </Badge>
                  )}

                  {selectedSubmission.graded_at && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      <Check className="h-3 w-3 mr-1" />
                      Graded: {formatDate(selectedSubmission.graded_at)}
                    </Badge>
                  )}
                </div>

                {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Submitted Files:</h4>
                    <div className="space-y-2">
                      {selectedSubmission.files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                          <div className="flex items-center">
                            {getFileIcon(file.file_type)}
                            <span className="ml-2">{file.name}</span>
                            <span className="ml-2 text-xs text-gray-500">({formatFileSize(file.file_size)})</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.submission_type === "text" && selectedSubmission.content && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Text Submission:</h4>
                    <div className="bg-white p-3 rounded-md border whitespace-pre-wrap">
                      {selectedSubmission.content}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="grade" className="text-base">
                      Grade
                    </Label>
                    <Input
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Enter grade (e.g., A, B+, 95)"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="feedback" className="text-base">
                      Feedback
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student"
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                      Cancel
                    </Button>

                    {assignment.allow_resubmission && (
                      <Button variant="outline" onClick={handleReturnForResubmission} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            Returning...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Return for Resubmission
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmitGrade}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Grade
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Are you sure you want to delete this assignment?</h4>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone. All submissions and grades associated with this assignment will be
                  permanently deleted.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssignment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                  <SelectItem value="missing_submission">Missing Submission</SelectItem>
                  <SelectItem value="feedback_available">Feedback Available</SelectItem>
                  <SelectItem value="resubmission_request">Resubmission Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notificationMessage" className="text-base">
                Message
              </Label>
              <Textarea
                id="notificationMessage"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message"
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-start">
                <Bell className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">Notification will be sent to:</h4>
                  <p className="text-amber-700 text-xs mt-1">
                    All students in {mockClasses.find((c) => c.id === assignment.class_id)?.name || "the selected class"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSendNotification}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}