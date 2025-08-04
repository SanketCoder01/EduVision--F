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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  AlertCircle,
  Calendar,
  Check,
  Clock, 
  Eye,
  EyeOff,
  FileText, 
  Filter,
  HelpCircle,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Upload,
  User
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const grievances = [
  {
    id: "GR-2023-001",
    title: "Unfair grading in CS301 course",
    category: "Academic",
    description: "I believe my final project was graded unfairly. I met all the requirements mentioned in the rubric but received a C grade without proper feedback.",
    status: "Resolved",
    priority: "Medium",
    isAnonymous: false,
    createdAt: "March 15, 2023",
    resolvedAt: "March 25, 2023",
    assignedTo: "Academic Grievance Committee",
    timeline: [
      {
        date: "March 15, 2023",
        action: "Grievance submitted",
        by: "You"
      },
      {
        date: "March 17, 2023",
        action: "Assigned to Academic Grievance Committee",
        by: "Admin"
      },
      {
        date: "March 20, 2023",
        action: "Under review by course instructor",
        by: "Committee"
      },
      {
        date: "March 25, 2023",
        action: "Resolved - Grade revised to B+ after review",
        by: "Committee"
      }
    ],
    comments: [
      {
        user: "Committee",
        text: "We have reviewed your project and discussed with the course instructor. There was an oversight in grading. Your grade has been revised to B+.",
        time: "March 25, 2023 11:30 AM",
        isPrivate: false
      }
    ]
  },
  {
    id: "GR-2023-008",
    title: "Harassment by senior students",
    category: "Ragging/Harassment",
    description: "A group of senior students have been verbally harassing me and other first-year students. This has been happening for the past two weeks in the hostel premises.",
    status: "In Progress",
    priority: "High",
    isAnonymous: true,
    createdAt: "April 5, 2023",
    assignedTo: "Anti-Ragging Committee",
    timeline: [
      {
        date: "April 5, 2023",
        action: "Grievance submitted anonymously",
        by: "Anonymous"
      },
      {
        date: "April 6, 2023",
        action: "Assigned to Anti-Ragging Committee",
        by: "Admin"
      },
      {
        date: "April 8, 2023",
        action: "Investigation initiated",
        by: "Committee"
      },
      {
        date: "April 12, 2023",
        action: "Witness statements being collected",
        by: "Committee"
      }
    ],
    comments: [
      {
        user: "Committee",
        text: "We are taking this matter very seriously. An investigation has been initiated. Please provide any additional details that might help identify the individuals involved.",
        time: "April 8, 2023 2:15 PM",
        isPrivate: false
      },
      {
        user: "You",
        text: "The incidents usually happen between 8-10 PM in the hostel common area. There are about 4-5 senior students involved.",
        time: "April 9, 2023 6:30 PM",
        isPrivate: true
      }
    ]
  },
  {
    id: "GR-2023-012",
    title: "Issue with hostel facilities",
    category: "Infrastructure",
    description: "The water supply in Hostel Block C has been irregular for the past month. We often don't have water during morning hours which affects our daily routine.",
    status: "Pending",
    priority: "Medium",
    isAnonymous: false,
    createdAt: "April 20, 2023",
    assignedTo: "",
    timeline: [
      {
        date: "April 20, 2023",
        action: "Grievance submitted",
        by: "You"
      }
    ],
    comments: []
  }
]

