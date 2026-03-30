"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Search, Send, FileText, Trash2, ArrowLeft, CheckCheck,
  Smile, Paperclip, Download, Loader2, Phone, Video, Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface Student {
  id: string
  name: string
  email: string
  department: string
  year: string
  prn?: string
  face_image?: string
}

interface MessageItem {
  id: string
  query_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  message: string
  is_read?: boolean
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
  created_at: string
}

const DEPTS = ['cse', 'cyber', 'cy', 'aids', 'aiml']
const UNIQUE_DEPTS = ['cse', 'cyber', 'aids', 'aiml'] // for display
const YEARS = ['1st', '2nd', '3rd', '4th']

const normalizeDept = (dept: string) => {
  const d = dept?.toLowerCase().trim() || ''
  if (d === 'cse' || d.includes('computer science') || d.includes('cs&e') || (d.startsWith('cs') && d.length <= 4)) return 'cse'
  if (d === 'aiml' || d.includes('machine learning') || d.includes('ai ml') || d.includes('ai & ml')) return 'aiml'
  if (d === 'aids' || d.includes('data science') || d.includes('ai ds') || d.includes('ai & data')) return 'aids'
  if (d === 'cyber' || d === 'cy' || d.includes('cyber') || d.includes('security')) return 'cyber'
  return d
}

// Table names may use 'cy' instead of 'cyber'
const DEPT_TABLE_VARIANTS: Record<string, string[]> = {
  'cse': ['cse'],
  'cyber': ['cyber', 'cy'],
  'aids': ['aids'],
  'aiml': ['aiml'],
}

const normalizeYear = (y: string) => {
  if (!y) return '1st'
  if (y.includes('1') || y.toLowerCase().includes('first')) return '1st'
  if (y.includes('2') || y.toLowerCase().includes('second')) return '2nd'
  if (y.includes('3') || y.toLowerCase().includes('third')) return '3rd'
  if (y.includes('4') || y.toLowerCase().includes('fourth')) return '4th'
  return y
}

const Mic = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>

