"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Calendar,
  Clock,
  UserPlus,
  FileText,
  AlertTriangle,
  Download,
  PlusCircle,
  CheckCircle,
  XCircle,
  Database,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from '@/lib/supabase/client'

export default function MentorshipDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [mentees, setMentees] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [pastMeetings, setPastMeetings] = useState([])
  const [statistics, setStatistics] = useState({
    totalMentees: 0,
    totalMeetings: 0,
    attendedMeetings: 0,
    missedMeetings: 0,
    nextMeeting: null,
  })
  const [helpRequests, setHelpRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingType, setMeetingType] = useState("individual")
  const [meetingLocation, setMeetingLocation] = useState("")
  const [meetingDuration, setMeetingDuration] = useState(30)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [showMeetingDetailsDialog, setShowMeetingDetailsDialog] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false)
  const [selectedMentee, setSelectedMentee] = useState(null)
  const [noteText, setNoteText] = useState("")
  const [isConfidential, setIsConfidential] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id

        if (!userId) {
          setError("User not authenticated")
          return
        }

        setCurrentUser(userData.user)

        // Fetch mentees
        const { data: menteesData, error: menteesError } = await supabase
          .from("mentorships")
          .select("*, student:student_id(*)")
          .eq("faculty_id", userId)
          .eq("status", "active")

        if (menteesError) {
          setError("Failed to fetch mentees. The database tables might not exist yet.")
          return
        }

        setMentees(menteesData || [])

        // Fetch upcoming meetings
        const now = new Date().toISOString()
        const { data: upcomingMeetingsData, error: upcomingMeetingsError } = await supabase
          .from("mentorship_meetings")
          .select("*")
          .eq("faculty_id", userId)
          .gte("meeting_date", now)
          .order("meeting_date", { ascending: true })

        if (!upcomingMeetingsError) {
          // Fetch attendees for each meeting
          const meetingsWithAttendees = await Promise.all(
            (upcomingMeetingsData || []).map(async (meeting) => {
              const { data: attendees, error: attendeesError } = await supabase
                .from("mentorship_meeting_attendees")
                .select("*, student:student_id(*)")
                .eq("meeting_id", meeting.id)

              return {
                ...meeting,
                attendees: attendeesError ? [] : attendees || [],
              }
            }),
          )

          setUpcomingMeetings(meetingsWithAttendees)
        }

        // Fetch past meetings
        const { data: pastMeetingsData, error: pastMeetingsError } = await supabase
          .from("mentorship_meetings")
          .select("*")
          .eq("faculty_id", userId)
          .lt("meeting_date", now)
          .order("meeting_date", { ascending: false })

        if (!pastMeetingsError) {
          // Fetch attendees for each meeting
          const meetingsWithAttendees = await Promise.all(
            (pastMeetingsData || []).map(async (meeting) => {
              const { data: attendees, error: attendeesError } = await supabase
                .from("mentorship_meeting_attendees")
                .select("*, student:student_id(*)")
                .eq("meeting_id", meeting.id)

              return {
                ...meeting,
                attendees: attendeesError ? [] : attendees || [],
              }
            }),
          )

          setPastMeetings(meetingsWithAttendees)
        }

        // Fetch help requests
        const { data: helpRequestsData, error: helpRequestsError } = await supabase
          .from("mentorship_help_requests")
          .select("*, student:student_id(*)")
          .eq("faculty_id", userId)
          .order("created_at", { ascending: false })

        if (!helpRequestsError) {
          setHelpRequests(helpRequestsData || [])
        }

        // Calculate statistics
        const totalMentees = menteesData?.length || 0
        const totalMeetings = (pastMeetingsData?.length || 0) + (upcomingMeetingsData?.length || 0)

        let attendedCount = 0
        let missedCount = 0

        // Count attended and missed meetings
        for (const meeting of pastMeetingsData || []) {
          const { data: attendees } = await supabase
            .from("mentorship_meeting_attendees")
            .select("attended")
            .eq("meeting_id", meeting.id)

          for (const attendee of attendees || []) {
            if (attendee.attended) {
              attendedCount++
            } else {
              missedCount++
            }
          }
        }

        setStatistics({
          totalMentees,
          totalMeetings,
          attendedMeetings: attendedCount,
          missedMeetings: missedCount,
          nextMeeting: upcomingMeetingsData && upcomingMeetingsData.length > 0 ? upcomingMeetingsData[0] : null,
        })

        // Fetch all students for assignment
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*")
          .order("name", { ascending: true })

        if (!studentsError) {
          setStudents(studentsData || [])
        }

        setError(null)
      } catch (error) {
        console.error("Error fetching mentorship data:", error)
        setError("An unexpected error occurred. The database tables might not exist yet.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true)

      // Create tables
      await fetch("/api/database/initialize", { method: "POST" })

      // Seed database
      await fetch("/api/database/seed", { method: "POST" })

      toast({
        title: "Success",
        description: "Database initialized and seeded successfully. Refreshing data...",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const handleAssignMentees = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      // Create mentorships for each selected student
      for (const studentId of selectedStudents) {
        const { error } = await supabase.from("mentorships").insert({
          faculty_id: currentUser.id,
          student_id: studentId,
          status: "active",
        })

        if (error && error.code !== "23505") {
          // Ignore duplicate key errors
          throw error
        }
      }

      toast({
        title: "Success",
        description: `${selectedStudents.length} mentees assigned successfully.`,
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error assigning mentees:", error)
      toast({
        title: "Error",
        description: "Failed to assign mentees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowAssignDialog(false)
      setSelectedStudents([])
    }
  }

  const handleScheduleMeeting = async () => {
    if (!meetingTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting title.",
        variant: "destructive",
      })
      return
    }

    if (!meetingDate) {
      toast({
        title: "Error",
        description: "Please select a meeting date and time.",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one mentee.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      // Create the meeting
      const { data: meeting, error: meetingError } = await supabase
        .from("mentorship_meetings")
        .insert({
          faculty_id: currentUser.id,
          title: meetingTitle,
          description: meetingDescription,
          meeting_type: meetingType,
          meeting_date: new Date(meetingDate).toISOString(),
          duration_minutes: meetingDuration,
          location: meetingLocation,
        })
        .select()
        .single()

      if (meetingError) throw meetingError

      // Add attendees
      const attendees = selectedStudents.map((studentId) => ({
        meeting_id: meeting.id,
        student_id: studentId,
      }))

      const { error: attendeesError } = await supabase.from("mentorship_meeting_attendees").insert(attendees)

      if (attendeesError) throw attendeesError

      toast({
        title: "Success",
        description: "Meeting scheduled successfully.",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowScheduleDialog(false)
      setMeetingTitle("")
      setMeetingDescription("")
      setMeetingDate("")
      setMeetingType("individual")
      setMeetingLocation("")
      setMeetingDuration(30)
      setSelectedStudents([])
    }
  }

  const handleViewMeetingDetails = async (meeting) => {
    setSelectedMeeting(meeting)

    try {
      const supabase = createClient()

      // Fetch attendees with attendance data
      const { data: attendees, error: attendeesError } = await supabase
        .from("mentorship_meeting_attendees")
        .select("*, student:student_id(*)")
        .eq("meeting_id", meeting.id)

      if (attendeesError) throw attendeesError

      setAttendanceData(attendees || [])
      setShowMeetingDetailsDialog(true)
    } catch (error) {
      console.error("Error fetching meeting details:", error)
      toast({
        title: "Error",
        description: "Failed to load meeting details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAttendance = async (attendeeId, attended) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("mentorship_meeting_attendees").update({ attended }).eq("id", attendeeId)

      if (error) throw error

      // Update local state
      setAttendanceData(
        attendanceData.map((attendee) => (attendee.id === attendeeId ? { ...attendee, attended } : attendee)),
      )

      toast({
        title: "Success",
        description: "Attendance updated successfully.",
      })
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddFeedback = async (attendeeId, feedback) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("mentorship_meeting_attendees").update({ feedback }).eq("id", attendeeId)

      if (error) throw error

      // Update local state
      setAttendanceData(
        attendanceData.map((attendee) => (attendee.id === attendeeId ? { ...attendee, feedback } : attendee)),
      )

      toast({
        title: "Success",
        description: "Feedback added successfully.",
      })
    } catch (error) {
      console.error("Error adding feedback:", error)
      toast({
        title: "Error",
        description: "Failed to add feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.from("mentorship_notes").insert({
        faculty_id: currentUser.id,
        student_id: selectedMentee.id,
        note: noteText,
        is_confidential: isConfidential,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Note added successfully.",
      })

      setShowAddNoteDialog(false)
      setNoteText("")
      setIsConfidential(true)
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleHelpRequestStatusChange = async (requestId, status) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("mentorship_help_requests").update({ status }).eq("id", requestId)

      if (error) throw error

      // Update local state
      setHelpRequests(helpRequests.map((request) => (request.id === requestId ? { ...request, status } : request)))

      toast({
        title: "Success",
        description: `Help request marked as ${status}.`,
      })
    } catch (error) {
      console.error("Error updating help request:", error)
      toast({
        title: "Error",
        description: "Failed to update help request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    toast({
      title: "Export Started",
      description: "Your report is being generated and will download shortly.",
    })
  }

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (searchQuery === "") return true

    const query = searchQuery.toLowerCase()
    return (
      student.name?.toLowerCase().includes(query) ||
      student.prn?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    )
  })

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="inline-block mr-2 h-6 w-6 text-blue-600" />
            Mentorship Dashboard
          </h1>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <Database className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Database Setup Required</h2>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <Button onClick={handleInitializeDatabase} disabled={isInitializing} className="flex items-center">
                {isInitializing ? "Setting up database..." : "Initialize & Seed Database"}
                {!isInitializing && <Database className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="inline-block mr-2 h-6 w-6 text-blue-600" />
          Mentorship Dashboard
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAssignDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Mentees
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
          <Button variant="outline" onClick={handleExportReport} className="border-blue-600 text-blue-600">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mentees">Mentees</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="help-requests">Help Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalMentees}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Meeting Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{statistics.attendedMeetings}</div>
                  <div className="text-xs text-gray-500">attended</div>
                  <div className="mx-1 text-gray-300">|</div>
                  <div className="text-2xl font-bold">{statistics.missedMeetings}</div>
                  <div className="text-xs text-gray-500">missed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.nextMeeting ? (
                  <div>
                    <div className="text-lg font-semibold">{statistics.nextMeeting.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(statistics.nextMeeting.meeting_date).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No upcoming meetings</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Help Requests</CardTitle>
                <CardDescription>Students who need assistance</CardDescription>
              </CardHeader>
              <CardContent>
                {helpRequests.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No help requests</div>
                ) : (
                  <div className="space-y-4">
                    {helpRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            request.status === "pending"
                              ? "text-orange-500"
                              : request.status === "in_progress"
                                ? "text-blue-500"
                                : "text-green-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{request.student?.name || "Unknown Student"}</div>
                          <div className="text-sm text-gray-500">{request.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(request.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {helpRequests.length > 0 && (
                <CardFooter>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("help-requests")}>
                    View all requests
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Your scheduled mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No upcoming meetings</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.slice(0, 3).map((meeting) => (
                      <div key={meeting.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          <div className="text-sm text-gray-500">
                            {meeting.meeting_type === "individual" ? "Individual" : "Group"} meeting
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(meeting.meeting_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {upcomingMeetings.length > 0 && (
                <CardFooter>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("meetings")}>
                    View all meetings
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mentees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Mentees</CardTitle>
              <CardDescription>Students assigned to you for mentorship</CardDescription>
            </CardHeader>
            <CardContent>
              {mentees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mentees assigned</h3>
                  <p className="text-gray-500 mb-4">Assign students as your mentees to get started.</p>
                  <Button onClick={() => setShowAssignDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Mentees
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentees.map((mentee) => (
                    <Card key={mentee.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="font-medium">{mentee.student?.name || "Unknown Student"}</div>
                          <div className="text-sm text-gray-500">{mentee.student?.email || "No email"}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Assigned: {new Date(mentee.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 rounded-none py-2 h-auto"
                            onClick={() => {
                              setSelectedMentee(mentee.student)
                              setShowAddNoteDialog(true)
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Add Note
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 rounded-none py-2 h-auto"
                            onClick={() => {
                              setSelectedStudents([mentee.student_id])
                              setShowScheduleDialog(true)
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Scheduled mentorship sessions</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                  <p className="text-gray-500 mb-4">Schedule a meeting to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{meeting.title}</div>
                            <div className="text-sm text-gray-500">
                              {meeting.meeting_type === "individual" ? "Individual" : "Group"} meeting
                              {meeting.location && ` • ${meeting.location}`}
                            </div>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500 mr-3">
                                {new Date(meeting.meeting_date).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">
                                {new Date(meeting.meeting_date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {meeting.duration_minutes && ` (${meeting.duration_minutes} min)`}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewMeetingDetails(meeting)}>
                              View Details
                            </Button>
                          </div>
                        </div>

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium mb-2">Attendees ({meeting.attendees.length})</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {meeting.attendees.slice(0, 4).map((attendee) => (
                                <div key={attendee.id} className="text-sm flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                  {attendee.student?.name || "Unknown Student"}
                                </div>
                              ))}
                              {meeting.attendees.length > 4 && (
                                <div className="text-sm text-gray-500">+{meeting.attendees.length - 4} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Meetings</CardTitle>
              <CardDescription>Previous mentorship sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {pastMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No past meetings</div>
              ) : (
                <div className="space-y-4">
                  {pastMeetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{meeting.title}</div>
                            <div className="text-sm text-gray-500">
                              {meeting.meeting_type === "individual" ? "Individual" : "Group"} meeting
                              {meeting.location && ` • ${meeting.location}`}
                            </div>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500 mr-3">
                                {new Date(meeting.meeting_date).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">
                                {new Date(meeting.meeting_date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewMeetingDetails(meeting)}>
                            View Details
                          </Button>
                        </div>

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium mb-2">Attendance</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {meeting.attendees.slice(0, 4).map((attendee) => (
                                <div key={attendee.id} className="text-sm flex items-center">
                                  {attendee.attended ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                  )}
                                  {attendee.student?.name || "Unknown Student"}
                                </div>
                              ))}
                              {meeting.attendees.length > 4 && (
                                <div className="text-sm text-gray-500">+{meeting.attendees.length - 4} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Help Requests</CardTitle>
              <CardDescription>Students who need assistance</CardDescription>
            </CardHeader>
            <CardContent>
              {helpRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No help requests</h3>
                  <p className="text-gray-500">When students request help, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                request.status === "pending"
                                  ? "bg-orange-100"
                                  : request.status === "in_progress"
                                    ? "bg-blue-100"
                                    : "bg-green-100"
                              }`}
                            >
                              <AlertTriangle
                                className={`h-5 w-5 ${
                                  request.status === "pending"
                                    ? "text-orange-500"
                                    : request.status === "in_progress"
                                      ? "text-blue-500"
                                      : "text-green-500"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{request.student?.name || "Unknown Student"}</div>
                              <div className="text-sm text-gray-500">
                                {request.is_confidential && (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 mr-2">
                                    Confidential
                                  </span>
                                )}
                                {request.status === "pending" && "Pending"}
                                {request.status === "in_progress" && "In Progress"}
                                {request.status === "resolved" && "Resolved"}
                              </div>
                              <div className="text-sm mt-2">{request.message}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(request.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {request.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleHelpRequestStatusChange(request.id, "in_progress")}
                              >
                                Start Helping
                              </Button>
                            )}
                            {request.status === "in_progress" && (
                              <Button size="sm" onClick={() => handleHelpRequestStatusChange(request.id, "resolved")}>
                                Mark as Resolved
                              </Button>
                            )}
                            {request.status === "resolved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleHelpRequestStatusChange(request.id, "pending")}
                              >
                                Reopen
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Mentees Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Mentees</DialogTitle>
            <DialogDescription>Select students to assign as your mentees.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-3 text-sm font-medium text-gray-500">
                <div className="col-span-1"></div>
                <div className="col-span-5">Name</div>
                <div className="col-span-3">PRN</div>
                <div className="col-span-3">Department</div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudents.includes(student.id)
                  const isAlreadyMentee = mentees.some((m) => m.student_id === student.id)

                  return (
                    <div
                      key={student.id}
                      className={`grid grid-cols-12 p-3 items-center ${
                        isAlreadyMentee ? "bg-gray-100 opacity-50" : isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="col-span-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleStudentSelect(student.id)}
                          id={`student-${student.id}`}
                          disabled={isAlreadyMentee}
                        />
                      </div>
                      <label
                        htmlFor={`student-${student.id}`}
                        className={`col-span-5 flex items-center ${isAlreadyMentee ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{student.name?.charAt(0) || "S"}</AvatarFallback>
                        </Avatar>
                        {student.name}
                        {isAlreadyMentee && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Already Assigned
                          </Badge>
                        )}
                      </label>
                      <div className="col-span-3">
                        <Badge variant="outline" className="font-mono">
                          {student.prn}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-sm text-gray-500">{student.department || "N/A"}</div>
                    </div>
                  )
                })}
                {filteredStudents.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No students found</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignDialog(false)
                setSelectedStudents([])
                setSearchQuery("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignMentees} disabled={selectedStudents.length === 0}>
              Assign {selectedStudents.length} {selectedStudents.length === 1 ? "Student" : "Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Schedule a meeting with your mentees.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                placeholder="Enter meeting title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-description">Description (Optional)</Label>
              <Textarea
                id="meeting-description"
                placeholder="Enter meeting description"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-date">Date & Time</Label>
                <Input
                  id="meeting-date"
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-type">Meeting Type</Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger id="meeting-type">
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-location">Location (Optional)</Label>
                <Input
                  id="meeting-location"
                  placeholder="Enter meeting location"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-duration">Duration (minutes)</Label>
                <Select
                  value={meetingDuration.toString()}
                  onValueChange={(value) => setMeetingDuration(Number.parseInt(value))}
                >
                  <SelectTrigger id="meeting-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Select Attendees</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {selectedStudents.length} selected
                </Badge>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-100 p-3 text-sm font-medium text-gray-500">
                  <div className="col-span-1"></div>
                  <div className="col-span-11">Mentee</div>
                </div>
                <div className="divide-y max-h-[200px] overflow-y-auto">
                  {mentees.map((mentee) => {
                    const isSelected = selectedStudents.includes(mentee.student_id)

                    return (
                      <div
                        key={mentee.id}
                        className={`grid grid-cols-12 p-3 items-center ${
                          isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleStudentSelect(mentee.student_id)}
                            id={`mentee-${mentee.id}`}
                          />
                        </div>
                        <label htmlFor={`mentee-${mentee.id}`} className="col-span-11 flex items-center cursor-pointer">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>{mentee.student?.name?.charAt(0) || "S"}</AvatarFallback>
                          </Avatar>
                          {mentee.student?.name || "Unknown Student"}
                        </label>
                      </div>
                    )
                  })}
                  {mentees.length === 0 && <div className="p-4 text-center text-gray-500">No mentees assigned yet</div>}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleDialog(false)
                setMeetingTitle("")
                setMeetingDescription("")
                setMeetingDate("")
                setMeetingType("individual")
                setMeetingLocation("")
                setMeetingDuration(30)
                setSelectedStudents([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleMeeting}
              disabled={!meetingTitle.trim() || !meetingDate || selectedStudents.length === 0}
            >
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog open={showMeetingDetailsDialog} onOpenChange={setShowMeetingDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.meeting_type === "individual" ? "Individual" : "Group"} meeting on{" "}
              {selectedMeeting?.meeting_date && new Date(selectedMeeting.meeting_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedMeeting?.title}</h3>
              <p className="text-sm text-gray-500">{selectedMeeting?.description}</p>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500 mr-3">
                  {selectedMeeting?.meeting_date && new Date(selectedMeeting.meeting_date).toLocaleDateString()}
                </span>
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">
                  {selectedMeeting?.meeting_date &&
                    new Date(selectedMeeting.meeting_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  {selectedMeeting?.duration_minutes && ` (${selectedMeeting.duration_minutes} min)`}
                </span>
              </div>
              {selectedMeeting?.location && (
                <div className="text-sm text-gray-500 mt-1">Location: {selectedMeeting.location}</div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Attendees</h4>
              <div className="space-y-3">
                {attendanceData.map((attendee) => (
                  <Card key={attendee.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{attendee.student?.name?.charAt(0) || "S"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.student?.name || "Unknown Student"}</div>
                            <div className="text-xs text-gray-500">{attendee.student?.email}</div>
                          </div>
                        </div>

                        {new Date(selectedMeeting?.meeting_date) < new Date() && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${attendee.attended ? "bg-green-50 text-green-700" : ""}`}
                              onClick={() => handleUpdateAttendance(attendee.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Attended
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${attendee.attended === false ? "bg-red-50 text-red-700" : ""}`}
                              onClick={() => handleUpdateAttendance(attendee.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Missed
                            </Button>
                          </div>
                        )}
                      </div>

                      {new Date(selectedMeeting?.meeting_date) < new Date() && (
                        <div className="mt-3">
                          <Label htmlFor={`feedback-${attendee.id}`} className="text-sm">
                            Feedback / Notes
                          </Label>
                          <div className="flex mt-1">
                            <Textarea
                              id={`feedback-${attendee.id}`}
                              placeholder="Add feedback or notes about this mentee..."
                              value={attendee.feedback || ""}
                              onChange={(e) => {
                                setAttendanceData(
                                  attendanceData.map((a) =>
                                    a.id === attendee.id ? { ...a, feedback: e.target.value } : a,
                                  ),
                                )
                              }}
                              className="text-sm min-h-[60px]"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() =>
                                handleAddFeedback(
                                  attendee.id,
                                  attendanceData.find((a) => a.id === attendee.id)?.feedback || "",
                                )
                              }
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMeetingDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Note for {selectedMentee?.name}</DialogTitle>
            <DialogDescription>Add a note about this mentee for future reference.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
            />
            <div className="flex items-center space-x-2">
              <Checkbox id="confidential" checked={isConfidential} onCheckedChange={setIsConfidential} />
              <Label htmlFor="confidential">Mark as confidential (only visible to you)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddNoteDialog(false)
                setNoteText("")
                setIsConfidential(true)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!noteText.trim()}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
