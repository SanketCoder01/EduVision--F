"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Search,
  Send,
  Check,
  Clock,
  BookOpen,
  User,
  X,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface Student {
  id: string
  name: string
  email: string
  prn?: string
  department: string
  year: string
}

interface Query {
  id: string
  student_id: string
  student_name: string
  student_department: string
  student_year: string
  faculty_id: string
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

export default function FacultyQueriesPage() {
  const { toast } = useToast()
  const [faculty, setFaculty] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    fetchFacultyData()
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (faculty) {
      fetchStudents()
      fetchQueries()
      setupRealtimeSubscription()
    }
  }, [faculty])

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery)
    }
  }, [selectedQuery])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: facultyData } = await supabase
        .from("faculty")
        .select("*")
        .eq("id", user.id)
        .single()

      if (facultyData) {
        setFaculty(facultyData)
      } else {
        setFaculty({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || "Faculty",
          department: user.user_metadata?.department || "CSE"
        })
      }
    } catch (error) {
      console.error("Error fetching faculty:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, prn, department, year")
        .eq("department", faculty.department)
        .order("year")
        .order("name")

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("queries")
        .select(`
          id,
          student_id,
          subject,
          title,
          status,
          priority,
          created_at,
          updated_at,
          student:student_id (name, department, year)
        `)
        .eq("faculty_id", faculty.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      const formattedQueries = (data || []).map((q: any) => ({
        ...q,
        student_name: q.student?.name || "Student",
        student_department: q.student?.department || faculty.department,
        student_year: q.student?.year || "N/A"
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
      .channel("faculty-query-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "query_messages"
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Check if this message belongs to faculty's query
          const query = queries.find(q => q.id === newMessage.query_id)
          if (query || selectedQuery === newMessage.query_id) {
            if (selectedQuery === newMessage.query_id) {
              setMessages(prev => [...prev, newMessage])
            }
            
            if (newMessage.sender_type === "student") {
              toast({
                title: "New Message",
                description: `${newMessage.sender_name}: ${newMessage.message.substring(0, 50)}...`
              })
            }
            fetchQueries()
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "queries"
        },
        (payload) => {
          const newQuery = payload.new as Query
          if (newQuery.faculty_id === faculty.id) {
            fetchQueries()
            toast({
              title: "New Query",
              description: `New query from student: ${newQuery.title}`
            })
          }
        }
      )
      .subscribe()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return

    try {
      const { error } = await supabase
        .from("query_messages")
        .insert({
          query_id: selectedQuery,
          sender_id: faculty.id,
          sender_type: "faculty",
          sender_name: faculty.name || faculty.full_name,
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

  const handleResolveQuery = async () => {
    if (!selectedQuery) return

    try {
      await supabase
        .from("queries")
        .update({ 
          status: "resolved", 
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedQuery)

      toast({
        title: "Query Resolved",
        description: "The query has been marked as resolved"
      })
      fetchQueries()
    } catch (error) {
      console.error("Error resolving query:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Resolved</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
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
      default:
        return <Badge variant="secondary">Low</Badge>
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

  const studentsByYear = students.reduce((acc, student) => {
    const year = student.year || "other"
    if (!acc[year]) acc[year] = []
    acc[year].push(student)
    return acc
  }, {} as Record<string, Student[]>)

  const yearOrder = ["first", "second", "third", "fourth"]
  const sortedYears = Object.keys(studentsByYear).sort((a, b) => 
    yearOrder.indexOf(a) - yearOrder.indexOf(b)
  )

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === "all" || q.student_year === selectedYear
    return matchesSearch && matchesYear
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageCircle className="inline-block mr-3 h-8 w-8 text-blue-600" />
            Student Queries
          </h1>
          <p className="text-gray-600 mt-1">Manage and respond to student questions</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Students Sidebar by Year */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students ({faculty?.department})</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {sortedYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year.charAt(0).toUpperCase() + year.slice(1)} Year ({studentsByYear[year].length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {sortedYears.map(year => (
                  (selectedYear === "all" || selectedYear === year) && (
                    <div key={year}>
                      <div className="px-4 py-2 bg-gray-50 border-b border-t font-medium text-sm text-gray-600 sticky top-0">
                        {year.charAt(0).toUpperCase() + year.slice(1)} Year
                      </div>
                      {studentsByYear[year]?.map(student => (
                        <div
                          key={student.id}
                          className="p-3 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {student.name?.charAt(0) || "S"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{student.name}</p>
                              <p className="text-xs text-gray-500 truncate">{student.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ))}
                {students.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No students found</p>
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
              <CardTitle className="text-lg">Queries</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No queries found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredQueries.map(query => (
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
                        <p className="text-xs text-gray-600 mb-2">{query.student_name}</p>
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
                        {queries.find(q => q.id === selectedQuery)?.student_name} • {queries.find(q => q.id === selectedQuery)?.student_year} year
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {queries.find(q => q.id === selectedQuery)?.status !== "resolved" && (
                      <Button variant="outline" size="sm" onClick={handleResolveQuery}>
                        <Check className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === "faculty" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-start gap-3 max-w-[80%] ${message.sender_type === "faculty" ? "flex-row-reverse" : ""}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={message.sender_type === "student" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}>
                              {message.sender_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={`flex items-center gap-2 mb-1 ${message.sender_type === "faculty" ? "justify-end" : ""}`}>
                              <span className="font-medium text-sm">{message.sender_name}</span>
                              <Badge variant={message.sender_type === "student" ? "outline" : "default"} className="text-xs">
                                {message.sender_type === "student" ? "Student" : "You"}
                              </Badge>
                            </div>
                            <div className={`p-3 rounded-lg ${message.sender_type === "faculty" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"}`}>
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
                      placeholder="Type your response..."
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
                      className="bg-purple-600 hover:bg-purple-700"
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
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a Query</h3>
                <p>Choose a query from the list to respond</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