export default function FacultyQueriesPage() {
  const { toast } = useToast()
  const [faculty, setFaculty] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [queryStudentMap, setQueryStudentMap] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatSubRef = useRef<any>(null)
  const globalSubRef = useRef<any>(null)
  const studentsSubRef = useRef<any>(null)
  const typingTimeoutRef = useRef<any>(null)

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chatSubRef.current?.unsubscribe()
      globalSubRef.current?.unsubscribe()
      studentsSubRef.current?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    loadFaculty()
  }, [])

  useEffect(() => {
    if (faculty) {
      loadAllStudents()
      setupStudentsRealtime()
      loadExistingThreads()
    }
  }, [faculty])

  useEffect(() => {
    if (activeQueryId) {
      fetchMessages(activeQueryId)
      setupChatRealtime(activeQueryId)
      markMessagesRead(activeQueryId)
      // Clear unread count for the selected student
      if (selectedStudent) {
        setUnreadCounts(prev => ({ ...prev, [selectedStudent.id]: 0 }))
      }
    } else {
      setMessages([])
    }
  }, [activeQueryId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadFaculty = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let fac: any = null
      const { data: byId } = await supabase.from("faculty").select("*").eq("id", user.id).maybeSingle()
      if (byId) { fac = byId }
      else {
        const { data: byEmail } = await supabase.from("faculty").select("*").eq("email", user.email).maybeSingle()
        fac = byEmail
      }

      setFaculty(fac || { id: user.id, email: user.email, name: user.user_metadata?.name || user.email?.split('@')[0] || "Faculty", department: user.user_metadata?.department || "CSE" })
    } catch (e) {
      console.error("loadFaculty:", e)
    } finally {
      setLoading(false)
    }
  }

  const loadAllStudents = async () => {
    if (!faculty?.department) return
    const deptCode = normalizeDept(faculty.department)
    // Get all table name variants for this dept (e.g. 'cyber' may also be 'cy')
    const tableVariants = DEPT_TABLE_VARIANTS[deptCode] || [deptCode]
    let all: Student[] = []

    await Promise.all(
      tableVariants.flatMap(deptVariant =>
        YEARS.map(async (yr) => {
          const tbl = `students_${deptVariant}_${yr}_year`
          const { data, error } = await supabase.from(tbl as any).select("id, name, email, department, year, prn, face_image")
          if (!error && data?.length) {
            all = [...all, ...data.map((s: any) => ({ ...s, year: normalizeYear(s.year || yr), department: deptCode }))]
          } else if (error && error.code !== '42P01') {
            console.warn(`${tbl}: ${error.message}`)
          }
        })
      )
    )

    // Deduplicate by id
    const seen = new Set<string>()
    all = all.filter(s => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })

    setStudents(all)
  }

  const setupStudentsRealtime = () => {
    if (!faculty?.department) return
    studentsSubRef.current?.unsubscribe()
    const deptCode = normalizeDept(faculty.department)
    const channel = supabase.channel(`students_rt_${deptCode}`)
    YEARS.forEach(yr => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: `students_${deptCode}_${yr}_year` }, () => loadAllStudents())
    })
    channel.subscribe()
    studentsSubRef.current = channel
  }

  const loadExistingThreads = async () => {
    if (!faculty?.id) return
    // Load all existing conversations for this faculty to build query->student map
    const { data: threads } = await supabase
      .from("queries")
      .select("id, student_id")
      .eq("faculty_id", faculty.id)

    if (threads) {
      const map: Record<string, string> = {}
      threads.forEach((t: any) => { map[t.id] = t.student_id })
      setQueryStudentMap(map)
      setupGlobalRealtime(threads.map((t: any) => t.id))
    }
  }

  const setupGlobalRealtime = (knownQueryIds: string[]) => {
    globalSubRef.current?.unsubscribe()
    const channel = supabase.channel('faculty_global_msgs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'query_messages' }, (payload) => {
        const msg = payload.new as MessageItem
        if (msg.sender_type !== 'student') return
        // Check if this message belongs to our faculty's thread
        if (knownQueryIds.includes(msg.query_id)) {
          if (msg.query_id !== activeQueryId) {
            // It's a background chat - increment unread count
            const studId = queryStudentMap[msg.query_id]
            if (studId) {
              setUnreadCounts(prev => ({ ...prev, [studId]: (prev[studId] || 0) + 1 }))
            }
            toast({
              title: "💬 New Message",
              description: `${msg.sender_name}: ${msg.message.substring(0, 60)}`,
            })
          }
        } else {
          // New thread started by a student - reload threads
          loadExistingThreads()
        }
      })
      .subscribe()
    globalSubRef.current = channel
  }

  const setupChatRealtime = (queryId: string) => {
    chatSubRef.current?.unsubscribe()
    chatSubRef.current = supabase
      .channel(`chat_fac_${queryId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'query_messages', filter: `query_id=eq.${queryId}` }, (payload) => {
        const newMsg = payload.new as MessageItem
        setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'query_messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id))
      })
      .subscribe()
  }

  const fetchMessages = async (queryId: string) => {
    const { data, error } = await supabase
      .from("query_messages")
      .select("*")
      .eq("query_id", queryId)
      .order("created_at", { ascending: true })
    if (!error) setMessages(data || [])
  }

  const markMessagesRead = async (queryId: string) => {
    await supabase
      .from("query_messages")
      .update({ is_read: true })
      .eq("query_id", queryId)
      .eq("sender_type", "student")
  }

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student)
    // Clear unread for this student
    setUnreadCounts(prev => ({ ...prev, [student.id]: 0 }))

    const { data, error } = await supabase
      .from("queries")
      .select("id")
      .eq("faculty_id", faculty.id)
      .eq("student_id", student.id)
      .maybeSingle()

    if (data) {
      setActiveQueryId(data.id)
    } else {
      setActiveQueryId(null)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !faculty) return
    const text = newMessage.trim()
    setNewMessage("")

    try {
      let qid = activeQueryId
      if (!qid) {
        const { data: qData, error: qError } = await supabase
          .from("queries")
          .insert({
            student_id: selectedStudent.id,
            faculty_id: faculty.id,
            faculty_name: faculty.name,
            student_name: selectedStudent.name,
            student_department: selectedStudent.department,
            student_year: selectedStudent.year,
            subject: faculty.subject || "Direct Message",
            title: "Direct Chat",
            status: "open"
          })
          .select().single()
        if (qError) throw qError
        qid = qData.id
        setActiveQueryId(qid)
        // Update maps
        setQueryStudentMap(prev => ({ ...prev, [qid!]: selectedStudent.id }))
      }

      const { error: msgError } = await supabase.from("query_messages").insert({
        query_id: qid,
        sender_id: faculty.id,
        sender_type: "faculty",
        sender_name: faculty.name,
        message: text,
        is_read: false
      })
      if (msgError) throw msgError

      await supabase.from("queries").update({ updated_at: new Date().toISOString() }).eq("id", qid)
    } catch (e: any) {
      setNewMessage(text)
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDeleteMessage = async (msgId: string) => {
    await supabase.from("query_messages").delete().eq("id", msgId).eq("sender_id", faculty.id)
  }

  const handleDeleteConversation = async () => {
    if (!activeQueryId) return
    const confirmed = window.confirm("Delete this entire conversation? This cannot be undone.")
    if (!confirmed) return
    await supabase.from("query_messages").delete().eq("query_id", activeQueryId)
    await supabase.from("queries").delete().eq("id", activeQueryId)
    setActiveQueryId(null)
    setSelectedStudent(null)
    setMessages([])
    toast({ title: "Conversation Deleted" })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedStudent) return
    setIsUploading(true)
    try {
      let qid = activeQueryId
      if (!qid) {
        const { data: qData, error } = await supabase.from("queries").insert({
          student_id: selectedStudent.id, faculty_id: faculty.id,
          faculty_name: faculty.name, student_name: selectedStudent.name,
          student_department: selectedStudent.department, student_year: selectedStudent.year,
          subject: "Direct Message", title: "Direct Chat", status: "open"
        }).select().single()
        if (error) throw error
        qid = qData.id
        setActiveQueryId(qid)
      }

      const fileName = `${qid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('query_attachments').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('query_attachments').getPublicUrl(fileName)

      await supabase.from("query_messages").insert({
        query_id: qid, sender_id: faculty.id, sender_type: "faculty",
        sender_name: faculty.name, message: `📎 ${file.name}`,
        attachment_url: urlData.publicUrl, attachment_type: file.type, attachment_name: file.name, is_read: false
      })
      toast({ title: "File Sent!" })
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const filteredStudents = students.filter(s => {
    const yr = normalizeYear(s.year)
    const matchYear = !selectedYear || yr === selectedYear
    const matchSearch = !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchYear && matchSearch
  })

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading Student Queries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT SIDEBAR ────────────────────────────────────── */}
        <div className={`${isMobileView && selectedStudent ? 'hidden' : 'w-full md:w-[360px]'} bg-white border-r flex flex-col shadow-sm`}>

          {/* Header */}
          <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/30">
                <AvatarImage src={faculty?.face_image} />
                <AvatarFallback className="bg-white/20 text-white font-bold">
                  {faculty?.name?.charAt(0) || "F"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{faculty?.name || "Faculty"}</p>
                <p className="text-white/70 text-xs">{faculty?.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              {totalUnread > 0 && (
                <span className="bg-[#25d366] text-white text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
                  <Bell className="h-3 w-3" />{totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2 bg-white border-b">
            <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                placeholder="Search students..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto bg-white border-b hide-scrollbar">
            <button
              onClick={() => setSelectedYear(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedYear ? 'bg-[#075e54] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >All</button>
            {YEARS.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(selectedYear === yr ? null : yr)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedYear === yr ? 'bg-[#075e54] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{yr} Year</button>
            ))}
          </div>

          {/* Students list */}
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">No students found</p>
                <p className="text-gray-400 text-xs mt-1">
                  {students.length === 0
                    ? "Run the SQL script in Supabase first"
                    : `No students match the current filter`}
                </p>
              </div>
            ) : (
              filteredStudents.map(st => {
                const unread = unreadCounts[st.id] || 0
                const isActive = selectedStudent?.id === st.id
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStudent(st)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={st.face_image} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-bold">
                        {st.name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-[14px] truncate ${unread > 0 ? 'text-[#111b21]' : 'text-[#111b21]'}`}>{st.name}</p>
                        {unread > 0 && (
                          <span className="ml-2 shrink-0 bg-[#25d366] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#667781] truncate">
                        <span className="font-medium text-[#111b21]">{normalizeYear(st.year)} Year</span>
                        {st.prn && <> · PRN: {st.prn}</>}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT CHAT PANEL ────────────────────────────────── */}
        <div className={`${isMobileView && !selectedStudent ? 'hidden' : 'flex-1'} flex flex-col relative`}
          style={{ backgroundImage: 'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>

          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-3 border-b border-gray-200 z-10 relative shadow-sm">
                {isMobileView && (
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-500 mr-1">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setShowStudentProfile(true)}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedStudent.face_image} />
                    <AvatarFallback className="bg-purple-500 text-white font-bold">{selectedStudent.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[15px] text-[#111b21] leading-tight">{selectedStudent.name}</p>
                    <p className="text-xs text-[#667781]">{normalizeYear(selectedStudent.year)} Year · {selectedStudent.department?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#54656f]">
                  <Video className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                  <Phone className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                  <button onClick={handleDeleteConversation} className="hover:text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-[8%] py-4 space-y-1 z-10 relative">
                {messages.length === 0 && (
                  <div className="flex justify-center mt-6">
                    <div className="bg-[#fffde7] text-[#54656f] text-xs px-4 py-2 rounded-lg shadow-sm text-center max-w-xs">
                      🔒 Messages are private between you and {selectedStudent.name}. Click send to start chatting.
                    </div>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.sender_type === "faculty"
                  return (
                    <div key={msg.id} className={`flex group ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                      <div className={`relative max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${isMe ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-opacity shadow-md"
                          >✕</button>
                        )}
                        {msg.attachment_url && (
                          <div className="mb-1">
                            {msg.attachment_type?.startsWith("image/") ? (
                              <img src={msg.attachment_url} alt="Attachment" className="max-w-xs rounded-md" />
                            ) : (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-black/5 rounded-md p-2 text-sm hover:bg-black/10 transition-colors">
                                <FileText className="h-4 w-4 text-[#075e54]" />
                                <span className="truncate max-w-[180px] font-medium">{msg.attachment_name || "File"}</span>
                                <Download className="h-3 w-3 text-gray-500 ml-auto shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                        <div className="flex items-end gap-2 flex-wrap">
                          <span className="text-[14px] text-[#111b21] leading-relaxed break-words">{msg.message}</span>
                          <span className="text-[11px] text-[#667781] ml-auto shrink-0 flex items-center gap-[2px]">
                            {formatTime(msg.created_at)}
                            {isMe && <CheckCheck className={`h-[14px] w-[14px] ${msg.is_read ? 'text-[#53bdeb]' : 'text-[#667781]'}`} />}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 z-10 relative border-t border-gray-200">
                <button className="text-[#54656f] p-2 rounded-full hover:bg-black/5"><Smile className="h-6 w-6" /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.zip" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="text-[#54656f] p-2 rounded-full hover:bg-black/5">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-[#075e54]" /> : <Paperclip className="h-6 w-6" />}
                </button>
                <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 outline-none text-[14px] text-[#111b21] placeholder:text-[#54656f] bg-transparent"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-sm transition-all ${newMessage.trim() ? 'bg-[#075e54] hover:bg-[#054c42]' : 'bg-[#54656f]'}`}
                >
                  {newMessage.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]/80 border-l border-white/30 z-10 relative">
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-[26px] font-light text-[#41525d] mb-2">EduVision Chat</h2>
                <p className="text-[#667781] text-sm leading-relaxed">
                  Select a student from the left panel to start messaging. All conversations are private and end-to-end secured within your department.
                </p>
                <p className="text-[#667781] text-xs mt-3">
                  Showing students from <strong>{faculty?.department}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      <Dialog open={showStudentProfile} onOpenChange={setShowStudentProfile}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-normal text-gray-500">Student Info</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Avatar className="h-32 w-32 mb-4 shadow-lg">
              <AvatarImage src={selectedStudent?.face_image} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-4xl">{selectedStudent?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedStudent?.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{selectedStudent?.email}</p>
            <div className="w-full divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {[
                { label: "Department", value: selectedStudent?.department?.toUpperCase() },
                { label: "Year", value: normalizeYear(selectedStudent?.year || '') + " Year" },
                { label: "PRN", value: selectedStudent?.prn || "Not assigned", mono: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className={`font-medium text-gray-900 text-sm ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
