"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Download,
  Eye,
  Users,
  CheckCircle,
  X,
  Code,
  AlertTriangle,
  FileText,
  Clock,
  Award
} from "lucide-react"

interface Exam {
  id: number
  title: string
  facultyName: string
  department: string
  studyingYear: string
  language: string
  createdDate: string
  examDate: string
  duration: string
  totalMarks: string
  status: 'scheduled' | 'ongoing' | 'completed'
  studentsEnrolled: number
  submissions: number
  description: string
}

interface StudentSubmission {
  id: number
  name: string
  rollNo: string
  email: string
  submissionStatus: 'submitted' | 'not_submitted' | 'in_progress'
  submittedAt?: string
  score?: number
  timeSpent: string
  code: string
  language: string
  testsPassed: number
  totalTests: number
  violations: number
  warnings: number
  cameraStatus: 'active' | 'inactive' | 'blocked'
  tabSwitches: number
}

export default function ExamSubmissions() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null)

  // Mock exams data
  const [exams] = useState<Exam[]>([
    {
      id: 1,
      title: "Java Programming Final Exam",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "2nd Year",
      language: "Java",
      createdDate: "2024-01-10",
      examDate: "2024-01-15",
      duration: "3 hours",
      totalMarks: "100",
      status: "completed",
      studentsEnrolled: 28,
      submissions: 25,
      description: "Comprehensive Java programming exam covering OOP concepts, data structures, and algorithms."
    },
    {
      id: 2,
      title: "Python Data Science Exam",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "3rd Year",
      language: "Python",
      createdDate: "2024-01-08",
      examDate: "2024-01-12",
      duration: "2.5 hours",
      totalMarks: "80",
      status: "completed",
      studentsEnrolled: 25,
      submissions: 23,
      description: "Python exam focusing on data manipulation, analysis, and machine learning basics."
    },
    {
      id: 3,
      title: "C++ Advanced Programming",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "2nd Year",
      language: "C++",
      createdDate: "2024-01-12",
      examDate: "2024-01-18",
      duration: "3 hours",
      totalMarks: "100",
      status: "ongoing",
      studentsEnrolled: 30,
      submissions: 18,
      description: "Advanced C++ concepts including templates, STL, and memory management."
    }
  ])

  // Mock student submissions for selected exam
  const [studentSubmissions] = useState<StudentSubmission[]>([
    {
      id: 1,
      name: "Alice Johnson",
      rollNo: "CS001",
      email: "alice.johnson@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-15T14:30:00Z",
      score: 85,
      timeSpent: "2h 45m",
      code: `public class ExamSolution {
    public static void main(String[] args) {
        // Question 1: Binary Search Implementation
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        int target = 7;
        int result = binarySearch(arr, target);
        System.out.println("Element found at index: " + result);
    }
    
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
      language: "java",
      testsPassed: 8,
      totalTests: 10,
      violations: 0,
      warnings: 1,
      cameraStatus: "active",
      tabSwitches: 2
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNo: "CS002",
      email: "bob.smith@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-15T16:45:00Z",
      score: 72,
      timeSpent: "2h 58m",
      code: `public class ExamSolution {
    public static void main(String[] args) {
        // Partial implementation
        int[] arr = {1, 3, 5, 7, 9};
        System.out.println("Array length: " + arr.length);
    }
}`,
      language: "java",
      testsPassed: 6,
      totalTests: 10,
      violations: 1,
      warnings: 3,
      cameraStatus: "active",
      tabSwitches: 5
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNo: "CS003",
      email: "carol.davis@sanjivani.edu.in",
      submissionStatus: "not_submitted",
      timeSpent: "1h 15m",
      code: "",
      language: "java",
      testsPassed: 0,
      totalTests: 10,
      violations: 2,
      warnings: 5,
      cameraStatus: "blocked",
      tabSwitches: 8
    },
    {
      id: 4,
      name: "David Wilson",
      rollNo: "CS004",
      email: "david.wilson@sanjivani.edu.in",
      submissionStatus: "in_progress",
      timeSpent: "2h 30m",
      code: `public class ExamSolution {
    // Work in progress...
}`,
      language: "java",
      testsPassed: 3,
      totalTests: 10,
      violations: 0,
      warnings: 0,
      cameraStatus: "active",
      tabSwitches: 1
    }
  ])

  const exportToExcel = (examId: number) => {
    const exam = exams.find(e => e.id === examId)
    const data = studentSubmissions.map(student => ({
      Name: student.name,
      RollNo: student.rollNo,
      Email: student.email,
      Status: student.submissionStatus,
      Score: student.score || 'N/A',
      TimeSpent: student.timeSpent,
      TestsPassed: `${student.testsPassed}/${student.totalTests}`,
      Violations: student.violations,
      Warnings: student.warnings,
      TabSwitches: student.tabSwitches,
      CameraStatus: student.cameraStatus,
      SubmittedAt: student.submittedAt || 'Not submitted'
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exam?.title}-submissions.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Exam submission data exported successfully"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'not_submitted': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const submittedStudents = studentSubmissions.filter(s => s.submissionStatus === 'submitted')
  const notSubmittedStudents = studentSubmissions.filter(s => s.submissionStatus === 'not_submitted')
  const inProgressStudents = studentSubmissions.filter(s => s.submissionStatus === 'in_progress')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-none mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam Options
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Exam Submissions
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor and review student exam submissions
            </p>
          </div>
        </motion.div>

        {/* Exams Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {exams.map((exam) => (
            <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {exam.duration}
                  </div>
                </div>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.department} - {exam.studyingYear} | {exam.language}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-semibold">{exam.studentsEnrolled}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submissions:</span>
                    <span className="font-semibold text-green-600">{exam.submissions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Marks:</span>
                    <span className="font-semibold">{exam.totalMarks}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Exam Date:</span>
                    <span className="font-semibold">{new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                  <Button
                    onClick={() => setSelectedExam(exam)}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Exam Submissions Modal */}
        {selectedExam && (
          <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExam.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedExam.department} - {selectedExam.studyingYear} | Faculty: {selectedExam.facultyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Exam Statistics */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Submission Statistics</CardTitle>
                      <Button onClick={() => exportToExcel(selectedExam.id)} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedExam.studentsEnrolled}</div>
                        <div className="text-sm text-gray-600">Total Students</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{submittedStudents.length}</div>
                        <div className="text-sm text-gray-600">Submitted</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{inProgressStudents.length}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{notSubmittedStudents.length}</div>
                        <div className="text-sm text-gray-600">Not Submitted</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedExam.totalMarks}</div>
                        <div className="text-sm text-gray-600">Total Marks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submissions Tabs */}
                <Card>
                  <CardContent className="p-6">
                    <Tabs defaultValue="submitted" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="submitted" className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Submitted ({submittedStudents.length})
                        </TabsTrigger>
                        <TabsTrigger value="in-progress" className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          In Progress ({inProgressStudents.length})
                        </TabsTrigger>
                        <TabsTrigger value="not-submitted" className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Not Submitted ({notSubmittedStudents.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="submitted" className="mt-6">
                        <div className="space-y-4">
                          {submittedStudents.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <h3 className="font-semibold">{student.name}</h3>
                                      <p className="text-sm text-gray-600">{student.rollNo} | {student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        <Award className="w-3 h-3 mr-1" />
                                        {student.score}/{selectedExam.totalMarks}
                                      </Badge>
                                      <Badge className="bg-blue-100 text-blue-800">
                                        Tests: {student.testsPassed}/{student.totalTests}
                                      </Badge>
                                      {student.violations > 0 && (
                                        <Badge className="bg-red-100 text-red-800">
                                          Violations: {student.violations}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                                    <span>Submitted: {new Date(student.submittedAt!).toLocaleString()}</span>
                                    <span>Time: {student.timeSpent}</span>
                                    <span>Tab Switches: {student.tabSwitches}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      student.cameraStatus === 'active' ? 'bg-green-100 text-green-800' : 
                                      student.cameraStatus === 'blocked' ? 'bg-red-100 text-red-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      Camera: {student.cameraStatus}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  <Code className="w-4 h-4 mr-2" />
                                  View Code
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="in-progress" className="mt-6">
                        <div className="space-y-4">
                          {inProgressStudents.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 bg-yellow-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <h3 className="font-semibold">{student.name}</h3>
                                      <p className="text-sm text-gray-600">{student.rollNo} | {student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        In Progress
                                      </Badge>
                                      <Badge className="bg-blue-100 text-blue-800">
                                        Tests: {student.testsPassed}/{student.totalTests}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                                    <span>Time Spent: {student.timeSpent}</span>
                                    <span>Tab Switches: {student.tabSwitches}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      student.cameraStatus === 'active' ? 'bg-green-100 text-green-800' : 
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      Camera: {student.cameraStatus}
                                    </span>
                                  </div>
                                </div>
                                <Clock className="w-5 h-5 text-yellow-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="not-submitted" className="mt-6">
                        <div className="space-y-4">
                          {notSubmittedStudents.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 bg-red-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <h3 className="font-semibold">{student.name}</h3>
                                      <p className="text-sm text-gray-600">{student.rollNo} | {student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-red-100 text-red-800">
                                        Not Submitted
                                      </Badge>
                                      {student.violations > 0 && (
                                        <Badge className="bg-red-100 text-red-800">
                                          Violations: {student.violations}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                                    <span>Time Spent: {student.timeSpent}</span>
                                    <span>Tab Switches: {student.tabSwitches}</span>
                                    <span>Warnings: {student.warnings}</span>
                                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                      Camera: {student.cameraStatus}
                                    </span>
                                  </div>
                                </div>
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Student Code Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Code Submission - {selectedStudent.name} ({selectedStudent.rollNo})
                </DialogTitle>
                <DialogDescription>
                  Review submitted code and exam performance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedStudent.score || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedStudent.testsPassed}/{selectedStudent.totalTests}</div>
                    <div className="text-sm text-gray-600">Tests Passed</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedStudent.timeSpent}</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedStudent.violations}</div>
                    <div className="text-sm text-gray-600">Violations</div>
                  </div>
                </div>
                
                {/* Security Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security & Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Tab Switches:</span>
                        <span className="font-semibold">{selectedStudent.tabSwitches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warnings:</span>
                        <span className="font-semibold">{selectedStudent.warnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Camera Status:</span>
                        <Badge className={selectedStudent.cameraStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedStudent.cameraStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Submission Status:</span>
                        <Badge className={getSubmissionStatusColor(selectedStudent.submissionStatus)}>
                          {selectedStudent.submissionStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Code Display */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Submitted Code:</h4>
                  <pre className="text-green-400 text-sm overflow-x-auto max-h-96">
                    <code>{selectedStudent.code || "No code submitted"}</code>
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
