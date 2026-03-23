"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle, ArrowLeft, Check, Clock, Download, FileText, Loader2, 
  MessageSquare, Search, Wrench, MapPin, Filter
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

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
}

export default function UniversityMaintenancePage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadRequests(); setupRealtimeSubscription() }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      if (data) setRequests(data)
    } catch (error) { 
      console.error("Error loading requests:", error) 
    } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("maintenance-university")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "maintenance_requests" }, 
        (payload) => {
          const newReq = payload.new as MaintenanceRequest
          toast({ title: "New Maintenance Request", description: `${newReq.title} from ${newReq.student_name}` })
          loadRequests()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRequest) return
    setUpdating(true)
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolution_notes = resolutionNotes
      }
      if (assignedTo) {
        updateData.assigned_to = assignedTo
      }

      const { error } = await supabase
        .from("maintenance_requests")
        .update(updateData)
        .eq("id", selectedRequest.id)

      if (error) throw error
      toast({ title: "Success", description: `Status updated to ${newStatus}` })
      setIsDialogOpen(false)
      setResolutionNotes("")
      setAssignedTo("")
      loadRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setUpdating(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-700"
      case "in_progress": return "bg-blue-100 text-blue-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700"
      case "medium": return "bg-yellow-100 text-yellow-700"
      case "low": return "bg-gray-100 text-gray-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const categories = ["all", "electrical", "plumbing", "furniture", "network", "hvac", "cleaning", "structural", "other"]
  const statuses = ["all", "pending", "in_progress", "resolved"]

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/university/other-services">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Wrench className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Complaints</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Review and manage maintenance requests from students</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ").toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-500">
                Total: {filteredRequests.length} requests
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Maintenance Requests</CardTitle><CardDescription>Click to view details and update status</CardDescription></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-8 text-center"><Wrench className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No maintenance requests found.</p></div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <motion.div 
                    key={request.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
                    onClick={() => { setSelectedRequest(request); setIsDialogOpen(true); }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                        {request.status === "resolved" ? <Check className="h-6 w-6" /> : request.status === "in_progress" ? <Clock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{request.status.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />{request.location}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center text-xs text-gray-500">{request.student_name} • {request.department}</div>
                          <Badge className={`${getPriorityColor(request.priority)} border-0`}>{request.priority.toUpperCase()}</Badge>
                          <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(request.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Request Details</DialogTitle></DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-gray-500">Student:</span><p className="font-medium">{selectedRequest.student_name}</p></div>
                  <div><span className="text-sm text-gray-500">Department:</span><p className="font-medium">{selectedRequest.department}</p></div>
                  <div><span className="text-sm text-gray-500">Category:</span><p className="font-medium">{selectedRequest.category}</p></div>
                  <div><span className="text-sm text-gray-500">Priority:</span><p className="font-medium">{selectedRequest.priority}</p></div>
                  <div><span className="text-sm text-gray-500">Location:</span><p className="font-medium">{selectedRequest.location}</p></div>
                  <div><span className="text-sm text-gray-500">Status:</span><Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                </div>
                <div><span className="text-sm text-gray-500">Description:</span><p className="mt-1">{selectedRequest.description}</p></div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To:</label>
                  <Input placeholder="Technician name" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resolution Notes:</label>
                  <Textarea placeholder="Add notes about the resolution..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={3} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpdateStatus("in_progress")} disabled={updating || selectedRequest.status === "in_progress"} variant="outline">
                    <Clock className="h-4 w-4 mr-2" />Mark In Progress
                  </Button>
                  <Button onClick={() => handleUpdateStatus("resolved")} disabled={updating || selectedRequest.status === "resolved"} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />Mark Resolved
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
