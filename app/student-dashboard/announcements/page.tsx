"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from '@/lib/supabase'
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
  poster_url?: string | null
  date?: string | null
  time?: string | null
  venue?: string | null
}

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  // Fetch announcements from Supabase
  useEffect(() => {
    fetchAnnouncements()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchAnnouncements()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAnnouncements = async () => {
    try {
      // Get current student info
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: student } = await supabase
        .from('students')
        .select('department, year')
        .eq('email', user.email)
        .single()

      if (!student) {
        setIsLoading(false)
        return
      }

      // Fetch announcements for this student
      // Get all announcements first, then filter in JavaScript for complex logic
      const { data: allAnnouncements, error } = await supabase
        .from('announcements')
        .select(`
          *,
          faculty:faculty_id (
            name,
            department
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter announcements based on student's department and year
      const announcements = allAnnouncements?.filter(announcement => {
        // University-wide announcements (no department specified)
        if (!announcement.department) return true
        
        // Check if announcement is for student's department
        if (announcement.department === student.department) {
          // If no target years specified, it's for all years in the department
          if (!announcement.target_years || announcement.target_years.length === 0) return true
          
          // Check if student's year is in the target years
          if (announcement.target_years.includes(student.year)) return true
        }
        
        return false
      }) || []

      // Map to interface format
      const mapped = announcements?.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content || '',
        faculty_name: a.faculty?.name || 'Unknown',
        faculty_department: a.faculty?.department || '',
        department: a.department || 'All Departments',
        priority: a.priority || 'normal',
        target_audience: a.target_audience || 'all',
        created_at: a.created_at,
        poster_url: a.poster_url,
        date: a.date,
        time: a.time,
        venue: a.venue
      })) || []

      setAnnouncements(mapped)
      setFilteredAnnouncements(mapped)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {announcement.poster_url && (
                      <div className="md:w-1/3 flex-shrink-0">
                        <img
                          src={announcement.poster_url}
                          alt={announcement.title}
                          className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
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
                          {(announcement.date || announcement.time || announcement.venue) && (
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                              {announcement.date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {announcement.date}
                                </div>
                              )}
                              {announcement.time && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {announcement.time}
                                </div>
                              )}
                              {announcement.venue && (
                                <span>📍 {announcement.venue}</span>
                              )}
                            </div>
                          )}
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
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {selectedAnnouncement?.title}
                                  <Badge
                                    className={`${getPriorityColor(selectedAnnouncement?.priority || "normal")} flex items-center gap-1`}
                                  >
                                    {getPriorityIcon(selectedAnnouncement?.priority || "normal")}
                                    {(selectedAnnouncement?.priority || "normal").charAt(0).toUpperCase() +
                                      (selectedAnnouncement?.priority || "normal").slice(1)}
                                  </Badge>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedAnnouncement?.poster_url && (
                                  <div className="w-full">
                                    <img
                                      src={selectedAnnouncement.poster_url}
                                      alt={selectedAnnouncement.title}
                                      className="w-full h-auto max-h-96 object-contain rounded-lg"
                                    />
                                  </div>
                                )}
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
                                {(selectedAnnouncement?.date || selectedAnnouncement?.time || selectedAnnouncement?.venue) && (
                                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                                    <h4 className="font-medium text-gray-900">Event Details</h4>
                                    <div className="space-y-1 text-sm">
                                      {selectedAnnouncement?.date && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <Calendar className="h-4 w-4" />
                                          <span>Date: {selectedAnnouncement.date}</span>
                                        </div>
                                      )}
                                      {selectedAnnouncement?.time && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <Calendar className="h-4 w-4" />
                                          <span>Time: {selectedAnnouncement.time}</span>
                                        </div>
                                      )}
                                      {selectedAnnouncement?.venue && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <span>📍 Venue: {selectedAnnouncement.venue}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="prose max-w-none">
                                  <p className="text-gray-700 leading-relaxed">{selectedAnnouncement?.content}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
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
