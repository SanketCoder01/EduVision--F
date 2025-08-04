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
  Award,
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
  GraduationCap,
  Info,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Star,
  Upload,
  User,
  UserCheck
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const recommendationRequests = [
  {
    id: "LOR-2023-001",
    facultyName: "Dr. Priya Sharma",
    facultyDepartment: "Computer Science",
    purpose: "Graduate School Application",
    university: "Stanford University",
    program: "MS in Computer Science",
    deadline: "December 15, 2023",
    requestDate: "October 5, 2023",
    status: "Approved",
    completionDate: "October 20, 2023",
    documentUrl: "#",
    notes: "Letter focuses on research experience and academic achievements."
  },
  {
    id: "LOR-2023-008",
    facultyName: "Prof. Rajiv Mehta",
    facultyDepartment: "Electrical Engineering",
    purpose: "Scholarship Application",
    organization: "IEEE Foundation",
    program: "Graduate Research Scholarship",
    deadline: "November 30, 2023",
    requestDate: "October 12, 2023",
    status: "In Progress",
    notes: "Professor requested additional information about projects."
  },
  {
    id: "LOR-2023-012",
    facultyName: "Dr. Anand Kumar",
    facultyDepartment: "Mechanical Engineering",
    purpose: "Job Application",
    company: "Tata Motors",
    position: "Graduate Engineer",
    deadline: "January 10, 2024",
    requestDate: "October 18, 2023",
    status: "Pending",
    notes: "Waiting for faculty response."
  }
]

const facultyList = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    department: "Computer Science",
    expertise: "Artificial Intelligence, Machine Learning",
    email: "priya.sharma@example.edu",
    image: ""
  },
  {
    id: 2,
    name: "Prof. Rajiv Mehta",
    department: "Electrical Engineering",
    expertise: "VLSI Design, Embedded Systems",
    email: "rajiv.mehta@example.edu",
    image: ""
  },
  {
    id: 3,
    name: "Dr. Anand Kumar",
    department: "Mechanical Engineering",
    expertise: "Thermodynamics, Fluid Mechanics",
    email: "anand.kumar@example.edu",
    image: ""
  },
  {
    id: 4,
    name: "Dr. Sunita Patel",
    department: "Computer Science",
    expertise: "Cybersecurity, Network Systems",
    email: "sunita.patel@example.edu",
    image: ""
  },
  {
    id: 5,
    name: "Prof. Vikram Singh",
    department: "Civil Engineering",
    expertise: "Structural Engineering, Construction Management",
    email: "vikram.singh@example.edu",
    image: ""
  }
]

const statusOptions = [
  "All",
  "Pending",
  "In Progress",
  "Approved",
  "Completed",
  "Declined"
]

const purposeOptions = [
  "All Purposes",
  "Graduate School Application",
  "Scholarship Application",
  "Job Application",
  "Internship Application",
  "Research Position",
  "Fellowship Application",
  "Other"
]

const achievements = [
  {
    id: 1,
    title: "Dean's List",
    year: "2022-2023",
    description: "Maintained a GPA of 3.8/4.0 for the academic year"
  },
  {
    id: 2,
    title: "Best Project Award",
    year: "2022",
    description: "Won first place in the department project exhibition for 'Smart Energy Monitoring System'"
  },
  {
    id: 3,
    title: "Technical Paper Publication",
    year: "2023",
    description: "Published paper titled 'Efficient Algorithms for Edge Computing' in IEEE conference"
  },
  {
    id: 4,
    title: "Hackathon Winner",
    year: "2022",
    description: "First place in national level hackathon organized by TechFest"
  },
  {
    id: 5,
    title: "Research Internship",
    year: "2022",
    description: "Completed summer research internship at IIT Research Lab"
  }
]

