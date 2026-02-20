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
  Building,
  Check,
  Clock, 
  FileText, 
  Filter,
  Home,
  Image,
  Lightbulb,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Thermometer,
  Upload,
  Wifi,
  Wrench
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const complaints = [
  {
    id: 1,
    title: "Flickering lights in Room 302",
    category: "Electrical",
    location: "Hostel Block B, Room 302",
    description: "The tube light in my room has been flickering for the past 3 days. It's causing eye strain and making it difficult to study at night.",
    status: "Resolved",
    priority: "Medium",
    createdAt: "May 10, 2023",
    resolvedAt: "May 12, 2023",
    assignedTo: "Mr. Rajesh (Electrician)",
    comments: [
      {
        user: "Admin",
        text: "Assigned to electrician. Will be fixed by tomorrow.",
        time: "May 11, 2023 10:30 AM"
      },
      {
        user: "Technician",
        text: "Replaced the faulty tube light and starter. Please confirm if it's working properly now.",
        time: "May 12, 2023 2:15 PM"
      },
      {
        user: "You",
        text: "Yes, it's working fine now. Thank you!",
        time: "May 12, 2023 6:45 PM"
      }
    ],
    images: ["#"]
  },
  {
    id: 2,
    title: "Leaking water tap in common bathroom",
    category: "Plumbing",
    location: "Hostel Block A, 2nd Floor Common Bathroom",
    description: "The third tap from the left is continuously leaking water even when fully closed. This is causing water wastage.",
    status: "In Progress",
    priority: "High",
    createdAt: "May 15, 2023",
    assignedTo: "Mr. Suresh (Plumber)",
    comments: [
      {
        user: "Admin",
        text: "Complaint received. Assigning high priority due to water wastage concerns.",
        time: "May 15, 2023 11:45 AM"
      },
      {
        user: "Technician",
        text: "Inspected the tap. Need to replace the washer. Will complete the work by tomorrow.",
        time: "May 16, 2023 10:20 AM"
      }
    ],
    images: ["#", "#"]
  },
  {
    id: 3,
    title: "Slow internet in Computer Lab 3",
    category: "Network/IT",
    location: "Computer Science Building, Lab 3",
    description: "The internet speed in Computer Lab 3 has been extremely slow for the past week. It's affecting our practical sessions.",
    status: "Pending",
    priority: "Medium",
    createdAt: "May 18, 2023",
    comments: [],
    images: []
  }
]

const categories = [
  { id: "electrical", name: "Electrical", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "plumbing", name: "Plumbing", icon: <Thermometer className="h-4 w-4" /> },
  { id: "furniture", name: "Furniture", icon: <Home className="h-4 w-4" /> },
  { id: "network", name: "Network/IT", icon: <Wifi className="h-4 w-4" /> },
  { id: "hvac", name: "HVAC/AC", icon: <Thermometer className="h-4 w-4" /> },
  { id: "cleaning", name: "Cleaning/Hygiene", icon: <Wrench className="h-4 w-4" /> },
  { id: "structural", name: "Structural", icon: <Building className="h-4 w-4" /> },
  { id: "other", name: "Other", icon: <Settings className="h-4 w-4" /> },
]

