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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Search, Filter, Code, Users, Trophy, Clock, Calendar as CalendarIcon2, Laptop, Globe, BookOpen, Zap, CheckCircle, AlertCircle, User, Building, GraduationCap } from "lucide-react"

// Mock data for hackathons
const mockHackathons = [
  {
    id: "HACK-2023-001",
    title: "EduTech Innovation Challenge",
    status: "Upcoming",
    startDate: "2023-12-15",
    endDate: "2023-12-17",
    registrationDeadline: "2023-12-10",
    location: "Virtual",
    description: "A 48-hour hackathon focused on developing innovative solutions for educational technology challenges. Open to all faculty members and students.",
    theme: "Educational Technology",
    prizes: [
      "1st Place: $2,000 and mentorship opportunity",
      "2nd Place: $1,000",
      "3rd Place: $500",
      "Best UI/UX: $300"
    ],
    eligibility: "Faculty members can participate as mentors or form teams with students. Each team should have 2-5 members.",
    organizers: [
      {
        name: "Dr. Emily Chen",
        department: "Computer Science",
        role: "Lead Organizer"
      },
      {
        name: "Prof. David Wilson",
        department: "Educational Technology",
        role: "Co-organizer"
      }
    ],
    sponsors: ["University Innovation Lab", "TechEdu Solutions", "CloudServe Inc."],
    timeline: [
      {
        date: "2023-12-15 18:00",
        event: "Opening Ceremony"
      },
      {
        date: "2023-12-15 19:00",
        event: "Hacking Begins"
      },
      {
        date: "2023-12-16 12:00",
        event: "Midway Check-in"
      },
      {
        date: "2023-12-17 17:00",
        event: "Submission Deadline"
      },
      {
        date: "2023-12-17 18:00",
        event: "Presentations"
      },
      {
        date: "2023-12-17 20:00",
        event: "Awards Ceremony"
      }
    ],
    resources: [
      "Cloud computing credits for all participants",
      "API access to university educational platforms",
      "Mentorship sessions with industry experts"
    ],
    registeredTeams: 12,
    maxTeams: 30
  },
  {
    id: "HACK-2023-002",
    title: "Sustainable Campus Hackathon",
    status: "Registration Open",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    registrationDeadline: "2024-01-15",
    location: "Science Building, Main Campus",
    description: "An on-campus hackathon focused on developing solutions for campus sustainability challenges. Projects should address energy efficiency, waste reduction, or sustainable transportation.",
    theme: "Campus Sustainability",
    prizes: [
      "1st Place: $1,500 and implementation opportunity",
      "2nd Place: $800",
      "3rd Place: $400",
      "People's Choice: $300"
    ],
    eligibility: "Open to all faculty members and students. Interdisciplinary teams are encouraged.",
    organizers: [
      {
        name: "Dr. Sarah Johnson",
        department: "Environmental Science",
        role: "Lead Organizer"
      },
      {
        name: "Prof. Michael Brown",
        department: "Engineering",
        role: "Technical Advisor"
      }
    ],
    sponsors: ["University Sustainability Office", "GreenTech Innovations", "EcoSolutions Corp"],
    timeline: [
      {
        date: "2024-01-20 09:00",
        event: "Opening Ceremony"
      },
      {
        date: "2024-01-20 10:00",
        event: "Hacking Begins"
      },
      {
        date: "2024-01-21 14:00",
        event: "Workshop: Sustainable Design Principles"
      },
      {
        date: "2024-01-22 15:00",
        event: "Submission Deadline"
      },
      {
        date: "2024-01-22 16:00",
        event: "Presentations"
      },
      {
        date: "2024-01-22 18:00",
        event: "Awards Ceremony"
      }
    ],
    resources: [
      "Access to campus sustainability data",
      "Consultation with sustainability experts",
      "Prototyping materials and equipment"
    ],
    registeredTeams: 8,
    maxTeams: 25
  },
  {
    id: "HACK-2023-003",
    title: "AI for Accessibility Hackathon",
    status: "Completed",
    startDate: "2023-10-05",
    endDate: "2023-10-07",
    registrationDeadline: "2023-09-30",
    location: "Hybrid (Online & Computer Science Building)",
    description: "A hackathon focused on developing AI-powered solutions to improve accessibility for individuals with disabilities. Projects should address challenges in education, navigation, communication, or daily living.",
    theme: "AI & Accessibility",
    prizes: [
      "1st Place: $2,500 and incubation support",
      "2nd Place: $1,200",
      "3rd Place: $700",
      "Most Innovative: $500"
    ],
    eligibility: "Open to faculty, students, and external participants. Teams must include at least one member with expertise in AI or accessibility.",
    organizers: [
      {
        name: "Dr. Robert Lee",
        department: "Computer Science",
        role: "Lead Organizer"
      },
      {
        name: "Prof. Jennifer Martinez",
        department: "Disability Services",
        role: "Accessibility Advisor"
      }
    ],
    sponsors: ["University AI Research Center", "AccessTech Foundation", "Neural Innovations"],
    timeline: [
      {
        date: "2023-10-05 10:00",
        event: "Opening Ceremony"
      },
      {
        date: "2023-10-05 11:00",
        event: "Hacking Begins"
      },
      {
        date: "2023-10-06 13:00",
        event: "Workshop: Ethical AI Development"
      },
      {
        date: "2023-10-07 16:00",
        event: "Submission Deadline"
      },
      {
        date: "2023-10-07 17:00",
        event: "Presentations"
      },
      {
        date: "2023-10-07 19:00",
        event: "Awards Ceremony"
      }
    ],
    resources: [
      "Access to specialized AI APIs and tools",
      "Consultation with accessibility experts",
      "User testing opportunities with target populations"
    ],
    winners: [
      {
        place: "1st Place",
        team: "AccessAI",
        project: "Real-time Sign Language Translator for Classroom Settings"
      },
      {
        place: "2nd Place",
        team: "NaviGuide",
        project: "Indoor Navigation System for Visually Impaired Students"
      },
      {
        place: "3rd Place",
        team: "VoiceNotes",
        project: "AI-Powered Note-Taking Assistant for Students with Learning Disabilities"
      }
    ],
    registeredTeams: 20,
    maxTeams: 20
  }
]

