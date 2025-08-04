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
  Lightbulb
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function SuggestionBoxPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("submissionDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("pending")
  
  // Form state for adding new suggestion
  const [isAddSuggestionDialogOpen, setIsAddSuggestionDialogOpen] = useState(false)
  const [suggestionTitle, setSuggestionTitle] = useState("")
  const [suggestionDescription, setSuggestionDescription] = useState("")
  const [suggestionCategory, setSuggestionCategory] = useState("")
  const [suggestionAnonymous, setSuggestionAnonymous] = useState(false)
  
  // Mock data for suggestions - in a real app this would come from an API
  const [suggestions, setSuggestions] = useState([
    {
      id: "SUG-2023-001",
      title: "Extend Library Hours During Exam Week",
      description: "Many students need a quiet place to study during exam periods. It would be very helpful if the library could remain open until midnight during the two weeks before final exams.",
      category: "Academic Facilities",
      submissionDate: "2023-05-10",
      submissionTime: "14:30",
      status: "Pending",
      priority: "Medium",
      votes: 42,
      submittedBy: {
        id: "STU2023025",
        name: "Rahul Sharma",
        type: "Student",
        department: "Computer Science & Engineering",
        email: "rahul.s@university.edu",
        phone: "+91 9876543210"
      },
      anonymous: false,
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-10 15:45",
          text: "Thank you for your suggestion. We will forward this to the library administration for consideration.",
          internal: false
        },
        {
          user: "Library Administration",
          time: "2023-05-11 10:30",
          text: "We are currently evaluating staffing requirements for extended hours.",
          internal: true
        }
      ]
    },
    {
      id: "SUG-2023-002",
      title: "Add More Vegetarian Options in Cafeteria",
      description: "The cafeteria currently has limited vegetarian options. Many students are vegetarian and would appreciate more variety in the daily menu.",
      category: "Campus Facilities",
      submissionDate: "2023-05-08",
      submissionTime: "12:15",
      status: "In Progress",
      priority: "High",
      votes: 78,
      submittedBy: {
        id: "STU2023056",
        name: "Priya Patel",
        type: "Student",
        department: "Artificial Intelligence & Data Science",
        email: "priya.p@university.edu",
        phone: "+91 9876543211"
      },
      anonymous: false,
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-08 14:00",
          text: "Thank you for your suggestion. We will discuss this with the cafeteria management.",
          internal: false
        },
        {
          user: "Cafeteria Management",
          time: "2023-05-09 09:45",
          text: "We are working on expanding our vegetarian menu. We will introduce 5 new vegetarian dishes next month.",
          internal: false
        },
        {
          user: "Priya Patel",
          time: "2023-05-09 11:20",
          text: "Thank you for considering this suggestion. Looking forward to the new options!",
          internal: false
        }
      ]
    },
    {
      id: "SUG-2023-003",
      title: "Install Water Purifiers in All Buildings",
      description: "Currently, only some buildings have water purifiers. It would be beneficial to have clean drinking water available in all academic buildings and hostels.",
      category: "Campus Facilities",
      submissionDate: "2023-05-05",
      submissionTime: "10:45",
      status: "Implemented",
      priority: "High",
      votes: 105,
      submittedBy: {
        id: "Anonymous",
        name: "Anonymous",
        type: "Student",
        department: "",
        email: "",
        phone: ""
      },
      anonymous: true,
      implementationDate: "2023-06-15",
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-05 11:30",
          text: "Thank you for your suggestion. We will forward this to the facilities department.",
          internal: false
        },
        {
          user: "Facilities Department",
          time: "2023-05-07 09:15",
          text: "We have approved the installation of water purifiers in all buildings. The work will begin next week.",
          internal: false
        },
        {
          user: "Facilities Department",
          time: "2023-06-15 16:30",
          text: "We have completed the installation of water purifiers in all buildings. Thank you for your valuable suggestion.",
          internal: false
        }
      ]
    },
    {
      id: "SUG-2023-004",
      title: "Introduce Online Course Registration",
      description: "The current process of course registration is time-consuming and requires students to stand in long queues. An online registration system would make the process more efficient.",
      category: "Administrative",
      submissionDate: "2023-04-20",
      submissionTime: "15:30",
      status: "Under Review",
      priority: "Medium",
      votes: 89,
      submittedBy: {
        id: "STU2023089",
        name: "Arjun Singh",
        type: "Student",
        department: "Cyber Security",
        email: "arjun.s@university.edu",
        phone: "+91 9876543212"
      },
      anonymous: false,
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-20 16:45",
          text: "Thank you for your suggestion. We will forward this to the academic administration.",
          internal: false
        },
        {
          user: "Academic Administration",
          time: "2023-04-25 11:30",
          text: "We are currently evaluating different online registration systems. We will provide an update soon.",
          internal: false
        },
        {
          user: "IT Department",
          time: "2023-05-05 14:15",
          text: "We have started developing a prototype for the online registration system. We will need to test it thoroughly before implementation.",
          internal: true
        }
      ]
    },
    {
      id: "SUG-2023-005",
      title: "Improve Wi-Fi Coverage in Hostels",
      description: "The Wi-Fi signal is weak in many hostel rooms, especially on higher floors. Better coverage would help students with online learning and research.",
      category: "IT Infrastructure",
      submissionDate: "2023-04-15",
      submissionTime: "18:45",
      status: "Rejected",
      priority: "Low",
      votes: 67,
      submittedBy: {
        id: "STU2023102",
        name: "Vikram Mehta",
        type: "Student",
        department: "Electronics & Communication",
        email: "vikram.m@university.edu",
        phone: "+91 9876543215"
      },
      anonymous: false,
      rejectionReason: "Budget constraints for the current academic year. Will reconsider in the next budget cycle.",
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-15 19:30",
          text: "Thank you for your suggestion. We will forward this to the IT department.",
          internal: false
        },
        {
          user: "IT Department",
          time: "2023-04-18 10:15",
          text: "We have conducted a survey of the Wi-Fi coverage in hostels. We will prepare a proposal for improvement.",
          internal: false
        },
        {
          user: "Finance Department",
          time: "2023-04-25 14:30",
          text: "The budget for this academic year has already been allocated. We cannot accommodate this request at present.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-04-26 11:45",
          text: "We regret to inform you that we cannot implement this suggestion in the current academic year due to budget constraints. We will reconsider it in the next budget cycle.",
          internal: false
        }
      ]
    },
    {
      id: "SUG-2023-006",
      title: "Start a Mentorship Program for First-Year Students",
      description: "First-year students often struggle with adjusting to university life. A mentorship program where senior students guide freshmen could help ease this transition.",
      category: "Student Welfare",
      submissionDate: "2023-04-10",
      submissionTime: "11:30",
      status: "Implemented",
      priority: "High",
      votes: 120,
      submittedBy: {
        id: "FAC2023015",
        name: "Dr. Rajesh Kumar",
        type: "Faculty",
        department: "Computer Science & Engineering",
        email: "rajesh.k@university.edu",
        phone: "+91 9876543220"
      },
      anonymous: false,
      implementationDate: "2023-07-01",
      comments: [
        {
          user: "Admin Office",
          time: "2023-04-10 12:45",
          text: "Thank you for your suggestion. We will forward this to the student welfare department.",
          internal: false
        },
        {
          user: "Student Welfare Department",
          time: "2023-04-12 14:30",
          text: "This is an excellent suggestion. We will work on developing a structured mentorship program.",
          internal: false
        },
        {
          user: "Student Council",
          time: "2023-04-20 15:15",
          text: "We fully support this initiative and would like to be involved in its implementation.",
          internal: false
        },
        {
          user: "Student Welfare Department",
          time: "2023-07-01 10:30",
          text: "We are pleased to announce that the mentorship program has been implemented. Senior students have been assigned as mentors to all first-year students. Thank you for your valuable suggestion.",
          internal: false
        }
      ]
    }
  ])

  // Filter suggestions based on active tab, search, and filters
  const getFilteredSuggestions = () => {
    let filteredByTab = [...suggestions]
    
    if (activeTab === "pending") {
      filteredByTab = suggestions.filter(item => item.status === "Pending")
    } else if (activeTab === "in-progress") {
      filteredByTab = suggestions.filter(item => ["In Progress", "Under Review"].includes(item.status))
    } else if (activeTab === "implemented") {
      filteredByTab = suggestions.filter(item => item.status === "Implemented")
    } else if (activeTab === "rejected") {
      filteredByTab = suggestions.filter(item => item.status === "Rejected")
    }
    
    return filteredByTab.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
  }

  // Sort filtered suggestions
  const getSortedSuggestions = () => {
    const filteredSuggestions = getFilteredSuggestions()
    
    return [...filteredSuggestions].sort((a, b) => {
      let valueA, valueB
      
      if (sortField === "submissionDate") {
        valueA = new Date(`${a.submissionDate} ${a.submissionTime || "00:00"}`).getTime()
        valueB = new Date(`${b.submissionDate} ${b.submissionTime || "00:00"}`).getTime()
      } else if (sortField === "votes") {
        valueA = a.votes || 0
        valueB = b.votes || 0
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

  const handleViewSuggestion = (suggestion: any) => {
    setSelectedSuggestion(suggestion)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedSuggestion || !replyText.trim()) return
    
    // In a real application, this would send the reply to an API
    const newComment = {
      user: "University Admin",
      time: new Date().toLocaleString(),
      text: replyText,
      internal: false
    }
    
    const updatedSuggestions = suggestions.map(suggestion => {
      if (suggestion.id === selectedSuggestion.id) {
        return {
          ...suggestion,
          comments: suggestion.comments ? [...suggestion.comments, newComment] : [newComment]
        }
      }
      return suggestion
    })
    
    setSuggestions(updatedSuggestions)
    
    // Update the selected suggestion to show the new comment
    const updatedSuggestion = updatedSuggestions.find(suggestion => suggestion.id === selectedSuggestion.id)
    if (updatedSuggestion) setSelectedSuggestion(updatedSuggestion)
    
    setReplyText("")
    alert(`Reply sent regarding ${selectedSuggestion.id}`)
  }

  const handleStatusChange = (suggestionId: string, newStatus: string) => {
    const updatedSuggestions = suggestions.map(suggestion => {
      if (suggestion.id === suggestionId) {
        const statusUpdateComment = {
          user: "University Admin",
          time: new Date().toLocaleString(),
          text: `Status updated to ${newStatus}`,
          internal: true
        }
        
        const updates: any = {
          status: newStatus,
          comments: suggestion.comments ? [...suggestion.comments, statusUpdateComment] : [statusUpdateComment]
        }
        
        if (newStatus === "Implemented") {
          updates.implementationDate = new Date().toLocaleDateString()
        }
        
        return {
          ...suggestion,
          ...updates
        }
      }
      return suggestion
    })
    
    setSuggestions(updatedSuggestions)
    
    // If we're viewing this suggestion, update the selected suggestion too
    if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
      const updatedSuggestion = updatedSuggestions.find(suggestion => suggestion.id === suggestionId)
      if (updatedSuggestion) setSelectedSuggestion(updatedSuggestion)
    }
    
    alert(`Status updated to ${newStatus} for suggestion ${suggestionId}`)
  }
  
  const handleAddSuggestion = () => {
    if (!suggestionTitle || !suggestionDescription || !suggestionCategory) {
      alert("Please fill in all required fields")
      return
    }
    
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const newSuggestion = {
      id: `SUG-${now.getFullYear()}-${String(suggestions.length + 1).padStart(3, '0')}`,
      title: suggestionTitle,
      description: suggestionDescription,
      category: suggestionCategory,
      submissionDate: now.toLocaleDateString(),
      submissionTime: formattedTime,
      status: "Pending",
      priority: "Medium",
      votes: 0,
      submittedBy: {
        id: "ADMIN001",
        name: suggestionAnonymous ? "Anonymous" : "University Admin",
        type: "Staff",
        department: "Administration",
        email: suggestionAnonymous ? "" : "admin@university.edu",
        phone: suggestionAnonymous ? "" : "+91 9876543200"
      },
      anonymous: suggestionAnonymous,
      comments: [
        {
          user: "University Admin",
          time: now.toLocaleString(),
          text: "Suggestion added to the system.",
          internal: true
        }
      ]
    }
    
    setSuggestions([newSuggestion, ...suggestions])
    
    // Reset form
    setSuggestionTitle("")
    setSuggestionDescription("")
    setSuggestionCategory("")
    setSuggestionAnonymous(false)
    setIsAddSuggestionDialogOpen(false)
    
    alert(`New suggestion added successfully`)
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
    "Under Review": "bg-purple-100 text-purple-800",
    "Implemented": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
  }

  const priorityColors: Record<string, string> = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-red-100 text-red-800",
  }

  const categories = [
    "All",
    "Academic Facilities",
    "Campus Facilities",
    "Administrative",
    "IT Infrastructure",
    "Student Welfare",
    "Curriculum",
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
              <h1 className="text-3xl font-bold text-gray-900">Suggestion Box</h1>
            </div>
            <p className="text-gray-500">Manage and respond to suggestions from students and faculty</p>
          </div>
          <Button onClick={() => setIsAddSuggestionDialogOpen(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add New Suggestion
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="implemented">Implemented</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter suggestions by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title, ID, or description..."
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
                  {activeTab === "pending" && "Pending Suggestions"}
                  {activeTab === "in-progress" && "In Progress Suggestions"}
                  {activeTab === "implemented" && "Implemented Suggestions"}
                  {activeTab === "rejected" && "Rejected Suggestions"}
                </CardTitle>
                <CardDescription>
                  {getSortedSuggestions().length} suggestions found
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
                            onClick={() => handleSort("submissionDate")}
                          >
                            Submission Date
                            {sortField === "submissionDate" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Submitted By
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
                            onClick={() => handleSort("votes")}
                          >
                            Votes
                            {sortField === "votes" && (
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
                      {getSortedSuggestions().length > 0 ? (
                        getSortedSuggestions().map((suggestion) => (
                          <tr key={suggestion.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{suggestion.id}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{suggestion.title}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{suggestion.description}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {suggestion.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {suggestion.submissionDate}
                                <Clock className="h-3 w-3 ml-1 text-gray-400" />
                                {suggestion.submissionTime}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {suggestion.anonymous ? (
                                <span className="text-gray-500 italic">Anonymous</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{suggestion.submittedBy.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium">{suggestion.submittedBy.name}</p>
                                    <p className="text-xs text-gray-500">{suggestion.submittedBy.type}</p>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={priorityColors[suggestion.priority]}>{suggestion.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{suggestion.votes}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[suggestion.status]}>{suggestion.status}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewSuggestion(suggestion)}>
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
                                    <DropdownMenuItem onClick={() => handleStatusChange(suggestion.id, "Pending")}>
                                      Mark as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(suggestion.id, "In Progress")}>
                                      Mark as In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(suggestion.id, "Under Review")}>
                                      Mark as Under Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(suggestion.id, "Implemented")}>
                                      Mark as Implemented
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(suggestion.id, "Rejected")}>
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
                          <td colSpan={9} className="py-6 text-center text-gray-500">
                            No suggestions found matching your criteria
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

        {/* Suggestion Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedSuggestion && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Suggestion Details
                  </DialogTitle>
                  <DialogDescription>
                    Suggestion ID: {selectedSuggestion.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Suggestion Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base font-medium">{selectedSuggestion.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-base">{selectedSuggestion.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Category</p>
                          <Badge variant="outline" className="mt-1">{selectedSuggestion.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={`${statusColors[selectedSuggestion.status]} mt-1`}>{selectedSuggestion.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <Badge className={`${priorityColors[selectedSuggestion.priority]} mt-1`}>{selectedSuggestion.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Votes</p>
                          <div className="flex items-center gap-1 mt-1">
                            <ThumbsUp className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{selectedSuggestion.votes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Submission Date</p>
                          <p className="text-base">{selectedSuggestion.submissionDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Submission Time</p>
                          <p className="text-base">{selectedSuggestion.submissionTime}</p>
                        </div>
                      </div>
                      
                      {selectedSuggestion.implementationDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Implementation Date</p>
                          <p className="text-base">{selectedSuggestion.implementationDate}</p>
                        </div>
                      )}
                      
                      {selectedSuggestion.rejectionReason && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                          <p className="text-base">{selectedSuggestion.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Submitter Information</h3>
                    {selectedSuggestion.anonymous ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-500 italic">This suggestion was submitted anonymously</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{selectedSuggestion.submittedBy.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedSuggestion.submittedBy.name}</p>
                            <p className="text-sm text-gray-500">{selectedSuggestion.submittedBy.type} - {selectedSuggestion.submittedBy.department}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {selectedSuggestion.submittedBy.email && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${selectedSuggestion.submittedBy.email}`} className="text-blue-600 hover:underline">
                                  {selectedSuggestion.submittedBy.email}
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {selectedSuggestion.submittedBy.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <a href={`tel:${selectedSuggestion.submittedBy.phone}`} className="text-blue-600 hover:underline">
                                  {selectedSuggestion.submittedBy.phone}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Comments/Communication History */}
                    <h3 className="text-lg font-medium mb-4">Communication History</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[400px] overflow-y-auto">
                      {selectedSuggestion.comments && selectedSuggestion.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedSuggestion.comments.map((comment: any, index: number) => (
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
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedSuggestion.id, "Pending")}>
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedSuggestion.id, "In Progress")}>
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedSuggestion.id, "Under Review")}>
                                Mark as Under Review
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedSuggestion.id, "Implemented")}>
                                Mark as Implemented
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(selectedSuggestion.id, "Rejected")}>
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
                                const updatedSuggestions = suggestions.map(suggestion => {
                                  if (suggestion.id === selectedSuggestion.id) {
                                    return { ...suggestion, priority: "Low" }
                                  }
                                  return suggestion
                                })
                                setSuggestions(updatedSuggestions)
                                const updatedSuggestion = updatedSuggestions.find(suggestion => suggestion.id === selectedSuggestion.id)
                                if (updatedSuggestion) setSelectedSuggestion(updatedSuggestion)
                              }}>
                                Set to Low
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedSuggestions = suggestions.map(suggestion => {
                                  if (suggestion.id === selectedSuggestion.id) {
                                    return { ...suggestion, priority: "Medium" }
                                  }
                                  return suggestion
                                })
                                setSuggestions(updatedSuggestions)
                                const updatedSuggestion = updatedSuggestions.find(suggestion => suggestion.id === selectedSuggestion.id)
                                if (updatedSuggestion) setSelectedSuggestion(updatedSuggestion)
                              }}>
                                Set to Medium
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const updatedSuggestions = suggestions.map(suggestion => {
                                  if (suggestion.id === selectedSuggestion.id) {
                                    return { ...suggestion, priority: "High" }
                                  }
                                  return suggestion
                                })
                                setSuggestions(updatedSuggestions)
                                const updatedSuggestion = updatedSuggestions.find(suggestion => suggestion.id === selectedSuggestion.id)
                                if (updatedSuggestion) setSelectedSuggestion(updatedSuggestion)
                              }}>
                                Set to High
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        
        {/* Add Suggestion Dialog */}
        <Dialog open={isAddSuggestionDialogOpen} onOpenChange={setIsAddSuggestionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Suggestion</DialogTitle>
              <DialogDescription>
                Add a new suggestion to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="space-y-2">
                <label htmlFor="suggestion-title" className="text-sm font-medium">Title*</label>
                <Input 
                  id="suggestion-title" 
                  value={suggestionTitle} 
                  onChange={(e) => setSuggestionTitle(e.target.value)} 
                  placeholder="Brief title of the suggestion"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="suggestion-description" className="text-sm font-medium">Description*</label>
                <Textarea 
                  id="suggestion-description" 
                  value={suggestionDescription} 
                  onChange={(e) => setSuggestionDescription(e.target.value)} 
                  placeholder="Detailed description of the suggestion"
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="suggestion-category" className="text-sm font-medium">Category*</label>
                <Select value={suggestionCategory} onValueChange={setSuggestionCategory}>
                  <SelectTrigger id="suggestion-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="suggestion-anonymous" 
                  className="rounded text-blue-600" 
                  checked={suggestionAnonymous}
                  onChange={(e) => setSuggestionAnonymous(e.target.checked)}
                />
                <label htmlFor="suggestion-anonymous" className="text-sm">Submit as anonymous</label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSuggestionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSuggestion}>Add Suggestion</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
