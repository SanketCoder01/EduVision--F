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
  Filter,
  Loader2,
  MessageSquare,
  Search,
  Eye,
  ArrowLeft,
  ArrowUpDown,
  Tag,
  Phone,
  Mail,
  ThumbsUp,
  X,
  Plus,
  Star,
  CalendarDays,
  MapPin,
  Users,
  FileText,
  Upload,
  Download,
  FileCheck,
  FileWarning,
  FileX,
  FilePlus
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function DocumentReissuePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [documentTypeFilter, setDocumentTypeFilter] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("requestDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("pending")
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null)
  
  // Mock data for document reissue requests - in a real app this would come from an API
  const [documentRequests, setDocumentRequests] = useState([
    {
      id: "DOC-2023-001",
      studentId: "STU2023045",
      studentName: "Rahul Sharma",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      documentType: "Degree Certificate",
      reason: "Original document was damaged due to water leakage at home. Need a replacement for job application.",
      requestDate: "2023-05-15",
      status: "Pending",
      priority: "High",
      contactEmail: "rahul.s@university.edu",
      contactPhone: "+91 9876543220",
      originalIssueDate: "2022-06-30",
      proofOfLoss: {
        name: "Damaged Certificate Photo.jpg",
        uploadedOn: "2023-05-15",
        size: "2.3 MB",
        url: "#"
      },
      paymentStatus: "Paid",
      paymentAmount: "₹500",
      paymentDate: "2023-05-15",
      paymentReference: "PAY123456",
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-15 14:30",
          text: "Thank you for your request. We will verify your details and process your request.",
          internal: false
        },
        {
          user: "Examination Department",
          time: "2023-05-16 10:15",
          text: "Verified student records. Original certificate was issued on 30th June 2022.",
          internal: true
        }
      ],
      reissuedDocument: null
    },
    {
      id: "DOC-2023-002",
      studentId: "STU2022078",
      studentName: "Priya Patel",
      department: "Electronics & Communication Engineering",
      year: "4th Year",
      documentType: "Provisional Certificate",
      reason: "Lost the original certificate while relocating to a new city. Need it for higher education application.",
      requestDate: "2023-05-10",
      status: "In Progress",
      priority: "Medium",
      contactEmail: "priya.p@university.edu",
      contactPhone: "+91 9876543221",
      originalIssueDate: "2023-01-15",
      proofOfLoss: {
        name: "Police Complaint.pdf",
        uploadedOn: "2023-05-10",
        size: "1.1 MB",
        url: "#"
      },
      paymentStatus: "Paid",
      paymentAmount: "₹300",
      paymentDate: "2023-05-10",
      paymentReference: "PAY123457",
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-10 15:45",
          text: "Thank you for your request. We will verify your details and process your request.",
          internal: false
        },
        {
          user: "Examination Department",
          time: "2023-05-11 11:30",
          text: "Verified student records. Original provisional certificate was issued on 15th January 2023.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-12 14:00",
          text: "Your request has been verified and is now being processed. The new certificate will be ready within 7 working days.",
          internal: false
        }
      ],
      reissuedDocument: null
    },
    {
      id: "DOC-2023-003",
      studentId: "STU2021033",
      studentName: "Amit Kumar",
      department: "Mechanical Engineering",
      year: "Alumni",
      documentType: "Transcript",
      reason: "Need additional copies for multiple university applications abroad.",
      requestDate: "2023-05-05",
      status: "Completed",
      priority: "Medium",
      contactEmail: "amit.k@university.edu",
      contactPhone: "+91 9876543222",
      originalIssueDate: "2022-07-10",
      proofOfLoss: null,
      paymentStatus: "Paid",
      paymentAmount: "₹400",
      paymentDate: "2023-05-05",
      paymentReference: "PAY123458",
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-05 10:30",
          text: "Thank you for your request. We will process your request for additional transcripts.",
          internal: false
        },
        {
          user: "Examination Department",
          time: "2023-05-06 09:45",
          text: "Verified student records. Original transcript was issued on 10th July 2022.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-08 14:15",
          text: "Your request has been processed. The additional transcripts are ready for collection.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-12 11:30",
          text: "The transcripts have been dispatched to your registered address via courier. Tracking number: TRACK123456.",
          internal: false
        }
      ],
      reissuedDocument: {
        name: "Amit_Kumar_Transcript.pdf",
        uploadedOn: "2023-05-08",
        size: "3.2 MB",
        url: "#"
      }
    },
    {
      id: "DOC-2023-004",
      studentId: "STU2020015",
      studentName: "Sneha Gupta",
      department: "Civil Engineering",
      year: "Alumni",
      documentType: "Migration Certificate",
      reason: "Original certificate had incorrect details. Need a corrected version.",
      requestDate: "2023-04-28",
      status: "Completed",
      priority: "High",
      contactEmail: "sneha.g@university.edu",
      contactPhone: "+91 9876543223",
      originalIssueDate: "2022-08-05",
      proofOfLoss: {
        name: "Original Certificate.pdf",
        uploadedOn: "2023-04-28",
        size: "1.8 MB",
        url: "#"
      },
      paymentStatus: "Waived",
      paymentAmount: "₹0",
      paymentDate: "-",
      paymentReference: "-",
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-28 16:15",
          text: "Thank you for your request. We will verify the details and process your request.",
          internal: false
        },
        {
          user: "Examination Department",
          time: "2023-04-29 10:30",
          text: "Verified student records. Original migration certificate was issued on 5th August 2022 with incorrect department name.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-04-29 14:45",
          text: "We have verified your request. Since the error was from our side, the fee for reissue has been waived.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-03 11:00",
          text: "Your corrected migration certificate is ready for collection. Please visit the examination department with your ID card.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-04 15:30",
          text: "The corrected migration certificate has been collected by the student.",
          internal: true
        }
      ],
      reissuedDocument: {
        name: "Sneha_Gupta_Migration_Certificate.pdf",
        uploadedOn: "2023-05-03",
        size: "2.1 MB",
        url: "#"
      }
    },
    {
      id: "DOC-2023-005",
      studentId: "STU2019027",
      studentName: "Vikram Singh",
      department: "Electrical Engineering",
      year: "Alumni",
      documentType: "Degree Certificate",
      reason: "Original certificate was lost during travel. Need a duplicate for employment verification.",
      requestDate: "2023-04-20",
      status: "Rejected",
      priority: "Medium",
      contactEmail: "vikram.s@university.edu",
      contactPhone: "+91 9876543224",
      originalIssueDate: "2021-06-25",
      proofOfLoss: {
        name: "Affidavit.pdf",
        uploadedOn: "2023-04-20",
        size: "1.5 MB",
        url: "#"
      },
      paymentStatus: "Pending",
      paymentAmount: "₹500",
      paymentDate: "-",
      paymentReference: "-",
      rejectionReason: "Insufficient documentation. Police complaint for lost document is required as per university policy.",
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-20 11:30",
          text: "Thank you for your request. We will verify your details and process your request.",
          internal: false
        },
        {
          user: "Examination Department",
          time: "2023-04-21 09:45",
          text: "Verified student records. Original degree certificate was issued on 25th June 2021.",
          internal: true
        },
        {
          user: "Legal Department",
          time: "2023-04-22 14:30",
          text: "The submitted affidavit is not sufficient as per university policy. A police complaint for lost document is mandatory for degree certificate reissue.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-04-23 10:15",
          text: "We regret to inform you that your request for a duplicate degree certificate cannot be processed with the current documentation. As per university policy, a police complaint for lost document is mandatory for degree certificate reissue. Please submit the required document and reapply.",
          internal: false
        }
      ],
      reissuedDocument: null
    }
  ])

  // Filter document requests based on active tab, search, and filters
  const getFilteredRequests = () => {
    let filteredByTab = [...documentRequests]
    
    if (activeTab === "pending") {
      filteredByTab = documentRequests.filter(item => item.status === "Pending")
    } else if (activeTab === "in-progress") {
      filteredByTab = documentRequests.filter(item => item.status === "In Progress")
    } else if (activeTab === "completed") {
      filteredByTab = documentRequests.filter(item => item.status === "Completed")
    } else if (activeTab === "rejected") {
      filteredByTab = documentRequests.filter(item => item.status === "Rejected")
    }
    
    return filteredByTab.filter(item => {
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDocumentType = documentTypeFilter === "All" || item.documentType === documentTypeFilter
      
      return matchesSearch && matchesDocumentType
    })
  }

  // Sort filtered requests
  const getSortedRequests = () => {
    const filteredRequests = getFilteredRequests()
    
    return [...filteredRequests].sort((a, b) => {
      let valueA, valueB
      
      if (sortField === "requestDate") {
        valueA = new Date(a.requestDate).getTime()
        valueB = new Date(b.requestDate).getTime()
      } else if (sortField === "originalIssueDate") {
        valueA = new Date(a.originalIssueDate).getTime()
        valueB = new Date(b.originalIssueDate).getTime()
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
  }

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedRequest || !replyText.trim()) return
    
    // In a real application, this would send the reply to an API
    const newComment = {
      user: "University Admin",
      time: new Date().toLocaleString(),
      text: replyText,
      internal: false
    }
    
    const updatedRequests = documentRequests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          comments: request.comments ? [...request.comments, newComment] : [newComment]
        }
      }
      return request
    })
    
    setDocumentRequests(updatedRequests)
    
    // Update the selected request to show the new comment
    const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
    if (updatedRequest) setSelectedRequest(updatedRequest)
    
    setReplyText("")
    alert(`Reply sent regarding ${selectedRequest.id}`)
  }

  const handleStatusChange = (requestId: string, newStatus: string) => {
    const updatedRequests = documentRequests.map(request => {
      if (request.id === requestId) {
        const statusUpdateComment = {
          user: "University Admin",
          time: new Date().toLocaleString(),
          text: `Status updated to ${newStatus}`,
          internal: true
        }
        
        return {
          ...request,
          status: newStatus,
          comments: request.comments ? [...request.comments, statusUpdateComment] : [statusUpdateComment]
        }
      }
      return request
    })
    
    setDocumentRequests(updatedRequests)
    
    // If we're viewing this request, update the selected request too
    if (selectedRequest && selectedRequest.id === requestId) {
      const updatedRequest = updatedRequests.find(request => request.id === requestId)
      if (updatedRequest) setSelectedRequest(updatedRequest)
    }
    
    alert(`Status updated to ${newStatus} for request ${requestId}`)
  }
  
  const handleUploadDocument = () => {
    if (!selectedRequest) return
    
    // In a real application, this would upload the document to a server
    // For this demo, we'll just simulate it
    const documentName = `${selectedRequest.studentName.replace(/ /g, "_")}_${selectedRequest.documentType.replace(/ /g, "_")}.pdf`
    
    const updatedRequests = documentRequests.map(request => {
      if (request.id === selectedRequest.id) {
        const uploadComment = {
          user: "University Admin",
          time: new Date().toLocaleString(),
          text: `Reissued document has been uploaded: ${documentName}`,
          internal: true
        }
        
        return {
          ...request,
          reissuedDocument: {
            name: documentName,
            uploadedOn: new Date().toLocaleDateString(),
            size: "2.5 MB",
            url: "#"
          },
          comments: request.comments ? [...request.comments, uploadComment] : [uploadComment]
        }
      }
      return request
    })
    
    setDocumentRequests(updatedRequests)
    
    // Update the selected request to show the new document
    const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
    if (updatedRequest) setSelectedRequest(updatedRequest)
    
    setUploadedDocument(documentName)
    alert(`Document ${documentName} uploaded successfully`)
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

  const priorityColors: Record<string, string> = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-red-100 text-red-800",
  }

  const documentTypes = [
    "All",
    "Degree Certificate",
    "Provisional Certificate",
    "Transcript",
    "Migration Certificate",
    "Transfer Certificate",
    "Character Certificate",
    "Bonafide Certificate",
    "Marksheet",
    "Other"
  ]

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
              <h1 className="text-3xl font-bold text-gray-900">Document Reissue</h1>
            </div>
            <p className="text-gray-500">Manage and process document reissue requests from students</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter document reissue requests by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, or reason..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" className="w-full" onClick={() => {
                      setSearchQuery("")
                      setDocumentTypeFilter("All")
                    }}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "pending" && "Pending Document Reissue Requests"}
                  {activeTab === "in-progress" && "In Progress Document Reissue Requests"}
                  {activeTab === "completed" && "Completed Document Reissue Requests"}
                  {activeTab === "rejected" && "Rejected Document Reissue Requests"}
                </CardTitle>
                <CardDescription>
                  {getSortedRequests().length} requests found
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
                            Request ID
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
                            onClick={() => handleSort("documentType")}
                          >
                            Document Type
                            {sortField === "documentType" && (
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
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("paymentStatus")}
                          >
                            Payment
                            {sortField === "paymentStatus" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("priority")}
                          >
                            Priority
                            {sortField === "priority" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
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
                      {getSortedRequests().length > 0 ? (
                        getSortedRequests().map((request) => (
                          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{request.id}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{request.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{request.studentName}</p>
                                  <p className="text-xs text-gray-500">{request.studentId} • {request.department}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {request.documentType}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {request.requestDate}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge 
                                variant={request.paymentStatus === "Paid" ? "default" : 
                                        request.paymentStatus === "Waived" ? "secondary" : "outline"}
                                className="flex items-center gap-1"
                              >
                                {request.paymentStatus}
                                {request.paymentStatus !== "Waived" && ` • ${request.paymentAmount}`}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={priorityColors[request.priority]}>{request.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[request.status]}>{request.status}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
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
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Pending")}>
                                      Mark as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "In Progress")}>
                                      Mark as In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Completed")}>
                                      Mark as Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Rejected")}>
                                      Mark as Rejected
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
                            No document reissue requests found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Document Reissue Request Details
                  </DialogTitle>
                  <DialogDescription>
                    Request ID: {selectedRequest.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Request Information</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Document Type</p>
                          <Badge variant="outline" className="mt-1">{selectedRequest.documentType}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={`${statusColors[selectedRequest.status]} mt-1`}>{selectedRequest.status}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reason for Reissue</p>
                        <p className="text-base">{selectedRequest.reason}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Request Date</p>
                          <p className="text-base">{selectedRequest.requestDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Original Issue Date</p>
                          <p className="text-base">{selectedRequest.originalIssueDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <Badge className={`${priorityColors[selectedRequest.priority]} mt-1`}>{selectedRequest.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Payment Status</p>
                          <Badge 
                            variant={selectedRequest.paymentStatus === "Paid" ? "default" : 
                                    selectedRequest.paymentStatus === "Waived" ? "secondary" : "outline"}
                            className="mt-1"
                          >
                            {selectedRequest.paymentStatus}
                            {selectedRequest.paymentStatus !== "Waived" && ` • ${selectedRequest.paymentAmount}`}
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedRequest.paymentStatus === "Paid" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Payment Date</p>
                            <p className="text-base">{selectedRequest.paymentDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Payment Reference</p>
                            <p className="text-base">{selectedRequest.paymentReference}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedRequest.rejectionReason && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                          <p className="text-base text-red-600">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Student Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedRequest.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedRequest.studentName}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.studentId} • {selectedRequest.department}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.year}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a href={`mailto:${selectedRequest.contactEmail}`} className="text-blue-600 hover:underline">
                              {selectedRequest.contactEmail}
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${selectedRequest.contactPhone}`} className="text-blue-600 hover:underline">
                              {selectedRequest.contactPhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRequest.proofOfLoss && (
                      <>
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium mb-4">Proof of Loss/Damage</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileWarning className="h-5 w-5 text-amber-500" />
                              <div>
                                <p className="text-sm font-medium">{selectedRequest.proofOfLoss.name}</p>
                                <p className="text-xs text-gray-500">Uploaded on {selectedRequest.proofOfLoss.uploadedOn} • {selectedRequest.proofOfLoss.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={selectedRequest.proofOfLoss.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedRequest.reissuedDocument && (
                      <>
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium mb-4">Reissued Document</h3>
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm font-medium">{selectedRequest.reissuedDocument.name}</p>
                                <p className="text-xs text-gray-500">Uploaded on {selectedRequest.reissuedDocument.uploadedOn} • {selectedRequest.reissuedDocument.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={selectedRequest.reissuedDocument.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    {/* Comments/Communication History */}
                    <h3 className="text-lg font-medium mb-4">Communication History</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[400px] overflow-y-auto">
                      {selectedRequest.comments && selectedRequest.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRequest.comments.map((comment: any, index: number) => (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                Change Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedRequest.id, "Pending")}>
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedRequest.id, "In Progress")}>
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedRequest.id, "Completed")}>
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedRequest.id, "Rejected")}>
                                Mark as Rejected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                Change Priority
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                const updatedRequests = documentRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "Low" }
                                  }
                                  return request
                                })
                                setDocumentRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to Low
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedRequests = documentRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "Medium" }
                                  }
                                  return request
                                })
                                setDocumentRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to Medium
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedRequests = documentRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "High" }
                                  }
                                  return request
                                })
                                setDocumentRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to High
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-x-2">
                          {!selectedRequest.reissuedDocument && (
                            <Button variant="outline" onClick={handleUploadDocument}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </Button>
                          )}
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
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