// Categories for hackathon proposals
const categories = [
  "Educational Technology",
  "Sustainability",
  "Healthcare",
  "Accessibility",
  "Smart Campus",
  "Artificial Intelligence",
  "Blockchain",
  "Virtual Reality",
  "Mobile Applications",
  "Internet of Things",
  "Data Science",
  "Cybersecurity"
]

// Roles for team members
const roles = [
  "Team Lead",
  "Developer",
  "Designer",
  "Subject Matter Expert",
  "Mentor",
  "Presenter"
]

export default function HackathonPage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  // Filter hackathons based on search query and status filter
  const filteredHackathons = mockHackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.theme.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "All" || hackathon.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Portal</h1>
            <p className="text-gray-500 mt-1">Organize and participate in coding competitions</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Hackathons</TabsTrigger>
            <TabsTrigger value="propose">Propose Hackathon</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          {/* Browse Hackathons Tab */}
          <TabsContent value="browse" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search hackathons..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Registration Open">Registration Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No hackathons found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredHackathons.map((hackathon) => (
                  <Card key={hackathon.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                          <CardDescription className="mt-1">{hackathon.theme}</CardDescription>
                        </div>
                        <Badge 
                          className={cn(
                            hackathon.status === "Upcoming" && "bg-blue-100 text-blue-800",
                            hackathon.status === "Registration Open" && "bg-green-100 text-green-800",
                            hackathon.status === "In Progress" && "bg-amber-100 text-amber-800",
                            hackathon.status === "Completed" && "bg-gray-100 text-gray-800"
                          )}
                        >
                          {hackathon.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {hackathon.startDate} to {hackathon.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Registration Deadline: {hackathon.registrationDeadline}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{hackathon.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {hackathon.registeredTeams} / {hackathon.maxTeams} Teams Registered
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{hackathon.description}</p>
                      
                      {hackathon.status === "Completed" && hackathon.winners && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Trophy className="h-4 w-4 mr-2 text-amber-500" /> Winners
                          </h4>
                          <ul className="space-y-1">
                            {hackathon.winners.map((winner, index) => (
                              <li key={index} className="text-sm">
                                <span className="font-medium">{winner.place}:</span> {winner.team} - {winner.project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-blue-500" /> Prizes
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {hackathon.prizes.map((prize, index) => (
                            <li key={index} className="text-sm">{prize}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {(hackathon.status === "Upcoming" || hackathon.status === "Registration Open") && (
                        <Button size="sm">
                          Register Team
                        </Button>
                      )}
                      {hackathon.status === "Completed" && (
                        <Button variant="outline" size="sm">
                          View Projects
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Propose Hackathon Tab */}
          <TabsContent value="propose" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Propose a New Hackathon</CardTitle>
                <CardDescription>
                  Fill out the form below to propose a new hackathon event. Your proposal will be reviewed by the administration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Hackathon Title</Label>
                    <Input id="title" placeholder="Enter a catchy title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme/Focus Area</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the hackathon, its goals, and expected outcomes" 
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="on-campus">On-Campus</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prizes">Proposed Prizes</Label>
                  <Textarea 
                    id="prizes" 
                    placeholder="List the prizes for winners (e.g., 1st Place: $1000, etc.)" 
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility Criteria</Label>
                  <Textarea 
                    id="eligibility" 
                    placeholder="Specify who can participate (students, faculty, external participants, etc.)" 
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resources">Required Resources</Label>
                  <Textarea 
                    id="resources" 
                    placeholder="List any resources needed (venue, equipment, funding, etc.)" 
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="volunteer" />
                  <Label htmlFor="volunteer">I am willing to volunteer as an organizer</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline">Save as Draft</Button>
                <Button>Submit Proposal</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Hackathon Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Participation Rules</h4>
                      <p className="text-sm text-gray-600">All participants must adhere to the university's code of conduct. Teams must consist of 2-5 members, and all projects must be original work created during the hackathon period.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Judging Criteria</h4>
                      <p className="text-sm text-gray-600">Projects are typically judged on innovation, technical complexity, practicality, presentation quality, and alignment with the hackathon theme.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Intellectual Property</h4>
                      <p className="text-sm text-gray-600">Participants retain ownership of their intellectual property. The university may request a non-exclusive license to showcase winning projects.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Download Complete Guidelines</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Laptop className="h-5 w-5 mr-2 text-green-500" />
                    Technical Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Available APIs & Services</h4>
                      <p className="text-sm text-gray-600">Participants can access university APIs for educational data, campus services, and more. Cloud computing credits are often provided by sponsors.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Development Environments</h4>
                      <p className="text-sm text-gray-600">Pre-configured development environments and templates are available to help teams get started quickly.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Hardware Resources</h4>
                      <p className="text-sm text-gray-600">For on-campus hackathons, specialized hardware like VR headsets, IoT devices, and robotics kits may be available for checkout.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Access Resource Portal</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-500" />
                    Mentorship & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Faculty Mentors</h4>
                      <p className="text-sm text-gray-600">Faculty members can volunteer as mentors to provide guidance to student teams during hackathons. Mentors typically offer 2-3 hour blocks of availability.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Industry Experts</h4>
                      <p className="text-sm text-gray-600">Industry partners often provide technical experts to help teams with specific technologies or domains.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Technical Support</h4>
                      <p className="text-sm text-gray-600">IT staff are available during hackathons to help resolve technical issues and provide infrastructure support.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Sign Up as Mentor</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-amber-500" />
                    Past Hackathon Showcase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Project Gallery</h4>
                      <p className="text-sm text-gray-600">Browse through winning projects from previous hackathons to get inspiration and see the quality of work expected.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Success Stories</h4>
                      <p className="text-sm text-gray-600">Several hackathon projects have gone on to become full-fledged startups or have been integrated into university systems.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Testimonials</h4>
                      <p className="text-sm text-gray-600">Read about the experiences of past participants and how hackathons have enhanced their skills and careers.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Project Gallery</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
