"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, MessageSquare, Send, Plus, Clock, CheckCircle, AlertCircle, User, BookOpen, X } from "lucide-react"
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
import { supabase } from "@/lib/supabase"

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  subject?: string
}

interface Query {
  id: string
  faculty_id: string
  faculty_name: string
  subject: string
  title: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  query_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  message: string
  created_at: string
}

export default function StudentQueriesPage() {
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newQuery, setNewQuery] = useState({
    subject: "",
    title: "",
    description: "",
    priority: "medium",
    faculty_id: ""
  })
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    fetchStudentData()
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (student) {
      fetchFaculty()
      fetchQueries()
      setupRealtimeSubscription()
    }
  }, [student])

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery)
    }
  }, [selectedQuery])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single()

      if (studentData) {
        setStudent(studentData)
      } else {
        // Use auth user data
        setStudent({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || "Student",
          department: user.user_metadata?.department || "CSE",
          year: user.user_metadata?.year || "third"
        })
      }
    } catch (error) {
      console.error("Error fetching student:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from("faculty")
        .select("id, name, email, department, subject")
        .eq("department", student.department)

      if (error) throw error
      setFacultyList(data || [])
    } catch (error) {
      console.error("Error fetching faculty:", error)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("queries")
        .select(`
          id,
          faculty_id,
          subject,
          title,
          status,
          priority,
          created_at,
          updated_at,
          faculty:faculty_id (name)
        `)
        .eq("student_id", student.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      const formattedQueries = (data || []).map((q: any) => ({
        ...q,
        faculty_name: q.faculty?.name || "Faculty"
      }))
      setQueries(formattedQueries)
    } catch (error) {
      console.error("Error fetching queries:", error)
    }
  }

  const fetchMessages = async (queryId: string) => {
    try {
      const { data, error } = await supabase
        .from("query_messages")
        .select("*")
        .eq("query_id", queryId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const setupRealtimeSubscription = () => {
    subscriptionRef.current = supabase
      .channel("query-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "query_messages"
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (selectedQuery === newMessage.query_id) {
            setMessages(prev => [...prev, newMessage])
            
            // Show toast if message is from faculty
            if (newMessage.sender_type === "faculty") {
              toast({
                title: "New Message",
                description: `${newMessage.sender_name}: ${newMessage.message.substring(0, 50)}...`
              })
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queries"
        },
        () => {
          fetchQueries()
        }
      )
      .subscribe()
  }

  const handleCreateQuery = async () => {
    if (!newQuery.title.trim() || !newQuery.description.trim() || !newQuery.faculty_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: queryData, error: queryError } = await supabase
        .from("queries")
        .insert({
          student_id: student.id,
          faculty_id: newQuery.faculty_id,
          subject: newQuery.subject,
          title: newQuery.title,
          status: "open",
          priority: newQuery.priority
        })
        .select()
        .single()

      if (queryError) throw queryError

      // Insert first message
      const { error: messageError } = await supabase
        .from("query_messages")
        .insert({
          query_id: queryData.id,
          sender_id: student.id,
          sender_type: "student",
          sender_name: student.name || student.full_name,
          message: newQuery.description
        })

      if (messageError) throw messageError

      toast({
        title: "Query Created",
        description: "Your query has been submitted successfully."
      })

      setNewQuery({
        subject: "",
        title: "",
        description: "",
        priority: "medium",
        faculty_id: ""
      })
      setIsCreateDialogOpen(false)
      fetchQueries()
    } catch (error) {
      console.error("Error creating query:", error)
      toast({
        title: "Error",
        description: "Failed to create query",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return

    try {
      const { error } = await supabase
        .from("query_messages")
        .insert({
          query_id: selectedQuery,
          sender_id: student.id,
          sender_type: "student",
          sender_name: student.name || student.full_name,
          message: newMessage
        })

      if (error) throw error

      // Update query status
      await supabase
        .from("queries")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", selectedQuery)

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "open":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Open
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredQueries = queries.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFaculty = facultyList.filter(f =>
    !selectedFaculty || f.id === selectedFaculty
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <div>
                <Label>Select Faculty *</Label>
                <Select 
                  value={newQuery.faculty_id} 
                  onValueChange={(value) => {
                    const faculty = facultyList.find(f => f.id === value)
                    setNewQuery({ 
                      ...newQuery, 
                      faculty_id: value,
                      subject: faculty?.subject || ""
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        <div className="flex items-center gap-2">
                          <span>{faculty.name}</span>
                          <span className="text-gray-500 text-xs">({faculty.subject || faculty.department})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={newQuery.subject}
                    onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
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
                <Label>Title *</Label>
                <Input
                  placeholder="Brief title for your query"
                  value={newQuery.title}
                  onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Faculty Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faculty ({student?.department})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {facultyList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No faculty found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {facultyList.map((faculty) => (
                      <div
                        key={faculty.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${
                          selectedFaculty === faculty.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                        }`}
                        onClick={() => setSelectedFaculty(selectedFaculty === faculty.id ? null : faculty.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {faculty.name?.charAt(0) || "F"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{faculty.name}</p>
                            <p className="text-xs text-gray-500">{faculty.subject || faculty.department}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queries List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Queries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No queries yet</p>
                    <p className="text-sm">Click "New Query" to start</p>
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
                        <p className="text-xs text-gray-600 mb-2">{query.faculty_name}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {query.subject}
                          </div>
                          {getStatusBadge(query.status)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{formatTimestamp(query.updated_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedQuery ? (
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {queries.find(q => q.id === selectedQuery)?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(queries.find(q => q.id === selectedQuery)?.status || "")}
                      {getPriorityBadge(queries.find(q => q.id === selectedQuery)?.priority || "")}
                      <span className="text-sm text-gray-500">
                        {queries.find(q => q.id === selectedQuery)?.faculty_name}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === "student" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-start gap-3 max-w-[80%] ${message.sender_type === "student" ? "flex-row-reverse" : ""}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={message.sender_type === "faculty" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}>
                              {message.sender_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={`flex items-center gap-2 mb-1 ${message.sender_type === "student" ? "justify-end" : ""}`}>
                              <span className="font-medium text-sm">{message.sender_name}</span>
                              <Badge variant={message.sender_type === "faculty" ? "default" : "outline"} className="text-xs">
                                {message.sender_type === "faculty" ? "Faculty" : "You"}
                              </Badge>
                            </div>
                            <div className={`p-3 rounded-lg ${message.sender_type === "student" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{formatTimestamp(message.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
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
                <p>Choose a query from the list to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
