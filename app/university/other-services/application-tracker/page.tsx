"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  AlertCircle,
  Calendar, 
  Check,
  Clock, 
  Download, 
  FileText, 
  Filter,
  Loader2,
  MessageSquare,
  Search,
  Upload,
  Eye,
  ArrowLeft,
  ArrowUpDown,
  FileCheck,
  FileX,
  FileClock,
  FileQuestion
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function ApplicationTrackerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("requestDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [documentUrl, setDocumentUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  
  // Mock data for applications - in a real app this would come from an API
  const [applications, setApplications] = useState([
    {
      id: "APP-2023-001",
      type: "Bonafide Certificate",
      purpose: "Bank Loan",
      studentId: "STU2023025",
      studentName: "Rahul Sharma",
      department: "Computer Science & Engineering",
      year: "Third Year",
      requestDate: "2023-05-10",
      status: "Pending",
      currentStage: "Document Verification",
      completionDate: null,
      documentUrl: null,
      timeline: [
        {
          stage: "Application Submitted",
          date: "2023-05-10",
          time: "10:30 AM",
          status: "Completed",
          notes: "Application received and logged in the system."
        },
        {
          stage: "Document Verification",
          date: "2023-05-11",
          time: "09:15 AM",
          status: "In Progress",
          notes: "Verifying student records and eligibility."
        },
        {
          stage: "Department Approval",
          date: null,
          time: null,
          status: "Pending",
          notes: null
        },
        {
          stage: "Certificate Generation",
          date: null,
          time: null,
          status: "Pending",
          notes: null
        },
        {
          stage: "Final Approval",
          date: null,
          time: null,
          status: "Pending",
          notes: null
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-10 11:45 AM",
          text: "Application received and forwarded to the verification team.",
          internal: true
        },
        {
          user: "Verification Team",
          time: "2023-05-11 09:15 AM",
          text: "Started verification process. Student records being checked.",
          internal: true
        }
      ]
    },
    {
      id: "APP-2023-002",
      type: "Other Document",
      documentType: "Internship Letter",
      purpose: "Summer Internship at TechCorp",
      studentId: "STU2023056",
      studentName: "Priya Patel",
      department: "Artificial Intelligence & Data Science",
      year: "Second Year",
      requestDate: "2023-05-08",
      status: "In Progress",
      currentStage: "Department Approval",
      completionDate: null,
      documentUrl: null,
      timeline: [
        {
          stage: "Application Submitted",
          date: "2023-05-08",
          time: "02:45 PM",
          status: "Completed",
          notes: "Application received with internship details."
        },
        {
          stage: "Document Verification",
          date: "2023-05-09",
          time: "10:30 AM",
          status: "Completed",
          notes: "Student records verified. All requirements met."
        },
        {
          stage: "Department Approval",
          date: "2023-05-10",
          time: "11:20 AM",
          status: "In Progress",
          notes: "Awaiting final approval from department head."
        },
        {
          stage: "Letter Generation",
          date: null,
          time: null,
          status: "Pending",
          notes: null
        },
        {
          stage: "Final Approval",
          date: null,
          time: null,
          status: "Pending",
          notes: null
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-08 03:30 PM",
          text: "Application received and forwarded to the verification team.",
          internal: true
        },
        {
          user: "Verification Team",
          time: "2023-05-09 10:30 AM",
          text: "Student records verified. Proceeding to department approval.",
          internal: true
        },
        {
          user: "Department Coordinator",
          time: "2023-05-10 11:20 AM",
          text: "Reviewed application. Forwarded to department head for final approval.",
          internal: true
        }
      ]
    },
    {
      id: "APP-2023-003",
      type: "Bonafide Certificate",
      purpose: "Visa Application",
      studentId: "STU2023089",
      studentName: "Arjun Singh",
      department: "Cyber Security",
      year: "Fourth Year",
      requestDate: "2023-05-05",
      status: "Completed",
      currentStage: "Certificate Issued",
      completionDate: "2023-05-12",
      documentUrl: "/documents/bonafide-STU2023089.pdf",
      timeline: [
        {
          stage: "Application Submitted",
          date: "2023-05-05",
          time: "09:15 AM",
          status: "Completed",
          notes: "Application received for visa purposes."
        },
        {
          stage: "Document Verification",
          date: "2023-05-06",
          time: "11:30 AM",
          status: "Completed",
          notes: "Student records verified. All requirements met."
        },
        {
          stage: "Department Approval",
          date: "2023-05-08",
          time: "10:45 AM",
          status: "Completed",
          notes: "Approved by department head."
        },
        {
          stage: "Certificate Generation",
          date: "2023-05-10",
          time: "02:30 PM",
          status: "Completed",
          notes: "Certificate generated with official seal."
        },
        {
          stage: "Final Approval",
          date: "2023-05-12",
          time: "11:15 AM",
          status: "Completed",
          notes: "Certificate approved and issued to student."
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-05 10:00 AM",
          text: "Application received and forwarded to the verification team.",
          internal: true
        },
        {
          user: "Verification Team",
          time: "2023-05-06 11:30 AM",
          text: "Student records verified. Proceeding to department approval.",
          internal: true
        },
        {
          user: "Department Head",
          time: "2023-05-08 10:45 AM",
          text: "Application approved. Forwarded for certificate generation.",
          internal: true
        },
        {
          user: "Certificate Team",
          time: "2023-05-10 02:30 PM",
          text: "Certificate generated and sent for final approval.",
          internal: true
        },
        {
          user: "Registrar Office",
          time: "2023-05-12 11:15 AM",
          text: "Certificate approved and issued. Student notified for collection.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-12 02:30 PM",
          text: "Certificate collected by student. Process completed.",
          internal: true
        }
      ]
    },
    {
      id: "APP-2023-004",
      type: "Other Document",
      documentType: "Character Certificate",
      purpose: "Job Application",
      studentId: "STU2023112",
      studentName: "Neha Gupta",
      department: "Electronics & Communication",
      year: "Fourth Year",
      requestDate: "2023-05-07",
      status: "Rejected",
      currentStage: "Application Rejected",
      completionDate: "2023-05-09",
      documentUrl: null,
      timeline: [
        {
          stage: "Application Submitted",
          date: "2023-05-07",
          time: "03:45 PM",
          status: "Completed",
          notes: "Application received for character certificate."
        },
        {
          stage: "Document Verification",
          date: "2023-05-08",
          time: "10:15 AM",
          status: "Completed",
          notes: "Student records verified. Disciplinary issues found."
        },
        {
          stage: "Application Rejected",
          date: "2023-05-09",
          time: "02:30 PM",
          status: "Completed",
          notes: "Application rejected due to pending disciplinary action."
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-07 04:15 PM",
          text: "Application received and forwarded to the verification team.",
          internal: true
        },
        {
          user: "Verification Team",
          time: "2023-05-08 10:15 AM",
          text: "Student records show pending disciplinary action. Forwarding to committee for review.",
          internal: true
        },
        {
          user: "Disciplinary Committee",
          time: "2023-05-09 01:45 PM",
          text: "Cannot issue character certificate due to pending disciplinary case. Recommend rejection.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-09 02:30 PM",
          text: "Application rejected. Student notified with reason.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-09 02:35 PM",
          text: "Dear student, your application for a character certificate has been rejected due to a pending disciplinary case. Please contact the Student Affairs office for more information.",
          internal: false
        }
      ]
    }
  ])

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application.purpose && application.purpose.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === "All" || application.status === statusFilter
    const matchesType = typeFilter === "All" || application.type === typeFilter
    const matchesDepartment = departmentFilter === "All" || application.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesDepartment
  })

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let valueA, valueB
    
    if (sortField === "requestDate") {
      valueA = new Date(a.requestDate).getTime()
      valueB = new Date(b.requestDate).getTime()
    } else if (sortField === "completionDate") {
      valueA = a.completionDate ? new Date(a.completionDate).getTime() : 0
      valueB = b.completionDate ? new Date(b.completionDate).getTime() : 0
    } else {
      valueA = a[sortField as keyof typeof a] || ""
      valueB = b[sortField as keyof typeof b] || ""
    }
    
    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedApplication || !replyText.trim()) return
    
    // In a real application, this would send the reply to an API
    const updatedApplications = applications.map(application => {
      if (application.id === selectedApplication.id) {
        const newComment = {
          user: "University Admin",
          time: new Date().toLocaleString(),
          text: replyText,
          internal: false
        }
        
        return {
          ...application,
          comments: application.comments ? [...application.comments, newComment] : [newComment]
        }
      }
      return application
    })
    
    setApplications(updatedApplications)
    setReplyText("")
    
    // Update the selected application to show the new comment
    const updatedApplication = updatedApplications.find(app => app.id === selectedApplication.id)
    if (updatedApplication) setSelectedApplication(updatedApplication)
    
    alert(`Reply sent regarding application ${selectedApplication.id}`)
  }

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // Update the status in our state
    const updatedApplications = applications.map(application => {
      if (application.id === applicationId) {
        const statusUpdateComment = {
          user: "University Admin",
          time: new Date().toLocaleString(),
          text: `Status updated to ${newStatus}`,
          internal: true
        }
        
        const updates: any = {
          status: newStatus,
          comments: application.comments ? [...application.comments, statusUpdateComment] : [statusUpdateComment]
        }
        
        if (newStatus === "Completed") {
          updates.completionDate = new Date().toLocaleDateString()
          updates.currentStage = "Certificate Issued"
          
          // Update the timeline
          const updatedTimeline = application.timeline.map(stage => {
            if (stage.status === "In Progress" || stage.status === "Pending") {
              return {
                ...stage,
                status: "Completed",
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                notes: "Completed by university admin"
              }
            }
            return stage
          })
          
          updates.timeline = updatedTimeline
        } else if (newStatus === "Rejected") {
          updates.completionDate = new Date().toLocaleDateString()
          updates.currentStage = "Application Rejected"
          
          // Add rejection stage to timeline if it doesn't exist
          const hasRejectionStage = application.timeline.some(stage => stage.stage === "Application Rejected")
          
          if (!hasRejectionStage) {
            updates.timeline = [
              ...application.timeline,
              {
                stage: "Application Rejected",
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "Completed",
                notes: "Application rejected by university admin"
              }
            ]
          }
        } else if (newStatus === "In Progress") {
          // Find the first pending stage and mark it as in progress
          const pendingStageIndex = application.timeline.findIndex(stage => stage.status === "Pending")
          
          if (pendingStageIndex !== -1) {
            const updatedTimeline = [...application.timeline]
            updatedTimeline[pendingStageIndex] = {
              ...updatedTimeline[pendingStageIndex],
              status: "In Progress",
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              notes: "Started processing by university admin"
            }
            
            updates.timeline = updatedTimeline
            updates.currentStage = updatedTimeline[pendingStageIndex].stage
          }
        }
        
        return {
          ...application,
          ...updates
        }
      }
      return application
    })
    
    setApplications(updatedApplications)
    alert(`Status updated to ${newStatus} for application ${applicationId}`)
    
    // If we're viewing this application, update the selected application too
    if (selectedApplication && selectedApplication.id === applicationId) {
      const updatedApplication = updatedApplications.find(a => a.id === applicationId)
      if (updatedApplication) setSelectedApplication(updatedApplication)
    }
  }
  
  const handleUploadDocument = () => {
    if (!selectedApplication || !documentUrl.trim()) {
      alert("Please enter a document URL")
      return
    }
    
    setIsUploading(true)
    
    // Simulate upload delay
    setTimeout(() => {
      // Update the application with the document URL
      const updatedApplications = applications.map(application => {
        if (application.id === selectedApplication.id) {
          const documentUploadComment = {
            user: "University Admin",
            time: new Date().toLocaleString(),
            text: `Document uploaded: ${documentUrl}`,
            internal: true
          }
          
          return {
            ...application,
            documentUrl: documentUrl,
            comments: application.comments ? [...application.comments, documentUploadComment] : [documentUploadComment]
          }
        }
        return application
      })
      
      setApplications(updatedApplications)
      
      // Update the selected application
      const updatedApplication = updatedApplications.find(app => app.id === selectedApplication.id)
      if (updatedApplication) setSelectedApplication(updatedApplication)
      
      setDocumentUrl("")
      setIsUploading(false)
      alert(`Document uploaded for application ${selectedApplication.id}`)
    }, 1500)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field and default to descending
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Completed": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
  }

  const statusIcons: Record<string, any> = {
    "Pending": <FileClock className="h-4 w-4" />,
    "In Progress": <Loader2 className="h-4 w-4" />,
    "Completed": <FileCheck className="h-4 w-4" />,
    "Rejected": <FileX className="h-4 w-4" />,
  }

  const applicationTypes = ["All", "Bonafide Certificate", "Other Document"]
  const departments = ["All", "Computer Science & Engineering", "Artificial Intelligence & Data Science", "Cyber Security", "Electronics & Communication"]
  const statuses = ["All", "Pending", "In Progress", "Completed", "Rejected"]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/university/other-services">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
            </div>
            <p className="text-gray-500">Track and manage student document requests and applications</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter applications by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, or purpose..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("All")
                  setTypeFilter("All")
                  setDepartmentFilter("All")
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Applications</CardTitle>
            <CardDescription>
              {sortedApplications.length} applications found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("id")}
                      >
                        ID
                        {sortField === "id" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("studentName")}
                      >
                        Student
                        {sortField === "studentName" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("type")}
                      >
                        Type
                        {sortField === "type" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("purpose")}
                      >
                        Purpose
                        {sortField === "purpose" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("requestDate")}
                      >
                        Request Date
                        {sortField === "requestDate" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Current Stage
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button 
                        className="flex items-center gap-1 hover:text-gray-900"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedApplications.length > 0 ? (
                    sortedApplications.map((application) => (
                      <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{application.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{application.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{application.studentName}</p>
                              <p className="text-xs text-gray-500">{application.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p>{application.type}</p>
                            {application.documentType && (
                              <p className="text-xs text-gray-500">{application.documentType}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{application.purpose}</td>
                        <td className="py-3 px-4 text-sm">{application.requestDate}</td>
                        <td className="py-3 px-4 text-sm">{application.currentStage}</td>
                        <td className="py-3 px-4">
                          <Badge className={`flex items-center gap-1 ${statusColors[application.status]}`}>
                            {statusIcons[application.status]}
                            {application.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewApplication(application)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(application.id, "In Progress")}>
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(application.id, "Completed")}>
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(application.id, "Rejected")}>
                                  Reject Application
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        No applications found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Application Details
                  </DialogTitle>
                  <DialogDescription>
                    Application ID: {selectedApplication.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Application Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p className="text-base">{selectedApplication.type}</p>
                          {selectedApplication.documentType && (
                            <p className="text-sm text-gray-500">{selectedApplication.documentType}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Purpose</p>
                          <p className="text-base">{selectedApplication.purpose}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Request Date</p>
                          <p className="text-base">{selectedApplication.requestDate}</p>
                        </div>
                        {selectedApplication.completionDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Completion Date</p>
                            <p className="text-base">{selectedApplication.completionDate}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Current Stage</p>
                          <p className="text-base">{selectedApplication.currentStage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={`${statusColors[selectedApplication.status]} flex items-center gap-1`}>
                            {statusIcons[selectedApplication.status]}
                            {selectedApplication.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedApplication.documentUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Document</p>
                          <Button variant="outline" size="sm" className="mt-1 gap-1">
                            <Download className="h-4 w-4" />
                            Download Document
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Student Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedApplication.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedApplication.studentName}</p>
                          <p className="text-sm text-gray-500">{selectedApplication.studentId}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-base">{selectedApplication.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Year</p>
                        <p className="text-base">{selectedApplication.year}</p>
                      </div>
                    </div>
                    
                    {/* Document Upload Section */}
                    {selectedApplication.status !== "Completed" && selectedApplication.status !== "Rejected" && (
                      <>
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium mb-4">Upload Document</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Input
                              placeholder="Enter document URL"
                              value={documentUrl}
                              onChange={(e) => setDocumentUrl(e.target.value)}
                              disabled={isUploading}
                            />
                            <Button 
                              onClick={handleUploadDocument}
                              disabled={!documentUrl.trim() || isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload the document to be sent to the student. This could be a certificate, letter, or any other requested document.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    {/* Application Timeline */}
                    <h3 className="text-lg font-medium mb-4">Application Timeline</h3>
                    <div className="space-y-4 mb-6">
                      {selectedApplication.timeline.map((stage: any, index: number) => (
                        <div key={index} className="relative pl-6 pb-4">
                          {/* Timeline connector */}
                          {index < selectedApplication.timeline.length - 1 && (
                            <div className="absolute left-[9px] top-[24px] bottom-0 w-0.5 bg-gray-200"></div>
                          )}
                          
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-1 h-[18px] w-[18px] rounded-full border-2 ${
                            stage.status === "Completed" ? "bg-green-100 border-green-500" :
                            stage.status === "In Progress" ? "bg-blue-100 border-blue-500" :
                            "bg-gray-100 border-gray-300"
                          }`}></div>
                          
                          {/* Stage content */}
                          <div>
                            <p className="font-medium">{stage.stage}</p>
                            {stage.date ? (
                              <p className="text-sm text-gray-500">
                                {stage.date} {stage.time && `at ${stage.time}`}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">Pending</p>
                            )}
                            {stage.notes && <p className="text-sm mt-1">{stage.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comments/Communication History */}
                    <h3 className="text-lg font-medium mb-4">Communication History</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[300px] overflow-y-auto">
                      {selectedApplication.comments && selectedApplication.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedApplication.comments.map((comment: any, index: number) => (
                            <div 
                              key={index} 
                              className={`rounded-lg p-3 shadow-sm ${comment.internal ? 'bg-yellow-50 border border-yellow-100' : 'bg-white'}`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  {comment.internal && (
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Internal Note</span>
                                  )}
                                  {comment.user}
                                </p>
                                <p className="text-xs text-gray-500">{comment.time}</p>
                              </div>
                              <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No communication history available</p>
                      )}
                    </div>

                    {/* Reply Form */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Send Reply</h4>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="internal-note" className="rounded text-blue-600" />
                          <label htmlFor="internal-note" className="text-sm">Internal Note Only</label>
                        </div>
                      </div>
                      <Textarea 
                        placeholder="Type your response here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedApplication.id, "In Progress")}
                          >
                            <Loader2 className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedApplication.id, "Completed")}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Completed
                          </Button>
                        </div>
                        <Button 
                          onClick={handleSendReply}
                          disabled={!replyText.trim()}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
