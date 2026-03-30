"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Calendar,
  Plus,
  Search,
  UserPlus,
  MessageSquare,
  Info,
  Database,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  FileText,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface StudyGroup {
  id: string
  name: string
  subject: string
  faculty_id: string
  faculty: string
  description: string
  max_members: number
  department: string
  year: string
  objectives: string
  group_purpose: string
  learning_goals: string
  expected_outcomes: string
  enable_task_scheduling: boolean
  task_frequency: string
  require_submissions: boolean
  allow_materials: boolean
  enable_file_uploads: boolean
  enable_messaging: boolean
  auto_notifications: boolean
  let_students_decide: boolean
  created_at: string
  updated_at: string
}

interface StudyGroupMember {
  id: string
  study_group_id: string
  student_id: string
  student_name: string
  student_email: string
  joined_at: string
}

interface StudentProfile {
  id: string
  name: string
  email: string
  prn: string
  department: string
  year: string
}

export default function StudyGroupsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("my-groups")
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])
  const [groupName, setGroupName] = useState("")
  const [maxGroupSize, setMaxGroupSize] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [groupMembers, setGroupMembers] = useState<StudyGroupMember[]>([])
  const [groupRequests, setGroupRequests] = useState<StudyGroup[]>([])
  const [selectedRequest, setSelectedRequest] = useState<StudyGroup | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [myMemberships, setMyMemberships] = useState<StudyGroupMember[]>([])

  // Chat state
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isCallActive, setIsCallActive] = useState(false)
  const [callType, setCallType] = useState("") // "audio" or "video"

  // Load student profile on mount
  useEffect(() => {
    loadStudentData()
  }, [])
  
  // Set up realtime subscription for study groups when profile is ready
  useEffect(() => {
    if (!studentProfile) return

    const channel = supabase
      .channel('study-groups-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'study_groups' },
        (payload) => {
          console.log('Study group change:', payload)
          // Simply reload to always get the freshest data and avoid stale closures
          loadStudyGroups(studentProfile.department, studentProfile.year)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'study_group_members' },
        (payload) => {
          console.log('Member change:', payload)
          loadMemberships()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [studentProfile])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to view study groups.")
        return
      }

      // Get student profile from department-specific table
      // Try to find student in any department table
      const departments = ['cse', 'aids', 'aiml', 'cyber']
      const years = ['1st_year', '2nd_year', '3rd_year', '4th_year']
      let studentData = null
      
      for (const dept of departments) {
        for (const yr of years) {
          const tableName = `students_${dept}_${yr.replace('_year', '')}`
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          
          if (data) {
            studentData = { ...data, department: dept, year: yr, tableName }
            break
          }
        }
        if (studentData) break
      }
      
      if (!studentData) {
        // Fallback: try students table
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        if (data) {
          studentData = data
        }
      }
      
      if (studentData) {
        setStudentProfile({
          id: user.id,
          name: studentData.name || 'Student',
          email: studentData.email || user.email,
          prn: studentData.prn || '',
          department: studentData.department,
          year: studentData.year
        })
        
        // Load study groups for this department/year
        await loadStudyGroups(studentData.department, studentData.year)
        await loadMemberships()
      } else {
        setError("Could not find your student profile.")
      }
      
      setError(null)
    } catch (error) {
      console.error("Error loading student data:", error)
      setError("An unexpected error occurred while loading your profile.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudyGroups = async (department: string, year: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('department', department)
        .eq('year', year)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setStudyGroups(data || [])
      
      // Filter groups where let_students_decide is true
      const requests = (data || []).filter(g => g.let_students_decide)
      setGroupRequests(requests)
    } catch (error) {
      console.error("Error loading study groups:", error)
    }
  }

  const loadMemberships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data, error: fetchError } = await supabase
        .from('study_group_members')
        .select('*')
        .eq('student_id', user.id)
      
      if (fetchError) throw fetchError
      
      setMyMemberships(data || [])
    } catch (error) {
      console.error("Error loading memberships:", error)
    }
  }

  const handleSettingSelect = async (studyGroupId: string) => {
    const group = studyGroups.find(g => g.id === studyGroupId)
    if (!group) return
    
    setSelectedGroup(group)
    setMaxGroupSize(group.max_members)

    try {
      // Normalize department to lowercase
      const normalizedDept = group.department.toLowerCase()
      // Fetch students from the same department/year
      const tableName = `students_${normalizedDept}_${group.year}`
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('id, name, prn, email')
        .limit(20)
      
      if (fetchError) {
        // Try alternative format without _year suffix
        const altTableName = `students_${normalizedDept}_${group.year.replace('_year', '')}`
        const { data: altData, error: altError } = await supabase
          .from(altTableName)
          .select('id, name, prn, email')
          .limit(20)
        
        if (altError) throw altError
        setStudents(altData || [])
      } else {
        setStudents(data || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students for this group.",
        variant: "destructive",
      })
    }
  }

  const handleRequestSelect = async (requestId: string) => {
    const request = groupRequests.find(r => r.id === requestId)
    if (!request) return
    setSelectedRequest(request)
    setMaxGroupSize(request.max_members)

    try {
      // Normalize department to lowercase
      const normalizedDept = request.department.toLowerCase()
      // Fetch real students from the same department/year
      const tableName = `students_${normalizedDept}_${request.year}`
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('id, name, email, prn')
        .limit(20)
      
      if (fetchError) {
        // Try alternative format
        const altTableName = `students_${normalizedDept}_${request.year.replace('_year', '')}`
        const { data: altData, error: altError } = await supabase
          .from(altTableName)
          .select('id, name, email, prn')
          .limit(20)
        
        if (altError) throw altError
        setStudents(altData || [])
      } else {
        setStudents(data || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students for this group.",
        variant: "destructive",
      })
    }
  }

  const handleStudentSelect = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else {
      if (selectedStudents.length < maxGroupSize) {
        setSelectedStudents([...selectedStudents, studentId])
      } else {
        toast({
          title: "Group Size Limit",
          description: `You can only select up to ${maxGroupSize} students for this group.`,
          variant: "destructive",
        })
      }
    }
  }

  const handleCreateGroupFromRequest = async () => {
    if (!selectedRequest) {
      toast({
        title: "Error",
        description: "Please select a request to create a group for.",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.length < 1) {
      toast({
        title: "Error",
        description: "Please select at least 1 other student for the group.",
        variant: "destructive",
      })
      return
    }

    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the study group.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to create a group.",
          variant: "destructive",
        })
        return
      }

      // Create student group members
      const members = selectedStudents.map(id => students.find(s => s.id === id)).filter(Boolean)
      
      // Add current user as member
      const allMembers = [
        { study_group_id: selectedRequest.id, student_id: user.id, student_name: studentProfile?.name || 'Student', student_email: studentProfile?.email },
        ...members.map(m => ({ study_group_id: selectedRequest.id, student_id: m.id, student_name: m.name, student_email: m.email }))
      ]

      // Insert members into study_group_members
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert(allMembers)

      if (memberError) throw memberError

      // Create notification for faculty
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.faculty_id,
          title: 'Study Group Formed',
          message: `Students have formed a group "${groupName}" for ${selectedRequest.subject || 'your subject'}`,
          type: 'study_group',
          reference_id: selectedRequest.id
        })

      toast({
        title: "Group Created",
        description: "Your study group has been created successfully and faculty has been notified.",
      })

      setShowRequestDialog(false)
      setSelectedRequest(null)
      setSelectedStudents([])
      setGroupName("")
      setActiveTab("my-groups")
      
      // Refresh memberships
      loadMemberships()
    } catch (error) {
      console.error("Error creating study group:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinGroup = async (group: StudyGroup) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('study_group_members')
        .select('*')
        .eq('study_group_id', group.id)
        .eq('student_id', user.id)
        .maybeSingle()
      
      if (existingMember) {
        toast({
          title: "Already Joined",
          description: "You are already a member of this group.",
        })
        return
      }
      
      // Join the group
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          study_group_id: group.id,
          student_id: user.id,
          student_name: studentProfile?.name || 'Student',
          student_email: studentProfile?.email
        })
      
      if (error) throw error
      
      toast({
        title: "Joined Group",
        description: `You have successfully joined ${group.name}.`,
      })
      
      loadMemberships()
    } catch (error) {
      console.error("Error joining group:", error)
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      })
    }
    setShowJoinDialog(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()

    // Store message in Supabase if group has a class_id context
    if (selectedGroup?.id) {
      await supabase.from('study_group_tasks').insert({
        class_id: selectedGroup.id,
        group_name: selectedGroup.name,
        title: `[MSG:${studentProfile?.name || 'Student'}] ${newMessage.substring(0, 200)}`,
        status: 'active',
      })
    }

    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      sender: studentProfile?.name || "Student",
      timestamp: new Date().toISOString(),
      type: "text",
    }
    setMessages((prev: any[]) => [...prev, newMsg])
    setNewMessage("")
  }


  const handleStartCall = (type: string) => {
    setCallType(type)
    setIsCallActive(true)

    const callMessage = {
      id: Date.now().toString(),
      text: `${type === "video" ? "Video" : "Audio"} call started`,
      sender: "System",
      timestamp: new Date().toISOString(),
      type: "system",
    }

    const updatedMessages = [...messages, callMessage]
    setMessages(updatedMessages)
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    setCallType("")

    const callMessage = {
      id: Date.now().toString(),
      text: "Call ended",
      sender: "System",
      timestamp: new Date().toISOString(),
      type: "system",
    }

    const updatedMessages = [...messages, callMessage]
    setMessages(updatedMessages)
  }

  const openChat = (group: any) => {
    setSelectedGroup(group)
    setMessages(group.messages || [])
    setShowChatDialog(true)
  }

  // Filter study groups based on search query
  const filteredGroups = studyGroups.filter((group) => {
    if (searchQuery === "") return true

    const query = searchQuery.toLowerCase()
    return (
      group.name.toLowerCase().includes(query) ||
      group.subject?.toLowerCase().includes(query) ||
      group.faculty?.toLowerCase().includes(query)
    )
  })

  // Get groups based on tab
  const getGroupsByTab = (tab: string) => {
    const myGroupIds = myMemberships.map(m => m.study_group_id)

    switch (tab) {
      case "my-groups":
        return filteredGroups.filter((group) => myGroupIds.includes(group.id))
      case "discover":
        return filteredGroups.filter((group) => !myGroupIds.includes(group.id))
      default:
        return filteredGroups
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
            Study Groups
          </h1>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <Database className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <Button onClick={() => loadStudentData()} className="flex items-center">
                Retry
                <Database className="ml-2 h-4 w-4" />
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
          Study Groups
        </h1>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/student-dashboard/study-groups/tasks'}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Tasks
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search study groups..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="math">Mathematics</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Group Requests
              {groupRequests.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700">
                  {groupRequests.length}
                </Badge>
              )}
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="my-groups" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Users className="mr-2 h-4 w-4" />
              My Groups
              {getGroupsByTab("my-groups").length > 0 && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {getGroupsByTab("my-groups").length}
                </Badge>
              )}
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Search className="mr-2 h-4 w-4" />
              Discover Groups
            </motion.div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="space-y-4">
            {groupRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No group requests available
                </h3>
                <p className="text-gray-500 mb-4">
                  Faculty haven't created any group formation requests yet.
                </p>
              </div>
            ) : (
              groupRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold">{request.subject}</h3>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              Group Request
                            </Badge>
                          </div>

                          <p className="text-gray-700 mb-2">Faculty: {request.faculty}</p>
                          <p className="text-gray-700 mb-4">Class: {request.name}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-start">
                              <Users className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">Max Members</p>
                                <p className="text-sm text-gray-600">{request.max_members} students per group</p>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">Created</p>
                                <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {request.objectives && (
                            <div className="mb-4">
                              <p className="font-medium text-sm mb-1">Objectives:</p>
                              <p className="text-sm text-gray-600">{request.objectives}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 justify-end">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              handleRequestSelect(request.id)
                              setShowRequestDialog(true)
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Form Group
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {["my-groups", "discover"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4">
              {getGroupsByTab(tab).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {tab === "my-groups" ? (
                      <Users className="h-8 w-8 text-gray-400" />
                    ) : (
                      <Search className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tab === "my-groups" ? "No study groups joined" : "No study groups found"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {tab === "my-groups"
                      ? "You haven't joined any study groups yet."
                      : "Try adjusting your search or filters."}
                  </p>
                  {tab === "my-groups" && <Button onClick={() => setActiveTab("discover")}>Discover Groups</Button>}
                </div>
              ) : (
                getGroupsByTab(tab).map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold">{group.name}</h3>
                              {group.subject && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {group.subject}
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-700 mb-4">Faculty: {group.faculty}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-start">
                                <Users className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Max Members</p>
                                  <p className="text-sm text-gray-600">{group.max_members} students</p>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Created</p>
                                  <p className="text-sm text-gray-600">{formatDate(group.created_at)}</p>
                                </div>
                              </div>
                            </div>

                            {group.let_students_decide && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                Students Form Groups
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 justify-end">
                            <Button
                              variant="outline"
                              className="flex items-center bg-transparent"
                              onClick={() => {
                                setSelectedGroup(group)
                                setShowDetailsDialog(true)
                              }}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              Details
                            </Button>

                            {tab === "my-groups" ? (
                              <div className="flex gap-2">
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openChat(group)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Chat
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  setSelectedGroup(group)
                                  setShowJoinDialog(true)
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Join Group
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Study Group Dialog - Students form groups from faculty-created requests */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              To create a study group, go to the "Group Requests" tab and select a faculty-created group request to form your own group.
            </p>
            <p className="text-sm text-gray-500">
              Faculty members create study group requests for your department and year. You can then form groups with your classmates.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setShowCreateDialog(false)
              setActiveTab("requests")
            }}>
              Go to Group Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Study Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Join Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedGroup && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{selectedGroup.name}</h3>
                  {selectedGroup.subject && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {selectedGroup.subject}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">Faculty: {selectedGroup.faculty}</p>
                <p className="text-gray-600">
                  Max Members: {selectedGroup.max_members}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleJoinGroup(selectedGroup)}>
              Join Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedGroup?.name} - Chat</span>
              <div className="flex gap-2">
                {!isCallActive ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall("audio")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall("video")}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" size="sm" onClick={handleEndCall}>
                    End {callType} Call
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isCallActive && (
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  {callType === "video" ? (
                    <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  ) : (
                    <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  )}
                  <p className="text-sm font-medium">{callType === "video" ? "Video" : "Audio"} call in progress...</p>
                  <p className="text-xs text-gray-500">
                    This is a simulation. In a real app, this would connect to a video/audio service.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 p-4 border rounded-md">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "Current Student" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.type === "system"
                          ? "bg-gray-100 text-gray-600 text-center text-sm"
                          : message.sender === "Current Student"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {message.type !== "system" && <p className="text-xs opacity-70 mb-1">{message.sender}</p>}
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="pr-20 resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Study Group Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open)
          if (!open) {
            setSelectedGroup(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Study Group Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedGroup && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{selectedGroup.name}</h3>
                  {selectedGroup.subject && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {selectedGroup.subject}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Faculty:</strong> {selectedGroup.faculty}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(selectedGroup.created_at)}
                  </p>
                  <p>
                    <strong>Max Members:</strong> {selectedGroup.max_members}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedGroup.department}
                  </p>
                </div>

                {selectedGroup.objectives && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Objectives</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedGroup.objectives}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDetailsDialog(false)
              setSelectedGroup(null)
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Formation Dialog for Faculty Requests */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">{selectedRequest.subject}</h3>
                  <p className="text-blue-700 text-sm">Faculty: {selectedRequest.faculty}</p>
                  <p className="text-blue-700 text-sm">Class: {selectedRequest.name}</p>
                  <p className="text-blue-700 text-sm">Max Members: {selectedRequest.max_members} students per group</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-name-request">Group Name</Label>
                  <Input
                    id="group-name-request"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Group Members</Label>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {selectedStudents.length}/{maxGroupSize - 1} members (excluding you)
                    </Badge>
                  </div>

                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {students.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No students available for this request or all students are already in groups
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => {
                          const isSelected = selectedStudents.includes(student.id)
                          const isDisabled = selectedStudents.length >= maxGroupSize - 1 && !isSelected

                          return (
                            <div
                              key={student.id}
                              className={`flex items-center justify-between p-2 rounded-md ${
                                isSelected ? "bg-blue-50" : isDisabled ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <Checkbox
                                  id={`request-student-${student.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handleStudentSelect(student.id)}
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor={`request-student-${student.id}`}
                                  className="ml-2 flex items-center cursor-pointer"
                                >
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {student.name}
                                </Label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                PRN: {student.prn}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {selectedStudents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Members</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudents.map((studentId) => {
                        const student = students.find((s) => s.id === studentId)
                        if (!student) return null

                        return (
                          <Badge key={student.id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                            {student.name}
                            <button
                              className="ml-1 text-gray-500 hover:text-gray-700"
                              onClick={() => handleStudentSelect(student.id)}
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRequestDialog(false)
              setSelectedRequest(null)
              setSelectedStudents([])
              setGroupName("")
            }}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateGroupFromRequest}
              disabled={!selectedRequest || selectedStudents.length < 1 || !groupName.trim()}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
