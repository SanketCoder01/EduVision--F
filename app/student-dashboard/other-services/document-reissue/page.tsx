"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  Flag,
  Info,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Send,
  Upload,
  User,
  FileCheck
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const documentRequests = [
  {
    id: "DOC-2023-001",
    documentType: "Fee Receipt",
    academicYear: "2022-2023",
    semester: "Spring",
    reason: "Original lost during relocation",
    status: "Approved",
    requestDate: "May 5, 2023",
    approvalDate: "May 7, 2023",
    paymentStatus: "Paid",
    paymentAmount: "₹250",
    paymentDate: "May 6, 2023",
    paymentMethod: "Online Transfer",
    transactionId: "TXN123456789",
    documentUrl: "#",
    notes: "Duplicate fee receipt issued with original receipt number and date."
  },
  {
    id: "DOC-2023-008",
    documentType: "ID Card",
    reason: "Damaged card needs replacement",
    status: "Processing",
    requestDate: "May 15, 2023",
    paymentStatus: "Paid",
    paymentAmount: "₹500",
    paymentDate: "May 16, 2023",
    paymentMethod: "Online Transfer",
    transactionId: "TXN987654321",
    notes: "New photo submitted for ID card. Old card must be surrendered upon collection."
  },
  {
    id: "DOC-2023-012",
    documentType: "Marksheet",
    academicYear: "2021-2022",
    semester: "Fall",
    reason: "Need additional copies for job application",
    status: "Pending Payment",
    requestDate: "May 20, 2023",
    paymentStatus: "Pending",
    paymentAmount: "₹350",
    notes: "Awaiting payment confirmation to process the request."
  }
]

const documentTypes = [
  "All Types",
  "Fee Receipt",
  "ID Card",
  "Marksheet",
  "Transcript",
  "Bonafide Certificate",
  "Transfer Certificate",
  "Migration Certificate",
  "Provisional Certificate",
  "Degree Certificate",
  "Other"
]

const academicYears = [
  "All Years",
  "2023-2024",
  "2022-2023",
  "2021-2022",
  "2020-2021",
  "2019-2020",
  "2018-2019"
]

const semesters = [
  "All Semesters",
  "Fall",
  "Spring",
  "Summer"
]

const statusOptions = [
  "All",
  "Draft",
  "Submitted",
  "Pending Payment",
  "Processing",
  "Ready for Collection",
  "Approved",
  "Rejected",
  "Cancelled"
]

const paymentMethods = [
  "Online Transfer",
  "Credit/Debit Card",
  "UPI",
  "Bank Deposit",
  "Cash at Counter"
]

