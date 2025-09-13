"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Monitor, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Camera,
  Shield,
  Clock,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface StudentActivity {
  id: string
  student_name: string
  student_id: string
  exam_id: number
  exam_title: string
  status: 'active' | 'completed' | 'disconnected' | 'violation'
  warnings: number
  max_warnings: number
  last_activity: string
  join_time: string
  violations: Array<{
    type: 'tab_switch' | 'copy_paste' | 'right_click' | 'fullscreen_exit' | 'suspicious_activity'
    timestamp: string
    details: string
  }>
  progress: number
  current_question: number
  total_questions: number
  webcam_status: 'active' | 'inactive' | 'blocked'
  screen_recording: boolean
}

interface RejoinRequest {
  id: string
  student_name: string
  student_id: string
  exam_id: number
  exam_title: string
  reason: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function ExamMonitorPage() {
  const router = useRouter()
  const [activeStudents, setActiveStudents] = useState<StudentActivity[]>([])
  const [rejoinRequests, setRejoinRequests] = useState<RejoinRequest[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentActivity | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMonitoringData()
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMonitoringData = () => {
    // Mock data for demonstration
    const mockStudents: StudentActivity[] = [
      {
        id: "1",
        student_name: "John Doe",
        student_id: "CS2021001",
        exam_id: 1,
        exam_title: "Data Structures Exam",
        status: "active",
        warnings: 1,
        max_warnings: 3,
        last_activity: new Date(Date.now() - 2 * 60000).toISOString(),
        join_time: new Date(Date.now() - 45 * 60000).toISOString(),
        violations: [
          {
            type: "tab_switch",
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            details: "Switched to another tab for 5 seconds"
          }
        ],
        progress: 65,
        current_question: 3,
        total_questions: 5,
        webcam_status: "active",
        screen_recording: true
      },
      {
        id: "2",
        student_name: "Jane Smith",
        student_id: "CS2021002",
        exam_id: 1,
        exam_title: "Data Structures Exam",
        status: "violation",
        warnings: 3,
        max_warnings: 3,
        last_activity: new Date(Date.now() - 1 * 60000).toISOString(),
        join_time: new Date(Date.now() - 50 * 60000).toISOString(),
        violations: [
          {
            type: "copy_paste",
            timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
            details: "Attempted to paste content"
          },
          {
            type: "tab_switch",
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
            details: "Multiple tab switches detected"
          },
          {
            type: "fullscreen_exit",
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            details: "Exited fullscreen mode"
          }
        ],
        progress: 40,
        current_question: 2,
        total_questions: 5,
        webcam_status: "blocked",
        screen_recording: false
      },
      {
        id: "3",
        student_name: "Mike Johnson",
        student_id: "CS2021003",
        exam_id: 2,
        exam_title: "Algorithms Exam",
        status: "completed",
        warnings: 0,
        max_warnings: 3,
        last_activity: new Date(Date.now() - 10 * 60000).toISOString(),
        join_time: new Date(Date.now() - 120 * 60000).toISOString(),
        violations: [],
        progress: 100,
        current_question: 5,
        total_questions: 5,
        webcam_status: "active",
        screen_recording: true
      }
    ]

    const mockRejoinRequests: RejoinRequest[] = [
      {
        id: "1",
        student_name: "Sarah Wilson",
        student_id: "CS2021004",
        exam_id: 1,
        exam_title: "Data Structures Exam",
        reason: "Internet connection lost due to power outage",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        status: "pending"
      },
      {
        id: "2",
        student_name: "Alex Brown",
        student_id: "CS2021005",
        exam_id: 2,
        exam_title: "Algorithms Exam",
        reason: "Browser crashed unexpectedly",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: "pending"
      }
    ]

    setActiveStudents(mockStudents)
    setRejoinRequests(mockRejoinRequests)
    setIsLoading(false)
  }

  const handleRejoinRequest = (requestId: string, action: 'approve' | 'reject') => {
    setRejoinRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    )

    toast({
      title: action === 'approve' ? "Request Approved" : "Request Rejected",
      description: `Student rejoin request has been ${action}d.`
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      case "violation":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "violation":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getTimeSince = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    return minutes < 1 ? "Just now" : `${minutes}m ago`
  }

  const filteredStudents = activeStudents.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesExam = examFilter === "all" || student.exam_id.toString() === examFilter
    
    return matchesSearch && matchesStatus && matchesExam
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Exam Monitoring</h1>
            <p className="text-lg text-gray-600 mt-1">
              Real-time monitoring of student activities during exams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? "Auto Refresh On" : "Auto Refresh Off"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMonitoringData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
          </div>
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
                  <p className="text-2xl font-bold text-green-600">
                    {activeStudents.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {activeStudents.filter(s => s.status === 'violation').length}
                  </p>
                  <p className="text-sm text-gray-600">Violations</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeStudents.filter(s => s.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {rejoinRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Rejoin Requests</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rejoin Requests */}
        {rejoinRequests.filter(r => r.status === 'pending').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Activity className="h-5 w-5" />
                  Pending Rejoin Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rejoinRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{request.student_name}</h4>
                          <Badge variant="outline">{request.student_id}</Badge>
                          <Badge variant="outline">{request.exam_title}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                        <p className="text-xs text-gray-500">Requested {getTimeSince(request.timestamp)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRejoinRequest(request.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejoinRequest(request.id, 'reject')}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="violation">Violations</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={examFilter} onValueChange={setExamFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    <SelectItem value="1">Data Structures</SelectItem>
                    <SelectItem value="2">Algorithms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Monitoring List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No students found</h3>
                <p className="text-gray-500">No students match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${
                  student.status === 'violation' ? 'border-red-200 bg-red-50' : 
                  student.status === 'active' ? 'border-green-200 bg-green-50' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {student.student_name}
                              </h3>
                              <Badge variant="outline">{student.student_id}</Badge>
                              <Badge className={getStatusColor(student.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(student.status)}
                                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                </div>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{student.exam_title}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Progress:</span> {student.progress}%
                          </div>
                          <div>
                            <span className="font-medium">Question:</span> {student.current_question}/{student.total_questions}
                          </div>
                          <div>
                            <span className="font-medium">Warnings:</span> {student.warnings}/{student.max_warnings}
                          </div>
                          <div>
                            <span className="font-medium">Last Activity:</span> {getTimeSince(student.last_activity)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={
                            student.webcam_status === 'active' ? 'border-green-200 text-green-700' :
                            student.webcam_status === 'blocked' ? 'border-red-200 text-red-700' :
                            'border-gray-200 text-gray-700'
                          }>
                            <Camera className="h-3 w-3 mr-1" />
                            Webcam: {student.webcam_status}
                          </Badge>
                          <Badge variant="outline" className={
                            student.screen_recording ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                          }>
                            <Monitor className="h-3 w-3 mr-1" />
                            Recording: {student.screen_recording ? 'Active' : 'Inactive'}
                          </Badge>
                          {student.violations.length > 0 && (
                            <Badge variant="outline" className="border-orange-200 text-orange-700">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {student.violations.length} Violations
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedStudent?.student_name} - Activity Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1">Student ID</h4>
                                  <p className="text-gray-600">{selectedStudent?.student_id}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Exam</h4>
                                  <p className="text-gray-600">{selectedStudent?.exam_title}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Join Time</h4>
                                  <p className="text-gray-600">{selectedStudent && formatTime(selectedStudent.join_time)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Status</h4>
                                  <Badge className={selectedStudent && getStatusColor(selectedStudent.status)}>
                                    {selectedStudent?.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              {selectedStudent && selectedStudent.violations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Security Violations</h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedStudent.violations.map((violation, idx) => (
                                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                          <strong className="text-red-800">
                                            {violation.type.replace('_', ' ').toUpperCase()}
                                          </strong>
                                          <span className="text-red-600 text-xs">
                                            {formatTime(violation.timestamp)}
                                          </span>
                                        </div>
                                        <p className="text-red-700">{violation.details}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          View Webcam
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Monitor className="h-4 w-4 mr-1" />
                          View Screen
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
