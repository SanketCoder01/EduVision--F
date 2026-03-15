"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { 
  AlertCircle, Calendar, Check, Clock, Eye, EyeOff, FileText, Filter, HelpCircle, Lock, MessageSquare, Plus, Search, Shield, Upload, User, ArrowLeft, Send, Loader2, AlertTriangle
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Grievance {
  id: string
  title: string
  category: string
  status: string
  priority: string
  description: string
  is_anonymous: boolean
  department: string
  target_years: string[]
  reporter_id: string
  reporter_name: string
  reporter_email: string
  reporter_type: string
  assigned_to_name: string
  assigned_to_department: string
  resolved_at: string
  created_at: string
  updated_at: string
}

interface GrievanceMessage {
  id: string
  grievance_id: string
  sender_id: string
  sender_name: string
  sender_type: string
  message: string
  is_private: boolean
  created_at: string
}

const categories = [
  { id: "Academic", name: "Academic", description: "Issues related to courses, grading, exams, etc." },
  { id: "Ragging/Harassment", name: "Ragging/Harassment", description: "Any form of ragging, bullying, or harassment" },
  { id: "Infrastructure", name: "Infrastructure", description: "Issues with facilities, buildings, amenities, etc." },
  { id: "Administrative", name: "Administrative", description: "Issues with administrative processes, documents, etc." },
  { id: "Discrimination", name: "Discrimination", description: "Any form of discrimination based on gender, caste, religion, etc." },
  { id: "Other", name: "Other", description: "Any other issues not covered in the above categories" }
]

