"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle,
  Calendar,
  Check,
  Clock, 
  Download,
  Eye,
  FileText, 
  Filter,
  HelpCircle,
  MoreHorizontal,
  Search,
  Ticket
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// This will be populated from the database in a real implementation
const applications = [
  {
    id: "APP-2023-001",
    type: "Bonafide Certificate",
    purpose: "Bank Loan",
    requestDate: "May 5, 2023",
    status: "Completed",
    currentStage: "Ready for Collection",
    completionDate: "May 8, 2023",
    documentUrl: "/documents/bonafide-certificate.pdf",
    timeline: [
      {
        stage: "Application Submitted",
        date: "May 5, 2023 10:30 AM",
        status: "Completed",
        remarks: "Application received"
      },
      {
        stage: "Verification",
        date: "May 6, 2023 11:45 AM",
        status: "Completed",
        remarks: "Student details verified"
      },
      {
        stage: "Processing",
        date: "May 7, 2023 3:20 PM",
        status: "Completed",
        remarks: "Certificate generated"
      },
      {
        stage: "Approval",
        date: "May 8, 2023 10:15 AM",
        status: "Completed",
        remarks: "Approved by HOD"
      },
      {
        stage: "Ready for Collection",
        date: "May 8, 2023 2:30 PM",
        status: "Completed",
        remarks: "Available for download"
      }
    ]
  },
  {
    id: "APP-2023-008",
    type: "Other Document",
    documentName: "Internship Completion Certificate",
    purpose: "Higher Studies Application",
    requestDate: "May 12, 2023",
    status: "In Progress",
    currentStage: "Processing",
    timeline: [
      {
        stage: "Application Submitted",
        date: "May 12, 2023 9:15 AM",
        status: "Completed",
        remarks: "Application received"
      },
      {
        stage: "Verification",
        date: "May 13, 2023 2:30 PM",
        status: "Completed",
        remarks: "Student details verified"
      },
      {
        stage: "Processing",
        date: "May 14, 2023 11:00 AM",
        status: "In Progress",
        remarks: "Compiling academic records"
      },
      {
        stage: "Approval",
        date: "",
        status: "Pending",
        remarks: ""
      },
      {
        stage: "Ready for Collection",
        date: "",
        status: "Pending",
        remarks: ""
      }
    ]
  },
  {
    id: "APP-2023-012",
    type: "Leave Request",
    purpose: "Medical Leave",
    requestDate: "May 15, 2023",
    status: "Pending",
    currentStage: "Verification",
    timeline: [
      {
        stage: "Application Submitted",
        date: "May 15, 2023 3:45 PM",
        status: "Completed",
        remarks: "Application received"
      },
      {
        stage: "Verification",
        date: "May 16, 2023 10:30 AM",
        status: "In Progress",
        remarks: "Verifying medical documents"
      },
      {
        stage: "Faculty Advisor Review",
        date: "",
        status: "Pending",
        remarks: ""
      },
      {
        stage: "HOD Approval",
        date: "",
        status: "Pending",
        remarks: ""
      },
      {
        stage: "Completion",
        date: "",
        status: "Pending",
        remarks: ""
      }
    ]
  },
  {
    id: "APP-2023-015",
    type: "Other Document",
    documentName: "Duplicate ID Card",
    purpose: "Lost Original",
    requestDate: "May 18, 2023",
    status: "Rejected",
    currentStage: "Verification",
    rejectionReason: "Insufficient evidence of loss. Please file a police complaint for lost ID and reapply with the complaint copy.",
    timeline: [
      {
        stage: "Application Submitted",
        date: "May 18, 2023 1:20 PM",
        status: "Completed",
        remarks: "Application received"
      },
      {
        stage: "Verification",
        date: "May 19, 2023 11:30 AM",
        status: "Rejected",
        remarks: "Insufficient documentation"
      }
    ]
  }
]

const applicationTypes = [
  "All Applications",
  "Bonafide Certificate",
  "Other Document",
  "Leave Request"
]

const statusTypes = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Rejected"
]

