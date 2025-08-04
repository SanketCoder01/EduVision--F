"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Search, Filter, Clock, Calendar, User, MessageSquare, FileText, AlertTriangle, CheckCircle, XCircle, Eye, Lock, LockOpen } from "lucide-react"

// Mock data for existing grievances
const mockGrievances = [
  {
    id: "GRV-2023-001",
    title: "Inadequate Lab Equipment",
    category: "Infrastructure",
    status: "Resolved",
    priority: "Medium",
    dateSubmitted: "2023-10-15",
    dateResolved: "2023-11-01",
    description: "The computer lab in the Engineering building has several workstations with outdated hardware that cannot run the required software for my classes. This is affecting the quality of practical sessions.",
    isAnonymous: false,
    assignedTo: {
      name: "Dr. Sarah Johnson",
      department: "IT Services",
      email: "sjohnson@university.edu",
      phone: "(555) 234-5678"
    },
    timeline: [
      {
        date: "2023-10-15",
        action: "Grievance submitted",
        by: "Faculty"
      },
      {
        date: "2023-10-16",
        action: "Grievance assigned to IT Services",
        by: "Grievance Committee"
      },
      {
        date: "2023-10-20",
        action: "Assessment conducted of lab equipment",
        by: "IT Services"
      },
      {
        date: "2023-10-25",
        action: "Procurement request submitted for new equipment",
        by: "IT Services"
      },
      {
        date: "2023-11-01",
        action: "New equipment installed and tested",
        by: "IT Services"
      },
      {
        date: "2023-11-01",
        action: "Grievance marked as resolved",
        by: "Grievance Committee"
      }
    ],
    comments: [
      {
        user: "Dr. Sarah Johnson",
        time: "2023-10-20 14:30",
        text: "We've completed an assessment of the lab equipment and confirmed the issues. We're preparing a procurement request for new workstations.",
        isPrivate: false
      },
      {
        user: "Grievance Committee",
        time: "2023-10-26 09:15",
        text: "Procurement has been approved. New equipment should be installed within the next week.",
        isPrivate: false
      },
      {
        user: "Dr. Sarah Johnson",
        time: "2023-11-01 16:45",
        text: "All new equipment has been installed and tested. Please confirm if this resolves your grievance.",
        isPrivate: false
      }
    ]
  },
  {
    id: "GRV-2023-002",
    title: "Classroom Scheduling Conflict",
    category: "Academic",
    status: "In Progress",
    priority: "High",
    dateSubmitted: "2023-11-05",
    dateResolved: "",
    description: "There is a recurring scheduling conflict for Room 302 in the Science Building. My Advanced Physics class is scheduled at the same time as another faculty's Chemistry lab, causing disruption and confusion for students.",
    isAnonymous: false,
    assignedTo: {
      name: "Dr. Michael Chen",
      department: "Academic Affairs",
      email: "mchen@university.edu",
      phone: "(555) 345-6789"
    },
    timeline: [
      {
        date: "2023-11-05",
        action: "Grievance submitted",
        by: "Faculty"
      },
      {
        date: "2023-11-06",
        action: "Grievance assigned to Academic Affairs",
        by: "Grievance Committee"
      },
      {
        date: "2023-11-08",
        action: "Investigation initiated into scheduling system",
        by: "Academic Affairs"
      },
      {
        date: "2023-11-10",
        action: "Temporary solution implemented - alternate classroom assigned",
        by: "Academic Affairs"
      }
    ],
    comments: [
      {
        user: "Dr. Michael Chen",
        time: "2023-11-08 11:20",
        text: "We've identified the issue in our scheduling system. There appears to be an overlap that wasn't caught during the initial scheduling process.",
        isPrivate: false
      },
      {
        user: "Dr. Michael Chen",
        time: "2023-11-10 15:45",
        text: "As a temporary solution, we've assigned Room 305 for your Advanced Physics class. We're working on a permanent fix to the scheduling system to prevent future conflicts.",
        isPrivate: false
      }
    ]
  },
  {
    id: "GRV-2023-003",
    title: "Research Grant Allocation Issue",
    category: "Administrative",
    status: "Under Review",
    priority: "Medium",
    dateSubmitted: "2023-11-12",
    dateResolved: "",
    description: "The allocated research grant for the Quantum Computing project appears to be less than what was approved in the initial proposal. This discrepancy is affecting the procurement of essential equipment.",
    isAnonymous: true,
    assignedTo: {
      name: "Dr. Lisa Patel",
      department: "Finance & Grants",
      email: "lpatel@university.edu",
      phone: "(555) 456-7890"
    },
    timeline: [
      {
        date: "2023-11-12",
        action: "Grievance submitted anonymously",
        by: "Faculty"
      },
      {
        date: "2023-11-13",
        action: "Grievance assigned to Finance & Grants",
        by: "Grievance Committee"
      },
      {
        date: "2023-11-15",
        action: "Review of grant allocation initiated",
        by: "Finance & Grants"
      }
    ],
    comments: [
      {
        user: "Dr. Lisa Patel",
        time: "2023-11-15 10:30",
        text: "We're reviewing the grant allocation records and comparing them with the approved proposal. We'll need to check with the external funding agency as well.",
        isPrivate: false
      },
      {
        user: "Grievance Committee",
        time: "2023-11-16 14:15",
        text: "Please provide any additional documentation that might help in resolving this issue.",
        isPrivate: false
      }
    ]
  }
]

