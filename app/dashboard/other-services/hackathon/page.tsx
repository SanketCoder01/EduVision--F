"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Search, Filter, Code, Users, Trophy, Clock, Calendar as CalendarIcon2, Laptop, Globe, BookOpen, Zap, CheckCircle, AlertCircle, User, Building, GraduationCap, MapPin, ArrowLeft } from "lucide-react"

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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  // Enhanced targeting state
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [enableClassWiseTargeting, setEnableClassWiseTargeting] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  // Department and year options
  const departments = [
    { id: "cse", name: "Computer Science Engineering" },
    { id: "aids", name: "Artificial Intelligence & Data Science" },
    { id: "aiml", name: "AI & Machine Learning" },
    { id: "cyber", name: "Cyber Security" },
    { id: "mech", name: "Mechanical Engineering" },
    { id: "civil", name: "Civil Engineering" },
    { id: "ece", name: "Electronics & Communication" }
  ]

  const years = [
    { id: "1st", name: "1st Year" },
    { id: "2nd", name: "2nd Year" },
    { id: "3rd", name: "3rd Year" },
    { id: "4th", name: "4th Year" }
  ]

  // Classes for each department and year combination
  const classes = [
    "CSE-A", "CSE-B", "CSE-C",
    "AIDS-A", "AIDS-B", 
    "AIML-A", "AIML-B",
    "CYBER-A", "CYBER-B",
    "MECH-A", "MECH-B", "MECH-C",
    "CIVIL-A", "CIVIL-B",
    "ECE-A", "ECE-B", "ECE-C"
  ]

  // Handle department selection
  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, departmentId])
    } else {
      setSelectedDepartments(selectedDepartments.filter(id => id !== departmentId))
    }
  }

  // Handle year selection
  const handleYearChange = (yearId: string, checked: boolean) => {
    if (checked) {
      setSelectedYears([...selectedYears, yearId])
    } else {
      setSelectedYears(selectedYears.filter(id => id !== yearId))
    }
  }

  // Handle class selection
  const handleClassChange = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, classId])
    } else {
      setSelectedClasses(selectedClasses.filter(id => id !== classId))
    }
  }
  
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/other-services')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Other Services
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Portal</h1>
            <p className="text-gray-500 mt-1">Organize and participate in coding competitions</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Hackathons</TabsTrigger>
            <TabsTrigger value="post">Post Hackathon</TabsTrigger>
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
          
          {/* Post Hackathon Tab */}
          <TabsContent value="post" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post New Hackathon</CardTitle>
                <CardDescription>
                  Create and publish a new hackathon event for students. Include all necessary details, poster, and registration information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Hackathon Title *</Label>
                      <Input id="title" placeholder="Enter hackathon title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme/Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the hackathon objectives, challenges, and expected outcomes..." 
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Dates and Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Pick end date
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Deadline *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Registration deadline
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input id="location" placeholder="e.g., Main Auditorium, Online, Hybrid" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTeams">Maximum Teams</Label>
                      <Input id="maxTeams" type="number" placeholder="e.g., 50" />
                    </div>
                  </div>
                </div>

                {/* Poster Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hackathon Poster</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Globe className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Button variant="outline">
                          Upload Poster
                        </Button>
                        <p className="mt-2 text-sm text-gray-500">
                          PNG, JPG, or PDF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Link */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Registration & Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regLink">Registration Link</Label>
                      <Input id="regLink" placeholder="https://forms.google.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Event Website (Optional)</Label>
                      <Input id="website" placeholder="https://hackathon-website.com" />
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Target Audience & Participation</h3>
                  
                  {/* Department Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Target Departments *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {departments.map((dept) => (
                        <div key={dept.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={dept.id}
                            checked={selectedDepartments.includes(dept.id)}
                            onCheckedChange={(checked) => handleDepartmentChange(dept.id, checked as boolean)}
                          />
                          <Label htmlFor={dept.id} className="text-sm font-normal cursor-pointer">
                            {dept.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedDepartments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedDepartments.map((deptId) => {
                          const dept = departments.find(d => d.id === deptId)
                          return (
                            <Badge key={deptId} variant="secondary" className="text-xs">
                              {dept?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Year Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Target Years *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {years.map((year) => (
                        <div key={year.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={year.id}
                            checked={selectedYears.includes(year.id)}
                            onCheckedChange={(checked) => handleYearChange(year.id, checked as boolean)}
                          />
                          <Label htmlFor={year.id} className="text-sm font-normal cursor-pointer">
                            {year.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedYears.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedYears.map((yearId) => {
                          const year = years.find(y => y.id === yearId)
                          return (
                            <Badge key={yearId} variant="secondary" className="text-xs">
                              {year?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Optional Class-wise Targeting */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Class-wise Targeting (Optional)</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="class-targeting"
                          checked={enableClassWiseTargeting}
                          onCheckedChange={setEnableClassWiseTargeting}
                        />
                        <Label htmlFor="class-targeting" className="text-sm">
                          Enable specific class targeting
                        </Label>
                      </div>
                    </div>
                    
                    {enableClassWiseTargeting && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-3">
                          Select specific classes to target. If no classes are selected, all classes within the selected departments and years will be included.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {classes.map((className) => (
                            <div key={className} className="flex items-center space-x-2">
                              <Checkbox
                                id={className}
                                checked={selectedClasses.includes(className)}
                                onCheckedChange={(checked) => handleClassChange(className, checked as boolean)}
                              />
                              <Label htmlFor={className} className="text-sm font-normal cursor-pointer">
                                {className}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedClasses.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedClasses.map((className) => (
                              <Badge key={className} variant="outline" className="text-xs">
                                {className}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team Size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input id="teamSize" placeholder="e.g., 2-5 members" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="participationType">Participation Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select participation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="team">Team-based</SelectItem>
                          <SelectItem value="both">Both Individual & Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Targeting Summary */}
                  {(selectedDepartments.length > 0 || selectedYears.length > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Targeting Summary</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        {selectedDepartments.length > 0 && (
                          <p>
                            <span className="font-medium">Departments:</span> {selectedDepartments.length} selected
                          </p>
                        )}
                        {selectedYears.length > 0 && (
                          <p>
                            <span className="font-medium">Years:</span> {selectedYears.length} selected
                          </p>
                        )}
                        {enableClassWiseTargeting && selectedClasses.length > 0 && (
                          <p>
                            <span className="font-medium">Specific Classes:</span> {selectedClasses.length} selected
                          </p>
                        )}
                        <p className="text-xs mt-2 text-blue-600">
                          This hackathon will be visible to students matching the above criteria.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prizes and Eligibility */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Prizes & Eligibility</h3>
                  <div className="space-y-2">
                    <Label htmlFor="prizes">Prize Details</Label>
                    <Textarea 
                      id="prizes" 
                      placeholder="1st Place: ₹50,000&#10;2nd Place: ₹30,000&#10;3rd Place: ₹20,000&#10;Best Innovation: ₹10,000" 
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility Criteria</Label>
                    <Textarea 
                      id="eligibility" 
                      placeholder="Open to all students. Teams must have 2-5 members. At least one member should be from technical background..." 
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="resources">Resources Provided</Label>
                    <Textarea 
                      id="resources" 
                      placeholder="Mentorship, API access, cloud credits, development tools..." 
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Information</Label>
                    <Input id="contact" placeholder="Email or phone for queries" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Publish Hackathon</Button>
                </div>
              </CardContent>
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