export default function DocumentReissuePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("All Types")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("All Years")
  const [selectedSemester, setSelectedSemester] = useState("All Semesters")
  const [selectedStatus, setSelectedStatus] = useState("All")
  
  const filteredRequests = documentRequests.filter(
    (request) => {
      const matchesSearch = 
        (request.id && request.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.documentType && request.documentType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.reason && request.reason.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDocType = 
        selectedDocType === "All Types" || 
        request.documentType === selectedDocType
      
      const matchesAcademicYear = 
        selectedAcademicYear === "All Years" || 
        request.academicYear === selectedAcademicYear
      
      const matchesSemester = 
        selectedSemester === "All Semesters" || 
        request.semester === selectedSemester
      
      const matchesStatus = 
        selectedStatus === "All" || 
        request.status === selectedStatus
      
      return matchesSearch && matchesDocType && matchesAcademicYear && matchesSemester && matchesStatus
    }
  )

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
                <Receipt className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Document Reissue</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request duplicate fee receipts, marksheets, ID cards, and other documents</p>
          </div>
        </div>

        <Tabs defaultValue="my-requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines & Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Document Requests</CardTitle>
                <CardDescription>View and track your document reissue requests</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, document type, or reason..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">Document Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="truncate">Academic Year</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 mr-2" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900">{request.documentType}</h3>
                              <span className="ml-2 text-xs text-gray-500">{request.id}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                request.status === "Approved" ? "bg-green-100 text-green-700" :
                                request.status === "Processing" ? "bg-blue-100 text-blue-700" :
                                request.status === "Rejected" ? "bg-red-100 text-red-700" :
                                request.status === "Pending Payment" ? "bg-amber-100 text-amber-700" :
                                request.status === "Ready for Collection" ? "bg-purple-100 text-purple-700" :
                                "bg-gray-100 text-gray-700"
                              } border-0 mt-2 sm:mt-0`}
                            >
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            {request.academicYear && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {request.academicYear} {request.semester && `(${request.semester})`}
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Requested: {request.requestDate}
                            </div>
                            {request.paymentStatus && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Badge variant="outline" className={`${
                                  request.paymentStatus === "Paid" ? "bg-green-50 text-green-700" :
                                  "bg-amber-50 text-amber-700"
                                } border-0 text-xs py-0 h-4`}>
                                  {request.paymentStatus} {request.paymentAmount && `- ${request.paymentAmount}`}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-2">{request.reason}</p>
                          
                          {request.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-md">
                              <div className="text-xs text-gray-500">
                                <Info className="h-3 w-3 inline-block mr-1" />
                                Note: {request.notes}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {request.approvalDate && `Approved: ${request.approvalDate}`}
                              {request.paymentDate && ` | Payment: ${request.paymentDate}`}
                            </div>
                            <div className="flex gap-2">
                              {request.status === "Pending Payment" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                  Make Payment
                                </Button>
                              )}
                              {request.status === "Ready for Collection" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                                  Collection Details
                                </Button>
                              )}
                              {request.documentUrl && request.status === "Approved" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Document
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No document requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-request" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>New Document Request</CardTitle>
                <CardDescription>Submit a request for document reissue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.slice(1).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.slice(1).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.slice(1).map((semester) => (
                            <SelectItem key={semester} value={semester}>
                              {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Request</label>
                    <Textarea 
                      placeholder="Please explain why you need this document reissued (e.g., lost, damaged, additional copies needed)..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-gray-500 mb-2">Police report for lost documents, damaged ID card, etc.</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-700">Fee Information</h4>
                        <p className="text-xs text-blue-600 mt-1">
                          A fee will be applicable for document reissue as per the institution's policy. 
                          Payment details will be provided after your request is reviewed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I confirm that the information provided is accurate
                      </label>
                      <p className="text-xs text-gray-500">
                        By submitting this request, I understand that fees may apply and that processing times vary by document type.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Guidelines & Fee Structure</CardTitle>
                <CardDescription>Important information about document reissue process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Fee Structure</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Processing</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgent Processing</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Fee Receipt</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹250</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹500</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3-5 working days / 1 day</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">ID Card</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹500</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹750</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5-7 working days / 2 days</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Marksheet</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹350</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹700</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7-10 working days / 3 days</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Transcript</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹500</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹1000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10-15 working days / 5 days</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Degree Certificate</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹1000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹2000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15-20 working days / 7 days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Document Reissue Process</h3>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          1
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Submit Request</h4>
                          <p className="text-sm text-gray-500 mt-1">Fill out the request form with accurate details about the document you need reissued.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          2
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Request Review</h4>
                          <p className="text-sm text-gray-500 mt-1">Your request will be reviewed by the relevant department to verify eligibility.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          3
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Payment</h4>
                          <p className="text-sm text-gray-500 mt-1">After approval, you'll receive payment instructions. Complete the payment to proceed.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          4
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Processing</h4>
                          <p className="text-sm text-gray-500 mt-1">Your document will be prepared according to the processing time mentioned in the fee structure.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          5
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Collection/Delivery</h4>
                          <p className="text-sm text-gray-500 mt-1">Once ready, you'll be notified to collect the document or it will be delivered digitally if applicable.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Important Notes</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>For lost documents, a police complaint/FIR may be required in some cases.</li>
                      <li>Damaged ID cards must be surrendered when collecting the new one.</li>
                      <li>Processing times are approximate and may vary during peak periods.</li>
                      <li>Urgent processing is subject to availability and departmental approval.</li>
                      <li>Digital copies are provided where applicable; physical copies may require in-person collection.</li>
                      <li>For degree certificates, additional verification by the university may be required.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Document Authenticity</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          All reissued documents contain security features and are marked as duplicates. 
                          They carry the same validity as original documents for official purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    For urgent inquiries, contact the Document Section at 555-123-4567
                  </div>
                  <Button variant="outline" className="sm:w-auto">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Download Complete Guidelines
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
