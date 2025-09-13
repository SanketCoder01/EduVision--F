"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Eye,
  Edit,
  Monitor,
  Users,
  Calendar,
  Clock,
  Award,
  Settings,
  Play,
  Pause,
  Square,
  FileText
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
  startTime: string
  endTime: string
  duration: string
  totalMarks: string
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  studentsEnrolled: number
  submissions: number
  description: string
  questions: number
  securitySettings: {
    cameraRequired: boolean
    microphoneRequired: boolean
    tabSwitchLimit: number
    fullScreenRequired: boolean
  }
}

export default function ViewExams() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  // Mock exams data
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 1,
      title: "Java Programming Final Exam",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "2nd Year",
      language: "Java",
      createdDate: "2024-01-10",
      examDate: "2024-01-15",
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      duration: "3 hours",
      totalMarks: "100",
      status: "completed",
      studentsEnrolled: 28,
      submissions: 25,
      description: "Comprehensive Java programming exam covering OOP concepts, data structures, and algorithms.",
      questions: 5,
      securitySettings: {
        cameraRequired: true,
        microphoneRequired: true,
        tabSwitchLimit: 3,
        fullScreenRequired: true
      }
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
      startTime: "02:00 PM",
      endTime: "04:30 PM",
      duration: "2.5 hours",
      totalMarks: "80",
      status: "completed",
      studentsEnrolled: 25,
      submissions: 23,
      description: "Python exam focusing on data manipulation, analysis, and machine learning basics.",
      questions: 4,
      securitySettings: {
        cameraRequired: true,
        microphoneRequired: false,
        tabSwitchLimit: 2,
        fullScreenRequired: true
      }
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
      startTime: "09:00 AM",
      endTime: "12:00 PM",
      duration: "3 hours",
      totalMarks: "100",
      status: "ongoing",
      studentsEnrolled: 30,
      submissions: 18,
      description: "Advanced C++ concepts including templates, STL, and memory management.",
      questions: 6,
      securitySettings: {
        cameraRequired: true,
        microphoneRequired: true,
        tabSwitchLimit: 5,
        fullScreenRequired: true
      }
    },
    {
      id: 4,
      title: "JavaScript Web Development",
      facultyName: "Dr. Sarah Johnson",
      department: "CSE",
      studyingYear: "3rd Year",
      language: "JavaScript",
      createdDate: "2024-01-14",
      examDate: "2024-01-20",
      startTime: "11:00 AM",
      endTime: "02:00 PM",
      duration: "3 hours",
      totalMarks: "90",
      status: "scheduled",
      studentsEnrolled: 22,
      submissions: 0,
      description: "Modern JavaScript development including ES6+, DOM manipulation, and async programming.",
      questions: 5,
      securitySettings: {
        cameraRequired: true,
        microphoneRequired: false,
        tabSwitchLimit: 3,
        fullScreenRequired: true
      }
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExamAction = (examId: number, action: string) => {
    const exam = exams.find(e => e.id === examId)
    if (!exam) return

    switch (action) {
      case 'edit':
        router.push(`/dashboard/compiler/edit/${examId}`)
        break
      case 'monitor':
        if (exam.status === 'ongoing') {
          router.push(`/dashboard/compiler/monitor/${examId}`)
        } else {
          toast({
            title: "Cannot Monitor",
            description: "Exam is not currently ongoing",
            variant: "destructive"
          })
        }
        break
      case 'submissions':
        router.push(`/dashboard/compiler/view/${examId}`)
        break
      case 'start':
        setExams(prev => prev.map(e => 
          e.id === examId ? { ...e, status: 'ongoing' } : e
        ))
        toast({
          title: "Exam Started",
          description: `${exam.title} has been started`
        })
        break
      case 'pause':
        setExams(prev => prev.map(e => 
          e.id === examId ? { ...e, status: 'scheduled' } : e
        ))
        toast({
          title: "Exam Paused",
          description: `${exam.title} has been paused`
        })
        break
      case 'end':
        setExams(prev => prev.map(e => 
          e.id === examId ? { ...e, status: 'completed' } : e
        ))
        toast({
          title: "Exam Ended",
          description: `${exam.title} has been completed`
        })
        break
    }
  }

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
              View Exams
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and monitor your coding exams
            </p>
          </div>
        </motion.div>

        {/* Exams Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {exams.map((exam) => (
            <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {exam.questions} Questions
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.department} - {exam.studyingYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{exam.startTime} - {exam.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span>{exam.totalMarks} Marks | {exam.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-semibold">{exam.studentsEnrolled}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submissions:</span>
                    <span className="font-semibold text-green-600">{exam.submissions}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => setSelectedExam(exam)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {exam.status === 'scheduled' && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'start')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {exam.status === 'ongoing' && (
                        <>
                          <Button
                            onClick={() => handleExamAction(exam.id, 'monitor')}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="sm"
                          >
                            <Monitor className="w-4 h-4 mr-1" />
                            Monitor
                          </Button>
                          <Button
                            onClick={() => handleExamAction(exam.id, 'end')}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <Square className="w-4 h-4 mr-1" />
                            End
                          </Button>
                        </>
                      )}
                      
                      {(exam.status === 'completed' || exam.status === 'ongoing') && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'submissions')}
                          className="bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      )}
                      
                      {exam.status !== 'ongoing' && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'edit')}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Exam Details Modal */}
        {selectedExam && (
          <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExam.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedExam.department} - {selectedExam.studyingYear} | Faculty: {selectedExam.facultyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Exam Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedExam.studentsEnrolled}</div>
                        <div className="text-sm text-gray-600">Students Enrolled</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedExam.submissions}</div>
                        <div className="text-sm text-gray-600">Submissions</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedExam.totalMarks}</div>
                        <div className="text-sm text-gray-600">Total Marks</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{selectedExam.questions}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exam Date:</span>
                        <span className="font-semibold">{new Date(selectedExam.examDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Time:</span>
                        <span className="font-semibold">{selectedExam.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Time:</span>
                        <span className="font-semibold">{selectedExam.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{selectedExam.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <Badge className="bg-blue-100 text-blue-800">{selectedExam.language}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Camera Required:</span>
                        <Badge className={selectedExam.securitySettings.cameraRequired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExam.securitySettings.cameraRequired ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Microphone Required:</span>
                        <Badge className={selectedExam.securitySettings.microphoneRequired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExam.securitySettings.microphoneRequired ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Full Screen Required:</span>
                        <Badge className={selectedExam.securitySettings.fullScreenRequired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExam.securitySettings.fullScreenRequired ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tab Switch Limit:</span>
                        <span className="font-semibold">{selectedExam.securitySettings.tabSwitchLimit}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedExam.description}</p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedExam.status === 'scheduled' && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'start')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Exam
                    </Button>
                  )}
                  
                  {selectedExam.status === 'ongoing' && (
                    <>
                      <Button
                        onClick={() => handleExamAction(selectedExam.id, 'monitor')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        Monitor Students
                      </Button>
                      <Button
                        onClick={() => handleExamAction(selectedExam.id, 'end')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        End Exam
                      </Button>
                    </>
                  )}
                  
                  {(selectedExam.status === 'completed' || selectedExam.status === 'ongoing') && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'submissions')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  )}
                  
                  {selectedExam.status !== 'ongoing' && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'edit')}
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Exam
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
