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
import { useRealtimeData } from "@/components/realtime/RealtimeDataProvider"
import { supabase } from "@/lib/supabase-realtime"
import { toast } from "@/hooks/use-toast"

interface FacultyHubItem {
  id: string
  type: "assignment" | "announcement" | "event" | "study_group" | "attendance" | "submission" | "query"
  title: string
  description: string
  author: string
  time: string
  urgent: boolean
  department: string
  redirectUrl: string
  metadata?: any
  targetYears?: string[]
  status?: string
}

export default function FacultyTodaysHubPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hubItems, setHubItems] = useState<FacultyHubItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FacultyHubItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const facultyData = localStorage.getItem("facultySession")
        const currentUserData = localStorage.getItem("currentUser")
        
        let user = null
        if (facultyData) {
          user = JSON.parse(facultyData)
        } else if (currentUserData) {
          user = JSON.parse(currentUserData)
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
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const loadTodaysHubData = async (user: any) => {
    try {
      setIsLoading(true)
      
      // Fetch data from API instead of localStorage
      const response = await fetch(
        `/api/todays-hub?user_id=${user.id}&user_type=faculty&department=${user.department}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s hub data')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data')
      }
      
      const data = result.data
      const items: FacultyHubItem[] = []
      
      // Process assignments
      data.assignments?.forEach((assignment: any) => {
        items.push({
          id: assignment.id,
          type: "assignment",
          title: `Assignment: ${assignment.title}`,
          description: `${assignment.assignment_type || 'Assignment'} - Due: ${new Date(assignment.due_date).toLocaleDateString()}`,
          author: "You",
          time: getRelativeTime(assignment.created_at),
          urgent: assignment.status === 'draft',
          department: assignment.department || user.department,
          redirectUrl: `/dashboard/assignments/manage/${assignment.id}`,
          targetYears: assignment.target_years,
          status: assignment.status,
          metadata: {
            type: assignment.assignment_type,
            maxMarks: assignment.max_marks,
            submissions: assignment.assignment_submissions?.length || 0,
            targetYears: assignment.target_years?.join(', ') || 'All years'
          }
        })
      })
      
      // Process announcements
      data.announcements?.forEach((announcement: any) => {
        items.push({
          id: announcement.id,
          type: "announcement",
          title: announcement.title,
          description: announcement.content.substring(0, 100) + '...',
          author: "You",
          time: getRelativeTime(announcement.created_at),
          urgent: announcement.priority === 'urgent' || announcement.priority === 'high',
          department: announcement.department || "All Departments",
          redirectUrl: `/dashboard/announcements`,
          targetYears: announcement.target_years,
          metadata: {
            priority: announcement.priority,
            audience: announcement.target_audience,
            targetYears: announcement.target_years?.join(', ') || 'All years'
          }
        })
      })
      
      // Process recent submissions
      data.submissions?.forEach((submission: any) => {
        items.push({
          id: submission.id,
          type: "submission",
          title: `New Submission: ${submission.assignment?.title}`,
          description: `Submitted by ${submission.student?.name} ${submission.is_late ? '(Late)' : ''}`,
          author: submission.student?.name || 'Student',
          time: getRelativeTime(submission.submitted_at),
          urgent: submission.is_late,
          department: user.department,
          redirectUrl: `/dashboard/assignments/manage/${submission.assignment_id}`,
          metadata: {
            studentName: submission.student?.name,
            studentPRN: submission.student?.prn,
            isLate: submission.is_late ? 'Yes' : 'No',
            status: submission.grade ? 'Graded' : 'Pending'
          }
        })
      })
      
      // Process study groups
      data.studyGroups?.forEach((group: any) => {
        items.push({
          id: group.id,
          type: "study_group",
          title: `Study Group: ${group.name}`,
          description: `${group.subject} - ${group.study_group_members?.length || 0} members`,
          author: "You",
          time: getRelativeTime(group.created_at),
          urgent: false,
          department: group.department,
          redirectUrl: `/dashboard/study-groups`,
          targetYears: group.target_years,
          metadata: {
            subject: group.subject,
            members: group.study_group_members?.length || 0,
            maxMembers: group.max_members,
            status: group.status
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
  
  const setupRealtimeSubscriptions = (user: any) => {
    // Subscribe to assignments changes
    const assignmentsChannel = supabase
      .channel('faculty_assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `faculty_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Assignment change:', payload)
          loadTodaysHubData(user)
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Assignment Created",
              description: `Assignment "${payload.new.title}" has been created.`,
            })
          }
        }
      )
      .subscribe()

    // Subscribe to announcements changes
    const announcementsChannel = supabase
      .channel('faculty_announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `faculty_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Announcement change:', payload)
          loadTodaysHubData(user)
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Announcement Posted",
              description: `Announcement "${payload.new.title}" has been posted.`,
            })
          }
        }
      )
      .subscribe()

    // Subscribe to assignment submissions
    const submissionsChannel = supabase
      .channel('assignment_submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_submissions'
        },
        async (payload) => {
          // Check if this submission is for faculty's assignment
          const { data: assignment } = await supabase
            .from('assignments')
            .select('faculty_id, title')
            .eq('id', payload.new.assignment_id)
            .single()
          
          if (assignment?.faculty_id === user.id) {
            console.log('New submission for faculty:', payload)
            loadTodaysHubData(user)
            
            toast({
              title: "New Submission",
              description: `A student has submitted "${assignment.title}".`,
            })
          }
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(assignmentsChannel)
      supabase.removeChannel(announcementsChannel)
      supabase.removeChannel(submissionsChannel)
    }
  }

  useEffect(() => {
    filterItems()
  }, [hubItems, searchTerm, filterType])

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
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

  const handleItemClick = (item: FacultyHubItem) => {
    router.push(item.redirectUrl)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4" />
      case 'announcement': return <FileText className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'study_group': return <Users className="h-4 w-4" />
      case 'attendance': return <GraduationCap className="h-4 w-4" />
      case 'submission': return <MessageCircle className="h-4 w-4" />
      case 'query': return <AlertCircle className="h-4 w-4" />
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
      case 'submission': return 'border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100'
      case 'query': return 'border-l-4 border-l-pink-500 bg-pink-50 hover:bg-pink-100'
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
      case 'submission': return 'Submission'
      case 'query': return 'Query'
      default: return 'Item'
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
        className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Today's Hub
            </h1>
            <p className="text-blue-100">
              Stay updated with all activities in {currentUser?.department || "your department"}
            </p>
            <p className="text-xs text-blue-200 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <div className="text-sm text-blue-200">Items</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentUser && loadTodaysHubData(currentUser)}
              className="mt-2 text-blue-200 hover:text-white hover:bg-blue-700"
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
                  placeholder="Search notifications..."
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
                <SelectItem value="submission">Submissions</SelectItem>
                <SelectItem value="query">Queries</SelectItem>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "All caught up! No new items at the moment."
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
                          {item.status === 'draft' && (
                            <Badge variant="outline" className="text-xs">
                              Draft
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
                      
                      {item.targetYears && item.targetYears.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Target: {item.targetYears.join(', ')} year
                          </Badge>
                        </div>
                      )}
                      
                      {item.metadata && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
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
              onClick={() => router.push("/dashboard/assignments/create")}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Create Assignment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/dashboard/announcements")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Post Announcement</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/dashboard/attendance")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => router.push("/dashboard/compiler")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Coding Exam</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
