"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle,
  Calendar, 
  Check,
  Clock, 
  Download, 
  Eye,
  FileText, 
  HelpCircle, 
  Loader2,
  Phone,
  Search,
  User,
  UserCheck,
  X
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for submitted leave applications
const leaveApplications = [
  {
    id: 1,
    studentName: "Rahul Sharma",
    rollNumber: "CS21B1001",
    class: "TE Computer Science - A",
    department: "Computer Science Engineering",
    contactNo: "+91 9876543210",
    email: "rahul.sharma@student.edu",
    leaveType: "Medical Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    totalDays: 4,
    reason: "Fever and cold. Doctor has advised rest for 4 days. Attached medical certificate from Dr. Patel.",
    status: "Pending",
    submittedDate: "2024-01-12",
    documentUrl: "/medical-cert-rahul.pdf",
    parentContact: "+91 9876543211",
    address: "123 Main Street, Mumbai, Maharashtra"
  },
  {
    id: 2,
    studentName: "Priya Patel",
    rollNumber: "CS21B1002",
    class: "TE Computer Science - A", 
    department: "Computer Science Engineering",
    contactNo: "+91 9876543220",
    email: "priya.patel@student.edu",
    leaveType: "Personal Leave",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    totalDays: 3,
    reason: "Sister's wedding ceremony at hometown. Family function requires attendance.",
    status: "Approved",
    submittedDate: "2024-01-17",
    approvedDate: "2024-01-18",
    documentUrl: "",
    parentContact: "+91 9876543221",
    address: "456 Park Avenue, Pune, Maharashtra"
  },
  {
    id: 3,
    studentName: "Amit Kumar",
    rollNumber: "CS21B1003",
    class: "TE Computer Science - A",
    department: "Computer Science Engineering", 
    contactNo: "+91 9876543230",
    email: "amit.kumar@student.edu",
    leaveType: "Event Participation",
    startDate: "2024-01-25",
    endDate: "2024-01-27",
    totalDays: 3,
    reason: "Participating in National Level Hackathon at IIT Bombay. Event invitation attached.",
    status: "Rejected",
    submittedDate: "2024-01-22",
    rejectedDate: "2024-01-23",
    rejectionReason: "Clash with mid-semester examinations. Cannot approve leave during exam period.",
    documentUrl: "/hackathon-invite-amit.pdf",
    parentContact: "+91 9876543231",
    address: "789 College Road, Nashik, Maharashtra"
  },
  {
    id: 4,
    studentName: "Sneha Desai",
    rollNumber: "CS21B1004",
    class: "TE Computer Science - A",
    department: "Computer Science Engineering",
    contactNo: "+91 9876543240", 
    email: "sneha.desai@student.edu",
    leaveType: "Bereavement Leave",
    startDate: "2024-01-10",
    endDate: "2024-01-14",
    totalDays: 5,
    reason: "Grandfather passed away. Need to attend funeral and family rituals.",
    status: "Approved",
    submittedDate: "2024-01-09",
    approvedDate: "2024-01-09",
    documentUrl: "",
    parentContact: "+91 9876543241",
    address: "321 Temple Street, Aurangabad, Maharashtra"
  }
]

export default function StudentLeaveManagement() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const filteredApplications = leaveApplications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const handleApprove = async (applicationId: number) => {
    setActionLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Leave Approved",
        description: "Student leave application has been approved successfully.",
      })
      setSelectedApplication(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave application.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (applicationId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this application.",
        variant: "destructive"
      })
      return
    }

    setActionLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Leave Rejected",
        description: "Student leave application has been rejected with reason provided.",
      })
      setSelectedApplication(null)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to reject leave application.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusStats = () => {
    const pending = leaveApplications.filter(app => app.status === "Pending").length
    const approved = leaveApplications.filter(app => app.status === "Approved").length
    const rejected = leaveApplications.filter(app => app.status === "Rejected").length
    return { pending, approved, rejected, total: leaveApplications.length }
  }

  const stats = getStatusStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <UserCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Student Leave Management</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Review and approve student leave applications</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <X className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="applications">Leave Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Leave Applications</CardTitle>
                <CardDescription>Review, approve, or reject student leave requests</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by student name, roll number, or leave type..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((application) => (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/placeholder-user.jpg`} />
                            <AvatarFallback>{application.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{application.studentName}</h3>
                                <p className="text-sm text-gray-500">{application.rollNumber} • {application.class}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  application.status === "Approved" ? "bg-green-100 text-green-700" :
                                  application.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                } border-0 mt-1 sm:mt-0`}
                              >
                                {application.status}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {application.leaveType}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {application.startDate} to {application.endDate} ({application.totalDays} days)
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {application.contactNo}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Submitted: {application.submittedDate}
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{application.reason}</p>

                            {application.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start">
                                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span><strong>Rejection Reason:</strong> {application.rejectionReason}</span>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => setSelectedApplication(application)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Leave Application Details</DialogTitle>
                                    <DialogDescription>
                                      Review complete application information
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedApplication && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Student Name</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.studentName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Roll Number</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.rollNumber}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Class</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.class}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Department</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.department}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Contact Number</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.contactNo}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Parent Contact</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.parentContact}</p>
                                        </div>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Leave Type</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.leaveType}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Duration</label>
                                          <p className="text-sm text-gray-900">{selectedApplication.startDate} to {selectedApplication.endDate} ({selectedApplication.totalDays} days)</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Reason</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApplication.reason}</p>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApplication.address}</p>
                                      </div>

                                      {selectedApplication.documentUrl && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Supporting Document</label>
                                          <Button variant="outline" size="sm" className="mt-1">
                                            <Download className="h-3 w-3 mr-1" />
                                            Download Document
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {selectedApplication?.status === "Pending" && (
                                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                      <div className="flex-1">
                                        <Textarea
                                          placeholder="Rejection reason (required if rejecting)"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          rows={2}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => handleReject(selectedApplication.id)}
                                          disabled={actionLoading}
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                          Reject
                                        </Button>
                                        <Button
                                          onClick={() => handleApprove(selectedApplication.id)}
                                          disabled={actionLoading}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                          Approve
                                        </Button>
                                      </div>
                                    </DialogFooter>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {application.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(application.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => setSelectedApplication(application)}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {application.documentUrl && (
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" />
                                  Document
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No leave applications found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Type Distribution</CardTitle>
                  <CardDescription>Breakdown of leave applications by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Medical Leave", "Personal Leave", "Event Participation", "Bereavement Leave"].map((type) => {
                      const count = leaveApplications.filter(app => app.leaveType === type).length
                      const percentage = Math.round((count / leaveApplications.length) * 100)
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Leave applications over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chart visualization would be implemented here</p>
                    <p className="text-sm text-gray-400 mt-2">Showing trends for current academic year</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
