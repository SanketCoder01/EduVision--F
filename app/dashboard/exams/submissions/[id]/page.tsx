"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Check, 
  AlertTriangle, 
  Search, 
  Users,
  Clock,
  GraduationCap,
  FileCheck,
  Eye,
  Monitor,
  Shield
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

interface ExamSubmission {
  id: string
  student_id: string
  student_name: string
  exam_id: string
  status: 'completed' | 'in_progress' | 'not_started' | 'auto_submitted'
  start_time: string
  end_time?: string
  duration_taken: number
  total_duration: number
  score?: number
  total_marks: number
  answers: Array<{
    question_id: number
    answer: string
    is_correct?: boolean
    points_earned?: number
  }>
  violations: Array<{
    type: string
    timestamp: string
    details: string
  }>
  auto_grade?: number
  manual_grade?: number
  feedback?: string
}

export default function ExamSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadExamData()
  }, [params.id])

  const loadExamData = () => {
    // Mock data for demonstration
    const mockExam = {
      id: params.id,
      title: "Data Structures Final Exam",
      department: "CSE",
      year: "2nd Year",
      duration: 120,
      total_marks: 100,
      questions: [
        { id: 1, question: "What is a binary tree?", points: 10, type: "text" },
        { id: 2, question: "Implement a stack using arrays", points: 20, type: "code" },
        { id: 3, question: "Time complexity of binary search", points: 10, type: "mcq" }
      ]
    }

    const mockSubmissions: ExamSubmission[] = [
      {
        id: "sub1",
        student_id: "s1",
        student_name: "John Doe",
        exam_id: params.id as string,
        status: "completed",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:45:00Z",
        duration_taken: 105,
        total_duration: 120,
        score: 85,
        total_marks: 100,
        answers: [
          { question_id: 1, answer: "A hierarchical data structure...", is_correct: true, points_earned: 10 },
          { question_id: 2, answer: "class Stack { ... }", is_correct: true, points_earned: 18 },
          { question_id: 3, answer: "O(log n)", is_correct: true, points_earned: 10 }
        ],
        violations: [],
        auto_grade: 85,
        manual_grade: 85
      },
      {
        id: "sub2",
        student_id: "s2",
        student_name: "Jane Smith",
        exam_id: params.id as string,
        status: "auto_submitted",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
        duration_taken: 120,
        total_duration: 120,
        score: 65,
        total_marks: 100,
        answers: [
          { question_id: 1, answer: "A tree structure...", is_correct: true, points_earned: 8 },
          { question_id: 2, answer: "Incomplete code", is_correct: false, points_earned: 5 },
          { question_id: 3, answer: "O(n)", is_correct: false, points_earned: 0 }
        ],
        violations: [
          { type: "tab_switch", timestamp: "2024-01-15T10:30:00Z", details: "Switched tabs 3 times" },
          { type: "copy_paste", timestamp: "2024-01-15T11:15:00Z", details: "Attempted to paste content" }
        ],
        auto_grade: 65
      },
      {
        id: "sub3",
        student_id: "s3",
        student_name: "Mike Johnson",
        exam_id: params.id as string,
        status: "in_progress",
        start_time: "2024-01-15T10:00:00Z",
        duration_taken: 45,
        total_duration: 120,
        total_marks: 100,
        answers: [
          { question_id: 1, answer: "Working on it...", points_earned: 0 }
        ],
        violations: []
      }
    ]

    setExam(mockExam)
    setSubmissions(mockSubmissions)
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "auto_submitted": return "bg-orange-100 text-orange-800"
      case "not_started": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const completedCount = submissions.filter(s => s.status === 'completed' || s.status === 'auto_submitted').length
  const inProgressCount = submissions.filter(s => s.status === 'in_progress').length
  const averageScore = completedCount > 0 
    ? (submissions.filter(s => s.score).reduce((sum, s) => sum + (s.score || 0), 0) / completedCount).toFixed(1)
    : 0
  const violationsCount = submissions.reduce((sum, s) => sum + s.violations.length, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{exam?.title}</h1>
            <p className="text-lg text-gray-600 mt-1">
              Exam Submissions - {exam?.department} {exam?.year}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/exams/view")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <FileCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{averageScore}</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{violationsCount}</p>
                  <p className="text-sm text-gray-600">Total Violations</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="auto_submitted">Auto Submitted</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No submissions found</h3>
                <p className="text-gray-500">No submissions match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {submission.student_name}
                          </h3>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {submission.violations.length > 0 && (
                            <Badge variant="outline" className="border-red-200 text-red-700">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {submission.violations.length} Violations
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Score:</span> {submission.score || 'N/A'}/{submission.total_marks}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {formatDuration(submission.duration_taken)}/{formatDuration(submission.total_duration)}
                          </div>
                          <div>
                            <span className="font-medium">Progress:</span> {Math.round((submission.duration_taken / submission.total_duration) * 100)}%
                          </div>
                          <div>
                            <span className="font-medium">Answers:</span> {submission.answers.length}/{exam?.questions.length || 0}
                          </div>
                        </div>

                        {submission.status === 'in_progress' && (
                          <Progress 
                            value={(submission.duration_taken / submission.total_duration) * 100} 
                            className="h-2 mb-2"
                          />
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedSubmission?.student_name} - Exam Submission
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Submission Overview */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1">Status</h4>
                                  <Badge className={selectedSubmission && getStatusColor(selectedSubmission.status)}>
                                    {selectedSubmission?.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Score</h4>
                                  <p className="text-gray-600">
                                    {selectedSubmission?.score || 'N/A'}/{selectedSubmission?.total_marks}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Time Taken</h4>
                                  <p className="text-gray-600">
                                    {selectedSubmission && formatDuration(selectedSubmission.duration_taken)}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Auto Grade</h4>
                                  <p className="text-gray-600">
                                    {selectedSubmission?.auto_grade || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Answers */}
                              <div>
                                <h4 className="font-semibold mb-3">Answers</h4>
                                <div className="space-y-4">
                                  {selectedSubmission?.answers.map((answer, idx) => (
                                    <div key={idx} className="border rounded p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium">Question {answer.question_id}</h5>
                                        {answer.is_correct !== undefined && (
                                          <Badge className={answer.is_correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                            {answer.points_earned || 0} pts
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {exam?.questions.find((q: any) => q.id === answer.question_id)?.question}
                                      </p>
                                      <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm">{answer.answer}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Violations */}
                              {selectedSubmission && selectedSubmission.violations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">Security Violations</h4>
                                  <div className="space-y-2">
                                    {selectedSubmission.violations.map((violation, idx) => (
                                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                          <strong className="text-red-800">
                                            {violation.type.replace('_', ' ').toUpperCase()}
                                          </strong>
                                          <span className="text-red-600 text-xs">
                                            {new Date(violation.timestamp).toLocaleTimeString()}
                                          </span>
                                        </div>
                                        <p className="text-red-700 text-sm">{violation.details}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Manual Grading */}
                              {selectedSubmission?.status === 'completed' && (
                                <div>
                                  <h4 className="font-semibold mb-3">Manual Review</h4>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        Manual Grade Override
                                      </label>
                                      <Input
                                        type="number"
                                        placeholder="Enter manual grade"
                                        defaultValue={selectedSubmission.manual_grade}
                                        max={selectedSubmission.total_marks}
                                        min={0}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        Feedback
                                      </label>
                                      <Textarea
                                        placeholder="Add feedback for the student..."
                                        defaultValue={selectedSubmission.feedback}
                                        rows={4}
                                      />
                                    </div>
                                    <Button>Save Manual Grade</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {submission.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Monitor className="h-4 w-4 mr-1" />
                            Monitor Live
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
