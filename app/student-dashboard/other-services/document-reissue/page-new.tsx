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
  AlertCircle, ArrowLeft, Check, Clock, Download, FileCheck, FileText, Loader2, 
  Receipt, Search, Upload, User
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface DocumentRequest {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_prn: string
  department: string
  year: string
  document_type: string
  academic_year: string
  semester: string
  reason: string
  payment_status: string
  payment_amount: string
  payment_date: string
  transaction_id: string
  status: string
  submitted_to: string
  document_url: string
  notes: string
  processed_at: string
  processed_by: string
  created_at: string
}

const documentTypes = [
  { id: "fee_receipt", name: "Fee Receipt", fee: "₹250" },
  { id: "id_card", name: "ID Card", fee: "₹500" },
  { id: "marksheet", name: "Marksheet", fee: "₹350" },
  { id: "bonafide", name: "Bonafide Certificate", fee: "₹100" },
  { id: "transfer_cert", name: "Transfer Certificate", fee: "₹500" },
  { id: "character_cert", name: "Character Certificate", fee: "₹100" },
  { id: "migration_cert", name: "Migration Certificate", fee: "₹300" },
  { id: "other", name: "Other Document", fee: "Varies" },
]

const academicYears = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021"]
const semesters = ["Fall", "Spring", "Summer"]

export default function DocumentReissuePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPRN, setStudentPRN] = useState("")
  const [studentDepartment, setStudentDepartment] = useState("")
  const [studentYear, setStudentYear] = useState("")
  
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [selectedDocType, setSelectedDocType] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [reason, setReason] = useState("")
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
      const { data, error } = await supabase.from("document_reissue_requests").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (error) throw error
      if (data) setRequests(data)
    } catch (error) { console.error("Error loading requests:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`documents-student-${studentId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "document_reissue_requests", filter: `student_id=eq.${studentId}` }, 
        (payload) => {
          const updated = payload.new as DocumentRequest
          if (updated.status === "approved" && updated.document_url) {
            toast({ title: "Document Ready!", description: `Your ${updated.document_type} is ready for download.` })
          } else if (updated.status === "payment_required") {
            toast({ title: "Payment Required", description: `Please complete payment for your ${updated.document_type} request.` })
          }
          loadRequests()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocType || !reason) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    
    setSubmitting(true)
    try {
      const { error } = await supabase.from("document_reissue_requests").insert({
        student_id: studentId, student_name: studentName, student_email: studentEmail, student_prn: studentPRN,
        department: studentDepartment, year: studentYear,
        document_type: documentTypes.find(d => d.id === selectedDocType)?.name || selectedDocType,
        academic_year: academicYear, semester: semester, reason,
        payment_status: "pending", payment_amount: documentTypes.find(d => d.id === selectedDocType)?.fee || "TBD",
        status: "pending", submitted_to: "university"
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Document request submitted to University Office!" })
      setSelectedDocType(""); setAcademicYear(""); setSemester(""); setReason("")
      loadRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700"
      case "processing": return "bg-blue-100 text-blue-700"
      case "payment_required": return "bg-orange-100 text-orange-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.document_type?.toLowerCase().includes(searchQuery.toLowerCase()) || r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><FileCheck className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Document Reissue</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request duplicate documents from University Office • <Badge variant="secondary">{studentDepartment}</Badge></p>
          </div>
        </div>

        <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Document Reissue Process</h3>
              <p className="text-sm text-purple-800">Submit your request to the University Office. After approval, you'll be notified to complete payment. Documents will be available for download once processed.</p>
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
                <CardTitle>Your Document Requests</CardTitle>
                <CardDescription>Track the status of your document reissue requests</CardDescription>
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
                      <SelectItem value="payment_required">Payment Required</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-8 text-center"><FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No document requests found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <motion.div key={request.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                            {request.status === "approved" ? <Check className="h-6 w-6" /> : request.status === "processing" ? <FileText className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.document_type}</h3>
                              <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{request.status.replace('_', ' ').toUpperCase()}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center text-xs text-gray-500"><Receipt className="h-3 w-3 mr-1" />Fee: {request.payment_amount}</div>
                              <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(request.created_at).toLocaleDateString()}</div>
                              <div className={`flex items-center text-xs px-2 py-1 rounded ${request.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                {request.payment_status === 'paid' ? '✓ Paid' : 'Payment Pending'}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{request.reason}</p>
                            {request.notes && <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600">{request.notes}</div>}
                            {request.status === "approved" && request.document_url && (
                              <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700"><Download className="h-4 w-4 mr-2" />Download Document</Button>
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
              <CardHeader><CardTitle>Request Document Reissue</CardTitle><CardDescription>Submit a request for duplicate documents</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Type *</label>
                      <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                        <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
                        <SelectContent>{documentTypes.map(d => <SelectItem key={d.id} value={d.id}><div className="flex justify-between w-full"><span>{d.name}</span><span className="text-gray-500 ml-2">{d.fee}</span></div></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Academic Year</label>
                      <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>{academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Semester</label>
                      <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                        <SelectContent>{semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PRN</label>
                      <Input value={studentPRN} disabled className="bg-gray-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for Reissue *</label>
                    <Textarea placeholder="Explain why you need this document reissued..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
                  </div>
                  <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><FileText className="h-4 w-4 mr-2" />Submit to University Office</>}
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
