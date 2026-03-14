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
  department: string
  year: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
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
  const [formErrors, setFormErrors] = useState<{ leaveType?: string; dates?: string; reason?: string }>({})

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentDepartment && studentId) {
      loadLeaveRequests()
      setupRealtimeSubscription()
    }
  }, [studentDepartment, studentId])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const tables = ["students_cse_first", "students_cse_second", "students_cse_third", "students_cse_fourth"]
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

  const loadLeaveRequests = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from("student_leave_requests").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (data) setLeaveRequests(data)
    } catch (error) { console.error("Error loading leave requests:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel(`leave-requests-student`).on("postgres_changes", { event: "*", schema: "public", table: "student_leave_requests", filter: `student_id=eq.${studentId}` }, () => {
      loadLeaveRequests()
    }).subscribe()
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
    
    if (Object.keys(errors).length > 0) { setFormErrors(errors); setSubmitting(false); return }
    
    try {
      const { error } = await supabase.from("student_leave_requests").insert({
        student_id: studentId, student_name: studentName, student_email: studentEmail,
        department: studentDepartment, year: studentYear, leave_type: leaveTypes.find(t => t.id === selectedLeaveType)?.name || selectedLeaveType,
        start_date: startDate!.toISOString().split('T')[0], end_date: endDate!.toISOString().split('T')[0],
        reason, status: "pending", approved_by: "", approved_date: "", rejection_reason: "", document_url: ""
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Leave application submitted successfully!" })
      setSelectedLeaveType(""); setStartDate(undefined); setEndDate(undefined); setReason("")
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

                  {formErrors.leaveType && <p className="text-sm text-red-500">{formErrors.leaveType}</p>}
                  {formErrors.dates && <p className="text-sm text-red-500">{formErrors.dates}</p>}
                  {formErrors.reason && <p className="text-sm text-red-500">{formErrors.reason}</p>}

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
                    <Button variant="outline" size="sm" className="text-xs">Previous Year</Button>
                    <h3 className="text-lg font-medium text-gray-900">{new Date().getFullYear()}</h3>
                    <Button variant="outline" size="sm" className="text-xs">Next Year</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(month => (
                      <div key={month} className="border border-gray-200 rounded-lg p-2">
                        <h4 className="text-sm font-medium text-center mb-2">{month}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-xs text-gray-500">{d}</div>)}</div>
                        <div className="grid grid-cols-7 gap-1">{Array(31).fill(0).map((_, i) => <div key={i} className="h-6 w-6 flex items-center justify-center rounded-full text-xs">{i + 1}</div>)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center"><div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-1"></div><span className="text-xs text-gray-600">Approved</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-1"></div><span className="text-xs text-gray-600">Pending</span></div>
                      <div className="flex items-center"><div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-1"></div><span className="text-xs text-gray-600">Rejected</span></div>
                    </div>
                  </div>
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
