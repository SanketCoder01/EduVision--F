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
  Download
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function EventHelpDeskPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("requestDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("pending")
  
  // Form state for adding new event request
  const [isAddRequestDialogOpen, setIsAddRequestDialogOpen] = useState(false)
  const [requestTitle, setRequestTitle] = useState("")
  const [requestDescription, setRequestDescription] = useState("")
  const [requestCategory, setRequestCategory] = useState("")
  const [requestEventDate, setRequestEventDate] = useState("")
  const [requestVenue, setRequestVenue] = useState("")
  const [requestExpectedAttendees, setRequestExpectedAttendees] = useState("")
  
  // Mock data for event help requests - in a real app this would come from an API
  const [eventRequests, setEventRequests] = useState([
    {
      id: "EVT-2023-001",
      title: "Technical Support for Annual Tech Symposium",
      description: "We need technical support for our annual tech symposium including projector setup, sound system, and live streaming equipment. The event will host industry speakers and student presentations.",
      category: "Technical Support",
      requestDate: "2023-05-10",
      requestTime: "14:30",
      eventDate: "2023-06-15",
      venue: "Main Auditorium",
      expectedAttendees: 250,
      status: "Pending",
      priority: "High",
      requester: {
        id: "FAC2023010",
        name: "Dr. Amit Verma",
        type: "Faculty",
        department: "Computer Science & Engineering",
        email: "amit.v@university.edu",
        phone: "+91 9876543210"
      },
      documents: [
        {
          name: "Event Proposal.pdf",
          uploadedOn: "2023-05-10",
          size: "1.2 MB",
          url: "#"
        },
        {
          name: "Technical Requirements.docx",
          uploadedOn: "2023-05-10",
          size: "450 KB",
          url: "#"
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-10 15:45",
          text: "Thank you for your request. We will review the technical requirements and get back to you soon.",
          internal: false
        },
        {
          user: "IT Department",
          time: "2023-05-11 10:30",
          text: "We need to check if the live streaming equipment is available on that date. Will confirm by tomorrow.",
          internal: true
        }
      ]
    },
    {
      id: "EVT-2023-002",
      title: "Venue Booking for Cultural Fest",
      description: "Request for booking the open-air theater for our annual cultural fest. We need the venue for three consecutive days including setup and teardown time.",
      category: "Venue Booking",
      requestDate: "2023-05-08",
      requestTime: "12:15",
      eventDate: "2023-07-20",
      venue: "Open-Air Theater",
      expectedAttendees: 500,
      status: "In Progress",
      priority: "Medium",
      requester: {
        id: "STU2023056",
        name: "Priya Patel",
        type: "Student",
        department: "Cultural Committee",
        email: "priya.p@university.edu",
        phone: "+91 9876543211"
      },
      documents: [
        {
          name: "Cultural Fest Schedule.pdf",
          uploadedOn: "2023-05-08",
          size: "2.5 MB",
          url: "#"
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-08 14:00",
          text: "Thank you for your request. We will check the venue availability for the requested dates.",
          internal: false
        },
        {
          user: "Facilities Department",
          time: "2023-05-09 09:45",
          text: "The venue is available for the requested dates. We need approval from the Dean of Student Affairs.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-09 16:20",
          text: "We have tentatively reserved the venue for your event. Please submit the security deposit by next week to confirm the booking.",
          internal: false
        }
      ]
    },
    {
      id: "EVT-2023-003",
      title: "Catering Services for Alumni Meet",
      description: "We need catering services for our department's alumni meet. The event will include breakfast, lunch, and evening snacks for approximately 100 people.",
      category: "Catering Services",
      requestDate: "2023-05-05",
      requestTime: "10:45",
      eventDate: "2023-06-25",
      venue: "Department Conference Hall",
      expectedAttendees: 100,
      status: "Approved",
      priority: "Medium",
      requester: {
        id: "FAC2023015",
        name: "Dr. Sunita Sharma",
        type: "Faculty",
        department: "Alumni Relations",
        email: "sunita.s@university.edu",
        phone: "+91 9876543212"
      },
      documents: [
        {
          name: "Menu Options.pdf",
          uploadedOn: "2023-05-05",
          size: "800 KB",
          url: "#"
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-05 11:30",
          text: "Thank you for your request. We will coordinate with the catering service providers.",
          internal: false
        },
        {
          user: "Catering Department",
          time: "2023-05-07 09:15",
          text: "We have three approved vendors who can provide the required services. Will share the quotations soon.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-10 14:30",
          text: "We have received quotations from three catering services. Please find them attached. Let us know your preference.",
          internal: false
        },
        {
          user: "Dr. Sunita Sharma",
          time: "2023-05-11 11:45",
          text: "We would like to go with Vendor B. Their menu options align with our requirements.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-12 10:00",
          text: "Your catering request has been approved. We have booked Vendor B for your event on June 25th.",
          internal: false
        }
      ]
    },
    {
      id: "EVT-2023-004",
      title: "Transportation for Industrial Visit",
      description: "We need transportation arrangements for an industrial visit to XYZ Manufacturing Company. We require two buses for 80 students and 5 faculty members.",
      category: "Transportation",
      requestDate: "2023-04-20",
      requestTime: "15:30",
      eventDate: "2023-05-30",
      venue: "XYZ Manufacturing Company, Industrial Area",
      expectedAttendees: 85,
      status: "Completed",
      priority: "High",
      requester: {
        id: "FAC2023022",
        name: "Prof. Rajiv Malhotra",
        type: "Faculty",
        department: "Mechanical Engineering",
        email: "rajiv.m@university.edu",
        phone: "+91 9876543213"
      },
      documents: [
        {
          name: "Student List.xlsx",
          uploadedOn: "2023-04-20",
          size: "350 KB",
          url: "#"
        },
        {
          name: "Visit Permission.pdf",
          uploadedOn: "2023-04-20",
          size: "1.1 MB",
          url: "#"
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-20 16:45",
          text: "Thank you for your request. We will check the availability of buses for the requested date.",
          internal: false
        },
        {
          user: "Transport Department",
          time: "2023-04-22 11:30",
          text: "We have two buses available on May 30th. We need the exact pickup time and duration of the visit.",
          internal: false
        },
        {
          user: "Prof. Rajiv Malhotra",
          time: "2023-04-22 14:15",
          text: "The pickup time should be 8:00 AM from the university main gate. The visit will be from 10:00 AM to 4:00 PM. We should be back by 6:00 PM.",
          internal: false
        },
        {
          user: "Transport Department",
          time: "2023-04-25 10:00",
          text: "Transportation has been arranged as requested. Two buses will be available at the main gate at 8:00 AM on May 30th.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-31 09:30",
          text: "The industrial visit has been completed successfully. The transportation service has been marked as completed.",
          internal: false
        }
      ]
    },
    {
      id: "EVT-2023-005",
      title: "Guest Accommodation for Conference Speakers",
      description: "We need accommodation arrangements for 5 guest speakers attending our international conference on Renewable Energy. They will be staying for 3 nights.",
      category: "Accommodation",
      requestDate: "2023-04-15",
      requestTime: "18:45",
      eventDate: "2023-06-10",
      venue: "University Guest House",
      expectedAttendees: 5,
      status: "Rejected",
      priority: "High",
      requester: {
        id: "FAC2023030",
        name: "Dr. Prakash Joshi",
        type: "Faculty",
        department: "Electrical Engineering",
        email: "prakash.j@university.edu",
        phone: "+91 9876543214"
      },
      documents: [
        {
          name: "Guest Details.pdf",
          uploadedOn: "2023-04-15",
          size: "900 KB",
          url: "#"
        }
      ],
      rejectionReason: "The university guest house is fully booked for a Board of Governors meeting during the requested dates.",
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-15 19:30",
          text: "Thank you for your request. We will check the availability of rooms in the university guest house.",
          internal: false
        },
        {
          user: "Guest House Management",
          time: "2023-04-17 10:15",
          text: "The university guest house is fully booked for a Board of Governors meeting from June 9th to June 12th.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-04-17 14:30",
          text: "We regret to inform you that the university guest house is fully booked during the requested dates due to a Board of Governors meeting. Would you like us to check availability at nearby hotels?",
          internal: false
        },
        {
          user: "Dr. Prakash Joshi",
          time: "2023-04-17 16:45",
          text: "Thank you for the information. We will make alternative arrangements for the guest speakers.",
          internal: false
        }
      ]
    },
    {
      id: "EVT-2023-006",
      title: "Photography Services for Graduation Ceremony",
      description: "We need professional photography services for the upcoming graduation ceremony. The service should include individual graduate photos, group photos, and event coverage.",
      category: "Photography/Videography",
      requestDate: "2023-04-10",
      requestTime: "11:30",
      eventDate: "2023-07-05",
      venue: "University Amphitheater",
      expectedAttendees: 300,
      status: "In Progress",
      priority: "Medium",
      requester: {
        id: "ADM2023005",
        name: "Ms. Anjali Desai",
        type: "Staff",
        department: "Student Affairs",
        email: "anjali.d@university.edu",
        phone: "+91 9876543215"
      },
      documents: [
        {
          name: "Photography Requirements.pdf",
          uploadedOn: "2023-04-10",
          size: "1.5 MB",
          url: "#"
        }
      ],
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-10 12:45",
          text: "Thank you for your request. We will contact our empaneled photography service providers.",
          internal: false
        },
        {
          user: "Media Cell",
          time: "2023-04-12 14:30",
          text: "We have contacted three photography agencies. They will submit their proposals by next week.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-04-20 15:15",
          text: "We have received proposals from three photography agencies. We are evaluating them based on their portfolio and pricing. We will update you soon.",
          internal: false
        }
      ]
    }
  ])

  // Filter event requests based on active tab, search, and filters
  const getFilteredRequests = () => {
    let filteredByTab = [...eventRequests]
    
    if (activeTab === "pending") {
      filteredByTab = eventRequests.filter(item => item.status === "Pending")
    } else if (activeTab === "in-progress") {
      filteredByTab = eventRequests.filter(item => ["In Progress", "Approved"].includes(item.status))
    } else if (activeTab === "completed") {
      filteredByTab = eventRequests.filter(item => item.status === "Completed")
    } else if (activeTab === "rejected") {
      filteredByTab = eventRequests.filter(item => item.status === "Rejected")
    }
    
    return filteredByTab.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requester.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
  }

  // Sort filtered requests
  const getSortedRequests = () => {
    const filteredRequests = getFilteredRequests()
    
    return [...filteredRequests].sort((a, b) => {
      let valueA, valueB
      
      if (sortField === "requestDate") {
        valueA = new Date(`${a.requestDate} ${a.requestTime || "00:00"}`).getTime()
        valueB = new Date(`${b.requestDate} ${b.requestTime || "00:00"}`).getTime()
      } else if (sortField === "eventDate") {
        valueA = new Date(a.eventDate).getTime()
        valueB = new Date(b.eventDate).getTime()
      } else if (sortField === "expectedAttendees") {
        valueA = a.expectedAttendees || 0
        valueB = b.expectedAttendees || 0
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
    
    const updatedRequests = eventRequests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          comments: request.comments ? [...request.comments, newComment] : [newComment]
        }
      }
      return request
    })
    
    setEventRequests(updatedRequests)
    
    // Update the selected request to show the new comment
    const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
    if (updatedRequest) setSelectedRequest(updatedRequest)
    
    setReplyText("")
    alert(`Reply sent regarding ${selectedRequest.id}`)
  }

  const handleStatusChange = (requestId: string, newStatus: string) => {
    const updatedRequests = eventRequests.map(request => {
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
    
    setEventRequests(updatedRequests)
    
    // If we're viewing this request, update the selected request too
    if (selectedRequest && selectedRequest.id === requestId) {
      const updatedRequest = updatedRequests.find(request => request.id === requestId)
      if (updatedRequest) setSelectedRequest(updatedRequest)
    }
    
    alert(`Status updated to ${newStatus} for request ${requestId}`)
  }
  
  const handleAddRequest = () => {
    if (!requestTitle || !requestDescription || !requestCategory || !requestEventDate || !requestVenue || !requestExpectedAttendees) {
      alert("Please fill in all required fields")
      return
    }
    
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const newRequest = {
      id: `EVT-${now.getFullYear()}-${String(eventRequests.length + 1).padStart(3, '0')}`,
      title: requestTitle,
      description: requestDescription,
      category: requestCategory,
      requestDate: now.toLocaleDateString(),
      requestTime: formattedTime,
      eventDate: requestEventDate,
      venue: requestVenue,
      expectedAttendees: parseInt(requestExpectedAttendees) || 0,
      status: "Pending",
      priority: "Medium",
      requester: {
        id: "ADMIN001",
        name: "University Admin",
        type: "Staff",
        department: "Administration",
        email: "admin@university.edu",
        phone: "+91 9876543200"
      },
      documents: [],
      comments: [
        {
          user: "University Admin",
          time: now.toLocaleString(),
          text: "Event help request added to the system.",
          internal: true
        }
      ]
    }
    
    setEventRequests([newRequest, ...eventRequests])
    
    // Reset form
    setRequestTitle("")
    setRequestDescription("")
    setRequestCategory("")
    setRequestEventDate("")
    setRequestVenue("")
    setRequestExpectedAttendees("")
    setIsAddRequestDialogOpen(false)
    
    alert(`New event help request added successfully`)
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
    "Approved": "bg-purple-100 text-purple-800",
    "Completed": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
  }

  const priorityColors: Record<string, string> = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-red-100 text-red-800",
  }

  const categories = [
    "All",
    "Technical Support",
    "Venue Booking",
    "Catering Services",
    "Transportation",
    "Accommodation",
    "Photography/Videography",
    "Decoration",
    "Security",
    "Others"
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
              <h1 className="text-3xl font-bold text-gray-900">Event Help Desk</h1>
            </div>
            <p className="text-gray-500">Manage and respond to event-related requests from students and faculty</p>
          </div>
          <Button onClick={() => setIsAddRequestDialogOpen(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add New Request
          </Button>
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
                <CardDescription>Filter event requests by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title, ID, description, or requester..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" className="w-full" onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("All")
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
                  {activeTab === "pending" && "Pending Event Requests"}
                  {activeTab === "in-progress" && "In Progress Event Requests"}
                  {activeTab === "completed" && "Completed Event Requests"}
                  {activeTab === "rejected" && "Rejected Event Requests"}
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
                            ID
                            {sortField === "id" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("title")}
                          >
                            Title
                            {sortField === "title" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("category")}
                          >
                            Category
                            {sortField === "category" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("eventDate")}
                          >
                            Event Date
                            {sortField === "eventDate" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Requester
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
                              <div>
                                <p className="font-medium">{request.title}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{request.description}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {request.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3 text-gray-400" />
                                {request.eventDate}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{request.requester.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium">{request.requester.name}</p>
                                  <p className="text-xs text-gray-500">{request.requester.type}</p>
                                </div>
                              </div>
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
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Approved")}>
                                      Mark as Approved
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
                            No event requests found matching your criteria
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
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                    Event Request Details
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
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base font-medium">{selectedRequest.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-base">{selectedRequest.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Category</p>
                          <Badge variant="outline" className="mt-1">{selectedRequest.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={`${statusColors[selectedRequest.status]} mt-1`}>{selectedRequest.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <Badge className={`${priorityColors[selectedRequest.priority]} mt-1`}>{selectedRequest.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expected Attendees</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{selectedRequest.expectedAttendees}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Request Date</p>
                          <p className="text-base">{selectedRequest.requestDate} {selectedRequest.requestTime}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Event Date</p>
                          <p className="text-base">{selectedRequest.eventDate}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Venue</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedRequest.venue}</span>
                        </div>
                      </div>
                      
                      {selectedRequest.rejectionReason && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                          <p className="text-base">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Requester Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedRequest.requester.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedRequest.requester.name}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.requester.type} - {selectedRequest.requester.department}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a href={`mailto:${selectedRequest.requester.email}`} className="text-blue-600 hover:underline">
                              {selectedRequest.requester.email}
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${selectedRequest.requester.phone}`} className="text-blue-600 hover:underline">
                              {selectedRequest.requester.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium mb-4">Attached Documents</h3>
                        <div className="space-y-3">
                          {selectedRequest.documents.map((doc: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-gray-500">Uploaded on {doc.uploadedOn} • {doc.size}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          ))}
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
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedRequest.id, "Approved")}>
                                Mark as Approved
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
                                const updatedRequests = eventRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "Low" }
                                  }
                                  return request
                                })
                                setEventRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to Low
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedRequests = eventRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "Medium" }
                                  }
                                  return request
                                })
                                setEventRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to Medium
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedRequests = eventRequests.map(request => {
                                  if (request.id === selectedRequest.id) {
                                    return { ...request, priority: "High" }
                                  }
                                  return request
                                })
                                setEventRequests(updatedRequests)
                                const updatedRequest = updatedRequests.find(request => request.id === selectedRequest.id)
                                if (updatedRequest) setSelectedRequest(updatedRequest)
                              }}>
                                Set to High
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </Button>
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
        
        {/* Add Request Dialog */}
        <Dialog open={isAddRequestDialogOpen} onOpenChange={setIsAddRequestDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Event Request</DialogTitle>
              <DialogDescription>
                Add a new event help request to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="space-y-2">
                <label htmlFor="request-title" className="text-sm font-medium">Title*</label>
                <Input 
                  id="request-title" 
                  value={requestTitle} 
                  onChange={(e) => setRequestTitle(e.target.value)} 
                  placeholder="Brief title of the event request"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="request-description" className="text-sm font-medium">Description*</label>
                <Textarea 
                  id="request-description" 
                  value={requestDescription} 
                  onChange={(e) => setRequestDescription(e.target.value)} 
                  placeholder="Detailed description of the event request"
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="request-category" className="text-sm font-medium">Category*</label>
                <Select value={requestCategory} onValueChange={setRequestCategory}>
                  <SelectTrigger id="request-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="request-event-date" className="text-sm font-medium">Event Date*</label>
                <Input 
                  id="request-event-date" 
                  type="date" 
                  value={requestEventDate} 
                  onChange={(e) => setRequestEventDate(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="request-venue" className="text-sm font-medium">Venue*</label>
                <Input 
                  id="request-venue" 
                  value={requestVenue} 
                  onChange={(e) => setRequestVenue(e.target.value)} 
                  placeholder="Location of the event"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="request-attendees" className="text-sm font-medium">Expected Attendees*</label>
                <Input 
                  id="request-attendees" 
                  type="number" 
                  value={requestExpectedAttendees} 
                  onChange={(e) => setRequestExpectedAttendees(e.target.value)} 
                  placeholder="Number of expected attendees"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRequestDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRequest}>Add Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
