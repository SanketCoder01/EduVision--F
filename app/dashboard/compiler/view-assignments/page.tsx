"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Users,
  Clock,
  CheckCircle,
  X,
  Code,
  Calendar,
  Play,
  AlertTriangle
} from "lucide-react"

interface Assignment {
  id: number
  title: string
  facultyName: string
  department: string
  studyingYear: string
  language: string
  createdDate: string
  dueDate: string
  totalMarks: string
  status: 'active' | 'completed' | 'archived'
  studentsEnrolled: number
  submissions: number
  description: string
}

interface Student {
  id: number
  name: string
  rollNo: string
  email: string
  submissionStatus: 'submitted' | 'not_submitted' | 'late_submission'
  submittedAt?: string
  score?: number
  timeSpent: string
  code: string
  language: string
  testsPassed: number
  totalTests: number
}

export default function ViewAssignments() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Mock assignments data
  const [assignments] = useState<Assignment[]>([
    {
      id: 1,
      title: "Java Array Operations",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "2nd Year",
      language: "Java",
      createdDate: "2024-01-10",
      dueDate: "2024-01-17",
      totalMarks: "50",
      status: "active",
      studentsEnrolled: 28,
      submissions: 22,
      description: "Implement various array operations including sorting, searching, and manipulation."
    },
    {
      id: 2,
      title: "Python Data Structures",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "3rd Year",
      language: "Python",
      createdDate: "2024-01-05",
      dueDate: "2024-01-12",
      totalMarks: "75",
      status: "completed",
      studentsEnrolled: 25,
      submissions: 24,
      description: "Work with lists, dictionaries, sets, and tuples in Python."
    },
    {
      id: 3,
      title: "C++ Pointers and Memory",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "2nd Year",
      language: "C++",
      createdDate: "2023-12-28",
      dueDate: "2024-01-04",
      totalMarks: "60",
      status: "archived",
      studentsEnrolled: 30,
      submissions: 28,
      description: "Understanding pointers, dynamic memory allocation, and memory management."
    }
  ])

  // Mock student submissions for selected assignment
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Alice Johnson",
      rollNo: "CS001",
      email: "alice.johnson@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-15T14:30:00Z",
      score: 45,
      timeSpent: "2h 15m",
      code: `public class ArrayOperations {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        bubbleSort(arr);
        System.out.println(Arrays.toString(arr));
    }
    
    public static void bubbleSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`,
      language: "java",
      testsPassed: 8,
      totalTests: 10
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNo: "CS002",
      email: "bob.smith@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-16T16:45:00Z",
      score: 38,
      timeSpent: "3h 20m",
      code: `public class ArrayOperations {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        // Incomplete implementation
        System.out.println("Array: " + arr);
    }
}`,
      language: "java",
      testsPassed: 6,
      totalTests: 10
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNo: "CS003",
      email: "carol.davis@sanjivani.edu.in",
      submissionStatus: "not_submitted",
      timeSpent: "0h 0m",
      code: "",
      language: "java",
      testsPassed: 0,
      totalTests: 10
    }
  ])

  const exportToExcel = (assignmentId: number) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    const data = students.map(student => ({
      Name: student.name,
      RollNo: student.rollNo,
      Email: student.email,
      Status: student.submissionStatus,
      Score: student.score || 'N/A',
      TimeSpent: student.timeSpent,
      TestsPassed: `${student.testsPassed}/${student.totalTests}`,
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
    a.download = `${assignment?.title}-submissions.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Assignment submission data exported successfully"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysOld = (createdDate: string) => {
    const created = new Date(createdDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Auto-archive assignments older than 5 days
  useEffect(() => {
    assignments.forEach(assignment => {
      if (assignment.status === 'completed' && getDaysOld(assignment.createdDate) > 5) {
        assignment.status = 'archived'
      }
    })
  }, [assignments])

  const submittedStudents = students.filter(s => s.submissionStatus === 'submitted')
  const notSubmittedStudents = students.filter(s => s.submissionStatus === 'not_submitted')

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
            Back to Compiler
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              View Assignments
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and review coding assignments
            </p>
          </div>
        </motion.div>

        {/* Assignments Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {getDaysOld(assignment.createdDate)} days old
                  </div>
                </div>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <CardDescription>
                  {assignment.department} - {assignment.studyingYear} | {assignment.language}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-semibold">{assignment.studentsEnrolled}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submissions:</span>
                    <span className="font-semibold text-green-600">{assignment.submissions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <Button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Assignment Details Modal */}
        {selectedAssignment && (
          <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAssignment.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedAssignment.department} - {selectedAssignment.studyingYear} | Faculty: {selectedAssignment.facultyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Assignment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedAssignment.studentsEnrolled}</div>
                        <div className="text-sm text-gray-600">Students Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedAssignment.submissions}</div>
                        <div className="text-sm text-gray-600">Submissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedAssignment.totalMarks}</div>
                        <div className="text-sm text-gray-600">Total Marks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedAssignment.language}</div>
                        <div className="text-sm text-gray-600">Language</div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Description:</h4>
                      <p className="text-gray-700">{selectedAssignment.description}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => exportToExcel(selectedAssignment.id)} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Submissions Tabs */}
                <Card>
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
                                        Score: {student.score}/{selectedAssignment.totalMarks}
                                      </Badge>
                                      <Badge className="bg-blue-100 text-blue-800">
                                        Tests: {student.testsPassed}/{student.totalTests}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600">
                                    Submitted: {new Date(student.submittedAt!).toLocaleString()} | 
                                    Time Spent: {student.timeSpent}
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
                                    <Badge className="bg-red-100 text-red-800">
                                      Not Submitted
                                    </Badge>
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Code Submission - {selectedStudent.name} ({selectedStudent.rollNo})
                </DialogTitle>
                <DialogDescription>
                  Review submitted code and test results
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedStudent.score}</div>
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
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Submitted Code:</h4>
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{selectedStudent.code}</code>
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
