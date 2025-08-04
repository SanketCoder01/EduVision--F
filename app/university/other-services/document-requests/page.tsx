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
import { 
  AlertCircle,
  Calendar, 
  Check,
  Clock, 
  Download, 
  FileText, 
  HelpCircle, 
  Loader2,
  Plus,
  Search,
  Upload,
  Eye,
  MessageSquare,
  X,
  Filter,
  ArrowLeft
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Mock data for document requests
const documentRequests = [
  {
    id: "DOC-2023-001",
    studentId: "STU2023001",
    studentName: "Rahul Sharma",
    department: "Computer Science & Engineering",
    year: "Third Year",
    type: "Bonafide Certificate",
    requestDate: "May 10, 2023",
    purpose: "Internship Application",
    status: "Pending",
    additionalInfo: "Need it urgently for summer internship application at Google.",
    supportingDocument: "/documents/internship-offer.pdf",
  },
  {
    id: "DOC-2023-002",
    studentId: "STU2023015",
    studentName: "Priya Patel",
    department: "Artificial Intelligence & Data Science",
    year: "Second Year",
    type: "Other Document",
    documentName: "Transcript",
    requestDate: "May 8, 2023",
    purpose: "Scholarship Application",
    status: "In Progress",
    additionalInfo: "Need official transcript with seal and signature.",
    supportingDocument: "/documents/scholarship-requirements.pdf",
    assignedTo: "Dr. Mehta",
  },
  {
    id: "DOC-2023-003",
    studentId: "STU2023042",
    studentName: "Arjun Singh",
    department: "Cyber Security",
    year: "Fourth Year",
    type: "Bonafide Certificate",
    requestDate: "May 5, 2023",
    purpose: "Bank Loan",
    status: "Approved",
    additionalInfo: "Need it for education loan processing at SBI.",
    supportingDocument: "/documents/loan-application.pdf",
    approvedBy: "Dr. Sharma",
    approvedDate: "May 7, 2023",
    documentUrl: "/documents/bonafide-arjun.pdf",
    comments: [
      {
        user: "Dr. Sharma",
        time: "May 6, 2023 10:30 AM",
        text: "Verified student details. Proceeding with certificate generation."
      },
      {
        user: "Admin Office",
        time: "May 7, 2023 11:45 AM",
        text: "Certificate generated and signed by the Principal."
      }
    ]
  },
  {
    id: "DOC-2023-004",
    studentId: "STU2023078",
    studentName: "Neha Gupta",
    department: "Artificial Intelligence & Machine Learning",
    year: "First Year",
    type: "Other Document",
    documentName: "Fee Structure Certificate",
    requestDate: "May 3, 2023",
    purpose: "Income Tax Filing",
    status: "Rejected",
    additionalInfo: "Need detailed fee breakup for income tax exemption claim.",
    supportingDocument: "/documents/tax-requirements.pdf",
    rejectedBy: "Finance Office",
    rejectedDate: "May 4, 2023",
    rejectionReason: "Student has outstanding fees. Please clear dues before requesting this certificate.",
    comments: [
      {
        user: "Finance Office",
        time: "May 4, 2023 09:15 AM",
        text: "Student has pending fees of Rs. 15,000. Cannot issue fee certificate until cleared."
      }
    ]
  },
  {
    id: "DOC-2023-005",
    studentId: "STU2023103",
    studentName: "Vikram Desai",
    department: "Computer Science & Engineering",
    year: "Third Year",
    type: "Bonafide Certificate",
    requestDate: "May 1, 2023",
    purpose: "Visa Application",
    status: "Completed",
    additionalInfo: "Need it for student visa application to attend conference in Germany.",
    supportingDocument: "/documents/conference-invitation.pdf",
    approvedBy: "Dr. Kapoor",
    approvedDate: "May 2, 2023",
    documentUrl: "/documents/bonafide-vikram.pdf",
    comments: [
      {
        user: "Dr. Kapoor",
        time: "May 1, 2023 03:30 PM",
        text: "Verified conference invitation. Approved for urgent processing."
      },
      {
        user: "Admin Office",
        time: "May 2, 2023 10:15 AM",
        text: "Certificate generated with special mention of conference participation."
      },
      {
        user: "Vikram Desai",
        time: "May 2, 2023 02:45 PM",
        text: "Thank you for the quick processing!"
      }
    ]
  }
]

export default function DocumentRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter requests based on search and filters
  const filteredRequests = documentRequests.filter(request => {
    const matchesSearch = 
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    const matchesType = typeFilter === "All" || request.type === typeFilter
    const matchesDepartment = departmentFilter === "All" || request.department.includes(departmentFilter)
    
    return matchesSearch && matchesStatus && matchesType && matchesDepartment
  })

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSendReply = () => {
    // In a real application, this would send the reply and possibly upload the document
    alert(`Reply sent to ${selectedRequest.studentName} with document`)
    setReplyText("")
    setUploadedFile(null)
    setIsDialogOpen(false)
  }

  const handleStatusChange = (requestId: string, newStatus: string) => {
    // In a real application, this would update the status in the database
    alert(`Status updated to ${newStatus} for request ${requestId}`)
  }

  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Approved": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
    "Completed": "bg-purple-100 text-purple-800",
  }

  const departments = [
    "All",
    "Computer Science & Engineering",
    "Cyber Security",
    "Artificial Intelligence & Data Science",
    "Artificial Intelligence & Machine Learning"
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
              <h1 className="text-3xl font-bold text-gray-900">Document Requests</h1>
            </div>
            <p className="text-gray-500">Review and manage student certificate and document requests</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter document requests by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Bonafide Certificate">Bonafide Certificate</SelectItem>
                    <SelectItem value="Other Document">Other Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Requests</CardTitle>
            <CardDescription>
              {filteredRequests.length} requests found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Document Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{request.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{request.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{request.studentName}</p>
                              <p className="text-xs text-gray-500">{request.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p className="text-sm">{request.department}</p>
                            <p className="text-xs text-gray-500">{request.year}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{request.type}</td>
                        <td className="py-3 px-4 text-sm">{request.purpose}</td>
                        <td className="py-3 px-4 text-sm">{request.requestDate}</td>
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
                                <DropdownMenuItem onClick={() => handleStatusChange(request.id, "In Progress")}>
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Approved")}>
                                  Approve Request
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Rejected")}>
                                  Reject Request
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Completed")}>
                                  Mark as Completed
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
                        No document requests found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Document Request Details
                  </DialogTitle>
                  <DialogDescription>
                    Request ID: {selectedRequest.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Request Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Document Type</p>
                        <p className="text-base">{selectedRequest.type}</p>
                        {selectedRequest.documentName && (
                          <p className="text-sm text-gray-600">{selectedRequest.documentName}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Purpose</p>
                        <p className="text-base">{selectedRequest.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Request Date</p>
                        <p className="text-base">{selectedRequest.requestDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge className={statusColors[selectedRequest.status]}>{selectedRequest.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Additional Information</p>
                        <p className="text-base">{selectedRequest.additionalInfo}</p>
                      </div>
                      {selectedRequest.supportingDocument && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Supporting Document</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            <Download className="h-4 w-4 mr-2" />
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
                          <AvatarFallback>{selectedRequest.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedRequest.studentName}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.studentId}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-base">{selectedRequest.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Year</p>
                        <p className="text-base">{selectedRequest.year}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Communication & Actions</h3>
                    
                    {/* Comments/Communication History */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[300px] overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Communication History</h4>
                      {selectedRequest.comments && selectedRequest.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRequest.comments.map((comment: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium">{comment.user}</p>
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
                      <h4 className="text-sm font-medium text-gray-700">Send Reply</h4>
                      <Textarea 
                        placeholder="Type your response here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Attach Document</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            id="document-upload" 
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('document-upload')?.click()}
                            className="w-full justify-start"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadedFile ? uploadedFile.name : "Upload Document"}
                          </Button>
                          {uploadedFile && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setUploadedFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedRequest.id, "Approved")}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedRequest.id, "Rejected")}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
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
