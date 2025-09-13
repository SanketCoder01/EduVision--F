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
  ArrowLeft,
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
  User
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

const leaveRequests = [
  {
    id: 1,
    type: "Medical Leave",
    startDate: "May 15, 2023",
    endDate: "May 18, 2023",
    reason: "Fever and cold. Doctor has advised rest for 4 days.",
    status: "Approved",
    approvedBy: "Prof. Mehta",
    approvedDate: "May 14, 2023",
    documentUrl: "#",
  },
  {
    id: 2,
    type: "Personal Leave",
    startDate: "June 5, 2023",
    endDate: "June 7, 2023",
    reason: "Family function at hometown.",
    status: "Pending",
    approvedBy: "",
    approvedDate: "",
    documentUrl: "",
  },
  {
    id: 3,
    type: "Event Participation",
    startDate: "April 10, 2023",
    endDate: "April 12, 2023",
    reason: "Participating in national level hackathon at IIT Delhi.",
    status: "Rejected",
    approvedBy: "Dr. Sharma",
    approvedDate: "April 8, 2023",
    rejectionReason: "Clash with mid-semester examinations. Cannot be approved.",
    documentUrl: "",
  },
]

const leaveTypes = [
  {
    id: "medical",
    name: "Medical Leave",
    description: "For health-related absences",
    maxDuration: "As per medical advice",
    requirements: ["Medical certificate", "Doctor's prescription"],
  },
  {
    id: "personal",
    name: "Personal Leave",
    description: "For personal or family matters",
    maxDuration: "3 days per semester",
    requirements: ["Written explanation"],
  },
  {
    id: "event",
    name: "Event Participation",
    description: "For participating in competitions, conferences, etc.",
    maxDuration: "Duration of the event",
    requirements: ["Event invitation/details", "Faculty recommendation"],
  },
  {
    id: "bereavement",
    name: "Bereavement Leave",
    description: "In case of death in the immediate family",
    maxDuration: "Up to 7 days",
    requirements: ["Self-declaration"],
  },
]