export default function RecommendationLetterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedPurpose, setSelectedPurpose] = useState("All Purposes")
  const [selectedAchievements, setSelectedAchievements] = useState<number[]>([])
  
  const toggleAchievement = (id: number) => {
    setSelectedAchievements(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }
  
  const filteredRequests = recommendationRequests.filter(
    (request) => {
      const matchesSearch = 
        request.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.university && request.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.company && request.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.organization && request.organization.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = 
        selectedStatus === "All" || 
        request.status === selectedStatus
      
      const matchesPurpose = 
        selectedPurpose === "All Purposes" || 
        request.purpose === selectedPurpose
      
      return matchesSearch && matchesStatus && matchesPurpose
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
                <Award className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Recommendation Letters</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request and manage letters of recommendation from faculty members</p>
          </div>
        </div>

        <Tabs defaultValue="my-requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines & Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Recommendation Requests</CardTitle>
                <CardDescription>Track and manage your recommendation letter requests</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by faculty, university, company..."
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
                    
                    <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">Purpose</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {purposeOptions.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
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
                              <h3 className="font-semibold text-gray-900">{request.facultyName}</h3>
                              <span className="ml-2 text-xs text-gray-500">{request.id}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                request.status === "Approved" || request.status === "Completed" ? "bg-green-100 text-green-700" :
                                request.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                request.status === "Declined" ? "bg-red-100 text-red-700" :
                                request.status === "Pending" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-700"
                              } border-0 mt-2 sm:mt-0`}
                            >
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {request.facultyDepartment}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <FileText className="h-3 w-3 mr-1" />
                              {request.purpose}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Requested: {request.requestDate}
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                              {request.university && (
                                <div className="flex items-center">
                                  <GraduationCap className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>University: {request.university}</span>
                                </div>
                              )}
                              {request.company && (
                                <div className="flex items-center">
                                  <Building className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>Company: {request.company}</span>
                                </div>
                              )}
                              {request.organization && (
                                <div className="flex items-center">
                                  <Award className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>Organization: {request.organization}</span>
                                </div>
                              )}
                              {request.program && (
                                <div className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>Program: {request.program}</span>
                                </div>
                              )}
                              {request.position && (
                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>Position: {request.position}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                <span>Deadline: {request.deadline}</span>
                              </div>
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
                              {request.completionDate && `Completed: ${request.completionDate}`}
                            </div>
                            <div className="flex gap-2">
                              {(request.status === "Approved" || request.status === "Completed") && request.documentUrl && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Letter
                                </Button>
                              )}
                              {request.status === "Pending" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Send Reminder
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
                      <p className="text-gray-500">No recommendation requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-request" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Request a Recommendation Letter</CardTitle>
                <CardDescription>Fill out the form to request a letter of recommendation from a faculty member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-700">Important Information</h4>
                        <p className="text-xs text-blue-600 mt-1">
                          Please submit your recommendation letter request at least 3-4 weeks before the deadline. 
                          Provide all necessary information to help the faculty write a strong letter. You can highlight 
                          your achievements and contributions that the faculty may include in the letter.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-3">Faculty Selection</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Faculty Member</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a faculty member" />
                          </SelectTrigger>
                          <SelectContent>
                            {facultyList.map((faculty) => (
                              <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                {faculty.name} - {faculty.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {facultyList.slice(0, 3).map((faculty) => (
                          <div key={faculty.id} className="p-3 border border-gray-200 rounded-lg flex items-start">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>{faculty.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">{faculty.name}</h4>
                              <p className="text-xs text-gray-500">{faculty.department}</p>
                              <p className="text-xs text-gray-500 mt-1">{faculty.expertise}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-3">Recommendation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Recommendation</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            {purposeOptions.slice(1).map((purpose) => (
                              <SelectItem key={purpose} value={purpose}>
                                {purpose}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University/Company/Organization</label>
                        <Input placeholder="Enter name of institution" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program/Position</label>
                        <Input placeholder="Enter program or position" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courses Taken with Faculty</label>
                    <Textarea 
                      placeholder="List courses you've taken with this faculty member, including course codes, titles, and grades received..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Highlight Your Achievements</label>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600">
                        <Plus className="h-3 w-3 mr-1" />
                        Add New Achievement
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id} 
                          className={`p-3 border rounded-lg flex items-start cursor-pointer transition-colors ${selectedAchievements.includes(achievement.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => toggleAchievement(achievement.id)}
                        >
                          <div className="flex-shrink-0 mr-3 mt-0.5">
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center ${selectedAchievements.includes(achievement.id) ? 'bg-blue-500' : 'border border-gray-300'}`}>
                              {selectedAchievements.includes(achievement.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium">{achievement.title}</h4>
                              <span className="text-xs text-gray-500">{achievement.year}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <Textarea 
                      placeholder="Provide any additional information that might help the faculty write a strong recommendation letter..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Supporting Documents (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-gray-500 mb-2">Resume, CV, personal statement, or other relevant documents</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="waiver" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="waiver"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I waive my right to view this letter of recommendation
                      </label>
                      <p className="text-xs text-gray-500">
                        By checking this box, you waive your right to see the recommendation letter. Many faculty prefer this option 
                        as it allows them to write a more candid evaluation, which may be viewed more favorably by the recipient.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Save as Draft</Button>
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
                <CardTitle>Guidelines & Best Practices</CardTitle>
                <CardDescription>Tips for requesting effective recommendation letters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">When to Request</h3>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-800">Timing is Critical</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Request letters at least 3-4 weeks before the deadline. For graduate school applications with 
                            December/January deadlines, consider requesting in October. For summer internships, request 
                            by February. Faculty members are busy, especially during exam periods, so plan accordingly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Choosing the Right Faculty</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li><span className="font-medium">Select faculty who know you well</span> - Ideally, you should have taken at least one course with them and performed well.</li>
                      <li><span className="font-medium">Consider relevance</span> - Choose faculty whose expertise aligns with your application purpose.</li>
                      <li><span className="font-medium">Quality over quantity</span> - A detailed letter from someone who knows your work well is better than a generic letter from someone more senior.</li>
                      <li><span className="font-medium">Gauge willingness</span> - If a faculty member seems hesitant, it's better to ask someone else who can write a more enthusiastic letter.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Information to Provide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 mb-2">Essential Information</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                          <li>Your full name and contact information</li>
                          <li>Purpose of the recommendation</li>
                          <li>Institution/organization name</li>
                          <li>Program/position you're applying for</li>
                          <li>Submission deadline and method</li>
                          <li>Courses taken with the faculty</li>
                          <li>Your resume or CV</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 mb-2">Helpful Additions</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                          <li>Statement of purpose/personal statement</li>
                          <li>Specific projects or papers completed</li>
                          <li>Relevant achievements and awards</li>
                          <li>Skills or qualities you'd like highlighted</li>
                          <li>How the program aligns with your goals</li>
                          <li>Any specific requirements from the recipient</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Etiquette & Follow-up</h3>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          1
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Make a Formal Request</h4>
                          <p className="text-sm text-gray-500 mt-1">Request in person if possible, or through a professional email. Briefly explain why you've chosen them.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          2
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Provide Clear Instructions</h4>
                          <p className="text-sm text-gray-500 mt-1">Include all submission details, deadlines, and any specific requirements from the recipient.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          3
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Send Gentle Reminders</h4>
                          <p className="text-sm text-gray-500 mt-1">If the deadline is approaching, send a polite reminder about a week before the due date.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          4
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Express Gratitude</h4>
                          <p className="text-sm text-gray-500 mt-1">Send a thank-you note after the letter has been submitted, regardless of the outcome of your application.</p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                          5
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Share Your Results</h4>
                          <p className="text-sm text-gray-500 mt-1">Let the faculty know the outcome of your application. They invested time in supporting you and will appreciate the update.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Sample Request Email</h4>
                        <div className="text-sm text-green-700 mt-1 p-3 bg-white bg-opacity-50 rounded border border-green-100">
                          <p className="mb-2"><strong>Subject:</strong> Request for Letter of Recommendation - [Your Name] - [Program/Position]</p>
                          <p className="mb-2">Dear Professor [Name],</p>
                          <p className="mb-2">I hope this email finds you well. I am writing to request a letter of recommendation for my application to [program/position] at [institution/company]. The application deadline is [date].</p>
                          <p className="mb-2">I have greatly enjoyed and learned from your courses, particularly [course name] in [semester/year]. My final project on [topic] received an A, and I believe it demonstrated my abilities in [relevant skills].</p>
                          <p className="mb-2">I am applying for this [program/position] because [brief explanation of your interest and goals]. I believe your insights into my academic abilities and [specific qualities] would strengthen my application significantly.</p>
                          <p className="mb-2">If you are willing to write a recommendation, I can provide you with my resume, statement of purpose, and any other materials that might be helpful. The recommendation can be submitted [explain submission method].</p>
                          <p className="mb-2">I understand that writing letters takes valuable time, and I appreciate your consideration of my request. Please let me know if you would be able to provide a letter by [date].</p>
                          <p className="mb-2">Thank you for your support and guidance throughout my academic journey.</p>
                          <p>Sincerely,<br/>[Your Name]<br/>[Your Contact Information]</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    For additional guidance, visit the Career Services office or contact your academic advisor
                  </div>
                  <Button variant="outline" className="sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Complete Guide
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
