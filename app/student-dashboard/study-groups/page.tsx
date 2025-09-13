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
import { getClasses, getStudentsByClass, initializeDatabase, seedDatabase } from "@/app/actions/study-group-actions"

export default function StudyGroupsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("my-groups")
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])
  const [groupName, setGroupName] = useState("")
  const [maxGroupSize, setMaxGroupSize] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [availableSettings, setAvailableSettings] = useState<any[]>([])
  const [selectedSetting, setSelectedSetting] = useState<any>(null)
  const [groupRequests, setGroupRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isCallActive, setIsCallActive] = useState(false)
  const [callType, setCallType] = useState("") // "audio" or "video"

  useEffect(() => {
    async function fetchClasses() {
      try {
        setIsLoading(true)
        const result = await getClasses()

        if (result.success) {
          setClasses(result.data)
          setError(null)
        } else {
          setError("Failed to fetch classes. The database tables might not exist yet.")
        }

        // Load existing study groups
        const existingGroups = JSON.parse(localStorage.getItem("studyGroups") || "[]")
        setStudyGroups(existingGroups)

        // Load available group settings
        const settings = JSON.parse(localStorage.getItem("studyGroupSettings") || "[]")
        setAvailableSettings(settings)

        // Load group requests from faculty (where letStudentsDecide is true)
        const classes = JSON.parse(localStorage.getItem("study_classes") || "[]")
        const requests = classes.filter((cls: any) => cls.letStudentsDecide === true)
        setGroupRequests(requests)
      } catch (error) {
        console.error("Error fetching classes:", error)
        setError("An unexpected error occurred. The database tables might not exist yet.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true)
      const result = await initializeDatabase()

      if (result.success) {
        toast({
          title: "Success",
          description: "Database initialized successfully. Now seeding with sample data...",
        })

        const seedResult = await seedDatabase()

        if (seedResult.success) {
          toast({
            title: "Success",
            description: "Database seeded successfully. Refreshing data...",
          })

          const classesResult = await getClasses()

          if (classesResult.success) {
            setClasses(classesResult.data)
            setError(null)
          }
        } else {
          toast({
            title: "Warning",
            description: "Database initialized but seeding failed. Some features may not work properly.",
            variant: "destructive",
          })
        }
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

  const handleSettingSelect = async (settingId: string) => {
    const setting = availableSettings.find((s: any) => s.id === settingId)
    setSelectedSetting(setting)
    setMaxGroupSize(setting.maxMembers)

    try {
      const result = await getStudentsByClass(setting.classId)

      if (result.success) {
        // Filter out students who are already in groups
        const existingGroupMembers = studyGroups
          .filter((group: any) => group.classId === setting.classId)
          .flatMap((group: any) => group.members.map((member: any) => member.id))

        const availableStudents = result.data.filter((student: any) => !existingGroupMembers.includes(student.id))

        setStudents(availableStudents)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch students for this class.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students for this class.",
        variant: "destructive",
      })
    }
  }

  const handleRequestSelect = async (requestId: string) => {
    const request = groupRequests.find((r: any) => r.id === requestId)
    setSelectedRequest(request)
    setMaxGroupSize(request.maxMembers)

    try {
      // Mock students data for the request's department and year
      const mockStudents = [
        { id: "1", name: "Alice Johnson", prn: "2124UCEM2001", department: request.department, year: request.year },
        { id: "2", name: "Bob Smith", prn: "2124UCEM2002", department: request.department, year: request.year },
        { id: "3", name: "Charlie Brown", prn: "2124UCEM2003", department: request.department, year: request.year },
        { id: "4", name: "Diana Prince", prn: "2124UCEM2004", department: request.department, year: request.year },
        { id: "5", name: "Eve Wilson", prn: "2124UCEM2005", department: request.department, year: request.year },
        { id: "6", name: "Frank Miller", prn: "2124UCEM2006", department: request.department, year: request.year },
        { id: "7", name: "Grace Lee", prn: "2124UCEM2007", department: request.department, year: request.year },
        { id: "8", name: "Henry Davis", prn: "2124UCEM2008", department: request.department, year: request.year },
      ]

      // Filter out students who are already in groups for this request
      const existingGroupMembers = studyGroups
        .filter((group: any) => group.requestId === requestId)
        .flatMap((group: any) => group.members.map((member: any) => member.id))

      const availableStudents = mockStudents.filter((student: any) => !existingGroupMembers.includes(student.id))
      setStudents(availableStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students for this request.",
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
      const currentUserId = "current-user-id" // In real app, get from auth
      const currentUser = { id: currentUserId, name: "Current Student", prn: "2124UCEM2059" }

      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        classId: selectedRequest.id,
        subjectName: selectedRequest.subject,
        facultyName: selectedRequest.faculty,
        maxMembers: selectedRequest.maxMembers,
        members: [currentUser, ...selectedStudents.map((id) => students.find((s) => s.id === id))],
        creationType: "student-request",
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        messages: [],
        requestId: selectedRequest.id,
      }

      const existingGroups = JSON.parse(localStorage.getItem("studyGroups") || "[]")
      const updatedGroups = [...existingGroups, newGroup]
      localStorage.setItem("studyGroups", JSON.stringify(updatedGroups))
      setStudyGroups(updatedGroups)

      // Remove the request from available requests since group is formed
      const updatedRequests = groupRequests.filter(req => req.id !== selectedRequest.id)
      setGroupRequests(updatedRequests)

      toast({
        title: "Group Created",
        description: "Your study group has been created successfully and faculty has been notified.",
      })

      setShowRequestDialog(false)
      setSelectedRequest(null)
      setSelectedStudents([])
      setGroupName("")
      setActiveTab("my-groups")
    } catch (error) {
      console.error("Error creating study group:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateGroup = async () => {
    if (!selectedSetting) {
      toast({
        title: "Error",
        description: "Please select a subject to create a group for.",
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
      const currentUserId = "current-user-id" // In real app, get from auth
      const currentUser = { id: currentUserId, name: "Current Student", prn: "2124UCEM2059" }

      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        classId: selectedSetting.classId,
        subjectName: selectedSetting.subjectName,
        facultyName: selectedSetting.facultyName,
        maxMembers: selectedSetting.maxMembers,
        members: [currentUser, ...selectedStudents.map((id) => students.find((s) => s.id === id))],
        creationType: "student",
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        messages: [],
      }

      const existingGroups = JSON.parse(localStorage.getItem("studyGroups") || "[]")
      const updatedGroups = [...existingGroups, newGroup]
      localStorage.setItem("studyGroups", JSON.stringify(updatedGroups))
      setStudyGroups(updatedGroups)

      toast({
        title: "Group Created",
        description: "Your study group has been created successfully.",
      })

      setShowCreateDialog(false)
      setSelectedSetting(null)
      setSelectedStudents([])
      setGroupName("")
    } catch (error) {
      console.error("Error creating study group:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinGroup = (group) => {
    toast({
      title: "Request Sent",
      description: `Your request to join ${group.name} has been sent to the group admin.`,
    })
    setShowJoinDialog(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "Current Student",
      timestamp: new Date().toISOString(),
      type: "text",
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    // Update group messages in localStorage
    const updatedGroups = studyGroups.map((group: any) => {
      if (group.id === selectedGroup.id) {
        return { ...group, messages: updatedMessages }
      }
      return group
    })
    localStorage.setItem("studyGroups", JSON.stringify(updatedGroups))
    setStudyGroups(updatedGroups)

    // If this is a student-request group, also send to faculty queries
    if (selectedGroup.creationType === "student-request") {
      const facultyQuery = {
        id: Date.now().toString() + "_query",
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        studentName: "Current Student",
        facultyName: selectedGroup.facultyName,
        message: newMessage,
        timestamp: new Date().toISOString(),
        status: "unread"
      }

      // Store in faculty queries
      const existingQueries = JSON.parse(localStorage.getItem("facultyQueries") || "[]")
      existingQueries.push(facultyQuery)
      localStorage.setItem("facultyQueries", JSON.stringify(existingQueries))

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the faculty and group members.",
      })
    }

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
      group.subjectName.toLowerCase().includes(query) ||
      group.facultyName.toLowerCase().includes(query)
    )
  })

  // Get groups based on tab
  const getGroupsByTab = (tab: string) => {
    const currentUserId = "current-user-id"

    switch (tab) {
      case "my-groups":
        return filteredGroups.filter((group) => group.members.some((member: { id: string }) => member.id === currentUserId))
      case "discover":
        return filteredGroups.filter((group) => !group.members.some((member: { id: string }) => member.id === currentUserId))
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
                                <p className="text-sm text-gray-600">{request.maxMembers} students per group</p>
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
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {group.subjectName}
                              </Badge>
                            </div>

                            <p className="text-gray-700 mb-4">Faculty: {group.facultyName}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-start">
                                <Users className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Members</p>
                                  <div className="flex -space-x-2 mt-1">
                                    {group.members.slice(0, 3).map((member) => (
                                      <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {group.members.length > 3 && (
                                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium border-2 border-white">
                                        +{group.members.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Created</p>
                                  <p className="text-sm text-gray-600">{formatDate(group.createdAt)}</p>
                                </div>
                              </div>
                            </div>

                            <Badge variant="outline" className="bg-gray-100">
                              {group.creationType === "faculty" ? "Faculty Created" : "Student Created"}
                            </Badge>
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
                                <Button
                                  variant="outline"
                                  onClick={() => handleStartCall("audio")}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Call
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleStartCall("video")}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  Video
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

      {/* Create Study Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject-select">Select Subject</Label>
              <Select value={selectedSetting?.id} onValueChange={handleSettingSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading subjects...
                    </SelectItem>
                  ) : availableSettings.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No subjects available for group creation
                    </SelectItem>
                  ) : (
                    availableSettings.map((setting) => (
                      <SelectItem key={setting.id || setting.classId} value={setting.id || setting.classId}>
                        {setting.subjectName} - {setting.facultyName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSetting && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
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
                        No students available for this subject or all students are already in groups
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
                                  id={`student-${student.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handleStudentSelect(student.id)}
                                  disabled={isDisabled}
                                />
                                <Label
                                  htmlFor={`student-${student.id}`}
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateGroup}
              disabled={!selectedSetting || selectedStudents.length < 1 || !groupName.trim()}
            >
              Create Group
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
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedGroup.subjectName}
                  </Badge>
                </div>
                <p className="text-gray-600">Faculty: {selectedGroup.facultyName}</p>
                <p className="text-gray-600">
                  Members: {selectedGroup.members.length}/{selectedGroup.maxMembers}
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
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedGroup.subjectName}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Faculty:</strong> {selectedGroup.facultyName}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(selectedGroup.createdAt)}
                  </p>
                  <p>
                    <strong>Members:</strong> {selectedGroup.members.length}/{selectedGroup.maxMembers}
                  </p>
                  <p>
                    <strong>Created by:</strong> {selectedGroup.creationType === "faculty" ? "Faculty" : "Student"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Group Members</Label>
                  <div className="mt-2 space-y-2">
                    {selectedGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        {member.prn && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            PRN: {member.prn}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                  <p className="text-blue-700 text-sm">Max Members: {selectedRequest.maxMembers} students per group</p>
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
