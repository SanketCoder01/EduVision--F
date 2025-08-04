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
  Phone,
  AlertTriangle,
  UserCircle
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function GrievancePortalPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("grievances")
  const [editingContact, setEditingContact] = useState<any>(null)
  const [contactName, setContactName] = useState("")
  const [contactRole, setContactRole] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  
  // Mock data for grievances - in a real app this would come from an API
  const [grievances, setGrievances] = useState([
    {
      id: "GRV-2023-001",
      studentId: "STU2023025",
      studentName: "Rahul Sharma",
      department: "Computer Science & Engineering",
      year: "Third Year",
      title: "Unfair Grading in Database Management Course",
      description: "I believe my final project for the Database Management course was graded unfairly. I implemented all the required features and followed the rubric, but received a C grade without proper feedback.",
      category: "Academic",
      subcategory: "Grading Issue",
      priority: "Medium",
      status: "Pending",
      submittedDate: "May 10, 2023",
      attachments: ["/grievances/project-submission.pdf", "/grievances/rubric.pdf"],
      anonymous: false,
      comments: []
    },
    {
      id: "GRV-2023-002",
      studentId: "STU2023056",
      studentName: "Priya Patel",
      department: "Artificial Intelligence & Data Science",
      year: "Second Year",
      title: "Harassment by Senior Students",
      description: "I've been experiencing harassment from a group of senior students. They have been making derogatory comments and creating a hostile environment. This has been affecting my mental health and academic performance.",
      category: "Behavioral",
      subcategory: "Harassment",
      priority: "High",
      status: "In Progress",
      submittedDate: "May 8, 2023",
      assignedTo: "Student Welfare Committee",
      assignedDate: "May 9, 2023",
      attachments: [],
      anonymous: true,
      comments: [
        {
          user: "Student Welfare Committee",
          time: "May 9, 2023 10:30 AM",
          text: "We have received your grievance and are taking it very seriously. A confidential investigation has been initiated. Please feel free to provide any additional information that might help us address this issue.",
          internal: false
        },
        {
          user: "Dean of Students",
          time: "May 9, 2023 02:15 PM",
          text: "Assigned to Anti-Ragging Committee for further investigation. Need to interview the involved parties separately.",
          internal: true
        }
      ]
    },
    {
      id: "GRV-2023-003",
      studentId: "STU2023089",
      studentName: "Arjun Singh",
      department: "Cyber Security",
      year: "Fourth Year",
      title: "Inadequate Lab Equipment",
      description: "The cybersecurity lab equipment is outdated and insufficient for our practical coursework. Many of the tools we need to learn are not available, and the existing computers are too slow to run modern security software.",
      category: "Infrastructure",
      subcategory: "Laboratory Facilities",
      priority: "Medium",
      status: "Resolved",
      submittedDate: "May 5, 2023",
      resolvedDate: "May 12, 2023",
      resolution: "The department has approved a budget for upgrading the cybersecurity lab. New equipment will be installed within the next two weeks.",
      attachments: ["/grievances/lab-inventory.pdf"],
      anonymous: false,
      comments: [
        {
          user: "HOD - Cyber Security",
          time: "May 7, 2023 11:45 AM",
          text: "Thank you for bringing this to our attention. We are reviewing the current lab setup and will propose upgrades in the next department meeting.",
          internal: false
        },
        {
          user: "IT Infrastructure Team",
          time: "May 10, 2023 09:30 AM",
          text: "Assessment completed. Recommended upgrades include 20 new workstations, updated security software licenses, and networking equipment.",
          internal: true
        },
        {
          user: "HOD - Cyber Security",
          time: "May 12, 2023 03:15 PM",
          text: "Good news! The budget for lab upgrades has been approved. New equipment will be installed within the next two weeks. Thank you for your patience.",
          internal: false
        },
        {
          user: "Arjun Singh",
          time: "May 12, 2023 04:30 PM",
          text: "Thank you for the quick response and resolution. This will greatly help our practical learning.",
          internal: false
        }
      ]
    }
  ])
  
  // Mock data for anti-ragging committee contacts
  const [antiRaggingContacts, setAntiRaggingContacts] = useState([
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      role: "Chairperson, Anti-Ragging Committee",
      email: "rajesh.kumar@university.edu",
      phone: "+91 9876543210"
    },
    {
      id: 2,
      name: "Dr. Meena Sharma",
      role: "Member, Anti-Ragging Committee",
      email: "meena.sharma@university.edu",
      phone: "+91 9876543211"
    },
    {
      id: 3,
      name: "Prof. Anand Verma",
      role: "Member, Anti-Ragging Committee",
      email: "anand.verma@university.edu",
      phone: "+91 9876543212"
    },
    {
      id: 4,
      name: "Ms. Priya Desai",
      role: "Student Counselor",
      email: "priya.desai@university.edu",
      phone: "+91 9876543213"
    }
  ])

  // Filter grievances based on search and filters
  const filteredGrievances = grievances.filter(grievance => {
    const matchesSearch = 
      grievance.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "All" || grievance.status === statusFilter
    const matchesCategory = categoryFilter === "All" || grievance.category === categoryFilter
    const matchesPriority = priorityFilter === "All" || grievance.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const handleViewGrievance = (grievance: any) => {
    setSelectedGrievance(grievance)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedGrievance || !replyText.trim()) return
    
    // In a real application, this would send the reply to an API
    const updatedGrievances = grievances.map(grievance => {
      if (grievance.id === selectedGrievance.id) {
        const newComment = {
          user: "Grievance Redressal Cell",
          time: new Date().toLocaleString(),
          text: replyText,
          internal: false
        }
        
        return {
          ...grievance,
          comments: grievance.comments ? [...grievance.comments, newComment] : [newComment]
        }
      }
      return grievance
    })
    
    setGrievances(updatedGrievances)
    setReplyText("")
    setIsDialogOpen(false)
    alert(`Reply sent regarding grievance ${selectedGrievance.id}`)
  }

  const handleStatusChange = (grievanceId: string, newStatus: string) => {
    // Update the status in our state
    const updatedGrievances = grievances.map(grievance => {
      if (grievance.id === grievanceId) {
        const statusUpdateComment = {
          user: "Grievance Redressal Cell",
          time: new Date().toLocaleString(),
          text: `Status updated to ${newStatus}`,
          internal: true
        }
        
        const updates: any = {
          status: newStatus,
          comments: grievance.comments ? [...grievance.comments, statusUpdateComment] : [statusUpdateComment]
        }
        
        if (newStatus === "Resolved") {
          updates.resolvedDate = new Date().toLocaleDateString()
        }
        
        return {
          ...grievance,
          ...updates
        }
      }
      return grievance
    })
    
    setGrievances(updatedGrievances)
    alert(`Status updated to ${newStatus} for grievance ${grievanceId}`)
    
    // If we're viewing this grievance, update the selected grievance too
    if (selectedGrievance && selectedGrievance.id === grievanceId) {
      const updatedGrievance = updatedGrievances.find(g => g.id === grievanceId)
      if (updatedGrievance) setSelectedGrievance(updatedGrievance)
    }
  }
  
  const handleAddContact = () => {
    if (!contactName || !contactRole || !contactEmail || !contactPhone) {
      alert("Please fill in all fields")
      return
    }
    
    if (editingContact) {
      // Update existing contact
      const updatedContacts = antiRaggingContacts.map(contact => {
        if (contact.id === editingContact.id) {
          return {
            ...contact,
            name: contactName,
            role: contactRole,
            email: contactEmail,
            phone: contactPhone
          }
        }
        return contact
      })
      setAntiRaggingContacts(updatedContacts)
    } else {
      // Add new contact
      const newContact = {
        id: antiRaggingContacts.length + 1,
        name: contactName,
        role: contactRole,
        email: contactEmail,
        phone: contactPhone
      }
      setAntiRaggingContacts([...antiRaggingContacts, newContact])
    }
    
    // Reset form
    setContactName("")
    setContactRole("")
    setContactEmail("")
    setContactPhone("")
    setEditingContact(null)
    setIsContactDialogOpen(false)
  }
  
  const handleEditContact = (contact: any) => {
    setEditingContact(contact)
    setContactName(contact.name)
    setContactRole(contact.role)
    setContactEmail(contact.email)
    setContactPhone(contact.phone)
    setIsContactDialogOpen(true)
  }
  
  const handleDeleteContact = (contactId: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      const updatedContacts = antiRaggingContacts.filter(contact => contact.id !== contactId)
      setAntiRaggingContacts(updatedContacts)
    }
  }

  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Resolved": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
  }

  const priorityColors: Record<string, string> = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-yellow-100 text-yellow-800",
    "High": "bg-red-100 text-red-800",
  }

  const categories = [
    "All",
    "Academic",
    "Behavioral",
    "Infrastructure",
    "Administrative",
    "Financial",
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
              <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            </div>
            <p className="text-gray-500">Manage and respond to student grievances</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
            <TabsTrigger value="anti-ragging">Anti-Ragging Committee</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grievances" className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter grievances by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, title, or category..."
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
                        <SelectItem value="Resolved">Resolved</SelectItem>
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
                <CardTitle>Student Grievances</CardTitle>
                <CardDescription>
                  {filteredGrievances.length} grievances found
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
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrievances.length > 0 ? (
                        filteredGrievances.map((grievance) => (
                          <tr key={grievance.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{grievance.id}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {grievance.anonymous ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 bg-gray-200">
                                      <AvatarFallback className="bg-gray-200 text-gray-600">Anon</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">Anonymous</p>
                                      <p className="text-xs text-gray-500">{grievance.department}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{grievance.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{grievance.studentName}</p>
                                      <p className="text-xs text-gray-500">{grievance.studentId}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{grievance.title}</td>
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <p>{grievance.category}</p>
                                {grievance.subcategory && (
                                  <p className="text-xs text-gray-500">{grievance.subcategory}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{grievance.submittedDate}</td>
                            <td className="py-3 px-4">
                              <Badge className={priorityColors[grievance.priority]}>{grievance.priority}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[grievance.status]}>{grievance.status}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewGrievance(grievance)}>
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
                                    <DropdownMenuItem onClick={() => handleStatusChange(grievance.id, "In Progress")}>
                                      Mark as In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(grievance.id, "Resolved")}>
                                      Mark as Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(grievance.id, "Rejected")}>
                                      Reject Grievance
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
                            No grievances found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="anti-ragging" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Anti-Ragging Committee</CardTitle>
                  <CardDescription>Manage anti-ragging committee members and contact information</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingContact(null)
                  setContactName("")
                  setContactRole("")
                  setContactEmail("")
                  setContactPhone("")
                  setIsContactDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Anti-Ragging Information</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Ragging is strictly prohibited in the university premises. Any student found involved in ragging will face severe disciplinary action, including expulsion from the university and criminal proceedings as per UGC regulations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {antiRaggingContacts.map((contact) => (
                    <Card key={contact.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{contact.name}</h3>
                                <p className="text-sm text-gray-500">{contact.role}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteContact(contact.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Grievance Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedGrievance && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Grievance Details
                  </DialogTitle>
                  <DialogDescription>
                    Grievance ID: {selectedGrievance.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Grievance Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base">{selectedGrievance.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-base">{selectedGrievance.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Category</p>
                          <p className="text-base">{selectedGrievance.category}</p>
                        </div>
                        {selectedGrievance.subcategory && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Subcategory</p>
                            <p className="text-base">{selectedGrievance.subcategory}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                        <p className="text-base">{selectedGrievance.submittedDate}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <Badge className={priorityColors[selectedGrievance.priority]}>{selectedGrievance.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={statusColors[selectedGrievance.status]}>{selectedGrievance.status}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Anonymous</p>
                          <Badge variant="outline">{selectedGrievance.anonymous ? "Yes" : "No"}</Badge>
                        </div>
                      </div>
                      
                      {selectedGrievance.assignedTo && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Assigned To</p>
                          <p className="text-base">{selectedGrievance.assignedTo}</p>
                          {selectedGrievance.assignedDate && (
                            <p className="text-xs text-gray-500">Assigned on {selectedGrievance.assignedDate}</p>
                          )}
                        </div>
                      )}
                      
                      {selectedGrievance.resolvedDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Resolved Date</p>
                          <p className="text-base">{selectedGrievance.resolvedDate}</p>
                        </div>
                      )}
                      
                      {selectedGrievance.resolution && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Resolution</p>
                          <p className="text-base">{selectedGrievance.resolution}</p>
                        </div>
                      )}
                      
                      {selectedGrievance.attachments && selectedGrievance.attachments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Attachments</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedGrievance.attachments.map((attachment: string, index: number) => (
                              <Button key={index} variant="outline" size="sm" className="gap-1">
                                <Download className="h-4 w-4" />
                                {attachment.split('/').pop()}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Student Information</h3>
                    <div className="space-y-4">
                      {selectedGrievance.anonymous ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserCircle className="h-5 w-5 text-gray-500" />
                            <p className="text-gray-600">This grievance was submitted anonymously</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{selectedGrievance.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{selectedGrievance.studentName}</p>
                              <p className="text-sm text-gray-500">{selectedGrievance.studentId}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Department</p>
                            <p className="text-base">{selectedGrievance.department}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Year</p>
                            <p className="text-base">{selectedGrievance.year}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Comments/Communication History */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[400px] overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Communication History</h4>
                      {selectedGrievance.comments && selectedGrievance.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedGrievance.comments.map((comment: any, index: number) => (
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
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedGrievance.id, "In Progress")}
                          >
                            <Loader2 className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleStatusChange(selectedGrievance.id, "Resolved")}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Resolved
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
        
        {/* Contact Form Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
              <DialogDescription>
                {editingContact ? "Update the contact information for the anti-ragging committee member." : "Add a new contact to the anti-ragging committee."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                <Input 
                  id="contact-name" 
                  value={contactName} 
                  onChange={(e) => setContactName(e.target.value)} 
                  placeholder="Full name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contact-role" className="text-sm font-medium">Role</label>
                <Input 
                  id="contact-role" 
                  value={contactRole} 
                  onChange={(e) => setContactRole(e.target.value)} 
                  placeholder="Position or role"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                <Input 
                  id="contact-email" 
                  type="email"
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  placeholder="Email address"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contact-phone" className="text-sm font-medium">Phone</label>
                <Input 
                  id="contact-phone" 
                  value={contactPhone} 
                  onChange={(e) => setContactPhone(e.target.value)} 
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddContact}>{editingContact ? "Update" : "Add"} Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
