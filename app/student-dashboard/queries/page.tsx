"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search, Send, FileText, Trash2, ArrowLeft, CheckCheck,
  Smile, Paperclip, Download, Loader2, Phone, Video, Bell
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  subject?: string
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
const YEARS = ['1st', '2nd', '3rd', '4th']

const normalizeDept = (dept: string) => {
  const d = dept?.toLowerCase().trim() || ''
  if (d === 'cse' || d.includes('computer science') || d.includes('cs&e') || (d.startsWith('cs') && d.length <= 4)) return 'cse'
  if (d === 'aiml' || d.includes('machine learning') || d.includes('ai ml') || d.includes('ai & ml')) return 'aiml'
  if (d === 'aids' || d.includes('data science') || d.includes('ai ds') || d.includes('ai & data')) return 'aids'
  if (d === 'cyber' || d === 'cy' || d.includes('cyber') || d.includes('security')) return 'cyber'
  return d
}

const Mic = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>

export default function StudentQueriesPage() {
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
  const [showFacultyProfile, setShowFacultyProfile] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [queryFacultyMap, setQueryFacultyMap] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatSubRef = useRef<any>(null)
  const globalSubRef = useRef<any>(null)
  const facSubRef = useRef<any>(null)

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chatSubRef.current?.unsubscribe()
      globalSubRef.current?.unsubscribe()
      facSubRef.current?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    loadStudentData()
  }, [])

  useEffect(() => {
    if (student) {
      loadFacultyList()
      setupFacultyRealtime()
      loadExistingThreads()
    }
  }, [student])

  useEffect(() => {
    if (activeQueryId) {
      fetchMessages(activeQueryId)
      setupChatRealtime(activeQueryId)
      markMessagesRead(activeQueryId)
      if (selectedFaculty) {
        setUnreadCounts(prev => ({ ...prev, [selectedFaculty.id]: 0 }))
      }
    } else {
      setMessages([])
    }
  }, [activeQueryId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Scan all 16 tables to find this student
      let studentData: any = null
      let foundDept: string | null = null
      let foundYear: string | null = null

      outer:
      for (const dept of DEPTS) {
        for (const yr of YEARS) {
          const tbl = `students_${dept}_${yr}_year`
          const { data } = await supabase.from(tbl as any).select('*').eq('id', user.id).maybeSingle()
          if (data) {
            studentData = data
            foundDept = dept
            foundYear = yr
            break outer
          }
        }
      }

      if (!studentData) {
        // Fallback: try email
        for (const dept of DEPTS) {
          for (const yr of YEARS) {
            const tbl = `students_${dept}_${yr}_year`
            const { data } = await supabase.from(tbl as any).select('*').eq('email', user.email).maybeSingle()
            if (data) {
              studentData = data
              foundDept = dept
              foundYear = yr
              break
            }
          }
          if (studentData) break
        }
      }

      if (studentData) {
        setStudent({ ...studentData, email: user.email, department: foundDept || studentData.department, year: foundYear || studentData.year })
      } else {
        setStudent({ id: user.id, email: user.email, name: user.user_metadata?.name, department: user.user_metadata?.department, year: user.user_metadata?.year })
      }
    } catch (e) {
      console.error("loadStudentData:", e)
    } finally {
      setLoading(false)
    }
  }

  const loadFacultyList = async () => {
    if (!student) return
    const { data: allFaculty, error } = await supabase
      .from("faculty")
      .select("id, name, email, department, subject, face_image")
      .order("name", { ascending: true })

    if (error) { console.error("loadFacultyList:", error); return }
    const all = allFaculty || []
    if (all.length === 0) { setFacultyList([]); return }

    const myDeptCode = normalizeDept(student.department || '')
    // Filter faculty whose normalized department matches student's
    const filtered = all.filter(f => normalizeDept(f.department || '') === myDeptCode)
    // If still nothing show all faculty (better than empty)
    setFacultyList(filtered.length > 0 ? filtered : all)
  }

  const setupFacultyRealtime = () => {
    facSubRef.current?.unsubscribe()
    const channel = supabase.channel('faculty_list_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faculty' }, () => loadFacultyList())
      .subscribe()
    facSubRef.current = channel
  }

  const loadExistingThreads = async () => {
    if (!student?.id) return
    const { data: threads } = await supabase
      .from("queries")
      .select("id, faculty_id")
      .eq("student_id", student.id)

    if (threads) {
      const map: Record<string, string> = {}
      const queryIds: string[] = []
      threads.forEach((t: any) => { map[t.id] = t.faculty_id; queryIds.push(t.id) })
      setQueryFacultyMap(map)
      setupGlobalRealtime(queryIds, map)
    }
  }

  const setupGlobalRealtime = (queryIds: string[], map: Record<string, string>) => {
    globalSubRef.current?.unsubscribe()
    const channel = supabase.channel('student_global_msgs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'query_messages' }, (payload) => {
        const msg = payload.new as MessageItem
        if (msg.sender_type !== 'faculty') return
        if (queryIds.includes(msg.query_id)) {
          if (msg.query_id !== activeQueryId) {
            const facId = map[msg.query_id]
            if (facId) setUnreadCounts(prev => ({ ...prev, [facId]: (prev[facId] || 0) + 1 }))
            toast({ title: "💬 New Reply", description: `${msg.sender_name}: ${msg.message.substring(0, 60)}` })
          }
        } else {
          loadExistingThreads()
        }
      })
      .subscribe()
    globalSubRef.current = channel
  }

  const setupChatRealtime = (queryId: string) => {
    chatSubRef.current?.unsubscribe()
    chatSubRef.current = supabase
      .channel(`chat_std_${queryId}`)
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
    const { data, error } = await supabase.from("query_messages").select("*").eq("query_id", queryId).order("created_at", { ascending: true })
    if (!error) setMessages(data || [])
  }

  const markMessagesRead = async (queryId: string) => {
    await supabase.from("query_messages").update({ is_read: true }).eq("query_id", queryId).eq("sender_type", "faculty")
  }

  const handleSelectFaculty = async (fac: Faculty) => {
    setSelectedFaculty(fac)
    setUnreadCounts(prev => ({ ...prev, [fac.id]: 0 }))

    const { data } = await supabase
      .from("queries")
      .select("id")
      .eq("student_id", student.id)
      .eq("faculty_id", fac.id)
      .maybeSingle()

    if (data) {
      setActiveQueryId(data.id)
    } else {
      setActiveQueryId(null)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFaculty || !student) return
    const text = newMessage.trim()
    setNewMessage("")

    try {
      let qid = activeQueryId
      if (!qid) {
        const { data: qData, error } = await supabase
          .from("queries")
          .insert({
            student_id: student.id,
            faculty_id: selectedFaculty.id,
            faculty_name: selectedFaculty.name,
            student_name: student.name || student.full_name,
            student_department: student.department,
            student_year: student.year,
            subject: selectedFaculty.subject || "Direct Message",
            title: "Direct Chat",
            status: "open"
          })
          .select().single()
        if (error) throw error
        qid = qData.id
        setActiveQueryId(qid)
        setQueryFacultyMap(prev => ({ ...prev, [qid!]: selectedFaculty.id }))
      }

      const { error: msgError } = await supabase.from("query_messages").insert({
        query_id: qid,
        sender_id: student.id,
        sender_type: "student",
        sender_name: student.name || student.full_name,
        message: text,
        is_read: false
      })
      if (msgError) throw msgError

      await supabase.from("queries").update({ updated_at: new Date().toISOString() }).eq("id", qid)
    } catch (e: any) {
      setNewMessage(text)
      toast({ title: "Error sending", description: e.message, variant: "destructive" })
    }
  }

  const handleDeleteMessage = async (msgId: string) => {
    await supabase.from("query_messages").delete().eq("id", msgId).eq("sender_id", student.id)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedFaculty || !student) return
    setIsUploading(true)
    try {
      let qid = activeQueryId
      if (!qid) {
        const { data: qData, error } = await supabase.from("queries").insert({
          student_id: student.id, faculty_id: selectedFaculty.id,
          faculty_name: selectedFaculty.name, student_name: student.name || student.full_name,
          student_department: student.department, student_year: student.year,
          subject: selectedFaculty.subject || "Direct Message", title: "Direct Chat", status: "open"
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
        query_id: qid, sender_id: student.id, sender_type: "student",
        sender_name: student.name || student.full_name,
        message: `📎 ${file.name}`,
        attachment_url: urlData.publicUrl, attachment_type: file.type,
        attachment_name: file.name, is_read: false
      })
      await supabase.from("queries").update({ updated_at: new Date().toISOString() }).eq("id", qid)
      toast({ title: "File Sent!" })
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const filteredFaculty = facultyList.filter(f =>
    !searchTerm ||
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f0f2f5]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#075e54] mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading queries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT SIDEBAR ─── */}
        <div className={`${isMobileView && selectedFaculty ? 'hidden' : 'w-full md:w-[360px]'} bg-white border-r flex flex-col shadow-sm`}>

          {/* Header */}
          <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/30">
                <AvatarImage src={student?.face_image} />
                <AvatarFallback className="bg-white/20 text-white font-bold">{student?.name?.charAt(0) || "S"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{student?.name || "Student"}</p>
                <p className="text-white/70 text-xs">{student?.department?.toUpperCase()} · {student?.year} Year</p>
              </div>
            </div>
            {totalUnread > 0 && (
              <span className="bg-[#25d366] text-white text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
                <Bell className="h-3 w-3" />{totalUnread}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="px-3 py-2 bg-white border-b">
            <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Faculty list */}
          <div className="flex-1 overflow-y-auto">
            {filteredFaculty.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">No faculty found</p>
                <p className="text-gray-400 text-xs mt-1">
                  {facultyList.length === 0 ? "Run the SQL script in Supabase first" : "Try a different search"}
                </p>
              </div>
            ) : (
              filteredFaculty.map(fac => {
                const unread = unreadCounts[fac.id] || 0
                const isActive = selectedFaculty?.id === fac.id
                return (
                  <div
                    key={fac.id}
                    onClick={() => handleSelectFaculty(fac)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={fac.face_image} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-500 text-white font-bold">
                        {fac.name?.charAt(0) || "F"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[14px] text-[#111b21] truncate">{fac.name}</p>
                        {unread > 0 && (
                          <span className="ml-2 shrink-0 bg-[#25d366] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#667781] truncate">{fac.subject || 'Faculty'}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT CHAT PANEL ─── */}
        <div
          className={`${isMobileView && !selectedFaculty ? 'hidden' : 'flex-1'} flex flex-col relative`}
          style={{ backgroundImage: 'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}
        >
          {selectedFaculty ? (
            <>
              {/* Header */}
              <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-3 border-b border-gray-200 z-10 relative shadow-sm">
                {isMobileView && (
                  <button onClick={() => setSelectedFaculty(null)} className="text-gray-500 mr-1">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setShowFacultyProfile(true)}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedFaculty.face_image} />
                    <AvatarFallback className="bg-teal-500 text-white font-bold">{selectedFaculty.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[15px] text-[#111b21] leading-tight">{selectedFaculty.name}</p>
                    <p className="text-xs text-[#667781]">{selectedFaculty.subject || selectedFaculty.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#54656f]">
                  <Video className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                  <Phone className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-[8%] py-4 space-y-1 z-10 relative">
                {messages.length === 0 && (
                  <div className="flex justify-center mt-6">
                    <div className="bg-[#fffde7] text-[#54656f] text-xs px-4 py-2 rounded-lg shadow-sm text-center max-w-xs">
                      🔒 Your messages to {selectedFaculty.name} are private. Only you and {selectedFaculty.name} can see this conversation.
                    </div>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.sender_type === "student"
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
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]/80 z-10 relative">
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-[26px] font-light text-[#41525d] mb-2">EduVision Chat</h2>
                <p className="text-[#667781] text-sm leading-relaxed">
                  Select a faculty member to start a private conversation. Your messages are visible only to you and the faculty you choose.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Profile Modal */}
      <Dialog open={showFacultyProfile} onOpenChange={setShowFacultyProfile}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-normal text-gray-500">Faculty Info</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Avatar className="h-32 w-32 mb-4 shadow-lg">
              <AvatarImage src={selectedFaculty?.face_image} />
              <AvatarFallback className="bg-teal-100 text-teal-600 text-4xl">{selectedFaculty?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedFaculty?.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{selectedFaculty?.email}</p>
            <div className="w-full divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {[
                { label: "Department", value: selectedFaculty?.department },
                { label: "Subject", value: selectedFaculty?.subject || "Not assigned" },
                { label: "Role", value: "Sr. Faculty Member" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="font-medium text-gray-900 text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
