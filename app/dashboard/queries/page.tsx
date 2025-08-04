"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Search,
  Send,
  Check,
  Clock,
  BookOpen,
  HelpCircle,
  FileText,
  MoreHorizontal,
  User,
  X,
  Filter,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for classes
const classes = [
  { id: "fy-cse", name: "FY CSE", icon: <BookOpen className="h-5 w-5" />, unread: 5 },
  { id: "sy-cse", name: "SY CSE", icon: <BookOpen className="h-5 w-5" />, unread: 2 },
  { id: "ty-cse", name: "TY CSE", icon: <BookOpen className="h-5 w-5" />, unread: 0 },
  { id: "fy-it", name: "FY IT", icon: <BookOpen className="h-5 w-5" />, unread: 3 },
  { id: "sy-it", name: "SY IT", icon: <BookOpen className="h-5 w-5" />, unread: 1 },
  { id: "ty-it", name: "TY IT", icon: <BookOpen className="h-5 w-5" />, unread: 0 },
]

// Mock data for students
const students = [
  { id: 1, name: "Rahul Sharma", prn: "PRN2023001", class: "FY CSE", avatar: null },
  { id: 2, name: "Priya Patel", prn: "PRN2023002", class: "FY CSE", avatar: null },
  { id: 3, name: "Amit Kumar", prn: "PRN2023003", class: "SY CSE", avatar: null },
  { id: 4, name: "Sneha Gupta", prn: "PRN2023004", class: "SY CSE", avatar: null },
  { id: 5, name: "Vikram Singh", prn: "PRN2023005", class: "TY CSE", avatar: null },
  { id: 6, name: "Neha Verma", prn: "PRN2023006", class: "FY IT", avatar: null },
  { id: 7, name: "Raj Malhotra", prn: "PRN2023007", class: "SY IT", avatar: null },
  { id: 8, name: "Ananya Desai", prn: "PRN2023008", class: "TY IT", avatar: null },
]

// Mock data for queries
const initialQueries = [
  {
    id: 1,
    studentId: 1,
    type: "study",
    subject: "Data Structures",
    title: "Confusion about Binary Trees",
    message:
      "I'm having trouble understanding the concept of balanced binary trees. Could you explain the difference between AVL trees and Red-Black trees?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "unread",
    class: "FY CSE",
    messages: [
      {
        id: 1,
        senderId: 1,
        text: "I'm having trouble understanding the concept of balanced binary trees. Could you explain the difference between AVL trees and Red-Black trees?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
      },
    ],
  },
  {
    id: 2,
    studentId: 2,
    type: "assignment",
    subject: "Database Management",
    title: "Clarification on Assignment 3",
    message:
      "For the third assignment, do we need to implement all the SQL queries or just design the database schema?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    status: "unread",
    class: "FY CSE",
    messages: [
      {
        id: 1,
        senderId: 2,
        text: "For the third assignment, do we need to implement all the SQL queries or just design the database schema?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: false,
      },
    ],
  },
  {
    id: 3,
    studentId: 3,
    type: "other",
    subject: "Project Submission",
    title: "Extension Request",
    message:
      "Due to some technical issues, I couldn't complete my project on time. Is it possible to get a two-day extension?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: "read",
    class: "SY CSE",
    messages: [
      {
        id: 1,
        senderId: 3,
        text: "Due to some technical issues, I couldn't complete my project on time. Is it possible to get a two-day extension?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
      },
      {
        id: 2,
        senderId: "faculty",
        text: "Can you please explain what technical issues you're facing? I'll need more details before I can approve an extension.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
        read: true,
      },
      {
        id: 3,
        senderId: 3,
        text: "My laptop crashed and I lost some of my work. I've been trying to recover the files but it's taking longer than expected.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
        read: true,
      },
    ],
  },
  {
    id: 4,
    studentId: 6,
    type: "study",
    subject: "Programming Fundamentals",
    title: "Help with Recursion",
    message:
      "I'm struggling with the concept of recursion. Could you provide some simple examples to help me understand?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "unread",
    class: "FY IT",
    messages: [
      {
        id: 1,
        senderId: 6,
        text: "I'm struggling with the concept of recursion. Could you provide some simple examples to help me understand?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
      },
    ],
  },
]

