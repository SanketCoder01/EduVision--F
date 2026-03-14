"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MessageCircle,
  Search,
  Send,
  Check,
  Clock,
  BookOpen,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowLeft,
  CheckCheck,
  Smile,
  Paperclip,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

interface Student {
  id: string
  name: string
  email: string
  department: string
  year: string
  prn?: string
}

interface QueryItem {
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

interface MessageItem {
  id: string
  query_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  message: string
  created_at: string
}

const yearLabels: Record<string, string> = {
  first: "1st Year",
  second: "2nd Year",
  third: "3rd Year",
  fourth: "4th Year",
}

export default function FacultyQueriesPage() {
  const { toast } = useToast()
  const [faculty, setFaculty] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [studentsByYear, setStudentsByYear] = useState<Record<string, Student[]>>({})
  const [queries, setQueries] = useState<QueryItem[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    fetchFacultyData()
    
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (faculty) {
      fetchAllStudents()
      fetchQueries()
      setupRealtimeSubscription()
    }
  }, [faculty])

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery.id)
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

  const fetchAllStudents = async () => {
    try {
      // Fetch students from faculty's department only
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, department, year, prn")
        .eq("department", faculty.department)
        .order("name", { ascending: true })

      if (error) throw error
      
      setStudents(data || [])
      
      const grouped: Record<string, Student[]> = {
        first: [],
        second: [],
        third: [],
        fourth: []
      }
      
      data?.forEach(student => {
        const year = student.year || "first"
        if (!grouped[year]) grouped[year] = []
        grouped[year].push(student)
      })
      
      setStudentsByYear(grouped)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .eq("faculty_id", faculty.id)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setQueries(data || [])
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
      .channel("query-messages-faculty")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "query_messages"
        },
        (payload) => {
          const newMsg = payload.new as MessageItem
          if (selectedQuery?.id === newMsg.query_id) {
            setMessages(prev => [...prev, newMsg])
            if (newMsg.sender_type === "student") {
              toast({ title: "New Message", description: `${newMsg.sender_name}: ${newMsg.message.substring(0, 50)}...` })
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queries" },
        () => fetchQueries()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queries" },
        () => fetchQueries()
      )
      .subscribe()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return

    try {
      await supabase
        .from("query_messages")
        .insert({
          query_id: selectedQuery.id,
          sender_id: faculty.id,
          sender_type: "faculty",
          sender_name: faculty.name || faculty.full_name,
          message: newMessage
        })

      await supabase
        .from("queries")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", selectedQuery.id)

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    }
  }

  const handleResolveQuery = async () => {
    if (!selectedQuery) return

    try {
      await supabase
        .from("queries")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", selectedQuery.id)

      toast({ title: "Query Resolved", description: "The query has been marked as resolved." })
      setSelectedQuery(null)
      fetchQueries()
    } catch (error) {
      console.error("Error resolving query:", error)
      toast({ title: "Error", description: "Failed to resolve query", variant: "destructive" })
    }
  }

  const formatTime = (timestamp: string) => {
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

  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredQueries = queries.filter(q => {
    const matchesYear = !selectedYear || q.student_year === selectedYear
    const matchesSearch = !searchTerm || 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesYear && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // WhatsApp-like layout
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {isMobileView && selectedQuery && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700" onClick={() => setSelectedQuery(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <MessageCircle className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">Student Queries</h1>
            <p className="text-xs text-purple-100">{students.length} students • {faculty?.department}</p>
          </div>
        </div>
        {selectedQuery && (
          <div className="flex items-center gap-2">
            {selectedQuery.status !== "resolved" && (
              <Button variant="ghost" className="text-white hover:bg-purple-700" onClick={handleResolveQuery}>
                <Check className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Students by Year / Queries List */}
        <div className={`${isMobileView && selectedQuery ? 'hidden' : 'w-full md:w-80 lg:w-96'} bg-white border-r flex flex-col`}>
          {/* Year Tabs */}
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${!selectedYear ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600" : "text-gray-600"}`}
            >
              All ({queries.length})
            </button>
            {Object.entries(studentsByYear).map(([year, yearStudents]) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${selectedYear === year ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600" : "text-gray-600"}`}
              >
                {yearLabels[year]} ({yearStudents.length})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-3 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search queries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white rounded-full" 
              />
            </div>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto">
            {filteredQueries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No queries found</p>
                <p className="text-sm">Queries will appear here when students ask questions</p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedQuery?.id === query.id ? "bg-purple-50" : ""
                  }`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-medium">
                      {query.student_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{query.student_name}</h3>
                      <span className="text-xs text-gray-400">{formatTime(query.updated_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{query.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {query.status === "open" && <Clock className="h-3 w-3 text-yellow-500" />}
                      {query.status === "in_progress" && <Clock className="h-3 w-3 text-blue-500" />}
                      {query.status === "resolved" && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <span className="text-xs text-gray-400">{query.subject}</span>
                      <span className="text-xs text-gray-400">• {yearLabels[query.student_year] || query.student_year}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className={`${isMobileView && !selectedQuery ? 'hidden' : 'flex-1'} flex flex-col bg-gray-50`}>
          {selectedQuery ? (
            <>
              {/* Chat Header */}
              <div className="bg-white px-4 py-3 flex items-center gap-3 border-b shadow-sm">
                {isMobileView && (
                  <Button variant="ghost" size="icon" onClick={() => setSelectedQuery(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {selectedQuery.student_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedQuery.student_name}</h3>
                  <p className="text-xs text-gray-500">{selectedQuery.subject} • {yearLabels[selectedQuery.student_year] || selectedQuery.student_year}</p>
                </div>
                <div className="flex items-center gap-1">
                  {selectedQuery.status === "resolved" ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />Resolved
                    </Badge>
                  ) : selectedQuery.status === "in_progress" ? (
                    <Badge className="bg-blue-100 text-blue-700">
                      <Clock className="h-3 w-3 mr-1" />In Progress
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <AlertCircle className="h-3 w-3 mr-1" />Open
                    </Badge>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender_type === "faculty" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                          message.sender_type === "faculty" 
                            ? "bg-purple-600 text-white rounded-br-none" 
                            : "bg-white text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender_type === "faculty" ? "text-purple-100" : "text-gray-400"}`}>
                          <span className="text-xs">{formatChatTime(message.created_at)}</span>
                          {message.sender_type === "faculty" && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-white px-4 py-3 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-full bg-gray-100 border-0"
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
                    className="bg-purple-600 hover:bg-purple-700 rounded-full h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Select a query</h3>
                <p>Choose from student queries to respond</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
