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
  CalendarDays,
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Flag,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PartyPopper,
  Plus,
  Search,
  Send,
  Upload,
  Users
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const eventRequests = [
  {
    id: "EVT-2023-001",
    title: "Tech Club Annual Hackathon",
    eventType: "Competition",
    venue: "Engineering Block, Labs 101-105",
    startDate: "2023-06-15",
    endDate: "2023-06-16",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    expectedAttendees: 120,
    resources: ["Projector", "Sound System", "Tables & Chairs", "Extension Cords"],
    description: "A 24-hour hackathon for students to develop innovative solutions to real-world problems. We'll need access to the labs overnight and require technical support staff.",
    status: "Approved",
    submittedDate: "May 10, 2023",
    approvedDate: "May 15, 2023",
    organizer: {
      name: "Tech Club",
      contactPerson: "John Smith",
      email: "techclub@example.edu",
      phone: "555-123-4567"
    },
    approvers: [
      {
        name: "Dr. Robert Chen",
        role: "Faculty Advisor",
        status: "Approved",
        date: "May 12, 2023",
        comments: "Great initiative. Approved."
      },
      {
        name: "Facilities Management",
        role: "Venue Approval",
        status: "Approved",
        date: "May 14, 2023",
        comments: "Labs reserved for the requested dates."
      },
      {
        name: "Dean of Student Affairs",
        role: "Final Approval",
        status: "Approved",
        date: "May 15, 2023",
        comments: "Event approved. Please ensure proper security arrangements."
      }
    ]
  },
  {
    id: "EVT-2023-008",
    title: "Cultural Festival - Diversity Day",
    eventType: "Cultural Event",
    venue: "Main Auditorium & Courtyard",
    startDate: "2023-06-25",
    endDate: "2023-06-25",
    startTime: "10:00 AM",
    endTime: "08:00 PM",
    expectedAttendees: 350,
    resources: ["Stage", "Sound System", "Lighting Equipment", "Food Stalls Area", "Seating Arrangements"],
    description: "Annual cultural festival celebrating diversity with performances, food stalls, and cultural exhibitions from different countries and regions.",
    status: "Under Review",
    submittedDate: "May 18, 2023",
    organizer: {
      name: "Cultural Affairs Committee",
      contactPerson: "Maria Rodriguez",
      email: "cultural@example.edu",
      phone: "555-987-6543"
    },
    approvers: [
      {
        name: "Dr. Sarah Johnson",
        role: "Faculty Advisor",
        status: "Approved",
        date: "May 20, 2023",
        comments: "Excellent initiative to promote cultural diversity."
      },
      {
        name: "Facilities Management",
        role: "Venue Approval",
        status: "Under Review",
        date: "",
        comments: "Checking availability of the auditorium for the requested date."
      },
      {
        name: "Dean of Student Affairs",
        role: "Final Approval",
        status: "Pending",
        date: "",
        comments: ""
      }
    ]
  },
  {
    id: "EVT-2023-012",
    title: "Career Fair - Spring 2023",
    eventType: "Professional Event",
    venue: "Student Center, Halls A & B",
    startDate: "2023-07-05",
    endDate: "2023-07-06",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    expectedAttendees: 500,
    resources: ["Booths", "Tables & Chairs", "Projector", "Sound System", "Wi-Fi Enhancement"],
    description: "Semi-annual career fair with participation from over 50 companies. Students will have the opportunity to network, submit resumes, and participate in on-the-spot interviews.",
    status: "Pending Submission",
    submittedDate: "May 22, 2023",
    organizer: {
      name: "Career Development Office",
      contactPerson: "David Wilson",
      email: "careers@example.edu",
      phone: "555-456-7890"
    },
    approvers: []
  }
]

const eventTypes = [
  "All Types",
  "Academic",
  "Cultural Event",
  "Sports",
  "Workshop",
  "Seminar",
  "Competition",
  "Professional Event",
  "Club Meeting",
  "Social Gathering",
  "Other"
]

const venues = [
  "All Venues",
  "Main Auditorium",
  "Student Center",
  "Engineering Block",
  "Science Block",
  "Sports Complex",
  "Open Air Theater",
  "Conference Rooms",
  "Classrooms",
  "Other"
]