export default function LeaveRequestPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLeaveType, setSelectedLeaveType] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const filteredRequests = leaveRequests.filter(
    (request) =>
      request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    leaveType?: string
    dates?: string
    reason?: string
    file?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    
    // Validate form
    const errors: {[key: string]: string} = {}
    
    if (!selectedLeaveType) {
      errors.leaveType = 'Please select a leave type'
    }
    
    if (!startDate || !endDate) {
      errors.dates = 'Please select both start and end dates'
    } else if (endDate < startDate) {
      errors.dates = 'End date cannot be before start date'
    }
    
    if (!reason.trim()) {
      errors.reason = 'Please provide a reason for your leave'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setSubmitting(false)
      return
    }
    
    // Simulate API call with timeout
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Reset form
      setSelectedLeaveType("")
      setStartDate(undefined)
      setEndDate(undefined)
      setReason("")
      setUploadedFile(null)
      
      // Show success message
      alert("Leave application submitted to ERP successfully! Your Class Teacher will review and approve.")
    } catch (error) {
      alert("There was an error submitting your leave application to ERP. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student-dashboard/other-services">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-700">
                <Calendar className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Student Leave Application</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Submit leave applications through ERP - Class Teacher approval required</p>
          </div>
        </div>

        {/* ERP Notice */}
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📋 Important Notice - ERP Only Submissions</h3>
              <p className="text-sm text-blue-800">
                All leave applications must be submitted through ERP only. Leaves will be reviewed & approved by your Class Teacher on ERP. Please apply in advance - uninformed absenteeism will not be considered.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Leave Requests</CardTitle>
                <CardDescription>Track the status of your leave applications</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by type, reason, or status..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            request.status === "Approved" ? "bg-green-100 text-green-700" :
                            request.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {
                              request.status === "Approved" ? <Check className="h-6 w-6" /> :
                              request.status === "Pending" ? <Clock className="h-6 w-6" /> :
                              <AlertCircle className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.type}</h3>
                              <Badge
                                variant="outline"
                                className={`${
                                  request.status === "Approved" ? "bg-green-100 text-green-700" :
                                  request.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                } border-0 mt-1 sm:mt-0`}
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {request.startDate} to {request.endDate}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{request.reason}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              {request.approvedDate && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {request.status === "Approved" ? "Approved" : "Reviewed"}: {request.approvedDate}
                                </div>
                              )}
                              {request.approvedBy && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <User className="h-3 w-3 mr-1" />
                                  By: {request.approvedBy}
                                </div>
                              )}
                            </div>
                            {request.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start">
                                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{request.rejectionReason}</span>
                              </div>
                            )}
                            <div className="mt-4 flex justify-end">
                              {request.status === "Rejected" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Reapply
                                </Button>
                              )}
                              {request.status === "Pending" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2 border-red-200 text-red-600 hover:bg-red-50">
                                  Cancel Request
                                </Button>
                              )}
                              {request.status === "Approved" && request.documentUrl && (
                                <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Approval
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No leave requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Leave Application</CardTitle>
                <CardDescription>Complete student details and leave information for Class Teacher approval</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Information Section */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Student Name</label>
                        <Input value="Rahul Sharma" disabled className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Roll Number</label>
                        <Input value="CS21B1001" disabled className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Class</label>
                        <Input value="TE Computer Science - A" disabled className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Class Teacher</label>
                        <Input value="Prof. Dr. Anjali Mehta" disabled className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <Input value="Computer Science Engineering" disabled className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contact Number</label>
                        <Input value="+91 9876543210" disabled className="bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Leave Type</label>
                    <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedLeaveType && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-1">
                        {leaveTypes.find(t => t.id === selectedLeaveType)?.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {leaveTypes.find(t => t.id === selectedLeaveType)?.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Maximum Duration: {leaveTypes.find(t => t.id === selectedLeaveType)?.maxDuration}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Requirements:</span>
                        <ul className="list-disc list-inside mt-1">
                          {leaveTypes.find(t => t.id === selectedLeaveType)?.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Reason for Leave</label>
                    <Textarea 
                      placeholder="Provide detailed reason for your leave request" 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Supporting Documents (if any)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {uploadedFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 text-purple-500 mb-2" />
                            <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setUploadedFile(null)}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">Click to upload a file</p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, JPG, or PNG (max. 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {formErrors.leaveType && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.leaveType}</p>
                  )}
                  
                  {formErrors.dates && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.dates}</p>
                  )}
                  
                  {formErrors.reason && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.reason}</p>
                  )}
                  
                  {formErrors.file && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.file}</p>
                  )}
                  
                  {/* Advance Notice Warning */}
                  <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-amber-700 mr-2 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <span className="font-medium">Advance Notice Required:</span> Submit applications at least 2 days before leave start date (except medical emergencies)
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting to ERP...
                        </>
                      ) : (
                        "Submit to ERP for Class Teacher Approval"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
                <CardDescription>View your approved and pending leaves on the calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <Button variant="outline" size="sm" className="text-xs">
                      Previous Year
                    </Button>
                    <h3 className="text-lg font-medium text-gray-900">2025</h3>
                    <Button variant="outline" size="sm" className="text-xs">
                      Next Year
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { month: "January", days: 31, startDay: 3 }, // Wednesday
                      { month: "February", days: 28, startDay: 6 }, // Saturday
                      { month: "March", days: 31, startDay: 6 }, // Saturday
                      { month: "April", days: 30, startDay: 2 }, // Tuesday
                      { month: "May", days: 31, startDay: 4 }, // Thursday
                      { month: "June", days: 30, startDay: 0 }, // Sunday
                      { month: "July", days: 31, startDay: 2 }, // Tuesday
                      { month: "August", days: 31, startDay: 5 }, // Friday
                      { month: "September", days: 30, startDay: 1 }, // Monday
                      { month: "October", days: 31, startDay: 3 }, // Wednesday
                      { month: "November", days: 30, startDay: 6 }, // Saturday
                      { month: "December", days: 31, startDay: 1 } // Monday
                    ].map((monthData) => (
                      <div key={monthData.month} className="border border-gray-200 rounded-lg p-2">
                        <h4 className="text-sm font-medium text-center mb-2">{monthData.month}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                            <div key={`${monthData.month}-${day}-${i}`} className="text-xs text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                          {/* Empty cells for days before the 1st */}
                          {Array(monthData.startDay).fill(0).map((_, i) => (
                            <div key={`${monthData.month}-empty-start-${i}`} className="h-6 w-6"></div>
                          ))}
                          
                          {/* Actual days */}
                          {Array(monthData.days).fill(0).map((_, i) => {
                            const day = i + 1
                            // This would be populated from the database in a real implementation
                            const leaveData = filteredRequests.find(req => {
                              const reqMonth = new Date(req.startDate).toLocaleString('en-US', { month: 'long' })
                              return reqMonth === monthData.month && day >= new Date(req.startDate).getDate() && day <= new Date(req.endDate).getDate()
                            })
                            
                            return (
                              <div 
                                key={`${monthData.month}-day-${day}`} 
                                className={`h-6 w-6 flex items-center justify-center rounded-full text-xs ${
                                  leaveData ? 
                                    leaveData.status === "Approved" ? "bg-green-100 text-green-700" : 
                                    leaveData.status === "Pending" ? "bg-yellow-100 text-yellow-700" : 
                                    "bg-red-100 text-red-700"
                                  : ""
                                }`}
                                title={leaveData ? `${leaveData.type}: ${leaveData.status}` : ""}
                              >
                                {day}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-1"></div>
                        <span className="text-xs text-gray-600">Medical Leave (ML)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-1"></div>
                        <span className="text-xs text-gray-600">Personal Leave (PL)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-1"></div>
                        <span className="text-xs text-gray-600">Event Participation (EP)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Leave Policy</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Students are eligible for the following leaves per semester:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-2">
                        <li>Medical Leave: As per medical advice with valid documentation</li>
                        <li>Personal Leave: Maximum 3 days</li>
                        <li>Event Participation: Subject to faculty approval</li>
                      </ul>
                      <p className="text-sm text-gray-600">
                        All leave requests must be submitted at least 2 days in advance, except for medical emergencies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