// Categories for grievances
const categories = [
  "All Categories",
  "Academic",
  "Administrative",
  "Infrastructure",
  "Technology",
  "Workplace Environment",
  "Professional Development",
  "Research Support",
  "Other"
]

export default function GrievancePage() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All")
  
  // State for form inputs
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  
  // Filter grievances based on search query, category, and status
  const filteredGrievances = mockGrievances.filter((grievance) => {
    const matchesSearch = grievance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || grievance.category === selectedCategory
    const matchesStatus = selectedStatus === "All" || grievance.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setFiles(prev => [...prev, ...fileArray])
    }
  }

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would send data to a backend
    alert("Grievance submitted successfully!")
    // Reset form
    setTitle("")
    setCategory("")
    setDescription("")
    setIsAnonymous(false)
    setFiles([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            <p className="text-gray-500 mt-1">Submit and track grievances with confidentiality</p>
          </div>
        </div>

        <Tabs defaultValue="my-grievances" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="my-grievances">My Grievances</TabsTrigger>
            <TabsTrigger value="submit-new">Submit a New Grievance</TabsTrigger>
            <TabsTrigger value="policies">Grievance Policies</TabsTrigger>
          </TabsList>

          {/* My Grievances Tab */}
          <TabsContent value="my-grievances" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search grievances..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredGrievances.length > 0 ? (
              <div className="space-y-6">
                {filteredGrievances.map((grievance) => (
                  <Card key={grievance.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {grievance.title}
                            {grievance.isAnonymous && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                <Lock className="h-3 w-3 mr-1" /> Anonymous
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                            <Badge variant="outline">{grievance.category}</Badge>
                            <Badge 
                              className={`
                                ${grievance.priority === "High" ? "bg-red-100 text-red-800" : ""}
                                ${grievance.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${grievance.priority === "Low" ? "bg-green-100 text-green-800" : ""}
                              `}
                            >
                              {grievance.priority} Priority
                            </Badge>
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              Submitted: {new Date(grievance.dateSubmitted).toLocaleDateString()}
                            </span>
                            {grievance.dateResolved && (
                              <span className="flex items-center">
                                <CheckCircle size={14} className="mr-1" />
                                Resolved: {new Date(grievance.dateResolved).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${grievance.status === "Pending" ? "bg-gray-100 text-gray-800" : ""}
                            ${grievance.status === "Under Review" ? "bg-blue-100 text-blue-800" : ""}
                            ${grievance.status === "In Progress" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${grievance.status === "Resolved" ? "bg-green-100 text-green-800" : ""}
                            ${grievance.status === "Closed" ? "bg-purple-100 text-purple-800" : ""}
                          `}
                        >
                          {grievance.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-700 line-clamp-2">{grievance.description}</p>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned to:</h4>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {grievance.assignedTo.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{grievance.assignedTo.name}</p>
                            <p className="text-xs text-gray-500">{grievance.assignedTo.department}</p>
                          </div>
                        </div>
                      </div>

                      {grievance.timeline.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity:</h4>
                          <div className="space-y-2">
                            {grievance.timeline.slice(-2).map((event, index) => (
                              <div key={index} className="flex items-start">
                                <div className="mr-2 mt-0.5">
                                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">{event.action}</p>
                                  <p className="text-xs text-gray-400">{event.date} by {event.by}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {grievance.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Comment:</h4>
                          <div className="flex items-start">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">
                                {grievance.comments[0].user.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="text-xs font-medium">{grievance.comments[0].user}</p>
                                <p className="text-xs text-gray-500 ml-2">{grievance.comments[0].time}</p>
                                {grievance.comments[0].isPrivate && (
                                  <Badge variant="outline" className="ml-2 h-5 text-xs">
                                    <Lock className="h-3 w-3 mr-1" /> Private
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{grievance.comments[0].text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" /> View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No grievances found matching your criteria.</p>
                  <p className="text-gray-400 text-sm text-center mt-1">Try adjusting your filters or search terms.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submit a New Grievance Tab */}
          <TabsContent value="submit-new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a New Grievance</CardTitle>
                <CardDescription>
                  Please provide details about your grievance. All submissions are treated with confidentiality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Grievance Title *</Label>
                      <Input
                        id="title"
                        placeholder="Provide a clear, concise title for your grievance"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide a detailed description of your grievance, including relevant dates, locations, and individuals involved."
                        className="min-h-[150px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                      <Label htmlFor="anonymous" className="cursor-pointer">
                        Submit Anonymously
                      </Label>
                      <span className="text-xs text-gray-500">
                        (Your identity will be hidden from all parties except the Grievance Committee)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="files">Supporting Documents (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <Input
                          id="files"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("files")?.click()}
                          >
                            Upload Files
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            Upload any relevant documents, images, or evidence (Max 5 files, 10MB each)
                          </p>
                        </div>
                        {files.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800">Important Information</h4>
                        <ul className="text-sm text-amber-700 mt-1 list-disc pl-5 space-y-1">
                          <li>All grievances are initially reviewed by the Grievance Committee.</li>
                          <li>You will receive updates on your grievance via email and on this portal.</li>
                          <li>False or malicious grievances may be subject to disciplinary action.</li>
                          <li>For urgent matters, please contact the Grievance Committee directly.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Submit Grievance</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grievance Policies Tab */}
          <TabsContent value="policies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Grievance Policies & Information</CardTitle>
                <CardDescription>
                  Understanding the grievance process and policies at our institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anti-Ragging Policy</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our institution has a zero-tolerance policy for ragging in any form. Ragging is strictly prohibited within the campus, including classrooms, laboratories, libraries, canteens, hostels, and all other areas. Any faculty member found engaging in or promoting ragging will face severe disciplinary action, including termination of service and legal proceedings as per the Anti-Ragging Act.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800">Reporting Ragging Incidents</h4>
                        <p className="text-sm text-red-700 mt-1">
                          If you witness or become aware of any ragging incidents, it is your duty to report them immediately to the Anti-Ragging Committee or through this grievance portal. Anonymous reporting is available to protect your identity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Grievance Redressal Process</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">1</div>
                        Submission
                      </h4>
                      <p className="text-sm text-gray-600 ml-8">
                        Faculty members can submit grievances through this portal. All submissions are logged with a unique tracking ID and timestamp. You can choose to submit anonymously if the matter is sensitive.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">2</div>
                        Processing
                      </h4>
                      <p className="text-sm text-gray-600 ml-8">
                        The Grievance Committee reviews all submissions within 48 hours. Based on the nature and urgency of the grievance, it is categorized and assigned to the appropriate department or committee for resolution.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">3</div>
                        Resolution
                      </h4>
                      <p className="text-sm text-gray-600 ml-8">
                        The assigned department investigates the grievance and takes appropriate action. Updates are provided through the portal and via email. The target resolution time is:
                      </p>
                      <ul className="text-sm text-gray-600 ml-8 mt-2 list-disc pl-5 space-y-1">
                        <li>High Priority: 7 working days</li>
                        <li>Medium Priority: 14 working days</li>
                        <li>Low Priority: 21 working days</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Anti-Ragging Committee</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm font-medium">Dr. Rajesh Kumar</p>
                          <p className="text-xs text-gray-500">Chairperson, Anti-Ragging Committee</p>
                          <p className="text-xs text-gray-500 mt-1">Email: rkumar@university.edu</p>
                          <p className="text-xs text-gray-500">Phone: (555) 123-4567</p>
                        </div>
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm font-medium">Dr. Priya Sharma</p>
                          <p className="text-xs text-gray-500">Member Secretary, Anti-Ragging Committee</p>
                          <p className="text-xs text-gray-500 mt-1">Email: psharma@university.edu</p>
                          <p className="text-xs text-gray-500">Phone: (555) 234-5678</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Grievance Redressal Cell</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm font-medium">Dr. Anita Desai</p>
                          <p className="text-xs text-gray-500">Head, Grievance Redressal Cell</p>
                          <p className="text-xs text-gray-500 mt-1">Email: adesai@university.edu</p>
                          <p className="text-xs text-gray-500">Phone: (555) 345-6789</p>
                        </div>
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm font-medium">Dr. Samuel Wilson</p>
                          <p className="text-xs text-gray-500">Faculty Representative, Grievance Cell</p>
                          <p className="text-xs text-gray-500 mt-1">Email: swilson@university.edu</p>
                          <p className="text-xs text-gray-500">Phone: (555) 456-7890</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800">Emergency Helpline</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            For urgent grievances or ragging incidents that require immediate attention:
                          </p>
                          <p className="text-sm font-medium text-blue-700 mt-2">
                            Helpline: (555) 911-0000 (Available 24/7)
                          </p>
                        </div>
                      </div>
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
