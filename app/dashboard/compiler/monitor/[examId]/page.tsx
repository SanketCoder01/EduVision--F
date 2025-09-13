"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Monitor,
  Users,
  AlertTriangle,
  Camera,
  Mic,
  Eye,
  Shield,
  Clock,
  Play,
  Pause,
  Square,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  Code,
  MessageSquare,
  Download,
  RefreshCw
} from "lucide-react"

interface StudentMonitorData {
  id: number
  name: string
  rollNo: string
  email: string
  status: 'online' | 'offline' | 'suspicious' | 'blocked'
  violations: number
  tabSwitches: number
  lastActivity: string
  progress: number
  currentQuestion: number
  cameraStatus: 'on' | 'off' | 'blocked'
  micStatus: 'on' | 'off' | 'muted'
  warnings: number
  submissionTime?: string
  codeSubmissions: number
  suspiciousActivities: string[]
  ipAddress: string
  browserInfo: string
  examStartTime: string
}

interface ExamMonitorData {
  id: string
  title: string
  language: string
  startTime: string
  endTime: string
  duration: number
  totalStudents: number
  status: 'scheduled' | 'active' | 'paused' | 'completed'
}

export default function ExamMonitorDashboard() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitorData | null>(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [examStatus, setExamStatus] = useState<'scheduled' | 'active' | 'paused' | 'completed'>('active')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock exam data
  const [examData] = useState<ExamMonitorData>({
    id: params.examId as string,
    title: "Java Programming Exam",
    language: "Java",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    duration: 120,
    totalStudents: 25,
    status: 'active'
  })

  // Mock student monitoring data
  const [studentsData, setStudentsData] = useState<StudentMonitorData[]>([
    {
      id: 1,
      name: "Alice Johnson",
      rollNo: "CS001",
      email: "alice@sanjivani.edu.in",
      status: 'online',
      violations: 0,
      tabSwitches: 1,
      lastActivity: "2 min ago",
      progress: 75,
      currentQuestion: 2,
      cameraStatus: 'on',
      micStatus: 'muted',
      warnings: 0,
      codeSubmissions: 5,
      suspiciousActivities: [],
      ipAddress: "192.168.1.100",
      browserInfo: "Chrome 118.0.0.0",
      examStartTime: "10:02 AM"
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNo: "CS002",
      email: "bob@sanjivani.edu.in",
      status: 'suspicious',
      violations: 3,
      tabSwitches: 5,
      lastActivity: "30 sec ago",
      progress: 45,
      currentQuestion: 1,
      cameraStatus: 'off',
      micStatus: 'off',
      warnings: 3,
      codeSubmissions: 2,
      suspiciousActivities: [
        "Multiple tab switches detected",
        "Camera turned off during exam",
        "Suspicious mouse movements",
        "Copy-paste activity detected"
      ],
      ipAddress: "192.168.1.101",
      browserInfo: "Firefox 119.0.0.0",
      examStartTime: "10:05 AM"
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNo: "CS003",
      email: "carol@sanjivani.edu.in",
      status: 'online',
      violations: 1,
      tabSwitches: 0,
      lastActivity: "1 min ago",
      progress: 90,
      currentQuestion: 3,
      cameraStatus: 'on',
      micStatus: 'muted',
      warnings: 1,
      codeSubmissions: 8,
      suspiciousActivities: ["Brief camera obstruction"],
      ipAddress: "192.168.1.102",
      browserInfo: "Chrome 118.0.0.0",
      examStartTime: "10:01 AM"
    },
    {
      id: 4,
      name: "David Wilson",
      rollNo: "CS004",
      email: "david@sanjivani.edu.in",
      status: 'blocked',
      violations: 5,
      tabSwitches: 8,
      lastActivity: "5 min ago",
      progress: 20,
      currentQuestion: 1,
      cameraStatus: 'blocked',
      micStatus: 'off',
      warnings: 5,
      codeSubmissions: 1,
      suspiciousActivities: [
        "Excessive tab switching",
        "Camera blocked multiple times",
        "Suspicious keyboard patterns",
        "Multiple violation threshold exceeded",
        "Potential external assistance detected"
      ],
      ipAddress: "192.168.1.103",
      browserInfo: "Edge 118.0.0.0",
      examStartTime: "10:03 AM"
    },
    {
      id: 5,
      name: "Eva Brown",
      rollNo: "CS005",
      email: "eva@sanjivani.edu.in",
      status: 'online',
      violations: 0,
      tabSwitches: 2,
      lastActivity: "1 min ago",
      progress: 85,
      currentQuestion: 3,
      cameraStatus: 'on',
      micStatus: 'muted',
      warnings: 0,
      codeSubmissions: 7,
      suspiciousActivities: [],
      ipAddress: "192.168.1.104",
      browserInfo: "Chrome 118.0.0.0",
      examStartTime: "10:00 AM"
    }
  ])

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setStudentsData(prev => prev.map(student => ({
          ...student,
          lastActivity: Math.random() > 0.7 ? "Just now" : student.lastActivity,
          progress: Math.min(100, student.progress + Math.floor(Math.random() * 5))
        })))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'suspicious': return 'bg-yellow-500'
      case 'blocked': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-600">Online</Badge>
      case 'suspicious': return <Badge className="bg-yellow-600">Suspicious</Badge>
      case 'blocked': return <Badge className="bg-red-600">Blocked</Badge>
      case 'offline': return <Badge variant="secondary">Offline</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleStudentAction = (studentId: number, action: 'warn' | 'block' | 'unblock' | 'message') => {
    setStudentsData(prev => prev.map(student => {
      if (student.id === studentId) {
        switch (action) {
          case 'warn':
            toast({
              title: "Warning Sent",
              description: `Warning sent to ${student.name}`
            })
            return { ...student, warnings: student.warnings + 1 }
          case 'block':
            toast({
              title: "Student Blocked",
              description: `${student.name} has been blocked from the exam`
            })
            return { ...student, status: 'blocked' as const }
          case 'unblock':
            toast({
              title: "Student Unblocked",
              description: `${student.name} has been unblocked`
            })
            return { ...student, status: 'online' as const }
          case 'message':
            toast({
              title: "Message Sent",
              description: `Message sent to ${student.name}`
            })
            return student
          default:
            return student
        }
      }
      return student
    }))
  }

  const handleExamControl = (action: 'start' | 'pause' | 'end') => {
    switch (action) {
      case 'start':
        setExamStatus('active')
        toast({
          title: "Exam Started",
          description: "The exam has been started for all students"
        })
        break
      case 'pause':
        setExamStatus('paused')
        toast({
          title: "Exam Paused",
          description: "The exam has been paused for all students"
        })
        break
      case 'end':
        setExamStatus('completed')
        toast({
          title: "Exam Ended",
          description: "The exam has been ended and all submissions are final"
        })
        break
    }
  }

  const exportMonitoringData = () => {
    const data = {
      examInfo: examData,
      studentsData: studentsData,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exam_monitoring_${examData.id}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Data Exported",
      description: "Monitoring data has been exported successfully"
    })
  }

  const onlineStudents = studentsData.filter(s => s.status === 'online').length
  const suspiciousStudents = studentsData.filter(s => s.status === 'suspicious').length
  const blockedStudents = studentsData.filter(s => s.status === 'blocked').length
  const offlineStudents = studentsData.filter(s => s.status === 'offline').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-4 md:p-6">
      <div className="w-full max-w-none mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exam Monitoring Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring for {examData.title}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${examStatus === 'active' ? 'bg-green-500' : examStatus === 'paused' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium capitalize">{examStatus}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportMonitoringData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Online</p>
                  <p className="text-2xl font-bold text-green-700">{onlineStudents}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Suspicious</p>
                  <p className="text-2xl font-bold text-yellow-700">{suspiciousStudents}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Blocked</p>
                  <p className="text-2xl font-bold text-red-700">{blockedStudents}</p>
                </div>
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offline</p>
                  <p className="text-2xl font-bold text-gray-700">{offlineStudents}</p>
                </div>
                <Users className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{studentsData.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exam Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Exam Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleExamControl('start')}
                  disabled={examStatus === 'active'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Exam
                </Button>
                <Button
                  onClick={() => handleExamControl('pause')}
                  disabled={examStatus !== 'active'}
                  variant="outline"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Exam
                </Button>
                <Button
                  onClick={() => handleExamControl('end')}
                  disabled={examStatus === 'completed'}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Monitoring List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsData.map((student) => (
                  <Card key={student.id} className="bg-white border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(student.status)}`}></div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.rollNo}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {getStatusBadge(student.status)}
                            {student.violations > 0 && (
                              <Badge variant="destructive">
                                {student.violations} violations
                              </Badge>
                            )}
                            {student.warnings > 0 && (
                              <Badge className="bg-yellow-600">
                                {student.warnings} warnings
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-gray-600">
                            <div>Progress: {student.progress}%</div>
                            <div>Question: {student.currentQuestion}/3</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Camera className={`w-4 h-4 ${student.cameraStatus === 'on' ? 'text-green-600' : 'text-red-600'}`} />
                            <Mic className={`w-4 h-4 ${student.micStatus === 'muted' ? 'text-yellow-600' : student.micStatus === 'on' ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(student)
                                setShowStudentDetail(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            
                            {student.status !== 'blocked' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStudentAction(student.id, 'block')}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Block
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStudentAction(student.id, 'unblock')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Unblock
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {student.suspiciousActivities.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-800 mb-1">Suspicious Activities:</p>
                          <ul className="text-xs text-red-700 list-disc list-inside">
                            {student.suspiciousActivities.slice(0, 2).map((activity, index) => (
                              <li key={index}>{activity}</li>
                            ))}
                            {student.suspiciousActivities.length > 2 && (
                              <li>+{student.suspiciousActivities.length - 2} more...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Detail Modal */}
        <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Student Details: {selectedStudent?.name}
              </DialogTitle>
              <DialogDescription>
                Detailed monitoring information for {selectedStudent?.rollNo}
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudent && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedStudent.name}</div>
                      <div><strong>Roll No:</strong> {selectedStudent.rollNo}</div>
                      <div><strong>Email:</strong> {selectedStudent.email}</div>
                      <div><strong>Status:</strong> {getStatusBadge(selectedStudent.status)}</div>
                      <div><strong>Exam Start:</strong> {selectedStudent.examStartTime}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Technical Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>IP Address:</strong> {selectedStudent.ipAddress}</div>
                      <div><strong>Browser:</strong> {selectedStudent.browserInfo}</div>
                      <div><strong>Last Activity:</strong> {selectedStudent.lastActivity}</div>
                      <div><strong>Code Submissions:</strong> {selectedStudent.codeSubmissions}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Progress and Violations */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{selectedStudent.progress}%</div>
                      <div className="text-sm text-gray-600">Question {selectedStudent.currentQuestion}/3</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Violations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{selectedStudent.violations}</div>
                      <div className="text-sm text-gray-600">Tab switches: {selectedStudent.tabSwitches}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Warnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{selectedStudent.warnings}</div>
                      <div className="text-sm text-gray-600">Issued by system</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Suspicious Activities */}
                {selectedStudent.suspiciousActivities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-red-600">Suspicious Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {selectedStudent.suspiciousActivities.map((activity, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleStudentAction(selectedStudent.id, 'warn')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Send Warning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStudentAction(selectedStudent.id, 'message')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  {selectedStudent.status !== 'blocked' ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStudentAction(selectedStudent.id, 'block')
                        setShowStudentDetail(false)
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Block Student
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleStudentAction(selectedStudent.id, 'unblock')
                        setShowStudentDetail(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unblock Student
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
