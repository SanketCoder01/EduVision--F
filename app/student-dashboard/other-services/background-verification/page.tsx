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
  Building,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  Flag,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Shield,
  Upload,
  User,
  UserCheck
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const verificationRequests = [
  {
    id: "VER-2023-001",
    studentName: "Rahul Sharma",
    rollNumber: "CS2019001",
    graduationYear: "2023",
    degree: "B.Tech Computer Science",
    companyName: "TechCorp Solutions",
    companyEmail: "hr@techcorp.com",
    contactPerson: "Priya Mehta",
    requestDate: "June 5, 2023",
    status: "Verified",
    verificationDate: "June 8, 2023",
    verifiedBy: "Registrar Office",
    notes: "All records verified. Student graduated with honors.",
    documentUrl: "#"
  },
  {
    id: "VER-2023-008",
    studentName: "Ananya Patel",
    rollNumber: "EC2020015",
    graduationYear: "2022",
    degree: "B.Tech Electronics",
    companyName: "Global Systems Inc.",
    companyEmail: "verification@globalsys.com",
    contactPerson: "Rajiv Kumar",
    requestDate: "June 12, 2023",
    status: "In Progress",
    notes: "Verification in process. Awaiting confirmation from department."
  },
  {
    id: "VER-2023-012",
    studentName: "Vikram Singh",
    rollNumber: "ME2018042",
    graduationYear: "2022",
    degree: "B.Tech Mechanical",
    companyName: "AutoTech Industries",
    companyEmail: "hr@autotech.com",
    contactPerson: "Sanjay Gupta",
    requestDate: "June 15, 2023",
    status: "Pending",
    notes: "New request. Pending initial review."
  }
]

const statusOptions = [
  "All",
  "Pending",
  "In Progress",
  "Verified",
  "Rejected",
  "Cancelled"
]

const degreeOptions = [
  "All Degrees",
  "B.Tech Computer Science",
  "B.Tech Electronics",
  "B.Tech Mechanical",
  "B.Tech Civil",
  "M.Tech Computer Science",
  "M.Tech Electronics",
  "MBA",
  "BBA",
  "Ph.D"
]

const yearOptions = [
  "All Years",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018"
]