export default function GrievancePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState<string>("")
  const [studentDepartment, setStudentDepartment] = useState<string>("")
  const [studentYear, setStudentYear] = useState<string>("")
  const [studentName, setStudentName] = useState<string>("")
  const [studentEmail, setStudentEmail] = useState<string>("")
  
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [messages, setMessages] = useState<GrievanceMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentDepartment && studentYear) {
      loadGrievances()
      setupRealtimeSubscription()
    }
  }, [studentDepartment, studentYear])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const tables = ["students_cse_first", "students_cse_second", "students_cse_third", "students_cse_fourth"]
      for (const table of tables) {
        const { data: student } = await supabase.from(table).select("id, department, year, name, email").eq("email", user.email).single()
        if (student) {
          setStudentId(student.id); setStudentDepartment(student.department); setStudentYear(student.year); setStudentName(student.name || ""); setStudentEmail(student.email)
          break
        }
      }
    } catch (error) { console.error("Error loading student data:", error) }
  }

  const loadGrievances = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from("grievances").select("*").eq("department", studentDepartment).eq("reporter_type", "student").or(`reporter_id.eq.${studentId},target_years.cs.{${studentYear}}`).order("created_at", { ascending: false })
      if (data) setGrievances(data)
    } catch (error) { console.error("Error loading grievances:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel(`grievances-student`).on("postgres_changes", { event: "*", schema: "public", table: "grievances", filter: `department=eq.${studentDepartment}` }, () => {
      loadGrievances()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category || !description) {
      toast({ title: "Missing Information", variant: "destructive" }); return
    }
    
    setSubmitting(true)
    try {
      const { error } = await supabase.from("grievances").insert({
        title, category, description, priority: "medium",
        is_anonymous: isAnonymous, department: studentDepartment, target_years: [studentYear],
        reporter_id: studentId, reporter_name: isAnonymous ? "Anonymous" : studentName,
        reporter_email: isAnonymous ? "" : studentEmail, reporter_type: "student",
        status: "pending", 
        assigned_to_name: "University Office", 
        assigned_to_department: "Office Section",
        submitted_to: "office" // Route to office instead of faculty
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Grievance submitted to University Office successfully!" })
      setTitle(""); setCategory(""); setDescription(""); setIsAnonymous(false)
      loadGrievances()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const loadMessages = async (grievanceId: string) => {
    const { data } = await supabase.from("grievance_messages").select("*").eq("grievance_id", grievanceId).or(`is_private.eq.false,sender_id.eq.${studentId}`).order("created_at", { ascending: true })
    if (data) setMessages(data)
  }

  const handleViewDetails = async (grievance: Grievance) => {
    setSelectedGrievance(grievance)
    setShowDetailsDialog(true)
    await loadMessages(grievance.id)
  }

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !selectedGrievance) return
    
    try {
      const { error } = await supabase.from("grievance_messages").insert({
        grievance_id: selectedGrievance.id, sender_id: studentId, sender_name: studentName,
        sender_type: "student", message: newMessage, is_private: true
      })
      if (error) throw error
      setNewMessage("")
      await loadMessages(selectedGrievance.id)
      toast({ title: "Message Added", description: "Your message has been added" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filterGrievances = (grievanceList: Grievance[]) => {
    return grievanceList.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || g.category === selectedCategory
      const matchesStatus = selectedStatus === "All" || g.status === selectedStatus.toLowerCase()
      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-700"
      case "under_review": return "bg-purple-100 text-purple-700"
      case "in_progress": return "bg-yellow-100 text-yellow-700"
      case "resolved": return "bg-green-100 text-green-700"
      case "closed": return "bg-gray-100 text-gray-700"
      default: return "bg-blue-100 text-blue-700"
    }
  }

  const formatStatus = (status: string) => status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/student-dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-700"><Shield className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11"><Badge variant="secondary">{studentDepartment}</Badge> • <Badge variant="outline">{studentYear} Year</Badge></p>
          </div>
        </div>

        <Tabs defaultValue="grievances" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="grievances">My Grievances</TabsTrigger>
            <TabsTrigger value="new">New Grievance</TabsTrigger>
            <TabsTrigger value="info">Information & Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="grievances" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Grievances</CardTitle>
                <CardDescription>Track the status of your reported grievances</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search grievances..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filterGrievances(grievances).length === 0 ? (
                  <div className="py-8 text-center"><AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No grievances found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filterGrievances(grievances).map(g => (
                      <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(g.status)}`}>
                            {g.status === "resolved" ? <Check className="h-6 w-6" /> : g.status === "in_progress" ? <Clock className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-gray-900">{g.title}</h3>
                                {g.is_anonymous && <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center"><EyeOff className="h-3 w-3 mr-1" />Anonymous</div>}
                              </div>
                              <Badge className={`${getStatusColor(g.status)} border-0 mt-1 sm:mt-0`}>{formatStatus(g.status)}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <div className="flex items-center text-xs text-gray-500"><FileText className="h-3 w-3 mr-1" />{g.category}</div>
                              <div className="flex items-center text-xs text-gray-500"><AlertCircle className="h-3 w-3 mr-1" />Priority: {formatStatus(g.priority)}</div>
                              <div className="flex items-center text-xs text-gray-500"><Calendar className="h-3 w-3 mr-1" />{format(new Date(g.created_at), "PP")}</div>
                              {g.resolved_at && <div className="flex items-center text-xs text-gray-500"><Check className="h-3 w-3 mr-1" />Resolved: {format(new Date(g.resolved_at), "PP")}</div>}
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{g.description}</p>
                            {g.assigned_to_name && <div className="mt-3 flex items-center text-xs text-gray-500"><span className="font-medium">Assigned to:</span><span className="ml-1">{g.assigned_to_name} ({g.assigned_to_department})</span></div>}
                            <div className="mt-4 flex justify-end">
                              <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700" onClick={() => handleViewDetails(g)}><Eye className="h-3 w-3 mr-1" />View Details</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Submit a New Grievance</CardTitle><CardDescription>Fill out the form below to report a grievance or incident</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Grievance Title *</label><Input placeholder="Brief title describing the issue" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Category *</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                    {category && <p className="text-xs text-gray-500 mt-1">{categories.find(c => c.id === category)?.description}</p>}
                  </div>
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Description *</label><Textarea placeholder="Provide detailed description of the issue..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required /></div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="anonymous" className="text-sm font-medium leading-none">Submit Anonymously</Label>
                      <p className="text-xs text-gray-500">Your identity will be hidden from everyone except the grievance committee.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Important Information</h3>
                        <p className="text-xs text-gray-600 mt-1">All grievances are taken seriously and will be investigated thoroughly. False complaints may result in disciplinary action.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4"><Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Grievance"}</Button></div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Grievance Policies & Information</CardTitle><CardDescription>Learn about the grievance redressal process and anti-ragging policies</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Anti-Ragging Policy</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-gray-800 font-medium">Zero Tolerance Policy</p>
                      <p className="text-sm text-gray-600 mt-1">The university maintains a strict zero-tolerance policy towards ragging. Any student found guilty will face severe disciplinary action, including expulsion.</p>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3">
                      <li>Any conduct that causes physical or psychological harm.</li>
                      <li>Asking students to perform acts which cause shame or embarrassment.</li>
                      <li>Any act of financial extortion or forceful expenditure.</li>
                      <li>Any act that affects mental health and self-confidence.</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Grievance Redressal Process</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto"><span className="text-gray-700 font-medium">1</span></div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Submission</h4>
                        <p className="text-xs text-gray-600 text-center">Submit your grievance through this portal with all relevant details.</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto"><span className="text-gray-700 font-medium">2</span></div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Processing</h4>
                        <p className="text-xs text-gray-600 text-center">Your grievance will be reviewed and assigned to the appropriate committee.</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-3 mx-auto"><span className="text-gray-700 font-medium">3</span></div>
                        <h4 className="text-center font-medium text-gray-800 mb-2">Resolution</h4>
                        <p className="text-xs text-gray-600 text-center">After investigation, appropriate action will be taken and you will be notified.</p>
                      </div>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li><span className="font-medium">Acknowledgment:</span> Within 24 hours</li>
                      <li><span className="font-medium">Initial Assessment:</span> Within 3 working days</li>
                      <li><span className="font-medium">Investigation:</span> 7-14 working days</li>
                      <li><span className="font-medium">Resolution:</span> Within 21 working days</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Anti-Ragging Committee</h4>
                        <p className="text-sm text-gray-600">Email: antiragging@university.edu</p>
                        <p className="text-sm text-gray-600">Phone: +91-9876543210</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Grievance Redressal Cell</h4>
                        <p className="text-sm text-gray-600">Email: grievance@university.edu</p>
                        <p className="text-sm text-gray-600">Phone: +91-1234567890</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-1">Emergency Helpline (24x7)</h4>
                      <p className="text-sm text-gray-600">For urgent cases: <span className="font-medium">1800-XXX-XXXX</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedGrievance?.title}</DialogTitle>
              <DialogDescription>{selectedGrievance?.category} • {selectedGrievance?.id}</DialogDescription>
            </DialogHeader>
            {selectedGrievance && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(selectedGrievance.status)}>{formatStatus(selectedGrievance.status)}</Badge>
                    <Badge variant="outline">{formatStatus(selectedGrievance.priority)} Priority</Badge>
                  </div>
                </div>
                <div><Label className="text-sm text-gray-500">Description</Label><p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedGrievance.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm text-gray-500">Submitted By</Label><p className="text-sm mt-1">{selectedGrievance.is_anonymous ? "Anonymous" : selectedGrievance.reporter_name}</p></div>
                  <div><Label className="text-sm text-gray-500">Date</Label><p className="text-sm mt-1">{format(new Date(selectedGrievance.created_at), "PP")}</p></div>
                </div>
                {selectedGrievance.assigned_to_name && (
                  <div><Label className="text-sm text-gray-500">Assigned To</Label><p className="text-sm mt-1">{selectedGrievance.assigned_to_name} ({selectedGrievance.assigned_to_department})</p></div>
                )}
                <div>
                  <Label className="text-sm text-gray-500">Messages</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
                    {messages.length === 0 ? <p className="text-sm text-gray-500">No messages yet</p> : messages.map(m => (
                      <div key={m.id} className="p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{m.sender_name} <Badge variant="outline" className="text-xs ml-1">{m.sender_type}</Badge></span>
                          <span className="text-xs text-gray-500">{format(new Date(m.created_at), "PPp")}</span>
                        </div>
                        <p className="text-sm text-gray-700">{m.message}</p>
                      </div>
                    ))}
                  </div>
                  {selectedGrievance.status !== "resolved" && selectedGrievance.status !== "closed" && (
                    <div className="mt-3 flex gap-2">
                      <Textarea placeholder="Add a private message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 min-h-[60px]" />
                      <Button onClick={handleAddMessage} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
