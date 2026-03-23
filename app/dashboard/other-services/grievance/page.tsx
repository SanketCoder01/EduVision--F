"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AlertCircle, Search, Calendar, User, MessageSquare, FileText, AlertTriangle, CheckCircle, Eye, Lock, ArrowLeft, Send, Loader2, Upload, XCircle } from "lucide-react"

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

const categories = ["Academic", "Administrative", "Infrastructure", "Technology", "Workplace Environment", "Professional Development", "Research Support", "Other"]
const priorities = ["Low", "Medium", "High"]
const years = [
  { id: "first", name: "1st Year" },
  { id: "second", name: "2nd Year" },
  { id: "third", name: "3rd Year" },
  { id: "fourth", name: "4th Year" },
  { id: "all", name: "All Years" }
]

export default function GrievancePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [facultyId, setFacultyId] = useState<string>("")
  const [facultyDepartment, setFacultyDepartment] = useState<string>("")
  const [facultyName, setFacultyName] = useState<string>("")
  const [facultyEmail, setFacultyEmail] = useState<string>("")
  
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([])
  const [studentGrievances, setStudentGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [messages, setMessages] = useState<GrievanceMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  
  const [activeTab, setActiveTab] = useState("my-grievances")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedYears, setSelectedYears] = useState<string[]>(["all"])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadFacultyData() }, [])

  useEffect(() => {
    if (facultyDepartment) {
      loadGrievances()
      setupRealtimeSubscription()
    }
  }, [facultyDepartment])

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const { data: faculty } = await supabase.from("faculty").select("id, department, name, email").eq("email", user.email).single()
      if (faculty) {
        setFacultyId(faculty.id); setFacultyDepartment(faculty.department); setFacultyName(faculty.name || ""); setFacultyEmail(faculty.email)
      }
    } catch (error) { console.error("Error loading faculty data:", error) }
  }

  const loadGrievances = async () => {
    setLoading(true)
    try {
      const { data: myData } = await supabase.from("grievances").select("*").eq("department", facultyDepartment).eq("reporter_type", "faculty").order("created_at", { ascending: false })
      if (myData) setMyGrievances(myData)
      
      const { data: studentData } = await supabase.from("grievances").select("*").eq("department", facultyDepartment).eq("reporter_type", "student").order("created_at", { ascending: false })
      if (studentData) setStudentGrievances(studentData)
    } catch (error) { console.error("Error loading grievances:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel(`grievances-faculty`).on("postgres_changes", { event: "*", schema: "public", table: "grievances", filter: `department=eq.${facultyDepartment}` }, () => {
      loadGrievances()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleYearChange = (yearId: string, checked: boolean) => {
    if (yearId === "all") {
      setSelectedYears(checked ? ["all"] : [])
    } else {
      let updated = selectedYears.filter(y => y !== "all")
      if (checked) updated = [...updated, yearId]
      else updated = updated.filter(y => y !== yearId)
      setSelectedYears(updated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category || !description) {
      toast({ title: "Missing Information", variant: "destructive" }); return
    }
    
    setSubmitting(true)
    try {
      const targetYears = selectedYears.includes("all") ? ["first", "second", "third", "fourth"] : selectedYears
      
      const { error } = await supabase.from("grievances").insert({
        title, category, description, priority: priority.toLowerCase(),
        is_anonymous: isAnonymous, department: facultyDepartment, target_years: targetYears,
        reporter_id: facultyId, reporter_name: isAnonymous ? "Anonymous" : facultyName,
        reporter_email: isAnonymous ? "" : facultyEmail, reporter_type: "faculty",
        status: "pending", 
        assigned_to_name: "University Office", 
        assigned_to_department: "Office Section",
        submitted_to: "office" // Route to office instead of faculty
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Grievance submitted to University Office successfully!" })
      setTitle(""); setCategory(""); setDescription(""); setPriority("Medium"); setIsAnonymous(false); setSelectedYears(["all"]); setActiveTab("my-grievances")
      loadGrievances()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleStatusUpdate = async (grievanceId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() }
      if (newStatus === "resolved") updateData.resolved_at = new Date().toISOString()
      
      const { error } = await supabase.from("grievances").update(updateData).eq("id", grievanceId)
      if (error) throw error
      toast({ title: "Status Updated", description: `Grievance status updated to ${newStatus}` })
      loadGrievances()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const loadMessages = async (grievanceId: string) => {
    const { data } = await supabase.from("grievance_messages").select("*").eq("grievance_id", grievanceId).order("created_at", { ascending: true })
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
        grievance_id: selectedGrievance.id, sender_id: facultyId, sender_name: facultyName,
        sender_type: "faculty", message: newMessage, is_private: false
      })
      if (error) throw error
      setNewMessage("")
      await loadMessages(selectedGrievance.id)
      toast({ title: "Message Added", description: "Your message has been added" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filterGrievances = (grievances: Grievance[]) => {
    return grievances.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || g.category === selectedCategory
      const matchesStatus = selectedStatus === "All" || g.status === selectedStatus.toLowerCase()
      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800"
      case "under_review": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())

  const renderGrievanceCard = (grievance: Grievance, isStudentGrievance = false) => (
    <Card key={grievance.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-lg">
              {grievance.title}
              {grievance.is_anonymous && <Badge variant="outline" className="ml-2 text-xs"><Lock className="h-3 w-3 mr-1" /> Anonymous</Badge>}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
              <Badge variant="outline">{grievance.category}</Badge>
              <Badge className={getPriorityColor(grievance.priority)}>{formatStatus(grievance.priority)} Priority</Badge>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{format(new Date(grievance.created_at), "PP")}</span>
            </div>
          </div>
          <Badge className={getStatusColor(grievance.status)}>{formatStatus(grievance.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 line-clamp-2">{grievance.description}</p>
        {isStudentGrievance && !grievance.is_anonymous && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">{grievance.reporter_name}</p>
            <p className="text-xs text-gray-500">{grievance.reporter_email}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {grievance.target_years.map(y => <Badge key={y} variant="outline" className="text-xs">{y} Year</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleViewDetails(grievance)}><Eye className="h-3 w-3 mr-1" /> View Details</Button>
        {grievance.status !== "resolved" && grievance.status !== "closed" && (
          <Select onValueChange={(value) => handleStatusUpdate(grievance.id, value)}>
            <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Update" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            <p className="text-gray-500 mt-1"><Badge variant="secondary">{facultyDepartment}</Badge></p>
          </div>
        </div>

        <Tabs defaultValue="my-grievances" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[800px] grid-cols-4">
            <TabsTrigger value="my-grievances">My Grievances</TabsTrigger>
            <TabsTrigger value="review-student">Review Student Grievances</TabsTrigger>
            <TabsTrigger value="submit-new">Submit New</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="my-grievances" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search grievances..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filterGrievances(myGrievances).length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No grievances found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">{filterGrievances(myGrievances).map(g => renderGrievanceCard(g))}</div>
            )}
          </TabsContent>

          <TabsContent value="review-student" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search student grievances..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filterGrievances(studentGrievances).length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No student grievances found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">{filterGrievances(studentGrievances).map(g => renderGrievanceCard(g, true))}</div>
            )}
          </TabsContent>

          <TabsContent value="submit-new" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Submit a New Grievance</CardTitle><CardDescription>All submissions are treated with confidentiality</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Grievance Title *</Label><Input placeholder="Clear, concise title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Category *</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Priority</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Target Years</Label><div className="grid grid-cols-2 gap-2">{years.map(y => <div key={y.id} className="flex items-center space-x-2"><Checkbox id={y.id} checked={selectedYears.includes(y.id)} onCheckedChange={(checked) => handleYearChange(y.id, checked as boolean)} /><Label htmlFor={y.id} className="text-sm cursor-pointer">{y.name}</Label></div>)}</div></div>
                  </div>
                  <div className="space-y-2"><Label>Detailed Description *</Label><Textarea placeholder="Provide detailed description..." className="min-h-[150px]" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                  <div className="flex items-center space-x-2">
                    <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    <Label htmlFor="anonymous" className="cursor-pointer">Submit Anonymously</Label>
                    <span className="text-xs text-gray-500">(Your identity will be hidden)</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800">Important Information</h4>
                        <ul className="text-sm text-amber-700 mt-1 list-disc pl-5 space-y-1">
                          <li>All grievances are reviewed by the Grievance Committee.</li>
                          <li>You will receive updates via email and on this portal.</li>
                          <li>False grievances may be subject to disciplinary action.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("my-grievances")}>Cancel</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Grievance"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Grievance Policies & Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anti-Ragging Policy</h3>
                  <p className="text-sm text-gray-600 mb-4">Our institution has a zero-tolerance policy for ragging. Any incidents should be reported immediately through this portal.</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="text-red-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800">Reporting Ragging Incidents</h4>
                        <p className="text-sm text-red-700 mt-1">Anonymous reporting is available to protect your identity.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Grievance Redressal Process</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center"><div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">1</div>Submission</h4>
                      <p className="text-sm text-gray-600 ml-8">Submit grievances through this portal. All submissions receive a unique tracking ID.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center"><div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">2</div>Processing</h4>
                      <p className="text-sm text-gray-600 ml-8">The Grievance Committee reviews all submissions within 48 hours.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center"><div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">3</div>Resolution</h4>
                      <p className="text-sm text-gray-600 ml-8">Target resolution times: High Priority: 7 days, Medium: 14 days, Low: 21 days.</p>
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
                    <Badge className={getPriorityColor(selectedGrievance.priority)}>{formatStatus(selectedGrievance.priority)} Priority</Badge>
                  </div>
                  {selectedGrievance.status !== "resolved" && selectedGrievance.status !== "closed" && (
                    <Select onValueChange={(value) => { handleStatusUpdate(selectedGrievance.id, value); setSelectedGrievance({...selectedGrievance, status: value}) }}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Update Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div><Label className="text-sm text-gray-500">Description</Label><p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedGrievance.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm text-gray-500">Submitted By</Label><p className="text-sm mt-1">{selectedGrievance.is_anonymous ? "Anonymous" : selectedGrievance.reporter_name}</p></div>
                  <div><Label className="text-sm text-gray-500">Date</Label><p className="text-sm mt-1">{format(new Date(selectedGrievance.created_at), "PP")}</p></div>
                </div>
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
                  <div className="mt-3 flex gap-2">
                    <Textarea placeholder="Add a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 min-h-[60px]" />
                    <Button onClick={handleAddMessage} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
                  </div>
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
