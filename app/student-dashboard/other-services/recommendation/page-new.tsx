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
  AlertCircle, ArrowLeft, Award, Check, Clock, Download, FileText, GraduationCap, 
  Loader2, Mail, Search, Send, Star, User, UserCheck
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface RecommendationRequest {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_prn: string
  department: string
  year: string
  purpose: string
  target_type: string
  target_name: string
  program_position: string
  deadline: string
  additional_notes: string
  achievements: string
  status: string
  submitted_to: string
  document_url: string
  notes: string
  processed_at: string
  processed_by: string
  created_at: string
}

const purposeTypes = [
  { id: "graduate_school", name: "Graduate School Application", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "job", name: "Job Application", icon: <UserCheck className="h-4 w-4" /> },
  { id: "scholarship", name: "Scholarship Application", icon: <Award className="h-4 w-4" /> },
  { id: "internship", name: "Internship Application", icon: <Star className="h-4 w-4" /> },
  { id: "other", name: "Other", icon: <FileText className="h-4 w-4" /> },
]

export default function RecommendationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPRN, setStudentPRN] = useState("")
  const [studentDepartment, setStudentDepartment] = useState("")
  const [studentYear, setStudentYear] = useState("")
  
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [purpose, setPurpose] = useState("")
  const [targetType, setTargetType] = useState("")
  const [targetName, setTargetName] = useState("")
  const [programPosition, setProgramPosition] = useState("")
  const [deadline, setDeadline] = useState("")
  const [achievements, setAchievements] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
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
      
      const tables = ['students_cse_1st_year', 'students_cse_2nd_year', 'students_cse_3rd_year', 'students_cse_4th_year',
        'students_cyber_1st_year', 'students_cyber_2nd_year', 'students_cyber_3rd_year', 'students_cyber_4th_year',
        'students_aids_1st_year', 'students_aids_2nd_year', 'students_aids_3rd_year', 'students_aids_4th_year',
        'students_aiml_1st_year', 'students_aiml_2nd_year', 'students_aiml_3rd_year', 'students_aiml_4th_year']
      
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
      const { data, error } = await supabase.from("recommendation_requests").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (error) throw error
      if (data) setRequests(data)
    } catch (error) { console.error("Error loading requests:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`recommendations-student-${studentId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "recommendation_requests", filter: `student_id=eq.${studentId}` }, 
        (payload) => {
          const updated = payload.new as RecommendationRequest
          if (updated.status === "approved" && updated.document_url) {
            toast({ title: "Letter Ready!", description: `Your recommendation letter is ready for download.` })
          } else if (updated.status === "in_progress") {
            toast({ title: "In Progress", description: `Your recommendation letter request is being processed.` })
          }
          loadRequests()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose || !targetType || !targetName) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    
    setSubmitting(true)
    try {
      const { error } = await supabase.from("recommendation_requests").insert({
        student_id: studentId, student_name: studentName, student_email: studentEmail, student_prn: studentPRN,
        department: studentDepartment, year: studentYear,
        purpose, target_type: targetType, target_name: targetName, program_position: programPosition,
        deadline, achievements, additional_notes,
        status: "pending", submitted_to: "university"
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Recommendation letter request submitted to University Office!" })
      setPurpose(""); setTargetType(""); setTargetName(""); setProgramPosition(""); setDeadline(""); setAchievements(""); setAdditionalNotes("")
      loadRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700"
      case "in_progress": return "bg-blue-100 text-blue-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Award className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Recommendation Letter</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request letters from University Office • <Badge variant="secondary">{studentDepartment}</Badge></p>
          </div>
        </div>

        <div className="mb-6 p-4 border border-amber-200 rounded-lg bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Recommendation Letter Process</h3>
              <p className="text-sm text-amber-800">Submit your request to the University Office. Please provide detailed information about your achievements and the purpose of the letter. Letters are typically processed within 5-7 business days.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-2">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Recommendation Requests</CardTitle>
                <CardDescription>Track the status of your letter requests</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search requests..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-8 text-center"><Award className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No recommendation requests found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <motion.div key={request.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                            {request.status === "approved" ? <Check className="h-6 w-6" /> : request.status === "in_progress" ? <FileText className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.purpose}</h3>
                              <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{request.status.toUpperCase()}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Mail className="h-4 w-4 mr-1" />{request.target_name}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{request.program_position}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(request.created_at).toLocaleDateString()}</div>
                              {request.deadline && <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Deadline: {request.deadline}</div>}
                            </div>
                            {request.notes && <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600">{request.notes}</div>}
                            {request.status === "approved" && request.document_url && (
                              <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700"><Download className="h-4 w-4 mr-2" />Download Letter</Button>
                            )}
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
              <CardHeader><CardTitle>Request Recommendation Letter</CardTitle><CardDescription>Submit a request for a recommendation letter</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Purpose *</label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                        <SelectContent>{purposeTypes.map(p => <SelectItem key={p.id} value={p.name}><div className="flex items-center">{p.icon}<span className="ml-2">{p.name}</span></div></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Type *</label>
                      <Select value={targetType} onValueChange={setTargetType}>
                        <SelectTrigger><SelectValue placeholder="University/Company/Organization" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="organization">Organization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">University/Company Name *</label>
                      <Input placeholder="Name of institution or company" value={targetName} onChange={(e) => setTargetName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Program/Position</label>
                      <Input placeholder="Program name or job position" value={programPosition} onChange={(e) => setProgramPosition(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Deadline</label>
                      <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PRN</label>
                      <Input value={studentPRN} disabled className="bg-gray-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key Achievements</label>
                    <Textarea placeholder="List your key achievements, projects, GPA, etc. that should be highlighted in the letter..." value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <Textarea placeholder="Any other relevant information..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={2} />
                  </div>
                  <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit to University Office</>}
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
