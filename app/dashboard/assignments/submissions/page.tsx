"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Search,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
  Shield,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Users,
  BarChart3,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import AutoGradingSystem from "@/components/auto-grading/AutoGradingSystem"

export default function SubmissionsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("submissionDate")
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [grade, setGrade] = useState("")
  const [showAutoGrading, setShowAutoGrading] = useState(false)
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false)

  // Mock classes data
  const classes = [
    { id: "1", name: "DSY CSE" },
    { id: "2", name: "FY CSE" },
    { id: "3", name: "DSY CY" },
    { id: "4", name: "TY IT" },
    { id: "5", name: "FY ME" },
    { id: "6", name: "DSY EE" },
  ]

  // Load submissions from localStorage with sample data
  useEffect(() => {
    const loadSubmissions = () => {
      try {
        setLoading(true)
        let storedSubmissions = JSON.parse(localStorage.getItem("facultySubmissions") || "[]")
        
        // Add sample submissions if none exist
        if (storedSubmissions.length === 0) {
          const sampleSubmissions = [
            {
              id: "sub_001",
              studentId: "student_001",
              studentName: "Alice Johnson",
              studentPRN: "CSE2021001",
              assignmentTitle: "Data Structures Implementation",
              className: "1",
              submissionType: "file",
              content: "This assignment demonstrates the implementation of various data structures including linked lists, stacks, queues, and binary trees. The code is well-documented and follows best practices for memory management and algorithmic efficiency. Each data structure includes comprehensive test cases and performance analysis.",
              files: [
                { name: "LinkedList.cpp", size: "2.5 MB" },
                { name: "Stack.h", size: "1.2 MB" },
                { name: "TestCases.txt", size: "0.8 MB" }
              ],
              submittedAt: new Date(Date.now() - 86400000).toISOString(),
              status: "submitted",
              plagiarismScore: 5
            },
            {
              id: "sub_002",
              studentId: "student_002",
              studentName: "Bob Smith",
              studentPRN: "CSE2021002",
              assignmentTitle: "Database Design Project",
              className: "1",
              submissionType: "file",
              content: "Complete database design for an e-commerce platform including entity-relationship diagrams, normalization analysis, and SQL implementation. The project covers all aspects of database design from conceptual modeling to physical implementation with proper indexing strategies.",
              files: [
                { name: "ERDiagram.pdf", size: "3.1 MB" },
                { name: "DatabaseSchema.sql", size: "1.8 MB" },
                { name: "Documentation.docx", size: "2.2 MB" }
              ],
              submittedAt: new Date(Date.now() - 172800000).toISOString(),
              status: "submitted",
              plagiarismScore: 12
            },
            {
              id: "sub_003",
              studentId: "student_003",
              studentName: "Carol Davis",
              studentPRN: "CSE2021003",
              assignmentTitle: "Machine Learning Algorithm Analysis",
              className: "2",
              submissionType: "file",
              content: "Comprehensive analysis of supervised learning algorithms including decision trees, random forests, and neural networks. Implementation includes performance comparison, hyperparameter tuning, and cross-validation techniques with real-world datasets.",
              files: [
                { name: "MLAnalysis.py", size: "4.2 MB" },
                { name: "Results.xlsx", size: "1.5 MB" },
                { name: "Report.pdf", size: "3.8 MB" }
              ],
              submittedAt: new Date(Date.now() - 259200000).toISOString(),
              status: "submitted",
              plagiarismScore: 18
            },
            {
              id: "sub_004",
              studentId: "student_004",
              studentName: "David Wilson",
              studentPRN: "CSE2021004",
              assignmentTitle: "Web Development Portfolio",
              className: "2",
              submissionType: "file",
              content: "Full-stack web application built with React, Node.js, and MongoDB. Features include user authentication, real-time messaging, responsive design, and RESTful API implementation. The project demonstrates modern web development practices and deployment strategies.",
              files: [
                { name: "frontend.zip", size: "15.2 MB" },
                { name: "backend.zip", size: "8.7 MB" },
                { name: "deployment-guide.md", size: "0.5 MB" }
              ],
              submittedAt: new Date(Date.now() - 345600000).toISOString(),
              status: "submitted",
              plagiarismScore: 7
            },
            {
              id: "sub_005",
              studentId: "student_005",
              studentName: "Eva Brown",
              studentPRN: "CSE2021005",
              assignmentTitle: "Cybersecurity Risk Assessment",
              className: "3",
              submissionType: "file",
              content: "Detailed cybersecurity risk assessment for a fictional organization including threat modeling, vulnerability analysis, and mitigation strategies. The report covers network security, application security, and compliance requirements with industry standards.",
              files: [
                { name: "RiskAssessment.pdf", size: "5.1 MB" },
                { name: "ThreatModel.xlsx", size: "2.3 MB" },
                { name: "Recommendations.docx", size: "1.9 MB" }
              ],
              submittedAt: new Date(Date.now() - 432000000).toISOString(),
              status: "submitted",
              plagiarismScore: 22
            }
          ]
          
          localStorage.setItem("facultySubmissions", JSON.stringify(sampleSubmissions))
          storedSubmissions = sampleSubmissions
          setSampleDataLoaded(true)
        }
        
        setSubmissions(storedSubmissions)
      } catch (error) {
        console.error("Error loading submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  // Filter and sort submissions
  const getFilteredAndSortedSubmissions = () => {
    let filtered = [...submissions]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.studentPRN.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply class filter
    if (filterClass !== "all") {
      filtered = filtered.filter((sub) => sub.className === filterClass)
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((sub) => sub.status === filterStatus)
    }

    // Sort submissions
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "submissionDate":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case "studentName":
          return a.studentName.localeCompare(b.studentName)
        case "assignmentTitle":
          return a.assignmentTitle.localeCompare(b.assignmentTitle)
        case "plagiarismScore":
          return (b.plagiarismScore || 0) - (a.plagiarismScore || 0)
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      }
    })
  }

  // Generate detailed report
  const generateReport = (submission) => {
    const report = {
      studentInfo: {
        name: submission.studentName,
        prn: submission.studentPRN,
        className: classes.find((c) => c.id === submission.className)?.name || "Unknown Class",
      },
      assignmentInfo: {
        title: submission.assignmentTitle,
        submissionDate: new Date(submission.submittedAt).toLocaleString(),
        submissionTime: new Date(submission.submittedAt).toLocaleTimeString(),
        status: submission.status,
      },
      submissionDetails: {
        type: submission.submissionType,
        filesCount: submission.files?.length || 0,
        files: submission.files || [],
        textContent: submission.content || "",
        totalSize:
          submission.files
            ?.reduce((total, file) => {
              const sizeInMB = Number.parseFloat(file.size.replace(" MB", ""))
              return total + sizeInMB
            }, 0)
            .toFixed(2) + " MB" || "0 MB",
      },
      plagiarismCheck: {
        score: submission.plagiarismScore || 0,
        status:
          submission.plagiarismScore > 15 ? "High Risk" : submission.plagiarismScore > 8 ? "Medium Risk" : "Low Risk",
        sources: submission.plagiarismSources || [],
      },
      analytics: {
        submissionTiming: calculateSubmissionTiming(submission.submittedAt),
        fileTypes: getFileTypes(submission.files || []),
        wordCount: submission.content ? submission.content.split(" ").length : 0,
      },
    }

    return report
  }

  // Calculate submission timing
  const calculateSubmissionTiming = (submittedAt) => {
    // This would normally compare with assignment due date
    const submissionDate = new Date(submittedAt)
    const now = new Date()
    const diffHours = Math.abs(now - submissionDate) / (1000 * 60 * 60)

    if (diffHours < 24) {
      return "Recent submission"
    } else if (diffHours < 72) {
      return "Submitted within 3 days"
    } else {
      return "Earlier submission"
    }
  }

  // Get file types distribution
  const getFileTypes = (files) => {
    const types = {}
    files.forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "unknown"
      types[extension] = (types[extension] || 0) + 1
    })
    return types
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>
      case "graded":
        return <Badge className="bg-purple-100 text-purple-800">Graded</Badge>
      case "late":
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Get plagiarism badge
  const getPlagiarismBadge = (score) => {
    if (score > 15) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High ({score}%)
        </Badge>
      )
    } else if (score > 8) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Medium ({score}%)
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Low ({score}%)
        </Badge>
      )
    }
  }

  // Get file icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileText className="h-4 w-4 text-green-500" />
      case "ppt":
      case "pptx":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Handle grade submission
  const handleGradeSubmission = () => {
    if (!grade) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive",
      })
      return
    }

    // Update submission with grade and feedback
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          status: "graded",
          grade: Number.parseFloat(grade),
          feedback: feedback,
          gradedAt: new Date().toISOString(),
        }
      }
      return sub
    })

    setSubmissions(updatedSubmissions)
    localStorage.setItem("facultySubmissions", JSON.stringify(updatedSubmissions))

    // Also update student submissions
    const studentSubmissions = JSON.parse(localStorage.getItem("studentSubmissions") || "[]")
    const updatedStudentSubmissions = studentSubmissions.map((sub) => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          status: "graded",
          grade: Number.parseFloat(grade),
          feedback: feedback,
          gradedAt: new Date().toISOString(),
        }
      }
      return sub
    })
    localStorage.setItem("studentSubmissions", JSON.stringify(updatedStudentSubmissions))

    setSelectedSubmission(null)
    setGrade("")
    setFeedback("")

    toast({
      title: "Success",
      description: "Grade and feedback have been saved successfully.",
    })
  }

  // Handle auto-grading completion
  const handleAutoGradingComplete = (gradedSubmissions) => {
    setSubmissions(gradedSubmissions)
    localStorage.setItem("facultySubmissions", JSON.stringify(gradedSubmissions))
    
    // Also update student submissions
    const studentSubmissions = JSON.parse(localStorage.getItem("studentSubmissions") || "[]")
    const updatedStudentSubmissions = studentSubmissions.map((studentSub) => {
      const graded = gradedSubmissions.find(g => g.id === studentSub.id)
      return graded ? { ...studentSub, ...graded } : studentSub
    })
    localStorage.setItem("studentSubmissions", JSON.stringify(updatedStudentSubmissions))
    
    setShowAutoGrading(false)
    toast({
      title: "Auto-Grading Complete",
      description: `Successfully processed ${gradedSubmissions.length} submissions with AI-powered grading and plagiarism detection.`,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Assignment Submissions</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAutoGrading(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={submissions.length === 0}
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Auto-Grade ({submissions.filter(s => s.status === 'submitted').length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Students</p>
                <p className="text-2xl font-bold">{new Set(submissions.map((s) => s.studentId)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">High Plagiarism</p>
                <p className="text-2xl font-bold">{submissions.filter((s) => s.plagiarismScore > 15).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-bold">{submissions.filter((s) => s.status === "graded").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by student name, PRN, or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submissionDate">Sort by Date</SelectItem>
              <SelectItem value="studentName">Sort by Student</SelectItem>
              <SelectItem value="assignmentTitle">Sort by Assignment</SelectItem>
              <SelectItem value="plagiarismScore">Sort by Plagiarism</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {getFilteredAndSortedSubmissions().length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">No submissions match your current filters.</p>
          </div>
        ) : (
          getFilteredAndSortedSubmissions().map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={submission.plagiarismScore > 15 ? "border-l-4 border-l-red-500" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{submission.assignmentTitle}</h3>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span className="font-medium">{submission.studentName}</span>
                          <span className="ml-2 text-gray-500">({submission.studentPRN})</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          <span>{classes.find((c) => c.id === submission.className)?.name || "Unknown Class"}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {submission.submissionType === "file" ? "File Upload" : "Text Entry"}
                        </Badge>

                        {submission.files && submission.files.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {submission.files.length} file(s)
                          </Badge>
                        )}

                        {submission.plagiarismScore !== null && (
                          <div className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {getPlagiarismBadge(submission.plagiarismScore)}
                          </div>
                        )}

                        {submission.grade && (
                          <Badge className="bg-purple-100 text-purple-800">Grade: {submission.grade}/100</Badge>
                        )}
                      </div>

                      {submission.files && submission.files.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Submitted files:</p>
                          <div className="flex flex-wrap gap-1">
                            {submission.files.slice(0, 3).map((file, index) => (
                              <div key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                                {getFileIcon(file.name)}
                                <span className="ml-1">{file.name}</span>
                              </div>
                            ))}
                            {submission.files.length > 3 && (
                              <span className="text-xs text-gray-500">+{submission.files.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowReport(true)
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Report
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(submission)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>

                      {submission.status !== "graded" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setGrade(submission.grade?.toString() || "")
                            setFeedback(submission.feedback || "")
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Detailed Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Submission Report
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {(() => {
                const report = generateReport(selectedSubmission)
                return (
                  <>
                    {/* Student Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <User className="mr-2 h-5 w-5" />
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Name</Label>
                            <p className="text-sm text-gray-600">{report.studentInfo.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">PRN</Label>
                            <p className="text-sm text-gray-600">{report.studentInfo.prn}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Class</Label>
                            <p className="text-sm text-gray-600">{report.studentInfo.className}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Assignment Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Assignment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Assignment Title</Label>
                            <p className="text-sm text-gray-600">{report.assignmentInfo.title}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Submission Date</Label>
                            <p className="text-sm text-gray-600">{report.assignmentInfo.submissionDate}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Submission Time</Label>
                            <p className="text-sm text-gray-600">{report.assignmentInfo.submissionTime}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="mt-1">{getStatusBadge(report.assignmentInfo.status)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submission Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Upload className="mr-2 h-5 w-5" />
                          Submission Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Type</Label>
                              <p className="text-sm text-gray-600 capitalize">{report.submissionDetails.type}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Files Count</Label>
                              <p className="text-sm text-gray-600">{report.submissionDetails.filesCount}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Total Size</Label>
                              <p className="text-sm text-gray-600">{report.submissionDetails.totalSize}</p>
                            </div>
                          </div>

                          {report.submissionDetails.files.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Submitted Files</Label>
                              <div className="space-y-2">
                                {report.submissionDetails.files.map((file, index) => (
                                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                                    {getFileIcon(file.name)}
                                    <span className="ml-2 text-sm">{file.name}</span>
                                    <span className="ml-auto text-xs text-gray-500">{file.size}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {report.submissionDetails.textContent && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Text Content</Label>
                              <div className="p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap">{report.submissionDetails.textContent}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Plagiarism Check */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Shield className="mr-2 h-5 w-5" />
                          Plagiarism Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Similarity Score</Label>
                              <p className="text-2xl font-bold">{report.plagiarismCheck.score}%</p>
                            </div>
                            <div className="text-right">
                              <Label className="text-sm font-medium">Risk Level</Label>
                              <div className="mt-1">{getPlagiarismBadge(report.plagiarismCheck.score)}</div>
                            </div>
                          </div>

                          <div>
                            <Progress value={report.plagiarismCheck.score} className="h-3" />
                          </div>

                          {report.plagiarismCheck.sources.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Similar Sources Found</Label>
                              <div className="space-y-2">
                                {report.plagiarismCheck.sources.map((source, index) => (
                                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-medium">{source.title}</p>
                                    <p className="text-xs text-gray-600">{source.url}</p>
                                    <p className="text-xs text-red-600">Similarity: {source.similarity}%</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5" />
                          Submission Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Submission Timing</Label>
                            <p className="text-sm text-gray-600">{report.analytics.submissionTiming}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Word Count</Label>
                            <p className="text-sm text-gray-600">{report.analytics.wordCount} words</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">File Types</Label>
                            <div className="text-sm text-gray-600">
                              {Object.entries(report.analytics.fileTypes).map(([type, count]) => (
                                <span key={type} className="mr-2">
                                  .{type} ({count})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>
              Close Report
            </Button>
            <Button onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">
              <Download className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={selectedSubmission !== null && !showReport} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Grade Submission
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium">{selectedSubmission.assignmentTitle}</h4>
                <p className="text-sm text-gray-600">
                  Student: {selectedSubmission.studentName} ({selectedSubmission.studentPRN})
                </p>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="grade" className="text-sm font-medium">
                  Grade (out of 100)
                </Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Enter grade"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Feedback
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the student..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Submitted Files</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedSubmission.files.map((file, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                        {getFileIcon(file.name)}
                        <span className="ml-2 text-sm">{file.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{file.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.content && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Text Submission</Label>
                  <div className="p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedSubmission.content}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button onClick={handleGradeSubmission} className="bg-purple-600 hover:bg-purple-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Grading System Dialog */}
      <Dialog open={showAutoGrading} onOpenChange={setShowAutoGrading}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              AI-Powered Auto-Grading System
            </DialogTitle>
          </DialogHeader>
          
          <AutoGradingSystem 
            submissions={submissions.filter(s => s.status === 'submitted')}
            onGradingComplete={handleAutoGradingComplete}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoGrading(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