export default function QueriesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("classes")
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [queries, setQueries] = useState(initialQueries)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedQuery])

  const handleSendMessage = () => {
    if (!message.trim() || !selectedQuery) return

    const newMessage = {
      id: selectedQuery.messages.length + 1,
      senderId: "faculty",
      text: message,
      timestamp: new Date(),
      read: true,
    }

    const updatedQueries = queries.map((query) => {
      if (query.id === selectedQuery.id) {
        return {
          ...query,
          status: "read",
          messages: [...query.messages, newMessage],
        }
      }
      return query
    })

    setQueries(updatedQueries)
    setSelectedQuery({
      ...selectedQuery,
      status: "read",
      messages: [...selectedQuery.messages, newMessage],
    })
    setMessage("")

    toast({
      title: "Message Sent",
      description: "Your response has been sent to the student.",
    })
  }

  const markAsRead = (queryId) => {
    const updatedQueries = queries.map((query) => {
      if (query.id === queryId) {
        const updatedMessages = query.messages.map((msg) => ({
          ...msg,
          read: true,
        }))
        return {
          ...query,
          status: "read",
          messages: updatedMessages,
        }
      }
      return query
    })

    setQueries(updatedQueries)

    if (selectedQuery && selectedQuery.id === queryId) {
      setSelectedQuery({
        ...selectedQuery,
        status: "read",
        messages: selectedQuery.messages.map((msg) => ({
          ...msg,
          read: true,
        })),
      })
    }
  }

  const getFilteredQueries = () => {
    let filtered = [...queries]

    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter((query) => query.class === selectedClass)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.message.toLowerCase().includes(query) ||
          students
            .find((s) => s.id === q.studentId)
            ?.name.toLowerCase()
            .includes(query),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType)
    }

    return filtered
  }

  const getUnreadCount = (classId) => {
    return queries.filter((q) => q.class === classId && q.status === "unread").length
  }

  const renderClassesTab = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search classes..." className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedClass === cls.name ? "border-2 border-purple-500" : ""
              }`}
              onClick={() => {
                setSelectedClass(cls.name)
                setActiveTab("queries")
              }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    {cls.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{cls.name}</h3>
                    <p className="text-sm text-gray-500">{getUnreadCount(cls.name)} unread queries</p>
                  </div>
                </div>
                {getUnreadCount(cls.name) > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {getUnreadCount(cls.name)}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderQueriesTab = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {selectedClass && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => {
                setSelectedClass(null)
                setActiveTab("classes")
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-lg font-medium">{selectedClass} Queries</h2>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)]">
        <Card className="md:w-1/3 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search queries..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative ml-2">
                <Button variant="outline" size="icon" onClick={() => setShowFilterMenu(!showFilterMenu)}>
                  <Filter className="h-4 w-4" />
                </Button>
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${filterType === "all" ? "bg-purple-50 text-purple-700" : "text-gray-700"} hover:bg-purple-50 hover:text-purple-700`}
                        onClick={() => {
                          setFilterType("all")
                          setShowFilterMenu(false)
                        }}
                      >
                        All Types
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${filterType === "study" ? "bg-purple-50 text-purple-700" : "text-gray-700"} hover:bg-purple-50 hover:text-purple-700`}
                        onClick={() => {
                          setFilterType("study")
                          setShowFilterMenu(false)
                        }}
                      >
                        <HelpCircle className="h-4 w-4 inline mr-2" />
                        Study Related
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${filterType === "assignment" ? "bg-purple-50 text-purple-700" : "text-gray-700"} hover:bg-purple-50 hover:text-purple-700`}
                        onClick={() => {
                          setFilterType("assignment")
                          setShowFilterMenu(false)
                        }}
                      >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Assignment Related
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${filterType === "other" ? "bg-purple-50 text-purple-700" : "text-gray-700"} hover:bg-purple-50 hover:text-purple-700`}
                        onClick={() => {
                          setFilterType("other")
                          setShowFilterMenu(false)
                        }}
                      >
                        <MessageCircle className="h-4 w-4 inline mr-2" />
                        Other
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <AnimatePresence>
                {getFilteredQueries().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No queries found</div>
                ) : (
                  getFilteredQueries().map((query, index) => {
                    const student = students.find((s) => s.id === query.studentId)
                    return (
                      <motion.div
                        key={query.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedQuery?.id === query.id
                              ? "bg-purple-100"
                              : query.status === "unread"
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSelectedQuery(query)
                            if (query.status === "unread") {
                              markAsRead(query.id)
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium line-clamp-1">{query.title}</div>
                            {query.status === "unread" && (
                              <Badge variant="default" className="ml-2 bg-blue-500">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mb-1">
                            <User className="h-3 w-3 mr-1" />
                            {student?.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center justify-between">
                            <div className="flex items-center">
                              {query.type === "study" && <HelpCircle className="h-3 w-3 mr-1 text-purple-500" />}
                              {query.type === "assignment" && <FileText className="h-3 w-3 mr-1 text-green-500" />}
                              {query.type === "other" && <MessageCircle className="h-3 w-3 mr-1 text-orange-500" />}
                              {query.subject}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(query.timestamp)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-2/3 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col h-full">
            {selectedQuery ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{selectedQuery.title}</h3>
                      <div className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {students.find((s) => s.id === selectedQuery.studentId)?.name} • {selectedQuery.class}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => markAsRead(selectedQuery.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <X className="h-4 w-4 mr-2" />
                          Close Query
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex">
                    <Badge
                      className={`
                      ${
                        selectedQuery.type === "study"
                          ? "bg-purple-500"
                          : selectedQuery.type === "assignment"
                            ? "bg-green-500"
                            : "bg-orange-500"
                      }
                    `}
                    >
                      {selectedQuery.type === "study" && <HelpCircle className="h-3 w-3 mr-1" />}
                      {selectedQuery.type === "assignment" && <FileText className="h-3 w-3 mr-1" />}
                      {selectedQuery.type === "other" && <MessageCircle className="h-3 w-3 mr-1" />}
                      {selectedQuery.type.charAt(0).toUpperCase() + selectedQuery.type.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {selectedQuery.subject}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedQuery.messages.map((msg, index) => {
                    const isStudent = msg.senderId !== "faculty"
                    const student = isStudent ? students.find((s) => s.id === msg.senderId) : null

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex ${isStudent ? "justify-start" : "justify-end"}`}
                      >
                        <div className={`max-w-[80%] ${isStudent ? "bg-gray-100" : "bg-purple-100"} rounded-lg p-3`}>
                          {isStudent && (
                            <div className="flex items-center mb-1">
                              <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center mr-2">
                                <User className="h-3 w-3 text-purple-700" />
                              </div>
                              <span className="text-sm font-medium">{student?.name}</span>
                            </div>
                          )}
                          <p className="text-gray-800">{msg.text}</p>
                          <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                            {!isStudent && (
                              <Check className={`h-3 w-3 ml-1 ${msg.read ? "text-green-500" : "text-gray-400"}`} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex">
                    <Textarea
                      placeholder="Type your response..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 resize-none focus:ring-2 focus:ring-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-2 self-end">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Query Selected</h3>
                <p className="text-gray-500">Select a query from the list to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now"
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}m ago`
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours}h ago`
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `${days}d ago`
    }

    // Format as date
    return timestamp.toLocaleDateString()
  }

  return (
    <div className="max-w-6xl mx-auto h-full">
      <motion.h1
        className="text-2xl font-bold mb-6 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MessageCircle className="inline-block mr-2 h-6 w-6 text-purple-600" />
        Student Queries
      </motion.h1>

      <Tabs defaultValue="classes" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Classes
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="queries"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Queries
              {queries.filter((q) => q.status === "unread").length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {queries.filter((q) => q.status === "unread").length}
                </Badge>
              )}
            </motion.div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="classes" className="h-full">
          {renderClassesTab()}
        </TabsContent>
        <TabsContent value="queries" className="h-full">
          {renderQueriesTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
