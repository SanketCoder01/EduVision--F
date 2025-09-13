"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  Monitor, 
  Users, 
  Camera, 
  Mic, 
  AlertTriangle,
  MoreVertical,
  Volume2,
  VolumeX,
  Eye,
  MessageSquare,
  Shield,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: number
  name: string
  rollNo: string
  status: 'online' | 'offline' | 'suspicious' | 'blocked'
  violations: number
  warnings: number
  lastActivity: string
  progress: number
  tabSwitches: number
  cameraStatus: 'on' | 'off' | 'blocked'
  micStatus: 'on' | 'off' | 'muted'
  isActive: boolean
  isSpeaking: boolean
  faceImage: string
}

export default function ExamSuccess() {
  const router = useRouter()
  const { toast } = useToast()
  const [showMonitoring, setShowMonitoring] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([
    { 
      id: 1, 
      name: "Alice Johnson", 
      rollNo: "CS001", 
      status: 'online', 
      violations: 0, 
      warnings: 0,
      lastActivity: "2 min ago", 
      progress: 75, 
      tabSwitches: 1, 
      cameraStatus: 'on', 
      micStatus: 'muted',
      isActive: true,
      isSpeaking: false,
      faceImage: "/placeholder-user.jpg"
    },
    { 
      id: 2, 
      name: "Bob Smith", 
      rollNo: "CS002", 
      status: 'suspicious', 
      violations: 2, 
      warnings: 1,
      lastActivity: "1 min ago", 
      progress: 45, 
      tabSwitches: 4, 
      cameraStatus: 'off', 
      micStatus: 'off',
      isActive: true,
      isSpeaking: true,
      faceImage: "/placeholder-user.jpg"
    },
    { 
      id: 3, 
      name: "Carol Davis", 
      rollNo: "CS003", 
      status: 'online', 
      violations: 1, 
      warnings: 0,
      lastActivity: "30 sec ago", 
      progress: 90, 
      tabSwitches: 0, 
      cameraStatus: 'on', 
      micStatus: 'muted',
      isActive: true,
      isSpeaking: false,
      faceImage: "/placeholder-user.jpg"
    },
    { 
      id: 4, 
      name: "David Wilson", 
      rollNo: "CS004", 
      status: 'offline', 
      violations: 0, 
      warnings: 0,
      lastActivity: "5 min ago", 
      progress: 20, 
      tabSwitches: 0, 
      cameraStatus: 'blocked', 
      micStatus: 'off',
      isActive: false,
      isSpeaking: false,
      faceImage: "/placeholder-user.jpg"
    },
    { 
      id: 5, 
      name: "Eva Brown", 
      rollNo: "CS005", 
      status: 'online', 
      violations: 0, 
      warnings: 0,
      lastActivity: "1 min ago", 
      progress: 85, 
      tabSwitches: 2, 
      cameraStatus: 'on', 
      micStatus: 'muted',
      isActive: true,
      isSpeaking: false,
      faceImage: "/placeholder-user.jpg"
    }
  ])

  // Simulate audio detection
  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(prev => prev.map(student => ({
        ...student,
        isSpeaking: Math.random() > 0.9 && student.isActive && student.micStatus === 'on'
      })))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleStudentAction = (studentId: number, action: 'warn' | 'block' | 'unblock' | 'message') => {
    setStudents(prev => prev.map(student => {
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
            return { ...student, status: 'blocked' as const, isActive: false }
          case 'unblock':
            toast({
              title: "Student Unblocked",
              description: `${student.name} has been unblocked`
            })
            return { ...student, status: 'online' as const, isActive: true }
          case 'message':
            toast({
              title: "Message Sent",
              description: `Private message sent to ${student.name}`
            })
            return student
        }
      }
      return student
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'suspicious': return 'bg-yellow-500'
      case 'blocked': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const exportData = () => {
    const data = students.map(student => ({
      Name: student.name,
      RollNo: student.rollNo,
      Status: student.status,
      Progress: `${student.progress}%`,
      Violations: student.violations,
      Warnings: student.warnings,
      TabSwitches: student.tabSwitches,
      LastActivity: student.lastActivity
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exam-monitoring-data.csv'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Monitoring data has been exported successfully"
    })
  }

  if (!showMonitoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Exam Published Successfully!
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Your coding exam has been scheduled and is now live for students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Exam Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Exam ID:</span>
                      <span className="ml-2 font-mono">EX-2024-001</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Live</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Students Enrolled:</span>
                      <span className="ml-2 font-semibold">24</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2">2 hours</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Button 
                    onClick={() => setShowMonitoring(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    size="lg"
                  >
                    <Monitor className="w-5 h-5 mr-2" />
                    Start Real-Time Monitoring
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard/compiler')}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Back to Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard/compiler/edit/1')}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Edit Exam
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-6 h-6 text-red-600" />
                    Real-Time Exam Monitoring
                  </CardTitle>
                  <CardDescription>
                    Live monitoring of student activities during the exam
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">
                    <Users className="w-4 h-4 mr-1" />
                    {students.filter(s => s.isActive).length} Online
                  </Badge>
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Zoom-style Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {students.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: student.id * 0.1 }}
              className="relative group"
            >
              <Card className={`bg-black rounded-lg overflow-hidden transition-all duration-300 ${
                student.isSpeaking ? 'ring-4 ring-green-400 shadow-lg' : ''
              } ${student.status === 'suspicious' ? 'ring-2 ring-yellow-400' : ''} ${
                student.status === 'blocked' ? 'ring-2 ring-red-400' : ''
              }`}>
                <div className="aspect-video relative bg-gray-900">
                  {student.cameraStatus === 'on' && student.isActive ? (
                    <img 
                      src={student.faceImage} 
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(student.status)}`} />
                    {student.isSpeaking && (
                      <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
                    )}
                  </div>

                  {/* 3-dot Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Student Actions</DialogTitle>
                          <DialogDescription>
                            Actions for {student.name} ({student.rollNo})
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button 
                            onClick={() => handleStudentAction(student.id, 'warn')}
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Send Warning
                          </Button>
                          {student.status !== 'blocked' ? (
                            <Button 
                              onClick={() => handleStudentAction(student.id, 'block')}
                              variant="outline" 
                              className="w-full justify-start text-red-600"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Block Student
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleStudentAction(student.id, 'unblock')}
                              variant="outline" 
                              className="w-full justify-start text-green-600"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Unblock Student
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleStudentAction(student.id, 'message')}
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Student Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-sm font-medium truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>{student.rollNo}</span>
                      <div className="flex items-center gap-1">
                        {student.warnings > 0 && (
                          <Badge className="bg-yellow-500 text-white text-xs px-1 py-0">
                            {student.warnings}W
                          </Badge>
                        )}
                        {student.violations > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1 py-0">
                            {student.violations}V
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Details
                  </Button>
                  <div className="text-sm text-gray-600">
                    Active: {students.filter(s => s.isActive).length} | 
                    Suspicious: {students.filter(s => s.status === 'suspicious').length} | 
                    Blocked: {students.filter(s => s.status === 'blocked').length}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowMonitoring(false)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Back to Success Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