const categories = [
  { id: "academic", name: "Academic", description: "Issues related to courses, grading, exams, etc." },
  { id: "ragging", name: "Ragging/Harassment", description: "Any form of ragging, bullying, or harassment" },
  { id: "infrastructure", name: "Infrastructure", description: "Issues with facilities, buildings, amenities, etc." },
  { id: "administrative", name: "Administrative", description: "Issues with administrative processes, documents, etc." },
  { id: "discrimination", name: "Discrimination", description: "Any form of discrimination based on gender, caste, religion, etc." },
  { id: "other", name: "Other", description: "Any other issues not covered in the above categories" }
]

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const filteredGrievances = grievances.filter(
    (grievance) =>
      grievance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.status.toLowerCase().includes(searchQuery.toLowerCase())
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
    alert("Grievance submitted successfully!")
    // Reset form
    setSelectedCategory("")
    setTitle("")
    setDescription("")
    setIsAnonymous(false)
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
              <div className="p-2 rounded-lg bg-red-100 text-red-700">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Report and track grievances, ragging incidents, and other issues</p>
          </div>
        </div>

        <Tabs defaultValue="grievances" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="grievances">My Grievances</TabsTrigger>
            <TabsTrigger value="new">New Grievance</TabsTrigger>
            <TabsTrigger value="info">Information & Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="grievances" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Grievances</CardTitle>
                <CardDescription>Track the status of your reported grievances</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search grievances..."
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
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGrievances.length > 0 ? (
                    filteredGrievances.map((grievance) => (
                      <motion.div
                        key={grievance.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            grievance.status === "Resolved" ? "bg-green-100 text-green-700" :
                            grievance.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {
                              grievance.status === "Resolved" ? <Check className="h-6 w-6" /> :
                              grievance.status === "In Progress" ? <Clock className="h-6 w-6" /> :
                              <HelpCircle className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-gray-900">{grievance.title}</h3>
                                {grievance.isAnonymous && (
                                  <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Anonymous
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  grievance.status === "Resolved" ? "bg-green-100 text-green-700" :
                                  grievance.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-blue-100 text-blue-700"
                                } border-0 mt-1 sm:mt-0`}
                              >
                                {grievance.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <div className="flex items-center text-xs text-gray-500">
                                <FileText className="h-3 w-3 mr-1" />
                                {grievance.category}
                              </div>
                              {grievance.priority && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Priority: {grievance.priority}
                                </div>
                              )}
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Submitted: {grievance.createdAt}
                              </div>
                              {grievance.resolvedAt && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Check className="h-3 w-3 mr-1" />
                                  Resolved: {grievance.resolvedAt}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{grievance.description}</p>
                            
                            {grievance.assignedTo && (
                              <div className="mt-3 flex items-center text-xs text-gray-500">
                                <span className="font-medium">Assigned to:</span>
                                <span className="ml-1">{grievance.assignedTo}</span>
                              </div>
                            )}
                            
                            {grievance.timeline && grievance.timeline.length > 0 && (
                              <div className="mt-4">
                                <Separator className="my-2" />
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                                <div className="relative pl-5 border-l border-gray-200 space-y-3">
                                  {grievance.timeline.map((event, index) => (
                                    <div key={index} className="relative">
                                      <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">{event.date}</p>
                                        <p className="text-sm text-gray-700">{event.action}</p>
                                        <p className="text-xs text-gray-500">By: {event.by}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {grievance.comments && grievance.comments.length > 0 && (
                              <div className="mt-4">
                                <Separator className="my-2" />
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                                <div className="space-y-3">
                                  {grievance.comments.map((comment, index) => (
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
                                          {comment.isPrivate && (
                                            <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex items-center">
                                              <Lock className="h-2 w-2 mr-0.5" />
                                              Private
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{comment.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end">
                              {grievance.status !== "Resolved" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Add Comment
                                </Button>
                              )}
                              <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">
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
                      <p className="text-gray-500">No grievances found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a New Grievance</CardTitle>
                <CardDescription>Fill out the form below to report a grievance or incident</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Grievance Title</label>
                    <Input 
                      placeholder="Brief title describing the issue" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCategory && (
                      <p className="text-xs text-gray-500 mt-1">
                        {categories.find(c => c.id === selectedCategory)?.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Textarea 
                      placeholder="Provide detailed description of the issue. Include specific details like when and where it happened, who was involved, etc." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="anonymous" 
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="anonymous"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Submit Anonymously
                      </Label>
                      <p className="text-xs text-gray-500">
                        Your identity will be hidden from everyone except the grievance committee administrators.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Supporting Evidence (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload files</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Images, PDF, Word documents (max. 5MB per file)
                        </p>
                      </label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
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

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Important Information</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          All grievances are taken seriously and will be investigated thoroughly. False complaints or misuse of this portal may result in disciplinary action.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                      Submit Grievance
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Grievance Policies & Information</CardTitle>
                <CardDescription>Learn about the grievance redressal process and anti-ragging policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Anti-Ragging Policy</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-gray-800 font-medium">Zero Tolerance Policy</p>
                      <p className="text-sm text-gray-600 mt-1">
                        The university maintains a strict zero-tolerance policy towards ragging in any form. Any student found guilty of ragging will face severe disciplinary action, including expulsion from the institution.
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      As per the UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009, ragging constitutes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3">
                      <li>Any conduct by any student or students that causes physical or psychological harm.</li>
                      <li>Asking students to perform acts which can cause shame or embarrassment.</li>
                      <li>Any act of financial extortion or forceful expenditure.</li>
                      <li>Any act that affects the mental health and self-confidence of students.</li>
                      <li>Exploiting the services of a junior student for completing academic tasks.</li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      All complaints related to ragging will be handled with the utmost confidentiality to protect the identity of the complainant.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Grievance Redressal Process</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto">
                          <span className="text-gray-700 font-medium">1</span>
                        </div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Submission</h4>
                        <p className="text-xs text-gray-600 text-center">
                          Submit your grievance through this portal with all relevant details and supporting documents.
                        </p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto">
                          <span className="text-gray-700 font-medium">2</span>
                        </div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Processing</h4>
                        <p className="text-xs text-gray-600 text-center">
                          Your grievance will be reviewed and assigned to the appropriate committee for investigation.
                        </p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto">
                          <span className="text-gray-700 font-medium">3</span>
                        </div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Resolution</h4>
                        <p className="text-xs text-gray-600 text-center">
                          After investigation, appropriate action will be taken and you will be notified of the outcome.
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Timeline for resolution:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li><span className="font-medium">Acknowledgment:</span> Within 24 hours of submission</li>
                      <li><span className="font-medium">Initial Assessment:</span> Within 3 working days</li>
                      <li><span className="font-medium">Investigation:</span> 7-14 working days (depending on complexity)</li>
                      <li><span className="font-medium">Resolution:</span> Within 21 working days for standard grievances</li>
                      <li><span className="font-medium">Urgent Matters (Ragging/Harassment):</span> Expedited process with immediate action</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Anti-Ragging Committee</h4>
                        <p className="text-sm text-gray-600">Dr. Rajesh Kumar (Chairperson)</p>
                        <p className="text-sm text-gray-600">Email: antiragging@university.edu</p>
                        <p className="text-sm text-gray-600">Phone: +91-9876543210</p>
                        <p className="text-sm text-gray-600">Location: Admin Block, Room 105</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Grievance Redressal Cell</h4>
                        <p className="text-sm text-gray-600">Prof. Meera Singh (Coordinator)</p>
                        <p className="text-sm text-gray-600">Email: grievance@university.edu</p>
                        <p className="text-sm text-gray-600">Phone: +91-1234567890</p>
                        <p className="text-sm text-gray-600">Location: Admin Block, Room 110</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-1">Emergency Helpline (24x7)</h4>
                      <p className="text-sm text-gray-600">For urgent ragging or harassment cases: <span className="font-medium">1800-XXX-XXXX</span></p>
                      <p className="text-sm text-gray-600">University Security: <span className="font-medium">+91-XXXXXXXXXX</span></p>
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
