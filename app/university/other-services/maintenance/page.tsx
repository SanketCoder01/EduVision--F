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
  ArrowLeft,
  MapPin,
  Wrench,
  Phone
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Mock data for maintenance complaints
const maintenanceComplaints = [
  {
    id: "MAINT-2023-001",
    studentId: "STU2023025",
    studentName: "Aditya Kumar",
    department: "Computer Science & Engineering",
    hostelRoom: "Block A - 203",
    title: "Leaking Water Tap",
    description: "The water tap in the common bathroom is continuously leaking, causing water wastage and wet floor.",
    category: "Plumbing",
    location: "Hostel Block A, 2nd Floor Common Bathroom",
    priority: "Medium",
    status: "Pending",
    reportedDate: "May 10, 2023",
    images: ["/maintenance/leak1.jpg"],
    emergencyContact: false
  },
  {
    id: "MAINT-2023-002",
    studentId: "STU2023056",
    studentName: "Meera Patel",
    department: "Artificial Intelligence & Data Science",
    hostelRoom: "Girls Hostel - 118",
    title: "Electrical Socket Not Working",
    description: "The electrical socket near my study table is not working. I've tried plugging in different devices but none work.",
    category: "Electrical",
    location: "Girls Hostel, Room 118",
    priority: "High",
    status: "In Progress",
    reportedDate: "May 9, 2023",
    assignedTo: "Electrical Department",
    assignedDate: "May 10, 2023",
    images: ["/maintenance/socket1.jpg", "/maintenance/socket2.jpg"],
    emergencyContact: false,
    comments: [
      {
        user: "Maintenance Office",
        time: "May 10, 2023 09:30 AM",
        text: "Assigned to electrical team. They will visit today between 2-4 PM."
      },
      {
        user: "Electrical Department",
        time: "May 10, 2023 02:45 PM",
        text: "Visited the location. Need to replace the socket. Will return tomorrow with parts."
      }
    ]
  },
  {
    id: "MAINT-2023-003",
    studentId: "STU2023089",
    studentName: "Rajat Verma",
    department: "Cyber Security",
    hostelRoom: "Block B - 315",
    title: "AC Not Cooling",
    description: "The air conditioner in the computer lab 3 is not cooling properly. It's making a strange noise and the air is barely cool.",
    category: "HVAC",
    location: "Academic Building, Computer Lab 3",
    priority: "High",
    status: "Completed",
    reportedDate: "May 7, 2023",
    assignedTo: "HVAC Department",
    assignedDate: "May 7, 2023",
    completedDate: "May 9, 2023",
    resolution: "Cleaned filters and recharged refrigerant. AC is now working properly.",
    images: ["/maintenance/ac1.jpg"],
    emergencyContact: false,
    comments: [
      {
        user: "HVAC Department",
        time: "May 8, 2023 11:15 AM",
        text: "Inspected the AC unit. Filters are clogged and refrigerant level is low. Will fix tomorrow."
      },
      {
        user: "HVAC Department",
        time: "May 9, 2023 03:30 PM",
        text: "Completed the repairs. AC is now cooling properly. Please let us know if there are any further issues."
      },
      {
        user: "Rajat Verma",
        time: "May 9, 2023 05:45 PM",
        text: "Thank you! The AC is working great now."
      }
    ]
  },
  {
    id: "MAINT-2023-004",
    studentId: "STU2023112",
    studentName: "Priya Singh",
    department: "Artificial Intelligence & Machine Learning",
    hostelRoom: "Girls Hostel - 205",
    title: "Broken Chair",
    description: "One of the chairs in the library reading area (near the science section) has a broken leg and is unsafe to sit on.",
    category: "Furniture",
    location: "Library, 1st Floor Reading Area",
    priority: "Low",
    status: "Rejected",
    reportedDate: "May 6, 2023",
    rejectedReason: "This issue has already been reported and is scheduled for repair on May 12, 2023.",
    rejectedDate: "May 6, 2023",
    images: ["/maintenance/chair1.jpg"],
    emergencyContact: false,
    comments: [
      {
        user: "Maintenance Office",
        time: "May 6, 2023 02:10 PM",
        text: "This issue was already reported by library staff and is in our schedule. Thank you for your vigilance."
      }
    ]
  },
  {
    id: "MAINT-2023-005",
    studentId: "STU2023078",
    studentName: "Vikram Desai",
    department: "Computer Science & Engineering",
    hostelRoom: "Block A - 112",
    title: "Water Heater Not Working",
    description: "The water heater in Block A bathroom is not heating water. It's very cold and difficult to take a shower.",
    category: "Plumbing",
    location: "Hostel Block A, 1st Floor Bathroom",
    priority: "High",
    status: "In Progress",
    reportedDate: "May 5, 2023",
    assignedTo: "Plumbing Department",
    assignedDate: "May 5, 2023",
    images: ["/maintenance/heater1.jpg"],
    emergencyContact: false,
    comments: [
      {
        user: "Plumbing Department",
        time: "May 5, 2023 04:30 PM",
        text: "Inspected the water heater. The heating element needs replacement. Parts ordered and will be fixed within 2 days."
      },
      {
        user: "Maintenance Office",
        time: "May 7, 2023 09:15 AM",
        text: "Parts have arrived. Repair scheduled for today afternoon."
      }
    ]
  },
  {
    id: "MAINT-2023-006",
    studentId: "STU2023045",
    studentName: "Ananya Sharma",
    department: "Artificial Intelligence & Data Science",
    hostelRoom: "Girls Hostel - 302",
    title: "Ceiling Fan Making Noise",
    description: "The ceiling fan in classroom 105 is making a loud rattling noise when running at medium or high speed.",
    category: "Electrical",
    location: "Academic Building, Classroom 105",
    priority: "Medium",
    status: "Pending",
    reportedDate: "May 4, 2023",
    images: [],
    emergencyContact: false
  }
]

