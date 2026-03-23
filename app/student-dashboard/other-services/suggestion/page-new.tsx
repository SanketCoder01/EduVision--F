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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle, ArrowLeft, Check, ChevronDown, Clock, Eye, Filter, Flag, Lightbulb, 
  Loader2, MessageSquare, Plus, Search, Send, Star, ThumbsUp, User
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const categories = [
  { id: "facilities", name: "Facilities", subcategories: ["Library", "Classrooms", "Labs", "Sports", "Hostel"] },
  { id: "food", name: "Food Services", subcategories: ["Menu Options", "Quality", "Hygiene", "Timings"] },
  { id: "academic", name: "Academic", subcategories: ["Curriculum", "Schedule", "Exams", "Faculty"] },
  { id: "administration", name: "Administration", subcategories: ["Process", "Communication", "Support"] },
  { id: "other", name: "Other", subcategories: ["General", "Events", "Clubs"] },
]

export default function SuggestionPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPRN, setStudentPRN] = useState("")
  const [studentDepartment, setStudentDepartment] = useState("")
  const [studentYear, setStudentYear] = useState("")
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentId) {
      loadSuggestions()
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

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("suggestions").select("*").eq("student_id", studentId).order("created_at", { ascending: false })
      if (error) throw error
      if (data) setSuggestions(data)
    } catch (error) { console.error("Error loading suggestions:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`suggestions-student-${studentId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "suggestions", filter: `student_id=eq.${studentId}` }, 
        (payload) => {
          const updated = payload.new as Suggestion
          if (updated.admin_response) {
            toast({ title: "Response Received!", description: `Your suggestion "${updated.title}" has received a response.` })
          }
          loadSuggestions()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !selectedCategory || !description) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    
    setSubmitting(true)
    try {
      const { error } = await supabase.from("suggestions").insert({
        student_id: studentId, 
        student_name: isAnonymous ? "Anonymous" : studentName, 
        student_email: studentEmail, 
        student_prn: studentPRN,
        department: studentDepartment, 
        year: studentYear,
        title, 
        category: selectedCategory, 
        subcategory: selectedSubcategory, 
        description, 
        is_anonymous: isAnonymous, 
        status: "under_review", 
        submitted_to: "university"
      })
      
      if (error) throw error
      toast({ title: "Success", description: "Suggestion submitted to University Office!" })
      setTitle(""); setSelectedCategory(""); setSelectedSubcategory(""); setDescription(""); setIsAnonymous(false)
      loadSuggestions()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
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

  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
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
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700"><Lightbulb className="h-6 w-6" /></div>
              <h1 className="text-3xl font-bold text-gray-900">Suggestion Box</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Submit suggestions to University Office • <Badge variant="secondary">{studentDepartment}</Badge></p>
          </div>
        </div>

        <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-700 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Your Voice Matters</h3>
              <p className="text-sm text-yellow-800">All suggestions are submitted directly to the University Office. You can choose to submit anonymously. Your feedback helps improve the campus experience.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="suggestions" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-2">
            <TabsTrigger value="suggestions">My Suggestions</TabsTrigger>
            <TabsTrigger value="new">New Suggestion</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Suggestions</CardTitle>
                <CardDescription>Track the status of your submitted suggestions</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search suggestions..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="py-8 text-center"><Lightbulb className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No suggestions found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filteredSuggestions.map(suggestion => (
                      <motion.div key={suggestion.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getStatusColor(suggestion.status)}`}>
                            {suggestion.status === "implemented" ? <Check className="h-6 w-6" /> : suggestion.status === "in_progress" ? <Flag className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                              <Badge className={`${getStatusColor(suggestion.status)} border-0 mt-1 sm:mt-0`}>{suggestion.status.replace('_', ' ').toUpperCase()}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{suggestion.description}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500"><Clock className="h-3 w-3 mr-1" />{new Date(suggestion.created_at).toLocaleDateString()}</div>
                              <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{suggestion.category}</div>
                              {suggestion.is_anonymous && <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded"><User className="h-3 w-3 mr-1" />Anonymous</div>}
                            </div>
                            {suggestion.admin_response && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center text-xs text-green-700 mb-1"><MessageSquare className="h-3 w-3 mr-1" />Response from University:</div>
                                <p className="text-sm text-green-800">{suggestion.admin_response}</p>
                              </div>
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
              <CardHeader><CardTitle>Submit New Suggestion</CardTitle><CardDescription>Share your ideas to improve the campus</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedSubcategory("") }}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subcategory</label>
                      <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={!selectedCategory}>
                        <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                        <SelectContent>
                          {categories.find(c => c.id === selectedCategory)?.subcategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input placeholder="Brief title of your suggestion" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea placeholder="Describe your suggestion in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                    <label htmlFor="anonymous" className="text-sm text-gray-600">Submit anonymously (your identity will be hidden)</label>
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
