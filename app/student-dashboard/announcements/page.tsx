"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { realtimeService, RealtimePayload } from '@/lib/realtime-service'
import { supabase } from '@/lib/supabase'
import { Search, Bell, Calendar, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  const subscriptionsRef = useRef<{ unsubscribe: () => void } | null>(null)
  const [student, setStudent] = useState<any>(null)

  // Fetch announcements from Supabase
  useEffect(() => {
    fetchAnnouncements()
    
    return () => {
      if (subscriptionsRef.current) {
        subscriptionsRef.current.unsubscribe()
      }
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
      const yearMapping: { [key: string]: string } = {
        '1': 'first', '2': 'second', '3': 'third', '4': 'fourth',
        '1st': 'first', '2nd': 'second', '3rd': 'third', '4th': 'fourth',
        'first': 'first', 'second': 'second', 'third': 'third', 'fourth': 'fourth'
      }
      const normalizedStudentYear = yearMapping[student.year?.toLowerCase()?.trim() || ''] || student.year?.toLowerCase()
      const normalizedStudentDept = student.department?.toLowerCase()?.trim()
      
      const announcements = allAnnouncements?.filter(announcement => {
        const recordDept = announcement.department?.toLowerCase()?.trim()
        const recordYears = announcement.target_years || []
        
        // University-wide announcements (no department specified)
        if (!announcement.department) return true
        
        // Check if announcement is for student's department (case-insensitive)
        if (recordDept === normalizedStudentDept) {
          // If no target years specified, it's for all years in the department
          if (!recordYears || recordYears.length === 0) return true
          
          // Check if student's year is in the target years (case-insensitive)
          const yearMatches = recordYears.some((y: string) => {
            const normalizedRecordYear = yearMapping[y?.toLowerCase()?.trim() || ''] || y?.toLowerCase()
            return normalizedRecordYear === normalizedStudentYear
          })
          if (yearMatches) return true
        }
        
        return false
      }) || []

      if (student) {
        setupRealtimeSubscriptions(student)
      }

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

  const setupRealtimeSubscriptions = (studentData: any) => {
    // Clean up previous subscriptions
    if (subscriptionsRef.current) {
      subscriptionsRef.current.unsubscribe()
    }
    
    // Use centralized realtime service with department + year filtering
    subscriptionsRef.current = realtimeService.subscribeToAnnouncements(
      { department: studentData.department, year: studentData.year },
      (payload: RealtimePayload) => {
        console.log('Announcement update:', payload)
        fetchAnnouncements()
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Announcement",
            description: payload.new.title,
          })
        }
      }
    )
  }

  useEffect(() => {
    let filtered = announcements

    // Filter by search term only
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredAnnouncements(filtered)
  }, [searchTerm, announcements])

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

      {/* Search Only - removed priority and department filters */}
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
                          <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
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
                                <DialogTitle className="text-xl font-semibold">{selectedAnnouncement?.title}</DialogTitle>
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
          <p className="text-gray-500"></p>
        </motion.div>
      )}
    </div>
  )
}
