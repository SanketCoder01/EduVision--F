"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Bell, Calendar, ChevronRight, Star, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Announcement {
  id: string
  title: string
  content: string
  faculty_name: string
  faculty_department: string
  department: string
  priority: "low" | "normal" | "high" | "urgent"
  target_audience: string
  created_at: string
  poster_url?: string
}

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  // Mock data - In production, this would come from your API
  const mockAnnouncements: Announcement[] = [
    {
      id: "1",
      title: "Welcome to New Semester",
      content:
        "Welcome students to the new academic semester. Please check your course schedules and prepare for upcoming classes. Make sure to attend the orientation session scheduled for next week.",
      faculty_name: "Dr. John Smith",
      faculty_department: "Computer Science",
      department: "Computer Science",
      priority: "high",
      target_audience: "all",
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Assignment Submission Guidelines",
      content:
        "Please follow the proper format for assignment submissions. Late submissions will not be accepted without prior approval. All assignments must be submitted through the online portal.",
      faculty_name: "Dr. Sarah Johnson",
      faculty_department: "Information Technology",
      department: "Computer Science",
      priority: "normal",
      target_audience: "students",
      created_at: "2024-01-14T14:30:00Z",
    },
    {
      id: "3",
      title: "Library Hours Extended",
      content:
        "The library will now be open until 10 PM on weekdays to accommodate student study needs. Please bring your student ID for access after regular hours.",
      faculty_name: "Dr. Michael Brown",
      faculty_department: "Administration",
      department: "All Departments",
      priority: "normal",
      target_audience: "all",
      created_at: "2024-01-13T09:15:00Z",
    },
    {
      id: "4",
      title: "Urgent: Exam Schedule Update",
      content:
        "There has been a change in the mid-semester exam schedule. Please check the updated timetable on the student portal immediately. Contact your class representative for any clarifications.",
      faculty_name: "Dr. Emily Davis",
      faculty_department: "Academic Affairs",
      department: "Computer Science",
      priority: "urgent",
      target_audience: "students",
      created_at: "2024-01-12T16:45:00Z",
    },
    {
      id: "5",
      title: "Workshop on AI and Machine Learning",
      content:
        "Join us for an exciting workshop on Artificial Intelligence and Machine Learning. Industry experts will share insights and hands-on experience. Registration is mandatory.",
      faculty_name: "Dr. Robert Wilson",
      faculty_department: "Computer Science",
      department: "Computer Science",
      priority: "high",
      target_audience: "students",
      created_at: "2024-01-11T11:20:00Z",
    },
  ]

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAnnouncements(mockAnnouncements)
      setFilteredAnnouncements(mockAnnouncements)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = announcements

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by priority
    if (filterPriority !== "all") {
      filtered = filtered.filter((announcement) => announcement.priority === filterPriority)
    }

    // Filter by department
    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (announcement) =>
          announcement.department.toLowerCase().includes(filterDepartment.toLowerCase()) ||
          announcement.department === "All Departments",
      )
    }

    setFilteredAnnouncements(filtered)
  }, [searchTerm, filterPriority, filterDepartment, announcements])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4" />
      case "high":
        return <Star className="h-4 w-4" />
      case "normal":
        return <Info className="h-4 w-4" />
      case "low":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Stay updated with the latest news and updates</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
        </Badge>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="computer science">Computer Science</SelectItem>
            <SelectItem value="information technology">Information Technology</SelectItem>
            <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
            <SelectItem value="electrical">Electrical Engineering</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Announcements List */}
      <AnimatePresence>
        <div className="grid gap-4">
          {filteredAnnouncements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                        <Badge className={`${getPriorityColor(announcement.priority)} flex items-center gap-1`}>
                          {getPriorityIcon(announcement.priority)}
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-3">{announcement.content}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                        <AvatarFallback>
                          {announcement.faculty_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{announcement.faculty_name}</p>
                        <p className="text-gray-500">{announcement.faculty_department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(announcement.created_at)}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAnnouncement(announcement)}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {selectedAnnouncement?.title}
                              <Badge
                                className={`${getPriorityColor(selectedAnnouncement?.priority || "normal")} flex items-center gap-1`}
                              >
                                {getPriorityIcon(selectedAnnouncement?.priority || "normal")}
                                {selectedAnnouncement?.priority.charAt(0).toUpperCase() +
                                  selectedAnnouncement?.priority.slice(1)}
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback>
                                  {selectedAnnouncement?.faculty_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{selectedAnnouncement?.faculty_name}</p>
                                <p className="text-sm text-gray-500">{selectedAnnouncement?.faculty_department}</p>
                                <p className="text-sm text-gray-500">
                                  {selectedAnnouncement && formatDate(selectedAnnouncement.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="prose max-w-none">
                              <p className="text-gray-700 leading-relaxed">{selectedAnnouncement?.content}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredAnnouncements.length === 0 && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </motion.div>
      )}
    </div>
  )
}
