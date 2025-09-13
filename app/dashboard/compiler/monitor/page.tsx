"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  AlertTriangle,
  Shield,
  Clock,
  User,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Monitor,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FacultyMonitoringPage() {
  const { toast } = useToast()
  const [studentActivities, setStudentActivities] = useState<any[]>([])
  const [rejoinRequests, setRejoinRequests] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isMonitoring, setIsMonitoring] = useState(true)

  // Load student activities and rejoin requests
  useEffect(() => {
    const loadData = () => {
      try {
        const activities = JSON.parse(localStorage.getItem("faculty_student_activities") || "[]")
        const requests = JSON.parse(localStorage.getItem("rejoin_requests") || "[]")
        
        // Add sample data if none exists
        if (activities.length === 0) {
          const sampleActivities = [
            {
              studentId: "student_001",
              studentName: "Alice Johnson",
              assignmentId: "assignment-1",
              assignmentTitle: "Data Structures Implementation",
              activity: {
                type: "security_violation",
                description: "Tab switched or window minimized",
                timestamp: new Date(Date.now() - 300000).toISOString(),
                severity: "high"
              },
              timestamp: new Date(Date.now() - 300000).toISOString(),
            },
            {
              studentId: "student_002",
              studentName: "Bob Smith",
              assignmentId: "assignment-1",
              assignmentTitle: "Data Structures Implementation",
              activity: {
                type: "normal",
                description: "Code execution started",
                timestamp: new Date(Date.now() - 120000).toISOString(),
                severity: "low"
              },
              timestamp: new Date(Date.now() - 120000).toISOString(),
            },
            {
              studentId: "student_003",
              studentName: "Carol Davis",
              assignmentId: "assignment-1",
              assignmentTitle: "Data Structures Implementation",
              activity: {
                type: "security_violation",
                description: "Attempted copy/paste operation",
                timestamp: new Date(Date.now() - 600000).toISOString(),
                severity: "high"
              },
              timestamp: new Date(Date.now() - 600000).toISOString(),
            }
          ]
          localStorage.setItem("faculty_student_activities", JSON.stringify(sampleActivities))
          setStudentActivities(sampleActivities)
        } else {
          setStudentActivities(activities)
        }

        if (requests.length === 0) {
          const sampleRequests = [
            {
              id: "req_001",
              studentId: "student_004",
              studentName: "David Wilson",
              assignmentId: "assignment-1",
              assignmentTitle: "Data Structures Implementation",
              reason: "Multiple security violations - auto-exited",
              requestedAt: new Date(Date.now() - 900000).toISOString(),
              status: "pending",
              warnings: 3
            }
          ]
          localStorage.setItem("rejoin_requests", JSON.stringify(sampleRequests))
          setRejoinRequests(sampleRequests)
        } else {
          setRejoinRequests(requests)
        }
      } catch (error) {
        console.error("Error loading monitoring data:", error)
      }
    }

    loadData()
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApproveRejoin = (request: any) => {
    const updatedRequests = rejoinRequests.map(req => 
      req.id === request.id ? { ...req, status: "approved" } : req
    )
    setRejoinRequests(updatedRequests)
    localStorage.setItem("rejoin_requests", JSON.stringify(updatedRequests))
    
    // Allow student to rejoin
    localStorage.setItem(`rejoin_approved_${request.studentId}`, "true")
    
    toast({
      title: "Request Approved",
      description: `${request.studentName} can now rejoin the exam.`,
    })
    
    setShowApprovalDialog(false)
  }

  const handleRejectRejoin = (request: any) => {
    const updatedRequests = rejoinRequests.map(req => 
      req.id === request.id ? { ...req, status: "rejected" } : req
    )
    setRejoinRequests(updatedRequests)
    localStorage.setItem("rejoin_requests", JSON.stringify(updatedRequests))
    
    toast({
      title: "Request Rejected",
      description: `${request.studentName}'s rejoin request has been rejected.`,
      variant: "destructive",
    })
    
    setShowApprovalDialog(false)
  }

  const getActivityIcon = (activity: any) => {
    switch (activity.type) {
      case "security_violation":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "normal":
        return <Activity className="h-4 w-4 text-green-500" />
      default:
        return <Eye className="h-4 w-4 text-blue-500" />
    }
  }

  const getActivityColor = (activity: any) => {
    switch (activity.severity) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const formatTimeAgo = (timestamp: any) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const activeStudents = [...new Set(studentActivities.map(a => a.studentId))].length
  const securityViolations = studentActivities.filter(a => a.activity.type === "security_violation").length
  const pendingRequests = rejoinRequests.filter(r => r.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-Time Student Monitoring</h1>
            <p className="text-gray-600 mt-1">Monitor student activities during coding exams</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isMonitoring ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {isMonitoring ? "Live Monitoring" : "Disconnected"}
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Monitor className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold">{activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Violations</p>
                  <p className="text-2xl font-bold">{securityViolations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejoin Requests</p>
                  <p className="text-2xl font-bold">{pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold">{studentActivities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Student Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {studentActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No student activities yet
                    </div>
                  ) : (
                    studentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 border-l-4 rounded-r-lg ${getActivityColor(activity.activity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getActivityIcon(activity.activity)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {activity.studentName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.assignmentTitle}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.activity.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rejoin Requests */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Rejoin Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rejoinRequests.filter(r => r.status === "pending").length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending requests
                    </div>
                  ) : (
                    rejoinRequests
                      .filter(r => r.status === "pending")
                      .map((request) => (
                        <div key={request.id} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{request.studentName}</p>
                              <p className="text-sm text-gray-600">{request.assignmentTitle}</p>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              {request.warnings} warnings
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3">{request.reason}</p>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowApprovalDialog(true)
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRejoin(request)}
                              className="flex-1"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Approve Rejoin Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>{selectedRequest.studentName}</strong> was auto-exited due to {selectedRequest.warnings} security violations.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm"><strong>Assignment:</strong> {selectedRequest.assignmentTitle}</p>
                <p className="text-sm"><strong>Reason:</strong> {selectedRequest.reason}</p>
                <p className="text-sm"><strong>Requested:</strong> {formatTimeAgo(selectedRequest.requestedAt)}</p>
              </div>
              
              <p className="text-sm text-gray-600">
                Are you sure you want to allow this student to rejoin the exam? They will be able to continue from where they left off.
              </p>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleApproveRejoin(selectedRequest)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Rejoin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
