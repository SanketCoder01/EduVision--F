"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MessageSquare, Send, Plus, Clock, CheckCircle, AlertCircle, User, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function StudentQueriesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newQuery, setNewQuery] = useState({
    subject: "",
    class: "",
    title: "",
    description: "",
    priority: "medium",
  })

  // Mock data for classes
  const classes = [
    { id: "cs101", name: "Computer Science 101" },
    { id: "math201", name: "Mathematics 201" },
    { id: "phys301", name: "Physics 301" },
    { id: "eng102", name: "English 102" },
  ]

  // Mock data for queries
  const queries = [
    {
      id: 1,
      title: "Question about Binary Trees",
      description:
        "I'm having trouble understanding the implementation of binary search trees. Could you explain the insertion process?",
      subject: "Data Structures",
      class: "Computer Science 101",
      classId: "cs101",
      status: "answered",
      priority: "medium",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      student: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      messages: [
        {
          id: 1,
          sender: "You",
          role: "student",
          message:
            "I'm having trouble understanding the implementation of binary search trees. Could you explain the insertion process?",
          timestamp: "2024-01-15T10:30:00Z",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 2,
          sender: "Dr. Smith",
          role: "faculty",
          message:
            "Great question! Binary search tree insertion follows a specific pattern. Let me break it down for you...",
          timestamp: "2024-01-15T14:20:00Z",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      ],
    },
    {
      id: 2,
      title: "Calculus Integration Problem",
      description: "I need help with integration by parts. The textbook example doesn't make sense to me.",
      subject: "Calculus",
      class: "Mathematics 201",
      classId: "math201",
      status: "pending",
      priority: "high",
      createdAt: "2024-01-16T09:15:00Z",
      updatedAt: "2024-01-16T09:15:00Z",
      student: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      messages: [
        {
          id: 1,
          sender: "You",
          role: "student",
          message: "I need help with integration by parts. The textbook example doesn't make sense to me.",
          timestamp: "2024-01-16T09:15:00Z",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      ],
    },
    {
      id: 3,
      title: "Physics Lab Report Guidelines",
      description: "What format should I use for the lab report? Are there specific sections required?",
      subject: "Physics",
      class: "Physics 301",
      classId: "phys301",
      status: "in_progress",
      priority: "low",
      createdAt: "2024-01-14T16:45:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
      student: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      messages: [
        {
          id: 1,
          sender: "You",
          role: "student",
          message: "What format should I use for the lab report? Are there specific sections required?",
          timestamp: "2024-01-14T16:45:00Z",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 2,
          sender: "Prof. Johnson",
          role: "faculty",
          message:
            "For lab reports, please follow the standard scientific format: Introduction, Methods, Results, Discussion, and Conclusion.",
          timestamp: "2024-01-15T11:30:00Z",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      ],
    },
  ]

  // Filter queries based on search and filters
  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || query.classId === selectedClass
    const matchesStatus = selectedStatus === "all" || query.status === selectedStatus

    return matchesSearch && matchesClass && matchesStatus
  })

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "answered":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Answered
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="outline">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedQuery) return

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the faculty.",
    })

    setNewMessage("")
  }

  // Handle create query
  const handleCreateQuery = () => {
    if (!newQuery.title.trim() || !newQuery.description.trim() || !newQuery.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Query Created",
      description: "Your query has been submitted successfully.",
    })

    setNewQuery({
      subject: "",
      class: "",
      title: "",
      description: "",
      priority: "medium",
    })
    setIsCreateDialogOpen(false)
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="inline-block mr-3 h-8 w-8 text-blue-600" />
            My Queries
          </h1>
          <p className="text-gray-600 mt-1">Ask questions and get help from your instructors</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Query</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Select value={newQuery.class} onValueChange={(value) => setNewQuery({ ...newQuery, class: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newQuery.priority}
                    onValueChange={(value) => setNewQuery({ ...newQuery, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures, Calculus, etc."
                  value={newQuery.subject}
                  onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your query"
                  value={newQuery.title}
                  onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your question in detail..."
                  rows={4}
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQuery} className="bg-blue-600 hover:bg-blue-700">
                  Create Query
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queries List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Queries</CardTitle>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No queries found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredQueries.map((query) => (
                      <div
                        key={query.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                          selectedQuery === query.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                        }`}
                        onClick={() => setSelectedQuery(query.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm line-clamp-2">{query.title}</h3>
                          {getPriorityBadge(query.priority)}
                        </div>

                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{query.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {query.class}
                          </div>
                          {getStatusBadge(query.status)}
                        </div>

                        <div className="text-xs text-gray-400 mt-2">{formatTimestamp(query.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Query Details and Chat */}
        <div className="lg:col-span-2">
          {selectedQuery ? (
            <Card className="h-[700px] flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{queries.find((q) => q.id === selectedQuery)?.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(queries.find((q) => q.id === selectedQuery)?.status || "")}
                      {getPriorityBadge(queries.find((q) => q.id === selectedQuery)?.priority || "")}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {queries.find((q) => q.id === selectedQuery)?.class}
                      <span className="mx-2">•</span>
                      <span>{queries.find((q) => q.id === selectedQuery)?.subject}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {queries
                    .find((q) => q.id === selectedQuery)
                    ?.messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                          <AvatarFallback>
                            {message.role === "student" ? <User className="h-4 w-4" /> : message.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <Badge variant={message.role === "faculty" ? "default" : "outline"} className="text-xs">
                              {message.role === "faculty" ? "Faculty" : "Student"}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{message.message}</p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your follow-up question..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[700px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a Query</h3>
                <p>Choose a query from the list to view details and continue the conversation</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