export default function MaintenanceComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter complaints based on search and filters
  const filteredComplaints = maintenanceComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "All" || complaint.status === statusFilter
    const matchesCategory = categoryFilter === "All" || complaint.category === categoryFilter
    const matchesPriority = priorityFilter === "All" || complaint.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const handleViewComplaint = (complaint: any) => {
    setSelectedComplaint(complaint)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    // In a real application, this would send the reply
    alert(`Reply sent to ${selectedComplaint.studentName}`)
    setReplyText("")
    setIsDialogOpen(false)
  }

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    // In a real application, this would update the status in the database
    alert(`Status updated to ${newStatus} for complaint ${complaintId}`)
  }

  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Completed": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
  }

  const priorityColors: Record<string, string> = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-yellow-100 text-yellow-800",
    "High": "bg-red-100 text-red-800",
  }

  const categories = [
    "All",
    "Plumbing",
    "Electrical",
    "HVAC",
    "Furniture",
    "Cleaning",
    "Structural",
    "Painting",
    "Others"
  ]

  const priorities = ["All", "Low", "Medium", "High"]

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
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Complaints</h1>
            </div>
            <p className="text-gray-500">Review and manage maintenance requests from students</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter maintenance complaints by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, title, or location..."
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
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
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
              <div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Complaints</CardTitle>
            <CardDescription>
              {filteredComplaints.length} complaints found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{complaint.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{complaint.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{complaint.studentName}</p>
                              <p className="text-xs text-gray-500">{complaint.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{complaint.title}</td>
                        <td className="py-3 px-4 text-sm">{complaint.category}</td>
                        <td className="py-3 px-4 text-sm">{complaint.location}</td>
                        <td className="py-3 px-4 text-sm">{complaint.reportedDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={priorityColors[complaint.priority]}>{complaint.priority}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[complaint.status]}>{complaint.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewComplaint(complaint)}>
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
                                <DropdownMenuItem onClick={() => handleStatusChange(complaint.id, "In Progress")}>
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(complaint.id, "Completed")}>
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(complaint.id, "Rejected")}>
                                  Reject Complaint
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-500">
                        No maintenance complaints found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedComplaint && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Maintenance Complaint Details
                  </DialogTitle>
                  <DialogDescription>
                    Complaint ID: {selectedComplaint.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Complaint Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base">{selectedComplaint.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-base">{selectedComplaint.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="text-base">{selectedComplaint.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <p className="text-base">{selectedComplaint.location}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reported Date</p>
                        <p className="text-base">{selectedComplaint.reportedDate}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <Badge className={priorityColors[selectedComplaint.priority]}>{selectedComplaint.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={statusColors[selectedComplaint.status]}>{selectedComplaint.status}</Badge>
                        </div>
                      </div>
                      
                      {selectedComplaint.assignedTo && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Assigned To</p>
                          <p className="text-base">{selectedComplaint.assignedTo}</p>
                          {selectedComplaint.assignedDate && (
                            <p className="text-xs text-gray-500">Assigned on {selectedComplaint.assignedDate}</p>
                          )}
                        </div>
                      )}
                      
                      {selectedComplaint.completedDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Completed Date</p>
                          <p className="text-base">{selectedComplaint.completedDate}</p>
                        </div>
                      )}
                      
                      {selectedComplaint.resolution && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Resolution</p>
                          <p className="text-base">{selectedComplaint.resolution}</p>
                        </div>
                      )}
                      
                      {selectedComplaint.rejectedReason && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                          <p className="text-base">{selectedComplaint.rejectedReason}</p>
                          {selectedComplaint.rejectedDate && (
                            <p className="text-xs text-gray-500">Rejected on {selectedComplaint.rejectedDate}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Student Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedComplaint.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedComplaint.studentName}</p>
                          <p className="text-sm text-gray-500">{selectedComplaint.studentId}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-base">{selectedComplaint.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Hostel Room</p>
                        <p className="text-base">{selectedComplaint.hostelRoom}</p>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        Emergency Maintenance Contacts
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Electrical Issues:</span> +91 9876543210</p>
                        <p><span className="font-medium">Plumbing Issues:</span> +91 9876543211</p>
                        <p><span className="font-medium">HVAC Issues:</span> +91 9876543212</p>
                        <p><span className="font-medium">Security:</span> +91 9876543213</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Images */}
                    {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedComplaint.images.map((image: string, index: number) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={image} 
                                  alt={`Complaint image ${index + 1}`} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Comments/Communication History */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[300px] overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Communication History</h4>
                      {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedComplaint.comments.map((comment: any, index: number) => (
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
                      <div className="flex justify-between items-center mt-4">
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedComplaint.id, "In Progress")}
                          >
                            <Loader2 className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedComplaint.id, "Completed")}
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
