"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle, ArrowLeft, Award, Check, Clock, Download, FileText, Loader2, 
  Mail, Search
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

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

export default function UniversityRecommendationPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [documentUrl, setDocumentUrl] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadRequests(); setupRealtimeSubscription() }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("recommendation_requests")
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
      .channel("recommendations-university")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "recommendation_requests" }, 
        (payload) => {
          const newReq = payload.new as RecommendationRequest
          toast({ title: "New Recommendation Request", description: `${newReq.purpose} from ${newReq.student_name}` })
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
      const updateData: any = { 
        status: newStatus,
        notes: notes,
        processed_at: new Date().toISOString(),
        processed_by: "University Admin"
      }
      if (documentUrl) updateData.document_url = documentUrl

      const { error } = await supabase
        .from("recommendation_requests")
        .update(updateData)
        .eq("id", selectedRequest.id)

      if (error) throw error
      toast({ title: "Success", description: `Status updated to ${newStatus}` })
      setIsDialogOpen(false)
      setNotes("")
      setDocumentUrl("")
      loadRequests()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setUpdating(false) }
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

  const statuses = ["all", "pending", "in_progress", "approved", "rejected"]

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
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
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Award className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Recommendation Letters</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Process student recommendation letter requests</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by name, purpose, or target..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-500">Total: {filteredRequests.length} requests</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Recommendation Requests</CardTitle><CardDescription>Click to view details and process</CardDescription></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-8 text-center"><Award className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No recommendation requests found.</p></div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <motion.div 
                    key={request.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
                    onClick={() => { setSelectedRequest(request); setNotes(request.notes || ""); setDocumentUrl(request.document_url || ""); setIsDialogOpen(true); }}
                  >
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
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center text-xs text-gray-500">{request.student_name} • {request.department}</div>
                          {request.deadline && <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Deadline: {request.deadline}</div>}
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
            <DialogHeader><DialogTitle>Recommendation Request Details</DialogTitle></DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-gray-500">Student:</span><p className="font-medium">{selectedRequest.student_name}</p></div>
                  <div><span className="text-sm text-gray-500">PRN:</span><p className="font-medium">{selectedRequest.student_prn}</p></div>
                  <div><span className="text-sm text-gray-500">Department:</span><p className="font-medium">{selectedRequest.department}</p></div>
                  <div><span className="text-sm text-gray-500">Purpose:</span><p className="font-medium">{selectedRequest.purpose}</p></div>
                  <div><span className="text-sm text-gray-500">Target:</span><p className="font-medium">{selectedRequest.target_name}</p></div>
                  <div><span className="text-sm text-gray-500">Type:</span><p className="font-medium">{selectedRequest.target_type}</p></div>
                  <div><span className="text-sm text-gray-500">Program/Position:</span><p className="font-medium">{selectedRequest.program_position || "N/A"}</p></div>
                  <div><span className="text-sm text-gray-500">Deadline:</span><p className="font-medium">{selectedRequest.deadline || "N/A"}</p></div>
                </div>
                
                {selectedRequest.achievements && (
                  <div><span className="text-sm text-gray-500">Key Achievements:</span><p className="mt-1 bg-gray-50 p-2 rounded">{selectedRequest.achievements}</p></div>
                )}
                
                {selectedRequest.additional_notes && (
                  <div><span className="text-sm text-gray-500">Additional Notes:</span><p className="mt-1">{selectedRequest.additional_notes}</p></div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document URL (upload letter first):</label>
                  <Input placeholder="https://..." value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes:</label>
                  <Textarea placeholder="Add notes about processing..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpdateStatus("in_progress")} disabled={updating} variant="outline"><Clock className="h-4 w-4 mr-2" />In Progress</Button>
                  <Button onClick={() => handleUpdateStatus("approved")} disabled={updating} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2" />Approve</Button>
                  <Button onClick={() => handleUpdateStatus("rejected")} disabled={updating} variant="destructive"><AlertCircle className="h-4 w-4 mr-2" />Reject</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
