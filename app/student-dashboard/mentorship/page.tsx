"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  XCircle,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { initializeDatabase } from "@/app/actions/database-actions"

export default function StudentMentorshipDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [mentor, setMentor] = useState<any>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [pastMeetings, setPastMeetings] = useState([])
  const [helpMessage, setHelpMessage] = useState("")
  const [isConfidential, setIsConfidential] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        return user.id
      }
      return null
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = await fetchCurrentUser()

        if (!userId) {
          setError("User not authenticated")
          return
        }

        // Fetch mentor
        const { data: mentorData, error: mentorError } = await supabase
          .from("mentorships")
          .select("*, faculty:faculty_id(*)")
          .eq("student_id", userId)
          .eq("status", "active")
          .single()

        if (mentorError && mentorError.code !== "PGRST116") {
          setError("Failed to fetch mentor. The database tables might not exist yet.")
          return
        }

        if (mentorData) {
          setMentor(mentorData)

          // Fetch upcoming meetings
          const now = new Date().toISOString()
          const { data: upcomingMeetingsData, error: upcomingMeetingsError } = await supabase
            .from("mentorship_meeting_attendees")
            .select("*, meeting:meeting_id(*)")
            .eq("student_id", userId)
            .gte("meeting:meeting_id.meeting_date", now)
            .order("meeting:meeting_id.meeting_date", { ascending: true })

          if (!upcomingMeetingsError) {
            setUpcomingMeetings(upcomingMeetingsData)
          }

          // Fetch past meetings
          const { data: pastMeetingsData, error: pastMeetingsError } = await supabase
            .from("mentorship_meeting_attendees")
            .select("*, meeting:meeting_id(*)")
            .eq("student_id", userId)
            .lt("meeting:meeting_id.meeting_date", now)
            .order("meeting:meeting_id.meeting_date", { ascending: false })

          if (!pastMeetingsError) {
            setPastMeetings(pastMeetingsData)
          }
        }

        setError(null)
      } catch (error: any) {
        console.error("Error fetching mentorship data:", error)
        setError(error?.message || "An unexpected error occurred. The database tables might not exist yet.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true)
      const result = await initializeDatabase()

      if (result.success) {
        toast({
          title: "Success",
          description: "Database initialized successfully. Refreshing data...",
        })

        // Refresh the page to fetch data again
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize database. Please try again.",
          variant: "destructive",
        })
      }
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

  const handleSendHelpRequest = async () => {
    if (!helpMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("mentorship_help_requests").insert({
        student_id: currentUser.id,
        faculty_id: mentor.faculty_id,
        message: helpMessage,
        is_confidential: isConfidential,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Help request sent successfully.",
      })

      setHelpMessage("")
    } catch (error) {
      console.error("Error sending help request:", error)
      toast({
        title: "Error",
        description: "Failed to send help request. Please try again.",
        variant: "destructive",
      })
    }
  }

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
                {isInitializing ? "Initializing..." : "Initialize Database"}
                {!isInitializing && <Database className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!mentor) {
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
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Mentor Assigned</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                You don't have a mentor assigned yet. Please contact your department for assistance.
              </p>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Help
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Help from Your Mentor</DialogTitle>
              <DialogDescription>Send a message to your mentor requesting assistance.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Describe what you need help with..."
                className="min-h-[100px]"
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="confidential" className="text-sm text-gray-700">
                  Mark as confidential (only visible to your mentor)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setHelpMessage("")}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSendHelpRequest}>
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Your Mentor</h2>
              <p className="text-lg">{mentor.faculty?.name || "Unknown Faculty"}</p>
              <p className="text-gray-500">{mentor.faculty?.email || "No email available"}</p>
              <p className="text-gray-500 text-sm mt-2">
                Assigned since {new Date(mentor.start_date).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meetings" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notes">Notes & Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Scheduled mentorship sessions with your mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                  <p className="text-gray-500 mb-4">You don't have any scheduled meetings with your mentor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting: any) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{meeting.meeting?.title}</div>
                            <div className="text-sm text-gray-500">
                              {meeting.meeting?.meeting_type === "individual" ? "Individual" : "Group"} meeting
                              {meeting.meeting?.location && ` • ${meeting.meeting.location}`}
                            </div>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500 mr-3">
                                {meeting.meeting?.meeting_date &&
                                  new Date(meeting.meeting.meeting_date).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">
                                {meeting.meeting?.meeting_date &&
                                  new Date(meeting.meeting.meeting_date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                {meeting.meeting?.duration_minutes && ` (${meeting.meeting.duration_minutes} min)`}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Add to Calendar
                          </Button>
                        </div>
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
              <CardDescription>Previous mentorship sessions with your mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {pastMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No past meetings</div>
              ) : (
                <div className="space-y-4">
                  {pastMeetings.map((meeting: any) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{meeting.meeting?.title}</div>
                            <div className="text-sm text-gray-500">
                              {meeting.meeting?.meeting_type === "individual" ? "Individual" : "Group"} meeting
                              {meeting.meeting?.location && ` • ${meeting.meeting.location}`}
                            </div>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500 mr-3">
                                {meeting.meeting?.meeting_date &&
                                  new Date(meeting.meeting.meeting_date).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">
                                {meeting.meeting?.meeting_date &&
                                  new Date(meeting.meeting.meeting_date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center">
                              {meeting.attended ? (
                                <div className="flex items-center text-green-600 text-sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Attended
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600 text-sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Missed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {meeting.feedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <div className="text-sm font-medium mb-1">Feedback from Mentor</div>
                            <div className="text-sm">{meeting.feedback}</div>
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

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Feedback</CardTitle>
              <CardDescription>Feedback and notes from your mentorship sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
                <p className="text-gray-500 mb-4">Your mentor hasn't shared any notes or feedback yet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