const statusOptions = [
  "All",
  "Draft",
  "Pending Submission",
  "Under Review",
  "Approved",
  "Rejected",
  "Cancelled"
]

const resourceOptions = [
  { id: "projector", label: "Projector" },
  { id: "sound", label: "Sound System" },
  { id: "lighting", label: "Lighting Equipment" },
  { id: "chairs", label: "Tables & Chairs" },
  { id: "stage", label: "Stage" },
  { id: "microphone", label: "Microphones" },
  { id: "extension", label: "Extension Cords" },
  { id: "wifi", label: "Wi-Fi Enhancement" },
  { id: "computer", label: "Computers/Laptops" },
  { id: "refreshments", label: "Refreshments" },
  { id: "security", label: "Security Personnel" },
  { id: "cleaning", label: "Cleaning Services" },
  { id: "other", label: "Other (Please Specify)" }
]

export default function EventDeskPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventType, setSelectedEventType] = useState("All Types")
  const [selectedVenue, setSelectedVenue] = useState("All Venues")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedResources, setSelectedResources] = useState([])
  
  const filteredEvents = eventRequests.filter(
    (event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesEventType = 
        selectedEventType === "All Types" || 
        event.eventType === selectedEventType
      
      const matchesVenue = 
        selectedVenue === "All Venues" || 
        event.venue.includes(selectedVenue)
      
      const matchesStatus = 
        selectedStatus === "All" || 
        event.status === selectedStatus
      
      return matchesSearch && matchesEventType && matchesVenue && matchesStatus
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
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <PartyPopper className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Event Help Desk</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request permission for events and reserve resources</p>
          </div>
        </div>

        <Tabs defaultValue="my-requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="resources">Available Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Event Requests</CardTitle>
                <CardDescription>View and track your event permission requests</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by title, description, or ID..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span className="truncate">Event Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">Venue</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue} value={venue}>
                            {venue}
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
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <span className="ml-2 text-xs text-gray-500">{event.id}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                event.status === "Approved" ? "bg-green-100 text-green-700" :
                                event.status === "Under Review" ? "bg-blue-100 text-blue-700" :
                                event.status === "Rejected" ? "bg-red-100 text-red-700" :
                                event.status === "Pending Submission" ? "bg-amber-100 text-amber-700" :
                                event.status === "Draft" ? "bg-gray-100 text-gray-700" :
                                event.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              } border-0 mt-2 sm:mt-0`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(event.startDate).toLocaleDateString()} {event.startDate !== event.endDate && `- ${new Date(event.endDate).toLocaleDateString()}`}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.startTime} - {event.endTime}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.venue}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Users className="h-3 w-3 mr-1" />
                              {event.expectedAttendees} attendees
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                          
                          {event.resources && event.resources.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-medium text-gray-700 mb-1">Resources Requested:</div>
                              <div className="flex flex-wrap gap-1">
                                {event.resources.map((resource, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {event.approvers && event.approvers.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs font-medium text-gray-700 mb-2">Approval Status:</div>
                              <div className="space-y-2">
                                {event.approvers.map((approver, index) => (
                                  <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                    <div>
                                      <span className="font-medium">{approver.role}</span>: {approver.name}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        approver.status === "Approved" ? "bg-green-100 text-green-700" :
                                        approver.status === "Under Review" ? "bg-blue-100 text-blue-700" :
                                        approver.status === "Rejected" ? "bg-red-100 text-red-700" :
                                        approver.status === "Pending" ? "bg-gray-100 text-gray-700" :
                                        "bg-gray-100 text-gray-700"
                                      } border-0 text-xs`}
                                    >
                                      {approver.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Submitted: {event.submittedDate}
                              {event.approvedDate && ` | Approved: ${event.approvedDate}`}
                            </div>
                            <div className="flex gap-2">
                              {event.status === "Pending Submission" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                  Edit Request
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              {event.status === "Approved" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs">
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
                      <p className="text-gray-500">No event requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-request" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>New Event Request</CardTitle>
                <CardDescription>Submit a request for event permission and resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <Input placeholder="Enter a clear, descriptive title for your event" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.slice(1).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues.slice(1).map((venue) => (
                            <SelectItem key={venue} value={venue}>
                              {venue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <Input type="time" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <Input type="time" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Number of Attendees</label>
                    <Input type="number" placeholder="Enter the expected number of participants" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                    <Textarea 
                      placeholder="Provide a detailed description of your event, including its purpose, activities, and any special requirements..."
                      className="resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resources Required</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {resourceOptions.map((resource) => (
                        <div key={resource.id} className="flex items-center space-x-2">
                          <Checkbox id={resource.id} />
                          <label
                            htmlFor={resource.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {resource.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Supporting Documents (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-gray-500 mb-2">Event proposal, budget, floor plan, etc.</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Organization/Club Name</label>
                        <Input placeholder="Enter organization name" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
                        <Input placeholder="Enter contact person's name" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                        <Input type="email" placeholder="Enter contact email" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                        <Input placeholder="Enter contact phone number" />
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
                        I agree to the event policies and guidelines
                      </label>
                      <p className="text-xs text-gray-500">
                        By submitting this request, I confirm that I have read and understood the institution's event policies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <div className="flex gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Resources</CardTitle>
                <CardDescription>View resources that can be requested for your events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Venues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Main Auditorium</div>
                              <Badge className="bg-green-100 text-green-700 border-0">Available</Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Capacity: 500 people</div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Conference Room A</div>
                              <Badge className="bg-green-100 text-green-700 border-0">Available</Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Capacity: 50 people</div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Student Center Hall</div>
                              <Badge className="bg-red-100 text-red-700 border-0">Booked</Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Capacity: 200 people</div>
                            <div className="text-xs text-red-500 mt-1">Booked until: June 20, 2023</div>
                          </div>
                          <Button variant="link" className="text-xs p-0 h-auto w-full text-right">
                            View all venues
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Equipment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Projectors</div>
                              <div className="text-sm">8/10 Available</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: "80%" }}></div>
                            </div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Sound Systems</div>
                              <div className="text-sm">3/5 Available</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: "60%" }}></div>
                            </div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Microphones</div>
                              <div className="text-sm">12/15 Available</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: "80%" }}></div>
                            </div>
                          </div>
                          <Button variant="link" className="text-xs p-0 h-auto w-full text-right">
                            View all equipment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Services</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="p-2 border rounded-md">
                            <div className="font-medium">Technical Support</div>
                            <div className="text-xs text-gray-500 mt-1">Available on request (48h notice required)</div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="font-medium">Catering Services</div>
                            <div className="text-xs text-gray-500 mt-1">Available through approved vendors only</div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <div className="font-medium">Security Personnel</div>
                            <div className="text-xs text-gray-500 mt-1">Required for events with 100+ attendees</div>
                          </div>
                          <Button variant="link" className="text-xs p-0 h-auto w-full text-right">
                            View all services
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Venue Availability Calendar</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center p-4">
                        <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Venue availability calendar will be displayed here</p>
                        <Button variant="outline" className="mt-2">
                          Check Availability
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Policies & Guidelines</CardTitle>
              <CardDescription>Important information about organizing events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Request Timeline</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Small events (under 50 attendees): Submit at least 1 week in advance</li>
                    <li>Medium events (50-200 attendees): Submit at least 2 weeks in advance</li>
                    <li>Large events (over 200 attendees): Submit at least 4 weeks in advance</li>
                    <li>Events requiring special arrangements: Submit at least 6 weeks in advance</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Approval Process</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Faculty Advisor approval is required for all student-organized events</li>
                    <li>Facilities Management must approve venue requests</li>
                    <li>Events with external participants require additional security clearance</li>
                    <li>Final approval is granted by the Dean of Student Affairs</li>
                    <li>You will receive email notifications at each stage of the approval process</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Event Rules & Regulations</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>All events must comply with institutional policies and local regulations</li>
                    <li>Noise levels must be maintained within acceptable limits</li>
                    <li>Fire safety regulations must be strictly followed</li>
                    <li>Organizers are responsible for cleanup after the event</li>
                    <li>Damage to facilities or equipment will be charged to the organizing entity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Info className="h-4 w-4 mr-2 text-purple-500" />
                  For urgent inquiries, contact the Event Management Office at 555-789-0123
                </div>
                <Button variant="outline" className="sm:w-auto">
                  Download Complete Event Guidelines
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
