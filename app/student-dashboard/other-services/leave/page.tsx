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
  AlertCircle, ArrowLeft, Calendar, Check, Clock, Download, FileText, HelpCircle, Loader2, Plus, Search, Upload, User
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface LeaveRequest {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_prn: string
  department: string
  year: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  faculty_id: string
  faculty_name: string
  approved_by: string
  approved_date: string
  rejection_reason: string
  document_url: string
  created_at: string
  updated_at: string
}

const leaveTypes = [
  { id: "medical", name: "Medical Leave", description: "For health-related absences", maxDuration: "As per medical advice", requirements: ["Medical certificate", "Doctor's prescription"] },
  { id: "personal", name: "Personal Leave", description: "For personal or family matters", maxDuration: "3 days per semester", requirements: ["Written explanation"] },
  { id: "event", name: "Event Participation", description: "For participating in competitions, conferences, etc.", maxDuration: "Duration of the event", requirements: ["Event invitation/details", "Faculty recommendation"] },
  { id: "bereavement", name: "Bereavement Leave", description: "In case of death in the immediate family", maxDuration: "Up to 7 days", requirements: ["Self-declaration"] },
]

export default function LeaveRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState<string>("")
  const [studentDepartment, setStudentDepartment] = useState<string>("")
  const [studentYear, setStudentYear] = useState<string>("")
  const [studentName, setStudentName] = useState<string>("")
  const [studentEmail, setStudentEmail] = useState<string>("")
  const [studentPRN, setStudentPRN] = useState<string>("")
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [selectedLeaveType, setSelectedLeaveType] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{ leaveType?: string; dates?: string; reason?: string; faculty?: string }>({})
  
  // Faculty selection states
  const [facultyList, setFacultyList] = useState<{id: string, name: string, email: string}[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("")
  const [selectedFacultyName, setSelectedFacultyName] = useState<string>("")
  const [loadingFaculty, setLoadingFaculty] = useState(false)

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentDepartment && studentId) {
      loadLeaveRequests()
      loadFacultyList()
      setupRealtimeSubscription()
    }
  }, [studentDepartment, studentId])

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
        const { data: student } = await supabase.from(table).select("id, department, year, name, email, prn").eq("email", user.email).single()
        if (student) {
          setStudentId(student.id); setStudentDepartment(student.department); setStudentYear(student.year)
          setStudentName(student.name || ""); setStudentEmail(student.email); setStudentPRN(student.prn || "")
          break
        }
      }
    } catch (error) { console.error("Error loading student data:", error) }
  }
  
  const loadFacultyList = async () => {
    setLoadingFaculty(true)
    try {
      console.log("Loading faculty for department:", studentDepartment)
      
      // Department name mappings for matching
      const deptMappings: Record<string, string[]> = {
        'cse': ['cse', 'computer science', 'computer science and engineering', 'cs', 'cs&e'],
        'aiml': ['aiml', 'ai ml', 'artificial intelligence', 'ai & ml', 'ai-ml'],
        'aids': ['aids', 'ai ds', 'artificial intelligence and data science', 'ai-ds'],
        'cyber': ['cyber', 'cyber security', 'cybersecurity', 'cyber security and forensics']
      }
      
      // Normalize student department
      const studentDeptLower = studentDepartment?.toLowerCase().trim()
      let studentDeptKey = 'cse'
      
      for (const [key, values] of Object.entries(deptMappings)) {
        if (values.some(v => studentDeptLower?.includes(v))) {
          studentDeptKey = key
          break
        }
      }
      
      console.log("Student department normalized to:", studentDeptKey, "from:", studentDepartment)
      
      // Fetch all faculty
      const { data, error } = await supabase
        .from("faculty")
        .select("id, name, email, department")
        .order("name", { ascending: true })
      
      if (error) {
        console.error("Error loading faculty:", error)
        throw error
      }
      
      console.log("Total faculty in database:", data?.length)
      console.log("Faculty departments:", [...new Set(data?.map(f => f.department))])
      
      // Filter faculty by matching department
      const filteredFaculty = (data || []).filter(f => {
        const facultyDeptLower = f.department?.toLowerCase().trim()
        
        // Direct match
        if (facultyDeptLower === studentDeptLower) return true
        
        // Check using mappings
        for (const [key, values] of Object.entries(deptMappings)) {
          const studentMatches = values.some(v => studentDeptLower?.includes(v))
          const facultyMatches = values.some(v => facultyDeptLower?.includes(v))
          if (studentMatches && facultyMatches) return true
        }
        
        return false
      })
      
      console.log("Filtered faculty count:", filteredFaculty.length, "for department key:", studentDeptKey)
      
      if (filteredFaculty.length > 0) {
        setFacultyList(filteredFaculty.map(f => ({ id: f.id, name: f.name, email: f.email })))
      } else {
        // Fallback: show all faculty if no match found
        console.log("No faculty found for department, showing all faculty as fallback")
        setFacultyList((data || []).map(f => ({ id: f.id, name: f.name, email: f.email })))
      }
    } catch (error) {
      console.error("Error loading faculty list:", error)
      // Try alternative query without department filter
      try {
        const { data: allFaculty } = await supabase
          .from("faculty")
          .select("id, name, email")
          .order("name", { ascending: true })
        if (allFaculty) {
          console.log("Fallback: loaded all faculty:", allFaculty.length)
          setFacultyList(allFaculty)
        }
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
      }
    } finally {
      setLoadingFaculty(false)
    }
  }

  const loadLeaveRequests = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from("student_leave_requests").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (data) setLeaveRequests(data)
    } catch (error) { console.error("Error loading leave requests:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`leave-requests-student-${studentId}`)
      .on(
        "postgres_changes", 
        { event: "UPDATE", schema: "public", table: "student_leave_requests", filter: `student_id=eq.${studentId}` },
        (payload) => {
          const updated = payload.new as LeaveRequest
          if (updated.status === "approved") {
            toast({ 
              title: "Leave Approved!", 
              description: `Your leave request from ${format(new Date(updated.start_date), "PP")} to ${format(new Date(updated.end_date), "PP")} has been approved by ${updated.approved_by}` 
            })
          } else if (updated.status === "rejected") {
            toast({ 
              title: "Leave Rejected", 
              description: `Your leave request has been rejected. Reason: ${updated.rejection_reason}`,
              variant: "destructive"
            })
          }
          loadLeaveRequests()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setFormErrors({})
    
    const errors: { [key: string]: string } = {}
    if (!selectedLeaveType) errors.leaveType = 'Please select a leave type'
    if (!startDate || !endDate) errors.dates = 'Please select both start and end dates'
    else if (endDate < startDate) errors.dates = 'End date cannot be before start date'
    if (!reason.trim()) errors.reason = 'Please provide a reason for your leave'
    if (!selectedFacultyId) errors.faculty = 'Please select a faculty member to review your leave'
    
    if (Object.keys(errors).length > 0) { setFormErrors(errors); setSubmitting(false); return }
    
    try {
      const insertData = {
        student_id: studentId, 
        student_name: studentName, 
        student_email: studentEmail,
        student_prn: studentPRN,
        department: studentDepartment, 
        year: studentYear, 
        leave_type: leaveTypes.find(t => t.id === selectedLeaveType)?.name || selectedLeaveType,
        start_date: startDate!.toISOString().split('T')[0], 
        end_date: endDate!.toISOString().split('T')[0],
        reason, 
        status: "pending", 
        faculty_id: selectedFacultyId,
        faculty_name: selectedFacultyName,
        approved_by: "", 
        approved_date: "", 
        rejection_reason: "", 
        document_url: "",
        created_at: new Date().toISOString()
      }
      
      console.log("Submitting leave request with data:", insertData)
      console.log("Faculty ID being sent:", selectedFacultyId)
      
      const { error } = await supabase.from("student_leave_requests").insert(insertData)
      
      if (error) {
        console.error("Supabase insert error:", error)
        throw error
      }
      
      console.log("Leave request submitted successfully!")
      toast({ title: "Success", description: `Leave application submitted to ${selectedFacultyName} successfully!` })
      setSelectedLeaveType(""); setStartDate(undefined); setEndDate(undefined); setReason("")
      setSelectedFacultyId(""); setSelectedFacultyName("")
      loadLeaveRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("student_leave_requests").update({ status: "cancelled" }).eq("id", requestId)
      if (error) throw error
      toast({ title: "Cancelled", description: "Leave request cancelled successfully" })
      loadLeaveRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filterRequests = (requests: LeaveRequest[]) => {
    return requests.filter(r =>
      r.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      case "cancelled": return "bg-gray-100 text-gray-700"
      default: return "bg-blue-100 text-blue-700"
    }
  }

  const formatStatus = (status: string) => status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/student-dashboard/other-services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Services
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-700"><Calendar className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Student Leave Application</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11"><Badge variant="secondary">{studentDepartment}</Badge> • <Badge variant="outline">{studentYear} Year</Badge></p>
          </div>
        </div>

        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-sm text-blue-800">All leave applications must be submitted through ERP. Leaves will be reviewed & approved by your Class Teacher. Please apply in advance.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Leave Requests</CardTitle>
                <CardDescription>Track the status of your leave applications</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search by type, reason, or status..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filterRequests(leaveRequests).length === 0 ? (
                  <div className="py-8 text-center"><AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No leave requests found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filterRequests(leaveRequests).map(request => (
                      <motion.div key={request.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                            {request.status === "approved" ? <Check className="h-6 w-6" /> : request.status === "pending" ? <Clock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.leave_type}</h3>
                              <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{formatStatus(request.status)}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />{format(new Date(request.start_date), "PP")} to {format(new Date(request.end_date), "PP")}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{request.reason}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              {request.faculty_name && <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"><User className="h-3 w-3 mr-1" />Submitted to: {request.faculty_name}</div>}
                              {request.approved_date && <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{request.status === "approved" ? "Approved" : "Reviewed"}: {format(new Date(request.approved_date), "PP")}</div>}
                              {request.approved_by && <div className="flex items-center text-xs text-gray-500"><User className="h-3 w-3 mr-1" />By: {request.approved_by}</div>}
                            </div>
                            {request.rejection_reason && <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start"><AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" /><span>{request.rejection_reason}</span></div>}
                            <div className="mt-4 flex justify-end">
                              {request.status === "pending" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleCancelRequest(request.id)}>Cancel Request</Button>
                              )}
                              {request.status === "approved" && request.document_url && (
                                <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700"><Download className="h-3 w-3 mr-1" />Download Approval</Button>
                              )}
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
              <CardHeader><CardTitle>Submit New Leave Application</CardTitle><CardDescription>Complete student details and leave information for Class Teacher approval</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Student Name</label><Input value={studentName} disabled className="bg-white" /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-700">PRN</label><Input value={studentPRN} disabled className="bg-white" /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Department</label><Input value={studentDepartment} disabled className="bg-white" /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Year</label><Input value={studentYear} disabled className="bg-white" /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Email</label><Input value={studentEmail} disabled className="bg-white" /></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Leave Type *</label>
                    <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                      <SelectContent>{leaveTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {selectedLeaveType && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-1">{leaveTypes.find(t => t.id === selectedLeaveType)?.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{leaveTypes.find(t => t.id === selectedLeaveType)?.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-2"><Clock className="h-3 w-3 mr-1" />Maximum Duration: {leaveTypes.find(t => t.id === selectedLeaveType)?.maxDuration}</div>
                      <div className="text-xs text-gray-500"><span className="font-medium">Requirements:</span><ul className="list-disc list-inside mt-1">{leaveTypes.find(t => t.id === selectedLeaveType)?.requirements.map((req, i) => <li key={i}>{req}</li>)}</ul></div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Start Date *</label>
                      <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><Calendar className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Select date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700">End Date *</label>
                      <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><Calendar className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Select date</span>}</Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Reason for Leave *</label><Textarea placeholder="Provide detailed reason for your leave request" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required /></div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Faculty for Approval *</label>
                    <Select 
                      value={selectedFacultyId} 
                      onValueChange={(val) => {
                        setSelectedFacultyId(val)
                        const faculty = facultyList.find(f => f.id === val)
                        if (faculty) setSelectedFacultyName(faculty.name)
                      }}
                      disabled={loadingFaculty}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingFaculty ? "Loading faculty..." : "Select faculty from your department"} />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map(faculty => (
                          <SelectItem key={faculty.id} value={faculty.id}>{faculty.name} ({faculty.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {facultyList.length === 0 && !loadingFaculty && (
                      <p className="text-xs text-amber-600">No faculty found in your department</p>
                    )}
                  </div>

                  {formErrors.leaveType && <p className="text-sm text-red-500">{formErrors.leaveType}</p>}
                  {formErrors.dates && <p className="text-sm text-red-500">{formErrors.dates}</p>}
                  {formErrors.reason && <p className="text-sm text-red-500">{formErrors.reason}</p>}
                  {formErrors.faculty && <p className="text-sm text-red-500">{formErrors.faculty}</p>}

                  <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-amber-700 mr-2 mt-0.5" />
                      <div className="text-sm text-amber-800"><span className="font-medium">Advance Notice Required:</span> Submit applications at least 2 days before leave start date (except medical emergencies)</div>
                    </div>
                  </div>

                  <div className="pt-4"><Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={submitting}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit for Class Teacher Approval"}</Button></div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Leave Calendar</CardTitle><CardDescription>View your approved and pending leaves on the calendar</CardDescription></CardHeader>
              <CardContent>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                      const cal = document.getElementById('leave-calendar')
                      if (cal) cal.scrollIntoView({ behavior: 'smooth' })
                    }}>Today</Button>
                    <h3 className="text-lg font-medium text-gray-900">{new Date().getFullYear()}</h3>
                    <div className="w-20"></div>
                  </div>
                  
                  <div id="leave-calendar" className="mb-6">
                    <CalendarComponent 
                      mode="single"
                      selected={undefined}
                      className="rounded-md border"
                      modifiers={{
                        approved: leaveRequests
                          .filter(r => r.status === "approved")
                          .flatMap(r => {
                            const dates = []
                            const start = new Date(r.start_date)
                            const end = new Date(r.end_date)
                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                              dates.push(new Date(d))
                            }
                            return dates
                          }),
                        pending: leaveRequests
                          .filter(r => r.status === "pending")
                          .flatMap(r => {
                            const dates = []
                            const start = new Date(r.start_date)
                            const end = new Date(r.end_date)
                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                              dates.push(new Date(d))
                            }
                            return dates
                          }),
                        rejected: leaveRequests
                          .filter(r => r.status === "rejected")
                          .flatMap(r => {
                            const dates = []
                            const start = new Date(r.start_date)
                            const end = new Date(r.end_date)
                            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                              dates.push(new Date(d))
                            }
                            return dates
                          })
                      }}
                      modifiersStyles={{
                        approved: { backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "50%", fontWeight: "bold" },
                        pending: { backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "50%" },
                        rejected: { backgroundColor: "#f3f4f6", color: "#6b7280", borderRadius: "50%", textDecoration: "line-through" }
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center"><div className="w-4 h-4 bg-red-100 border border-red-300 rounded-full mr-1"></div><span className="text-xs text-gray-600">Approved (Red)</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-full mr-1"></div><span className="text-xs text-gray-600">Pending</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-full mr-1"></div><span className="text-xs text-gray-600">Rejected</span></div>
                    </div>
                  </div>
                  
                  {leaveRequests.filter(r => r.status === "approved").length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Approved Leave Dates:</h4>
                      <div className="space-y-1">
                        {leaveRequests.filter(r => r.status === "approved").map(r => (
                          <div key={r.id} className="text-xs text-red-700">
                            • {format(new Date(r.start_date), "PP")} to {format(new Date(r.end_date), "PP")} ({r.leave_type})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Leave Policy</h3>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Medical Leave: As per medical advice with valid documentation</li>
                        <li>Personal Leave: Maximum 3 days</li>
                        <li>Event Participation: Subject to faculty approval</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