const locations = [
  { id: "hostel-a", name: "Hostel Block A" },
  { id: "hostel-b", name: "Hostel Block B" },
  { id: "hostel-c", name: "Hostel Block C" },
  { id: "academic-main", name: "Academic Building (Main)" },
  { id: "academic-cs", name: "Computer Science Building" },
  { id: "library", name: "Library" },
  { id: "canteen", name: "Canteen/Mess" },
  { id: "sports", name: "Sports Complex" },
  { id: "other", name: "Other" },
]

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const filteredComplaints = complaints.filter(
    (complaint) =>
      (complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.status.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    alert("Maintenance complaint submitted successfully!")
    // Reset form
    setSelectedCategory("")
    setSelectedLocation("")
    setTitle("")
    setDescription("")
    setSpecificLocation("")
    setUploadedFiles([])
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Wrench className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Complaints</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Report and track facility maintenance issues</p>
          </div>
        </div>

        <Tabs defaultValue="complaints" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="complaints">My Complaints</TabsTrigger>
            <TabsTrigger value="new">New Complaint</TabsTrigger>
            <TabsTrigger value="faq">FAQ & Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Maintenance Complaints</CardTitle>
                <CardDescription>Track the status of your reported issues</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search complaints..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>Category</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2">{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <motion.div
                        key={complaint.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            complaint.status === "Resolved" ? "bg-green-100 text-green-700" :
                            complaint.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {
                              complaint.status === "Resolved" ? <Check className="h-6 w-6" /> :
                              complaint.status === "In Progress" ? <Wrench className="h-6 w-6" /> :
                              <Clock className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                              <Badge
                                variant="outline"
                                className={`${
                                  complaint.status === "Resolved" ? "bg-green-100 text-green-700" :
                                  complaint.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-blue-100 text-blue-700"
                                } border-0 mt-1 sm:mt-0`}
                              >
                                {complaint.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {complaint.location}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Settings className="h-3 w-3 mr-1" />
                                {complaint.category}
                              </div>
                              {complaint.priority && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Priority: {complaint.priority}
                                </div>
                              )}
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Reported: {complaint.createdAt}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{complaint.description}</p>
                            
                            {complaint.assignedTo && (
                              <div className="mt-3 flex items-center text-xs text-gray-500">
                                <span className="font-medium">Assigned to:</span>
                                <span className="ml-1">{complaint.assignedTo}</span>
                              </div>
                            )}
                            
                            {complaint.comments.length > 0 && (
                              <div className="mt-4">
                                <Separator className="my-2" />
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Updates</h4>
                                <div className="space-y-3">
                                  {complaint.comments.map((comment, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className={`text-xs ${
                                          comment.user === "You" ? "bg-purple-100 text-purple-700" :
                                          comment.user === "Admin" ? "bg-blue-100 text-blue-700" :
                                          "bg-yellow-100 text-yellow-700"
                                        }`}>
                                          {comment.user.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <span className="text-xs font-medium">{comment.user}</span>
                                          <span className="text-xs text-gray-500 ml-2">{comment.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{comment.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {complaint.images.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Image className="h-3 w-3" />
                                  <span>{complaint.images.length} image{complaint.images.length > 1 ? "s" : ""} attached</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end">
                              {complaint.status !== "Resolved" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Add Comment
                                </Button>
                              )}
                              {complaint.status === "Resolved" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Reopen
                                </Button>
                              )}
                              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                                <FileText className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No complaints found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a New Maintenance Complaint</CardTitle>
                <CardDescription>Fill out the form below to report a maintenance issue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Issue Title</label>
                    <Input 
                      placeholder="Brief title describing the issue" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center">
                                {category.icon}
                                <span className="ml-2">{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Specific Location</label>
                    <Input 
                      placeholder="E.g., Room number, Floor, etc." 
                      value={specificLocation}
                      onChange={(e) => setSpecificLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description of Issue</label>
                    <Textarea 
                      placeholder="Provide detailed description of the issue" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Upload Images (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG or GIF (max. 5MB per image)
                        </p>
                      </label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="border rounded-lg p-2 h-24 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Submit Complaint
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance FAQ & Guidelines</CardTitle>
                <CardDescription>Frequently asked questions and guidelines for reporting maintenance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reporting Guidelines</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                      <li>Report issues as soon as you notice them to prevent further damage.</li>
                      <li>Provide clear and detailed descriptions of the issue.</li>
                      <li>Include specific location details (building, floor, room number, etc.).</li>
                      <li>Upload clear images of the issue whenever possible.</li>
                      <li>For urgent issues like major water leaks or electrical hazards, please call the maintenance hotline at <span className="font-medium">+91-1234567890</span> in addition to submitting a complaint.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800">How long does it take to resolve a maintenance issue?</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Resolution time depends on the nature and priority of the issue. Emergency issues are typically addressed within 24 hours, while standard issues may take 2-5 working days.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Can I track the status of my complaint?</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Yes, you can track the status of your complaint in the "My Complaints" tab. You'll also receive notifications when there are updates.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">What if the issue persists after it's marked as resolved?</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          If an issue persists after being marked as resolved, you can reopen the complaint or create a new one referencing the previous complaint number.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Are there any charges for maintenance services?</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Regular maintenance services are provided free of charge. However, if damage is caused due to negligence, charges may apply as per the hostel/institute policy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800">Maintenance Helpdesk</h4>
                        <p className="text-sm text-gray-600 mt-1">+91-1234567890</p>
                        <p className="text-sm text-gray-600">maintenance@university.edu</p>
                        <p className="text-sm text-gray-600">Working Hours: 8:00 AM - 8:00 PM</p>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800">Emergency Services (24x7)</h4>
                        <p className="text-sm text-gray-600 mt-1">+91-9876543210</p>
                        <p className="text-sm text-gray-600">emergency@university.edu</p>
                        <p className="text-sm text-gray-600">For urgent issues outside working hours</p>
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
