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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeft, Calendar, Check, Clock, Download, Eye, FileText, Loader2, Phone, Search, UserCheck, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface LeaveApplication {
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

export default function StudentLeaveManagement() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [facultyId, setFacultyId] = useState<string>("")
  const [facultyDepartment, setFacultyDepartment] = useState<string>("")
  const [facultyName, setFacultyName] = useState<string>("")
  
  const [applications, setApplications] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => { loadFacultyData() }, [])

  useEffect(() => {
    if (facultyDepartment && facultyId) {
      loadApplications()
      setupRealtimeSubscription()
    }
  }, [facultyDepartment, facultyId])

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const { data: faculty } = await supabase.from("faculty").select("id, department, name").eq("email", user.email).single()
      if (faculty) {
        setFacultyId(faculty.id); setFacultyDepartment(faculty.department); setFacultyName(faculty.name || "")
      }
    } catch (error) { console.error("Error loading faculty data:", error) }
  }

  const loadApplications = async () => {
    setLoading(true)
    try {
      console.log("=== Loading leave applications for faculty ===")
      console.log("Faculty ID:", facultyId)
      console.log("Faculty Department:", facultyDepartment)
      
      // Only show leave requests assigned to this specific faculty
      const { data, error } = await supabase
        .from("student_leave_requests")
        .select("*")
        .eq("faculty_id", facultyId)
        .order("created_at", { ascending: false })
      
      if (error) {
        console.error("Error loading applications:", error)
      }
      
      console.log("Query result - data length:", data?.length || 0)
      console.log("Query result - data:", data)
      
      if (data) setApplications(data)
    } catch (error) { console.error("Error loading applications:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    console.log("=== Setting up real-time subscription ===")
    console.log("Channel name:", `leave-applications-faculty-${facultyId}`)
    console.log("Filter:", `faculty_id=eq.${facultyId}`)
    
    const channel = supabase
      .channel(`leave-applications-faculty-${facultyId}`)
      .on(
        "postgres_changes", 
        { event: "INSERT", schema: "public", table: "student_leave_requests", filter: `faculty_id=eq.${facultyId}` },
        (payload) => {
          const newApp = payload.new as LeaveApplication
          console.log("=== NEW LEAVE REQUEST RECEIVED ===")
          console.log("Payload:", payload)
          console.log("New app data:", newApp)
          toast({ 
            title: "New Leave Request", 
            description: `${newApp.student_name} submitted a ${newApp.leave_type} request` 
          })
          loadApplications()
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "student_leave_requests", filter: `faculty_id=eq.${facultyId}` },
        (payload) => {
          console.log("Leave request updated:", payload)
          loadApplications()
        }
      )
      .subscribe((status) => {
        console.log("=== Subscription status ===")
        console.log("Status:", status)
      })
    return () => { supabase.removeChannel(channel) }
  }

  const handleApprove = async (application: LeaveApplication) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.from("student_leave_requests").update({
        status: "approved", approved_by: facultyName, approved_date: new Date().toISOString()
      }).eq("id", application.id)
      
      if (error) throw error
      toast({ title: "Approved", description: "Leave application approved successfully" })
      setSelectedApplication(null)
      loadApplications()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setActionLoading(false) }
  }

  const handleReject = async (application: LeaveApplication) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a rejection reason", variant: "destructive" })
      return
    }
    setActionLoading(true)
    try {
      const { error } = await supabase.from("student_leave_requests").update({
        status: "rejected", rejection_reason: rejectionReason, approved_by: facultyName
      }).eq("id", application.id)
      
      if (error) throw error
      toast({ title: "Rejected", description: "Leave application rejected" })
      setSelectedApplication(null); setRejectionReason("")
      loadApplications()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setActionLoading(false) }
  }

  const filterApplications = (apps: LeaveApplication[]) => {
    return apps.filter(a => {
      const matchesSearch = a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const getStats = () => ({
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const formatStatus = (status: string) => status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
  const stats = getStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><UserCheck className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Student Leave Management</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11"><Badge variant="secondary">{facultyDepartment}</Badge></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><FileText className="h-8 w-8 text-gray-400" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div><Clock className="h-8 w-8 text-yellow-400" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Approved</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></div><Check className="h-8 w-8 text-green-400" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Rejected</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></div><X className="h-8 w-8 text-red-400" /></div></CardContent></Card>
        </div>

        <Tabs defaultValue="applications" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="applications">Leave Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Leave Applications</CardTitle>
                <CardDescription>Review, approve, or reject student leave requests</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by student name, email, or leave type..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filterApplications(applications).length === 0 ? (
                  <div className="py-8 text-center"><AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No leave applications found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filterApplications(applications).map(app => (
                      <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(app.status)}`}>
                            {app.status === "approved" ? <Check className="h-6 w-6" /> : app.status === "pending" ? <Clock className="h-6 w-6" /> : <X className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{app.student_name}</h3>
                                <p className="text-sm text-gray-500">{app.student_email} • {app.year} Year</p>
                              </div>
                              <Badge className={`${getStatusColor(app.status)} border-0 mt-1 sm:mt-0`}>{formatStatus(app.status)}</Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />{app.leave_type}</div>
                              <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{format(new Date(app.start_date), "PP")} to {format(new Date(app.end_date), "PP")}</div>
                              <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />Submitted: {format(new Date(app.created_at), "PP")}</div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{app.reason}</p>
                            {app.rejection_reason && <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start"><AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" /><span><strong>Rejection:</strong> {app.rejection_reason}</span></div>}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedApplication(app)}><Eye className="h-3 w-3 mr-1" />View Details</Button>
                              {app.status === "pending" && (
                                <>
                                  <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(app)} disabled={actionLoading}><Check className="h-3 w-3 mr-1" />Approve</Button>
                                  <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => { setSelectedApplication(app); setRejectionReason("") }}><X className="h-3 w-3 mr-1" />Reject</Button>
                                </>
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

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Leave Type Distribution</CardTitle><CardDescription>Breakdown of leave applications by type</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Medical Leave", "Personal Leave", "Event Participation", "Bereavement Leave"].map(type => {
                      const count = applications.filter(a => a.leave_type === type).length
                      const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Status Overview</CardTitle><CardDescription>Application status breakdown</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Pending</span><span className="text-sm font-medium text-yellow-600">{stats.pending}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Approved</span><span className="text-sm font-medium text-green-600">{stats.approved}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Rejected</span><span className="text-sm font-medium text-red-600">{stats.rejected}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Leave Application Details</DialogTitle><DialogDescription>Review complete application information</DialogDescription></DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700">Student Name</label><p className="text-sm text-gray-900">{selectedApplication.student_name}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Email</label><p className="text-sm text-gray-900">{selectedApplication.student_email}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Department</label><p className="text-sm text-gray-900">{selectedApplication.department}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Year</label><p className="text-sm text-gray-900">{selectedApplication.year}</p></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700">Leave Type</label><p className="text-sm text-gray-900">{selectedApplication.leave_type}</p></div>
                  <div><label className="text-sm font-medium text-gray-700">Duration</label><p className="text-sm text-gray-900">{format(new Date(selectedApplication.start_date), "PP")} to {format(new Date(selectedApplication.end_date), "PP")}</p></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Reason</label><p className="text-sm text-gray-900 mt-1">{selectedApplication.reason}</p></div>
                <div><label className="text-sm font-medium text-gray-700">Status</label><p className="mt-1"><Badge className={getStatusColor(selectedApplication.status)}>{formatStatus(selectedApplication.status)}</Badge></p></div>
                {selectedApplication.approved_by && <div><label className="text-sm font-medium text-gray-700">Processed By</label><p className="text-sm text-gray-900">{selectedApplication.approved_by}</p></div>}
                {selectedApplication.rejection_reason && <div className="p-3 bg-red-50 rounded-lg"><label className="text-sm font-medium text-red-700">Rejection Reason</label><p className="text-sm text-red-600 mt-1">{selectedApplication.rejection_reason}</p></div>}
              </div>
            )}
            {selectedApplication?.status === "pending" && (
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1"><Textarea placeholder="Rejection reason (required if rejecting)" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} /></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleReject(selectedApplication)} disabled={actionLoading} className="border-red-200 text-red-600 hover:bg-red-50">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}Reject</Button>
                  <Button onClick={() => handleApprove(selectedApplication)} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Approve</Button>
                </div>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