export default function BackgroundVerificationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedDegree, setSelectedDegree] = useState("All Degrees")
  const [selectedYear, setSelectedYear] = useState("All Years")
  
  const filteredRequests = verificationRequests.filter(
    (request) => {
      const matchesSearch = 
        request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = 
        selectedStatus === "All" || 
        request.status === selectedStatus
      
      const matchesDegree = 
        selectedDegree === "All Degrees" || 
        request.degree === selectedDegree
      
      const matchesYear = 
        selectedYear === "All Years" || 
        request.graduationYear === selectedYear
      
      return matchesSearch && matchesStatus && matchesDegree && matchesYear
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
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Background Verification</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Verify alumni records and credentials for employment background checks</p>
          </div>
        </div>

        <Tabs defaultValue="verification-requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="verification-requests">Verification Requests</TabsTrigger>
            <TabsTrigger value="submit-request">Submit Request</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines & Process</TabsTrigger>
          </TabsList>

          <TabsContent value="verification-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Background Verification Requests</CardTitle>
                <CardDescription>View and manage verification requests from employers</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, roll number, company, or ID..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                    
                    <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">Degree</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {degreeOptions.map((degree) => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Year</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
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
                              <h3 className="font-semibold text-gray-900">{request.studentName}</h3>
                              <span className="ml-2 text-xs text-gray-500">{request.id}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                request.status === "Verified" ? "bg-green-100 text-green-700" :
                                request.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                request.status === "Rejected" ? "bg-red-100 text-red-700" :
                                request.status === "Pending" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              } border-0 mt-2 sm:mt-0`}
                            >
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              {request.rollNumber}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <FileText className="h-3 w-3 mr-1" />
                              {request.degree}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Graduated: {request.graduationYear}
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center mb-2">
                              <Building className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="font-medium text-sm">{request.companyName}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                              <div>Contact: {request.contactPerson}</div>
                              <div>Email: {request.companyEmail}</div>
                              <div>Requested: {request.requestDate}</div>
                              {request.verificationDate && (
                                <div>Verified: {request.verificationDate}</div>
                              )}
                            </div>
                          </div>
                          
                          {request.notes && (
                            <div className="mt-3 text-sm text-gray-700">
                              <div className="font-medium text-xs mb-1">Notes:</div>
                              <p>{request.notes}</p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {request.verifiedBy && `Verified by: ${request.verifiedBy}`}
                            </div>
                            <div className="flex gap-2">
                              {request.status === "Pending" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Verify Now
                                </Button>
                              )}
                              {request.status === "Verified" && request.documentUrl && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Certificate
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
                      <p className="text-gray-500">No verification requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit-request" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Verification Request</CardTitle>
                <CardDescription>For employers to verify alumni credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-indigo-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700">For Employers & Verification Agencies</h4>
                        <p className="text-xs text-indigo-600 mt-1">
                          This form is intended for companies and background verification agencies to verify the academic credentials 
                          of our alumni. Individual students should use the Application Tracker to check their own document status.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-3">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <Input placeholder="Enter your company name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                        <Input type="email" placeholder="Enter official company email" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <Input placeholder="Enter name of HR/Verification Officer" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <Input placeholder="Enter contact phone number" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-3">Candidate Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as per records)</label>
                        <Input placeholder="Enter candidate's full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number (if known)</label>
                        <Input placeholder="Enter roll/registration number" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree Program</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree program" />
                          </SelectTrigger>
                          <SelectContent>
                            {degreeOptions.slice(1).map((degree) => (
                              <SelectItem key={degree} value={degree}>
                                {degree}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.slice(1).map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <Textarea 
                      placeholder="Provide any additional details that may help in verification..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Authorization Letter (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-gray-500 mb-2">Authorization letter from candidate or company letterhead</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-start">
                      <Lock className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Data Privacy Notice</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          The information provided will be used solely for the purpose of verification. We will share only the 
                          relevant academic details after proper authentication of the request. Personal information is protected 
                          under our privacy policy.
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
                        I confirm that I am authorized to request this verification
                      </label>
                      <p className="text-xs text-gray-500">
                        By submitting this request, I confirm that I have proper authorization to verify this candidate's credentials 
                        and the information provided is accurate to the best of my knowledge.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Verification Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Guidelines & Process</CardTitle>
                <CardDescription>Important information about our background verification process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Verification Process</h3>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          1
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Request Submission</h4>
                          <p className="text-sm text-gray-500 mt-1">Employers or verification agencies submit a verification request with candidate details.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          2
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Authentication</h4>
                          <p className="text-sm text-gray-500 mt-1">Our team verifies the legitimacy of the request and the requesting organization.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          3
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Record Verification</h4>
                          <p className="text-sm text-gray-500 mt-1">The academic records of the candidate are checked against our database.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          4
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Response Preparation</h4>
                          <p className="text-sm text-gray-500 mt-1">A formal verification response is prepared with the verified information.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          5
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Secure Delivery</h4>
                          <p className="text-sm text-gray-500 mt-1">The verification certificate is securely delivered to the requesting organization.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Verification Timeframes</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard Processing</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expedited Processing</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Basic Verification</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5-7 working days</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2-3 working days</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Comprehensive Verification</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7-10 working days</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3-5 working days</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Archives (Before 2010)</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15-20 working days</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7-10 working days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Important Guidelines</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Verification requests must come from official company email addresses.</li>
                      <li>For third-party verification agencies, an authorization letter from the employer is required.</li>
                      <li>We verify only factual information such as enrollment dates, graduation status, degree awarded, etc.</li>
                      <li>Grade information is only shared with proper authorization from the alumnus.</li>
                      <li>For urgent verifications, please contact the Registrar's Office directly.</li>
                      <li>Verification certificates are digitally signed and can be validated online.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Digital Verification</h4>
                        <p className="text-xs text-green-700 mt-1">
                          All our verification certificates include a QR code and a unique verification ID that can be used to 
                          authenticate the document on our official website. This helps prevent fraudulent use of our verification documents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="h-4 w-4 mr-2 text-indigo-500" />
                    For urgent inquiries, contact the Verification Cell at verification@example.edu
                  </div>
                  <Button variant="outline" className="sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Verification Policy
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
