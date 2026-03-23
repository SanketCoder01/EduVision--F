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
  AlertCircle, ArrowLeft, Check, Clock, Lightbulb, Loader2, 
  MessageSquare, Search, ThumbsUp, User
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Suggestion {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_prn: string
  department: string
  year: string
  title: string
  category: string
  subcategory: string
  description: string
  is_anonymous: boolean
  status: string
  submitted_to: string
  upvotes: number
  admin_response: string
  responded_at: string
  responded_by: string
  created_at: string
}

export default function UniversitySuggestionPage() {
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadSuggestions(); setupRealtimeSubscription() }, [])

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      if (data) setSuggestions(data)
    } catch (error) { 
      console.error("Error loading suggestions:", error) 
    } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("suggestions-university")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "suggestions" }, 
        (payload) => {
          const newSug = payload.new as Suggestion
          toast({ title: "New Suggestion", description: `${newSug.title} from ${newSug.is_anonymous ? "Anonymous" : newSug.student_name}` })
          loadSuggestions()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedSuggestion) return
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("suggestions")
        .update({ 
          status: newStatus,
          admin_response: adminResponse,
          responded_at: new Date().toISOString(),
          responded_by: "University Admin"
        })
        .eq("id", selectedSuggestion.id)

      if (error) throw error
      toast({ title: "Success", description: `Status updated to ${newStatus}` })
      setIsDialogOpen(false)
      setAdminResponse("")
      loadSuggestions()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setUpdating(false) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented": return "bg-green-100 text-green-700"
      case "in_progress": return "bg-blue-100 text-blue-700"
      case "under_review": return "bg-yellow-100 text-yellow-700"
      case "rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const categories = ["all", "facilities", "food", "academic", "administration", "other"]
  const statuses = ["all", "under_review", "in_progress", "implemented", "rejected"]

  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter
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
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700"><Lightbulb className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Suggestion Box</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Review and respond to student suggestions</p>
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
              <div className="flex items-center text-sm text-gray-500">Total: {filteredSuggestions.length} suggestions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Suggestions</CardTitle><CardDescription>Click to view details and respond</CardDescription></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="py-8 text-center"><Lightbulb className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No suggestions found.</p></div>
            ) : (
              <div className="space-y-4">
                {filteredSuggestions.map(suggestion => (
                  <motion.div 
                    key={suggestion.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
                    onClick={() => { setSelectedSuggestion(suggestion); setAdminResponse(suggestion.admin_response || ""); setIsDialogOpen(true); }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(suggestion.status)}`}>
                        {suggestion.status === "implemented" ? <Check className="h-6 w-6" /> : suggestion.status === "in_progress" ? <Clock className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                          <Badge className={`${getStatusColor(suggestion.status)} border-0 mt-1 sm:mt-0`}>{suggestion.status.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{suggestion.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            {suggestion.is_anonymous ? <><User className="h-3 w-3 mr-1" />Anonymous</> : suggestion.student_name}
                          </div>
                          <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{suggestion.category}</div>
                          <div className="flex items-center text-xs text-gray-500"><ThumbsUp className="h-3 w-3 mr-1" />{suggestion.upvotes || 0}</div>
                          <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(suggestion.created_at).toLocaleDateString()}</div>
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
            <DialogHeader><DialogTitle>Suggestion Details</DialogTitle></DialogHeader>
            {selectedSuggestion && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-gray-500">From:</span><p className="font-medium">{selectedSuggestion.is_anonymous ? "Anonymous" : selectedSuggestion.student_name}</p></div>
                  <div><span className="text-sm text-gray-500">Department:</span><p className="font-medium">{selectedSuggestion.department}</p></div>
                  <div><span className="text-sm text-gray-500">Category:</span><p className="font-medium">{selectedSuggestion.category}</p></div>
                  <div><span className="text-sm text-gray-500">Status:</span><Badge className={getStatusColor(selectedSuggestion.status)}>{selectedSuggestion.status.replace("_", " ")}</Badge></div>
                </div>
                <div><span className="text-sm text-gray-500">Title:</span><p className="font-semibold text-lg mt-1">{selectedSuggestion.title}</p></div>
                <div><span className="text-sm text-gray-500">Description:</span><p className="mt-1">{selectedSuggestion.description}</p></div>
                
                {selectedSuggestion.admin_response && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center text-xs text-green-700 mb-1"><MessageSquare className="h-3 w-3 mr-1" />Previous Response:</div>
                    <p className="text-sm text-green-800">{selectedSuggestion.admin_response}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Response:</label>
                  <Textarea placeholder="Write your response to this suggestion..." value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} rows={3} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpdateStatus("under_review")} disabled={updating} variant="outline"><Clock className="h-4 w-4 mr-2" />Under Review</Button>
                  <Button onClick={() => handleUpdateStatus("in_progress")} disabled={updating} variant="outline" className="bg-blue-50"><Clock className="h-4 w-4 mr-2" />In Progress</Button>
                  <Button onClick={() => handleUpdateStatus("implemented")} disabled={updating} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2" />Implemented</Button>
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
