"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Bell,
  MessageCircle,
  BookOpen,
  Clock,
  AlertCircle,
  Sparkles,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  MoreVertical,
  GraduationCap,
  MapPin,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase-realtime"
import { toast } from "@/hooks/use-toast"

interface Assignment {
  id: string
  department: string
  target_years: string[]
  title: string
  status: string
}

interface Announcement {
  id: string
  department?: string
  title: string
}

interface StudyGroup {
  id: string
  department: string
  target_years: string[]
  name: string
}

interface Student {
  id: string
  name: string
  email: string
  department: string
  year: string
  prn?: string
}

interface TodaysHubItem {
  id: string
  type: "assignment" | "announcement" | "event" | "study_group" | "attendance"
  title: string
  description: string
  author: string
  time: string
  urgent: boolean
  department: string
  redirectUrl: string
  metadata?: any
  dueDate?: string
  status?: string
}

export default function StudentTodaysHubPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<Student | null>(null)
  const [hubItems, setHubItems] = useState<TodaysHubItem[]>([])
  const [filteredItems, setFilteredItems] = useState<TodaysHubItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const studentData = localStorage.getItem("studentSession")
        const currentUserData = localStorage.getItem("currentUser")
        const userSession = localStorage.getItem("user_session")
        
        let user = null
        if (studentData) {
          user = JSON.parse(studentData)
        } else if (currentUserData) {
          user = JSON.parse(currentUserData)
        } else if (userSession) {
          const sessionUser = JSON.parse(userSession)
          // Check if this is a student user
          if (sessionUser.department && sessionUser.year) {
            user = sessionUser
          }
        }
        
        if (user) {
          setCurrentUser(user)
          await loadTodaysHubData(user)
          setupRealtimeSubscriptions(user)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    filterItems()
  }, [hubItems, searchTerm, filterType])

  const loadTodaysHubData = async (user: Student) => {
    try {
      setIsLoading(true)
      
      // Fetch data from API instead of localStorage
      const response = await fetch(
        `/api/todays-hub?user_id=${user.id}&user_type=student&department=${user.department}&year=${user.year}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s hub data')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data')
      }
      
      const data = result.data
      const items: TodaysHubItem[] = []

      // Process assignments
      data.assignments?.forEach((assignment: any) => {
        const dueDate = new Date(assignment.due_date)
        const now = new Date()
        const isUrgent = dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // Due within 24 hours
        const isSubmitted = assignment.assignment_submissions?.some((sub: any) => sub.student_id === user.id)

        items.push({
          id: assignment.id,
          type: "assignment",
          title: `Assignment: ${assignment.title}`,
          description: assignment.description || `Due: ${dueDate.toLocaleDateString()}`,
          author: assignment.faculty?.name || "Faculty",
          time: getRelativeTime(assignment.created_at),
          urgent: isUrgent && !isSubmitted,
          department: assignment.department,
          redirectUrl: `/student-dashboard/assignments`,
          metadata: {
            subject: assignment.assignment_type,
            maxMarks: assignment.max_marks,
            status: isSubmitted ? 'Submitted' : 'Pending',
            type: assignment.assignment_type
          },
          dueDate: assignment.due_date,
          status: assignment.status
        })
      })

      // Process announcements
      data.announcements?.forEach((announcement: any) => {
        items.push({
          id: announcement.id,
          type: "announcement",
          title: announcement.title,
          description: announcement.content.substring(0, 100) + '...',
          author: announcement.faculty?.name || "Faculty",
          time: getRelativeTime(announcement.created_at),
          urgent: announcement.priority === 'urgent' || announcement.priority === 'high',
          department: announcement.department || "All Departments",
          redirectUrl: `/student-dashboard/announcements`,
          metadata: {
            priority: announcement.priority,
            audience: announcement.target_audience
          }
        })
      })

      // Process study groups
      data.studyGroups?.forEach((group: any) => {
        const isMember = group.study_group_members?.some((member: any) => member.student_id === user.id)
        
        items.push({
          id: group.id,
          type: "study_group",
          title: `Study Group: ${group.name}`,
          description: `${group.subject} - ${group.study_group_members?.length || 0} members`,
          author: group.faculty?.name || "Faculty",
          time: getRelativeTime(group.created_at),
          urgent: false,
          department: group.department,
          redirectUrl: `/student-dashboard/study-groups`,
          metadata: {
            subject: group.subject,
            members: group.study_group_members?.length || 0,
            maxMembers: group.max_members,
            status: isMember ? 'Joined' : 'Available'
          }
        })
      })

      // Process events
      data.events?.forEach((event: any) => {
        const eventDate = new Date(event.event_date)
        const now = new Date()
        const isUrgent = eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // Event within 24 hours

        items.push({
          id: event.id,
          type: "event",
          title: `Event: ${event.title}`,
          description: event.description || `Event on ${eventDate.toLocaleDateString()}`,
          author: event.faculty?.name || "Event Organizer",
          time: getRelativeTime(event.created_at),
          urgent: isUrgent,
          department: event.department || "All Departments",
          redirectUrl: `/student-dashboard/events`,
          metadata: {
            eventDate: event.event_date,
            location: event.location,
            status: event.status
          }
        })
      })

      // Sort by creation time (newest first)
      items.sort((a, b) => {
        const timeA = new Date(a.time.includes('ago') ? Date.now() : a.time).getTime()
        const timeB = new Date(b.time.includes('ago') ? Date.now() : b.time).getTime()
        return timeB - timeA
      })
      
      setHubItems(items)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error("Error loading today's hub data:", error)
      toast({
        title: "Error",
        description: "Failed to load today's hub data. Please try refreshing.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  const setupRealtimeSubscriptions = (user: Student) => {
    // Subscribe to assignments changes for student's department and year
    const assignmentsChannel = supabase
      .channel('student_assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        (payload) => {
          // Check if assignment is relevant to student
          const assignment = payload.new as Assignment || payload.old as Assignment
          if (assignment && assignment.department === user.department && 
              assignment.target_years && assignment.target_years.includes(user.year)) {
            console.log('Relevant assignment change:', payload)
            loadTodaysHubData(user)
            
            if (payload.eventType === 'INSERT' && payload.new.status === 'published') {
              toast({
                title: "New Assignment",
                description: `Assignment "${payload.new.title}" has been published.`,
              })
            }
          }
        }
      )
      .subscribe()

    // Subscribe to announcements changes
    const announcementsChannel = supabase
      .channel('student_announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          const announcement = payload.new as Announcement || payload.old as Announcement
          if (announcement && (!announcement.department || announcement.department === user.department)) {
            console.log('Relevant announcement change:', payload)
            loadTodaysHubData(user)
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Announcement",
                description: `"${payload.new.title}" has been posted.`,
              })
            }
          }
        }
      )
      .subscribe()

    // Subscribe to study groups changes
    const studyGroupsChannel = supabase
      .channel('student_study_groups')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups'
        },
        (payload) => {
          const group = payload.new as StudyGroup || payload.old as StudyGroup
          if (group && group.department === user.department && 
              group.target_years && group.target_years.includes(user.year)) {
            console.log('Relevant study group change:', payload)
            loadTodaysHubData(user)
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Study Group",
                description: `Study group "${payload.new.name}" has been created.`,
              })
            }
          }
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(assignmentsChannel)
      supabase.removeChannel(announcementsChannel)
      supabase.removeChannel(studyGroupsChannel)
    }
  }

  const filterItems = () => {
    let filtered = hubItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType)
    }

    setFilteredItems(filtered)
  }

  const handleItemClick = (item: TodaysHubItem) => {
    router.push(item.redirectUrl)
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4" />
      case 'announcement': return <FileText className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'study_group': return <Users className="h-4 w-4" />
      case 'attendance': return <GraduationCap className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getItemColor = (type: string, urgent: boolean) => {
    if (urgent) return 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100'
    switch (type) {
      case 'assignment': return 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100'
      case 'announcement': return 'border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100'
      case 'event': return 'border-l-4 border-l-purple-500 bg-purple-50 hover:bg-purple-100'
      case 'study_group': return 'border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100'
      case 'attendance': return 'border-l-4 border-l-indigo-500 bg-indigo-50 hover:bg-indigo-100'
      default: return 'border-l-4 border-l-gray-500 bg-gray-50 hover:bg-gray-100'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment': return 'Assignment'
      case 'announcement': return 'Announcement'
      case 'event': return 'Event'
      case 'study_group': return 'Study Group'
      case 'attendance': return 'Attendance'
      default: return 'Notification'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
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
        className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Today's Hub
            </h1>
            <p className="text-emerald-100">
              Stay updated with all activities in {currentUser?.department || "your department"} - {currentUser?.year || "your year"} year
            </p>
            <p className="text-xs text-emerald-200 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <div className="text-sm text-emerald-200">Updates</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentUser && loadTodaysHubData(currentUser)}
              className="mt-2 text-emerald-200 hover:text-white hover:bg-emerald-700"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="study_group">Study Groups</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hub Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "All caught up! No new updates at the moment."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getItemColor(item.type, item.urgent)}`}
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${item.urgent ? 'bg-red-100 text-red-600' : 'bg-white text-gray-600'}`}>
                        {getItemIcon(item.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                          {item.title}
                          {item.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                      
                      {item.metadata && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {item.dueDate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/student-dashboard/assignments")}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">View Assignments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/student-dashboard/attendance")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/student-dashboard/study-groups")}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs">Study Groups</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/student-dashboard/events")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Events</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