export default function ApplicationTrackerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All Applications")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredApplications = applications.filter(
    (application) => {
      const matchesSearch = 
        application.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = 
        selectedType === "All Applications" || 
        application.type === selectedType
      
      const matchesStatus = 
        selectedStatus === "All" || 
        application.status === selectedStatus
      
      return matchesSearch && matchesType && matchesStatus
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
                <Ticket className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Track the status of all your service requests</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="active">Active Applications</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Applications</CardTitle>
                <CardDescription>Track the status of your service requests and applications</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, type, or purpose..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span className="truncate">Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {applicationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map((status) => (
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
                          <div className={`p-3 rounded-lg ${
                            application.status === "Completed" ? "bg-green-100 text-green-700" :
                            application.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                            application.status === "Rejected" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {
                              application.status === "Completed" ? <Check className="h-6 w-6" /> :
                              application.status === "In Progress" ? <Clock className="h-6 w-6" /> :
                              application.status === "Rejected" ? <AlertCircle className="h-6 w-6" /> :
                              <HelpCircle className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold text-gray-900">{application.type}</h3>
                                  <span className="ml-2 text-xs text-gray-500">{application.id}</span>
                                </div>
                                {application.type === "Other Document" && application.documentName && (
                                  <p className="text-sm text-gray-700">Document: {application.documentName}</p>
                                )}
                                <p className="text-sm text-gray-600">Purpose: {application.purpose}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  application.status === "Completed" ? "bg-green-100 text-green-700" :
                                  application.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                                  application.status === "Rejected" ? "bg-red-100 text-red-700" :
                                  "bg-blue-100 text-blue-700"
                                } border-0 mt-2 sm:mt-0`}
                              >
                                {application.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Requested: {application.requestDate}
                              </div>
                              {application.completionDate && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Check className="h-3 w-3 mr-1" />
                                  Completed: {application.completionDate}
                                </div>
                              )}
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Current Stage: {application.currentStage}
                              </div>
                            </div>
                            
                            {application.rejectionReason && (
                              <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start">
                                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{application.rejectionReason}</span>
                              </div>
                            )}
                            
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700">Application Progress</h4>
                                {application.status === "Completed" && application.documentUrl && (
                                  <a href={application.documentUrl} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </a>
                                )}
                              </div>
                              <div className="relative">
                                <div className="absolute top-0 left-0 ml-2 h-full w-0.5 bg-gray-200"></div>
                                <div className="space-y-4 relative">
                                  {application.timeline.map((stage, index) => (
                                    <div key={index} className="ml-6 relative">
                                      <div className={`absolute -left-[18px] top-0 w-4 h-4 rounded-full flex items-center justify-center ${
                                        stage.status === "Completed" ? "bg-green-100" :
                                        stage.status === "In Progress" ? "bg-yellow-100" :
                                        "bg-gray-100"
                                      }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                          stage.status === "Completed" ? "bg-green-500" :
                                          stage.status === "In Progress" ? "bg-yellow-500" :
                                          "bg-gray-400"
                                        }`}></div>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <h5 className="text-sm font-medium text-gray-800">{stage.stage}</h5>
                                        <Badge
                                          variant="outline"
                                          className={`${
                                            stage.status === "Completed" ? "bg-green-100 text-green-700" :
                                            stage.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                                            "bg-gray-100 text-gray-500"
                                          } border-0 text-xs mt-1 sm:mt-0`}
                                        >
                                          {stage.status}
                                        </Badge>
                                      </div>
                                      {stage.date && (
                                        <p className="text-xs text-gray-500 mt-1">{stage.date}</p>
                                      )}
                                      {stage.remarks && (
                                        <p className="text-xs text-gray-600 mt-1">{stage.remarks}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {application.status === "Rejected" && (
                                    <DropdownMenuItem>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Reapply
                                    </DropdownMenuItem>
                                  )}
                                  {application.status === "Completed" && application.documentUrl && (
                                    <DropdownMenuItem asChild>
                                      <a href={application.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Document
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No applications found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Services</CardTitle>
              <CardDescription>Quick links to various application services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <a href="/student-dashboard/other-services/certificate" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center">
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="font-medium">Bonafide Certificate</span>
                    <span className="text-xs text-gray-500 mt-1">Request a new certificate</span>
                  </Button>
                </a>
                <a href="/student-dashboard/other-services/certificate" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center">
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="font-medium">Other Document</span>
                    <span className="text-xs text-gray-500 mt-1">Request any other document</span>
                  </Button>
                </a>
                <a href="/student-dashboard/other-services/leave" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center">
                    <Calendar className="h-5 w-5 mb-2" />
                    <span className="font-medium">Leave Request</span>
                    <span className="text-xs text-gray-500 mt-1">Apply for leave</span>
                  </Button>
                </a>
                <a href="/student-dashboard/other-services/grievance" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center">
                    <AlertCircle className="h-5 w-5 mb-2" />
                    <span className="font-medium">Grievance Portal</span>
                    <span className="text-xs text-gray-500 mt-1">Submit grievances</span>
                  </Button>
                </a>
                <a href="/student-dashboard/other-services/maintenance" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center">
                    <HelpCircle className="h-5 w-5 mb-2" />
                    <span className="font-medium">Maintenance</span>
                    <span className="text-xs text-gray-500 mt-1">Report maintenance issues</span>
                  </Button>
                </a>
                <a href="/student-dashboard/other-services" className="w-full">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center bg-indigo-50 border-indigo-200 hover:bg-indigo-100">
                    <HelpCircle className="h-5 w-5 mb-2 text-indigo-600" />
                    <span className="font-medium text-indigo-700">Other Services</span>
                    <span className="text-xs text-indigo-500 mt-1">View all available services</span>
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
