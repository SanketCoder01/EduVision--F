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
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [activeTab, setActiveTab] = useState("my-groups")
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [groupName, setGroupName] = useState("")
  const [maxGroupSize, setMaxGroupSize] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [studyGroups, setStudyGroups] = useState([])
  const [availableSettings, setAvailableSettings] = useState([])
  const [selectedSetting, setSelectedSetting] = useState(null)

  // Chat state
  const [messages, setMessages] = useState([])
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

  const handleSettingSelect = async (settingId) => {
    const setting = availableSettings.find((s) => s.id === settingId)
    setSelectedSetting(setting)
    setMaxGroupSize(setting.maxMembers)

    try {
      const result = await getStudentsByClass(setting.classId)

      if (result.success) {
        // Filter out students who are already in groups
        const existingGroupMembers = studyGroups
          .filter((group) => group.classId === setting.classId)
          .flatMap((group) => group.members.map((member) => member.id))

        const availableStudents = result.data.filter((student) => !existingGroupMembers.includes(student.id))

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

  const handleStudentSelect = (studentId) => {
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
    const updatedGroups = studyGroups.map((group) => {
      if (group.id === selectedGroup.id) {
        return { ...group, messages: updatedMessages }
      }
      return group
    })
    localStorage.setItem("studyGroups", JSON.stringify(updatedGroups))
    setStudyGroups(updatedGroups)

    setNewMessage("")
  }

  const handleStartCall = (type) => {
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

  const openChat = (group) => {
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
  const getGroupsByTab = (tab) => {
    const currentUserId = "current-user-id"

    switch (tab) {
      case "my-groups":
        return filteredGroups.filter((group) => group.members.some((member) => member.id === currentUserId))
      case "discover":
        return filteredGroups.filter((group) => !group.members.some((member) => member.id === currentUserId))
      default:
        return filteredGroups
    }
  }

  // Format date
  const formatDate = (dateString) => {
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

        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Study Group
        </Button>
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

      <Tabs defaultValue="my-groups" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
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
                              onClick={() => setSelectedGroup(group)}
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
        open={selectedGroup !== null && !showChatDialog && !showJoinDialog}
        onOpenChange={() => setSelectedGroup(null)}
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
            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
