"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, MessageSquare, Send, Plus, Clock, CheckCircle, AlertCircle, User, MoreVertical, Paperclip, Mic, Smile, ArrowLeft, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

interface QueryItem {
  id: string
  faculty_id: string
  faculty_name: string
  subject: string
  title: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  last_message?: string
  unread_count?: number
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

export default function StudentQueriesPage() {
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [queries, setQueries] = useState<QueryItem[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null)
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
  const [isMobileView, setIsMobileView] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    fetchStudentData()
    
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
    if (student) {
      fetchAllFaculty()
      fetchQueries()
      setupRealtimeSubscription()
    }
  }, [student])

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery.id)
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

  const fetchAllFaculty = async () => {
    try {
      console.log("Fetching faculty for department:", student?.department)
      
      // Department name mappings for matching (same as leave application)
      const deptMappings: Record<string, string[]> = {
        'cse': ['cse', 'computer science', 'computer science and engineering', 'cs', 'cs&e'],
        'aiml': ['aiml', 'ai ml', 'artificial intelligence', 'ai & ml', 'ai-ml'],
        'aids': ['aids', 'ai ds', 'artificial intelligence and data science', 'ai-ds'],
        'cyber': ['cyber', 'cyber security', 'cybersecurity', 'cyber security and forensics']
      }
      
      // Normalize student department
      const studentDeptLower = student?.department?.toLowerCase().trim() || ''
      let studentDeptKey = 'cse'
      
      for (const [key, values] of Object.entries(deptMappings)) {
        if (values.some(v => studentDeptLower.includes(v))) {
          studentDeptKey = key
          break
        }
      }
      
      console.log("Student department normalized to:", studentDeptKey, "from:", student?.department)
      
      // Fetch ALL faculty first
      const { data: allFaculty, error } = await supabase
        .from("faculty")
        .select("id, name, email, department, subject")
        .order("name", { ascending: true })

      if (error) throw error
      
      // Filter faculty by department using mapping
      const filteredFaculty = (allFaculty || []).filter(f => {
        const facultyDeptLower = f.department?.toLowerCase().trim() || ''
        const matches = deptMappings[studentDeptKey]?.some(v => 
          facultyDeptLower.includes(v) || v.includes(facultyDeptLower)
        ) || facultyDeptLower.includes(studentDeptKey) || studentDeptLower.includes(facultyDeptLower)
        return matches
      })
      
      console.log("Total faculty:", allFaculty?.length, "Filtered:", filteredFaculty.length)
      
      // If no matches, show all faculty as fallback
      if (filteredFaculty.length === 0) {
        console.log("No faculty found for department, showing all faculty")
        setFacultyList(allFaculty || [])
      } else {
        setFacultyList(filteredFaculty)
      }
    } catch (error) {
      console.error("Error fetching faculty:", error)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .eq("student_id", student.id)
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
      .channel("query-messages-student")
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
            if (newMsg.sender_type === "faculty") {
              toast({ title: "New Message", description: `${newMsg.sender_name}: ${newMsg.message.substring(0, 50)}...` })
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queries" },
        () => fetchQueries()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "queries" },
        () => fetchQueries()
      )
      .subscribe()
  }

  const handleCreateQuery = async () => {
    if (!newQuery.title.trim() || !newQuery.description.trim() || !newQuery.faculty_id) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    try {
      const faculty = facultyList.find(f => f.id === newQuery.faculty_id)
      
      const { data: queryData, error: queryError } = await supabase
        .from("queries")
        .insert({
          student_id: student.id,
          faculty_id: newQuery.faculty_id,
          faculty_name: faculty?.name || "Faculty",
          student_name: student.name || student.full_name,
          student_department: student.department,
          student_year: student.year,
          subject: newQuery.subject,
          title: newQuery.title,
          status: "open",
          priority: newQuery.priority
        })
        .select()
        .single()

      if (queryError) throw queryError

      await supabase
        .from("query_messages")
        .insert({
          query_id: queryData.id,
          sender_id: student.id,
          sender_type: "student",
          sender_name: student.name || student.full_name,
          message: newQuery.description
        })

      toast({ title: "Query Created", description: "Your query has been submitted successfully." })
      setNewQuery({ subject: "", title: "", description: "", priority: "medium", faculty_id: "" })
      setIsCreateDialogOpen(false)
      fetchQueries()
    } catch (error) {
      console.error("Error creating query:", error)
      toast({ title: "Error", description: "Failed to create query", variant: "destructive" })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return

    try {
      await supabase
        .from("query_messages")
        .insert({
          query_id: selectedQuery.id,
          sender_id: student.id,
          sender_type: "student",
          sender_name: student.name || student.full_name,
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
    const matchesSearch = !searchTerm || 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getLastMessage = (queryId: string) => {
    if (selectedQuery?.id === queryId && messages.length > 0) {
      return messages[messages.length - 1].message.substring(0, 30) + "..."
    }
    return query.subject || "No messages yet"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // WhatsApp-like layout
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {isMobileView && selectedQuery && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700" onClick={() => setSelectedQuery(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <MessageSquare className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">Queries</h1>
            <p className="text-xs text-blue-100">{facultyList.length} faculty • {student?.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-1" />
                New Query
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New Query</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Select Faculty *</Label>
                  <Select 
                    value={newQuery.faculty_id} 
                    onValueChange={(value) => {
                      const faculty = facultyList.find(f => f.id === value)
                      setNewQuery({ ...newQuery, faculty_id: value, subject: faculty?.subject || "" })
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select faculty" /></SelectTrigger>
                    <SelectContent>
                      {facultyList.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name} - {faculty.subject || faculty.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Subject</Label>
                    <Input placeholder="Subject" value={newQuery.subject} onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Priority</Label>
                    <Select value={newQuery.priority} onValueChange={(value) => setNewQuery({ ...newQuery, priority: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Title *</Label>
                  <Input placeholder="Query title" value={newQuery.title} onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Description *</Label>
                  <Textarea placeholder="Describe your question..." rows={3} value={newQuery.description} onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })} className="mt-1" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateQuery} className="bg-blue-600 hover:bg-blue-700">Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Faculty/Queries List */}
        <div className={`${isMobileView && selectedQuery ? 'hidden' : 'w-full md:w-80 lg:w-96'} bg-white border-r flex flex-col`}>
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
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No queries yet</p>
                <p className="text-sm">Start a new query with a faculty</p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedQuery?.id === query.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                      {query.faculty_name?.charAt(0) || "F"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{query.faculty_name}</h3>
                      <span className="text-xs text-gray-400">{formatTime(query.updated_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{query.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {query.status === "open" && <Clock className="h-3 w-3 text-yellow-500" />}
                      {query.status === "in_progress" && <Clock className="h-3 w-3 text-blue-500" />}
                      {query.status === "resolved" && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <span className="text-xs text-gray-400">{query.subject}</span>
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
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {selectedQuery.faculty_name?.charAt(0) || "F"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedQuery.faculty_name}</h3>
                  <p className="text-xs text-gray-500">{selectedQuery.subject} • {selectedQuery.title}</p>
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
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender_type === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                          message.sender_type === "student" 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-white text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender_type === "student" ? "text-blue-100" : "text-gray-400"}`}>
                          <span className="text-xs">{formatChatTime(message.created_at)}</span>
                          {message.sender_type === "student" && (
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
                    className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 p-0"
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
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Select a query</h3>
                <p>Choose from your existing queries or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
