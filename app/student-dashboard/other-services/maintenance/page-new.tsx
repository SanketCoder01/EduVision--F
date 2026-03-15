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
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle, ArrowLeft, Building, Check, Clock, FileText, Filter, Home, Image, 
  Lightbulb, Loader2, MapPin, MessageSquare, Plus, Search, Settings, Thermometer, 
  Upload, Wifi, Wrench
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface MaintenanceRequest {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_prn: string
  department: string
  year: string
  title: string
  category: string
  location: string
  description: string
  priority: string
  image_url: string
  status: string
  submitted_to: string
  assigned_to: string
  resolved_at: string
  resolution_notes: string
  created_at: string
  updated_at: string
}

const categories = [
  { id: "electrical", name: "Electrical", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "plumbing", name: "Plumbing", icon: <Thermometer className="h-4 w-4" /> },
  { id: "furniture", name: "Furniture", icon: <Home className="h-4 w-4" /> },
  { id: "network", name: "Network/IT", icon: <Wifi className="h-4 w-4" /> },
  { id: "hvac", name: "HVAC/AC", icon: <Thermometer className="h-4 w-4" /> },
  { id: "cleaning", name: "Cleaning/Hygiene", icon: <Wrench className="h-4 w-4" /> },
  { id: "structural", name: "Structural", icon: <Building className="h-4 w-4" /> },
  { id: "other", name: "Other", icon: <Settings className="h-4 w-4" /> },
]

const locations = [
  { id: "hostel-a", name: "Hostel Block A" },
  { id: "hostel-b", name: "Hostel Block B" },
  { id: "hostel-c", name: "Hostel Block C" },
  { id: "academic-main", name: "Academic Building (Main)" },
  { id: "academic-cs", name: "Computer Science Building" },
  { id: "library", name: "Library" },
  { id: "canteen", name: "Canteen/Mess" },
  { id: "sports", name: "Sports Complex" },
  { id: "other", name: "Other" },
]

export default function MaintenancePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPRN, setStudentPRN] = useState("")
  const [studentDepartment, setStudentDepartment] = useState("")
  const [studentYear, setStudentYear] = useState("")
  
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [priority, setPriority] = useState("medium")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentId) {
      loadRequests()
      setupRealtimeSubscription()
    }
  }, [studentId])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const tables = [
        'students_cse_1st_year', 'students_cse_2nd_year', 'students_cse_3rd_year', 'students_cse_4th_year',
        'students_cyber_1st_year', 'students_cyber_2nd_year', 'students_cyber_3rd_year', 'students_cyber_4th_year',
        'students_aids_1st_year', 'students_aids_2nd_year', 'students_aids_3rd_year', 'students_aids_4th_year',
        'students_aiml_1st_year', 'students_aiml_2nd_year', 'students_aiml_3rd_year', 'students_aiml_4th_year'
      ]
      
      for (const table of tables) {
        const { data: student } = await supabase.from(table).select("id, department, year, email, name, prn").eq("email", user.email).single()
        if (student) {
          setStudentId(student.id); setStudentDepartment(student.department); setStudentYear(student.year)
          setStudentEmail(student.email); setStudentName(student.name || ""); setStudentPRN(student.prn || "")
          break
        }
      }
    } catch (error) { console.error("Error loading student data:", error) }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("maintenance_requests").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (error) throw error
      if (data) setRequests(data)
    } catch (error) { console.error("Error loading requests:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`maintenance-student-${studentId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "maintenance_requests", filter: `student_id=eq.${studentId}` }, 
        (payload) => {
          const updated = payload.new as MaintenanceRequest
          if (updated.status === "resolved") {
            toast({ title: "Request Resolved!", description: `Your "${updated.title}" complaint has been resolved.` })
          } else if (updated.status === "in_progress") {
            toast({ title: "Request In Progress", description: `Your "${updated.title}" complaint is being worked on.` })
          }
          loadRequests()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !selectedCategory || !selectedLocation || !description) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    
    setSubmitting(true)
    try {
      const { error } = await supabase.from("maintenance_requests").insert({
        student_id: studentId, student_name: studentName, student_email: studentEmail, student_prn: studentPRN,
        department: studentDepartment, year: studentYear,
        title, category: selectedCategory, location: `${locations.find(l => l.id === selectedLocation)?.name || selectedLocation}${specificLocation ? ` - ${specificLocation}` : ''}`,
        description, priority, status: "pending", submitted_to: "university"
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Maintenance complaint submitted to University Office!" })
      setTitle(""); setSelectedCategory(""); setSelectedLocation(""); setDescription(""); setSpecificLocation(""); setPriority("medium")
      loadRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-700"
      case "in_progress": return "bg-blue-100 text-blue-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/student-dashboard/other-services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Wrench className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Complaints</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Submit to University Office • <Badge variant="secondary">{studentDepartment}</Badge></p>
          </div>
        </div>

        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-sm text-blue-800">All maintenance complaints are submitted directly to the University Office for resolution. You will receive real-time updates on the status of your complaints.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="complaints" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-2">
            <TabsTrigger value="complaints">My Complaints</TabsTrigger>
            <TabsTrigger value="new">New Complaint</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Maintenance Complaints</CardTitle>
                <CardDescription>Track the status of your reported issues</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search complaints..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-8 text-center"><AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No maintenance complaints found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <motion.div key={request.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                            {request.status === "resolved" ? <Check className="h-6 w-6" /> : request.status === "in_progress" ? <Settings className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.title}</h3>
                              <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{request.status.replace('_', ' ').toUpperCase()}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />{request.location}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(request.created_at).toLocaleDateString()}</div>
                              <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"><MapPin className="h-3 w-3 mr-1" />{request.category}</div>
                            </div>
                            {request.resolution_notes && <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-600">{request.resolution_notes}</div>}
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
              <CardHeader><CardTitle>Submit New Complaint</CardTitle><CardDescription>Report a maintenance issue to University Office</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}><div className="flex items-center">{c.icon}<span className="ml-2">{c.name}</span></div></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location *</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title *</label>
                      <Input placeholder="Brief title of the issue" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specific Location</label>
                      <Input placeholder="Room number, floor, etc." value={specificLocation} onChange={(e) => setSpecificLocation(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Wrench className="h-4 w-4 mr-2" />Submit to University Office</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
