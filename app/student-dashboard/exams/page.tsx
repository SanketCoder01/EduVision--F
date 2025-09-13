"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock,
  Calendar,
  Code,
  Monitor,
  AlertTriangle,
  Play,
  FileText,
  Users,
  Shield
} from "lucide-react"

interface Exam {
  id: string
  title: string
  facultyName: string
  examDate: string
  startTime: string
  duration: string
  department: string
  studyingYear: string
  language: string
  description: string
  totalMarks: string
  status: 'scheduled' | 'ongoing' | 'completed'
  enableSecurity: boolean
  enableCamera: boolean
  enableMicrophone: boolean
}

export default function StudentExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Load exams from localStorage
    const storedExams = JSON.parse(localStorage.getItem("coding_exams") || "[]")
    setExams(storedExams)

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const examDateTime = new Date(`${exam.examDate}T${exam.startTime}`)
    const examEndTime = new Date(examDateTime.getTime() + parseInt(exam.duration) * 60000)

    if (now < examDateTime) return 'scheduled'
    if (now >= examDateTime && now <= examEndTime) return 'ongoing'
    return 'completed'
  }

  const getTimeUntilExam = (exam: Exam) => {
    const now = new Date()
    const examDateTime = new Date(`${exam.examDate}T${exam.startTime}`)
    const diff = examDateTime.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const canStartExam = (exam: Exam) => {
    const status = getExamStatus(exam)
    return status === 'ongoing'
  }

  const handleStartExam = (examId: string) => {
    router.push(`/student-dashboard/exams/${examId}/take`)
  }

  const handleViewResults = (examId: string) => {
    router.push(`/student-dashboard/exams/${examId}/results`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coding Exams
          </h1>
          <p className="text-gray-600">
            View and take your scheduled coding examinations
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {exams.filter(exam => getExamStatus(exam) === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ongoing</p>
                  <p className="text-2xl font-bold text-green-600">
                    {exams.filter(exam => getExamStatus(exam) === 'ongoing').length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {exams.filter(exam => getExamStatus(exam) === 'completed').length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exams List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {exams.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Scheduled</h3>
                <p className="text-gray-600">
                  You don't have any coding exams scheduled at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => {
              const status = getExamStatus(exam)
              const timeUntil = getTimeUntilExam(exam)
              
              return (
                <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
                        <CardDescription className="text-base">
                          Faculty: {exam.facultyName}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(exam.examDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {exam.startTime} ({exam.duration} min)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Code className="w-4 h-4" />
                        {exam.language}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {exam.totalMarks} marks
                      </div>
                    </div>

                    {exam.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {exam.description}
                        </p>
                      </div>
                    )}

                    {/* Security Features */}
                    {exam.enableSecurity && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Security Features Enabled</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exam.enableCamera && (
                            <Badge variant="outline" className="text-xs">
                              <Monitor className="w-3 h-3 mr-1" />
                              Camera Required
                            </Badge>
                          )}
                          {exam.enableMicrophone && (
                            <Badge variant="outline" className="text-xs">
                              Microphone Monitoring
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Time Until Exam */}
                    {timeUntil && status === 'scheduled' && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Starts in {timeUntil}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {status === 'ongoing' && canStartExam(exam) && (
                        <Button
                          onClick={() => handleStartExam(exam.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Exam
                        </Button>
                      )}
                      
                      {status === 'completed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewResults(exam.id)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      )}
                      
                      {status === 'scheduled' && (
                        <Button variant="outline" disabled>
                          <Clock className="w-4 h-4 mr-2" />
                          Waiting to Start
                        </Button>
                      )}
                    </div>

                    {/* Warning for ongoing exams */}
                    {status === 'ongoing' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                          <div className="text-sm text-red-800">
                            <p className="font-medium">Exam in Progress</p>
                            <p>Make sure you have a stable internet connection and your camera/microphone are working properly before starting.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </motion.div>
      </div>
    </div>
  )
}
