"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
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
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  Calendar,
  Code,
  Monitor
} from "lucide-react"

interface ExamData {
  id: number
  title: string
  facultyName: string
  department: string
  studyingYear: string
  language: string
  examDate: string
  startTime: string
  endTime: string
  duration: string
  totalMarks: string
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  createdAt: string
  studentsEnrolled: number
  submissions: number
}

interface Student {
  id: number
  name: string
  rollNo: string
  email: string
  submissionStatus: 'submitted' | 'not_submitted' | 'late_submission'
  submittedAt?: string
  score?: number
  warnings: number
  violations: number
  tabSwitches: number
  timeSpent: string
  answers: {
    questionId: number
    question: string
    answer: string
    language: string
    isCorrect?: boolean
  }[]
}

export default function ViewExam() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  // Mock exam data
  const [examData] = useState<ExamData>({
    id: 1,
    title: "Java Programming Fundamentals",
    facultyName: "Dr. Sarah Johnson",
    department: "CSE",
    studyingYear: "2nd Year",
    language: "Java",
    examDate: "2024-01-15",
    startTime: "10:00",
    endTime: "12:00",
    duration: "120",
    totalMarks: "100",
    status: "completed",
    createdAt: "2024-01-10T10:00:00Z",
    studentsEnrolled: 24,
    submissions: 22
  })

  // Mock student submissions
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Alice Johnson",
      rollNo: "CS001",
      email: "alice.johnson@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-15T11:45:00Z",
      score: 85,
      warnings: 0,
      violations: 0,
      tabSwitches: 2,
      timeSpent: "1h 45m",
      answers: [
        {
          questionId: 1,
          question: "Write a Java program to implement a simple calculator",
          answer: `public class Calculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter two numbers:");
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Sum: " + (a + b));
    }
}`,
          language: "java",
          isCorrect: true
        },
        {
          questionId: 2,
          question: "Explain the concept of inheritance in Java",
          answer: "Inheritance is a mechanism where one class acquires the properties and methods of another class. It promotes code reusability and establishes an IS-A relationship between classes.",
          language: "text",
          isCorrect: true
        }
      ]
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNo: "CS002",
      email: "bob.smith@sanjivani.edu.in",
      submissionStatus: "submitted",
      submittedAt: "2024-01-15T11:58:00Z",
      score: 72,
      warnings: 2,
      violations: 1,
      tabSwitches: 5,
      timeSpent: "1h 58m",
      answers: [
        {
          questionId: 1,
          question: "Write a Java program to implement a simple calculator",
          answer: `public class Calculator {
    public static void main(String[] args) {
        int a = 10, b = 5;
        System.out.println(a + b);
    }
}`,
          language: "java",
          isCorrect: false
        }
      ]
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNo: "CS003",
      email: "carol.davis@sanjivani.edu.in",
      submissionStatus: "not_submitted",
      warnings: 1,
      violations: 0,
      tabSwitches: 8,
      timeSpent: "0h 45m",
      answers: []
    }
  ])

  const submittedStudents = students.filter(s => s.submissionStatus === 'submitted')
  const notSubmittedStudents = students.filter(s => s.submissionStatus === 'not_submitted')

  const downloadPDF = (student: Student) => {
    // Simulate PDF generation
    toast({
      title: "PDF Generated",
      description: `Answer sheet for ${student.name} is being downloaded.`
    })
  }

  const exportToExcel = () => {
    const data = students.map(student => ({
      Name: student.name,
      RollNo: student.rollNo,
      Email: student.email,
      Status: student.submissionStatus,
      Score: student.score || 'N/A',
      Warnings: student.warnings,
      Violations: student.violations,
      TabSwitches: student.tabSwitches,
      TimeSpent: student.timeSpent,
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
    a.download = `${examData.title}-submissions.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Submission data exported successfully"
    })
  }

  const canEdit = examData.status === 'draft' || examData.status === 'scheduled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {canEdit && (
                <Button
                  onClick={() => router.push(`/dashboard/compiler/edit/${examData.id}`)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Exam
                </Button>
              )}
              <Button
                onClick={() => router.push(`/dashboard/compiler/monitor/${examData.id}`)}
                variant="outline"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Monitor
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Exam Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {examData.title}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {examData.department} - {examData.studyingYear} | Faculty: {examData.facultyName}
                  </CardDescription>
                </div>
                <Badge className={`${
                  examData.status === 'completed' ? 'bg-green-100 text-green-800' :
                  examData.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  examData.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {examData.status.charAt(0).toUpperCase() + examData.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{examData.studentsEnrolled}</div>
                  <div className="text-sm text-gray-600">Students Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{examData.submissions}</div>
                  <div className="text-sm text-gray-600">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{examData.duration}m</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{examData.totalMarks}</div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {examData.examDate} | {examData.startTime} - {examData.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    {examData.language}
                  </div>
                </div>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold">{student.name}</h3>
                                <p className="text-sm text-gray-600">{student.rollNo} | {student.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {student.score && (
                                  <Badge className="bg-green-100 text-green-800">
                                    Score: {student.score}/100
                                  </Badge>
                                )}
                                {student.warnings > 0 && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    {student.warnings} Warnings
                                  </Badge>
                                )}
                                {student.violations > 0 && (
                                  <Badge className="bg-red-100 text-red-800">
                                    {student.violations} Violations
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Submitted: {new Date(student.submittedAt!).toLocaleString()} | 
                              Time Spent: {student.timeSpent} | 
                              Tab Switches: {student.tabSwitches}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadPDF(student)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Answers
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Answers - {student.name} ({student.rollNo})
                                  </DialogTitle>
                                  <DialogDescription>
                                    Review submitted answers and code solutions
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {student.answers.map((answer, index) => (
                                    <div key={answer.questionId} className="border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Question {index + 1}</h4>
                                        {answer.isCorrect !== undefined && (
                                          <Badge className={answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-gray-700 mb-3">{answer.question}</p>
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <h5 className="font-medium mb-2">Answer:</h5>
                                        <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                                          <code>{answer.answer}</code>
                                        </pre>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="not-submitted" className="mt-6">
                  <div className="space-y-4">
                    {notSubmittedStudents.map((student) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border rounded-lg p-4 bg-red-50 hover:shadow-md transition-shadow"
                      >
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
                                {student.warnings > 0 && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    {student.warnings} Warnings
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Time Spent: {student.timeSpent} | 
                              Tab Switches: {student.tabSwitches}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
