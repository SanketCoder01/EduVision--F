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
  AlertCircle, ArrowLeft, Check, Clock, Download, FileCheck, FileText, Loader2, 
  Receipt, Search
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

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

export default function UniversityDocumentReissuePage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [documentUrl, setDocumentUrl] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadRequests(); setupRealtimeSubscription() }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("document_reissue_requests")
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
      .channel("documents-university")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "document_reissue_requests" }, 
        (payload) => {
          const newReq = payload.new as DocumentRequest
          toast({ title: "New Document Request", description: `${newReq.document_type} from ${newReq.student_name}` })
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
        .from("document_reissue_requests")
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
      case "processing": return "bg-blue-100 text-blue-700"
      case "payment_required": return "bg-orange-100 text-orange-700"
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const statuses = ["all", "pending", "payment_required", "processing", "approved", "rejected"]

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.student_prn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.document_type?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><FileCheck className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Document Reissue Requests</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Process student document reissue requests</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by name, PRN, or document..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ").toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-500">Total: {filteredRequests.length} requests</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Document Requests</CardTitle><CardDescription>Click to view details and process</CardDescription></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-8 text-center"><FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No document requests found.</p></div>
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
                        {request.status === "approved" ? <Check className="h-6 w-6" /> : request.status === "processing" ? <FileText className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-semibold text-gray-900">{request.document_type}</h3>
                          <Badge className={`${getStatusColor(request.status)} border-0 mt-1 sm:mt-0`}>{request.status.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center text-xs text-gray-500">{request.student_name} • {request.student_prn}</div>
                          <div className="flex items-center text-xs text-gray-500">{request.department}</div>
                          <div className="flex items-center text-xs text-gray-500"><Receipt className="h-3 w-3 mr-1" />{request.payment_amount}</div>
                          <div className={`flex items-center text-xs px-2 py-1 rounded ${request.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {request.payment_status === 'paid' ? '✓ Paid' : 'Payment Pending'}
                          </div>
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
            <DialogHeader><DialogTitle>Document Request Details</DialogTitle></DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-gray-500">Student:</span><p className="font-medium">{selectedRequest.student_name}</p></div>
                  <div><span className="text-sm text-gray-500">PRN:</span><p className="font-medium">{selectedRequest.student_prn}</p></div>
                  <div><span className="text-sm text-gray-500">Department:</span><p className="font-medium">{selectedRequest.department}</p></div>
                  <div><span className="text-sm text-gray-500">Document:</span><p className="font-medium">{selectedRequest.document_type}</p></div>
                  <div><span className="text-sm text-gray-500">Academic Year:</span><p className="font-medium">{selectedRequest.academic_year || "N/A"}</p></div>
                  <div><span className="text-sm text-gray-500">Fee:</span><p className="font-medium">{selectedRequest.payment_amount}</p></div>
                  <div><span className="text-sm text-gray-500">Payment Status:</span><Badge className={selectedRequest.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{selectedRequest.payment_status}</Badge></div>
                  <div><span className="text-sm text-gray-500">Status:</span><Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                </div>
                <div><span className="text-sm text-gray-500">Reason:</span><p className="mt-1">{selectedRequest.reason}</p></div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document URL (for approved documents):</label>
                  <Input placeholder="https://..." value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes:</label>
                  <Textarea placeholder="Add notes about processing..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpdateStatus("payment_required")} disabled={updating} variant="outline"><Receipt className="h-4 w-4 mr-2" />Request Payment</Button>
                  <Button onClick={() => handleUpdateStatus("processing")} disabled={updating} variant="outline" className="bg-blue-50"><Clock className="h-4 w-4 mr-2" />Processing</Button>
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
