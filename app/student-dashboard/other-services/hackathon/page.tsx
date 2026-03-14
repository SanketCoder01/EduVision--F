"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { 
  ArrowLeft, Calendar, Clock, Code, ExternalLink, Globe, MapPin, 
  Search, Trophy, Users, Zap, Loader2, AlertCircle, Plus, X, Eye, Download,
  FileText, Image, Presentation, Link as LinkIcon, Trash2, Upload
} from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  category: string
  start_date: string
  end_date: string
  registration_deadline: string
  location: string
  max_teams: number
  team_size_min: number
  team_size_max: number
  department: string
  target_years: string[]
  registration_link: string
  website_link: string
  poster_url: string
  prizes: any[]
  status: string
  registered_teams_count: number
  created_at: string
}

interface Team {
  id: string
  hackathon_id: string
  team_name: string
  team_leader_id: string
  members: any[]
  member_count: number
  contact_email: string
  status: string
}

interface TeamFile {
  id: string
  team_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  description: string
  uploaded_at: string
}

export default function StudentHackathonPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [studentId, setStudentId] = useState<string>("")
  const [studentDepartment, setStudentDepartment] = useState<string>("")
  const [studentYear, setStudentYear] = useState<string>("")
  const [studentEmail, setStudentEmail] = useState<string>("")
  const [studentName, setStudentName] = useState<string>("")
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [teamMembers, setTeamMembers] = useState<{ name: string; email: string }[]>([])
  const [registering, setRegistering] = useState(false)
  const [showPosterDialog, setShowPosterDialog] = useState(false)
  const [posterDialogUrl, setPosterDialogUrl] = useState<string>("")
  
  // Team files state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamFiles, setTeamFiles] = useState<TeamFile[]>([])
  const [showFilesDialog, setShowFilesDialog] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileDescription, setFileDescription] = useState("")
  const [fileType, setFileType] = useState("")
  const [fileLink, setFileLink] = useState("")

  const openPosterDialog = (url: string) => {
    setPosterDialogUrl(url)
    setShowPosterDialog(true)
  }

  useEffect(() => { loadStudentData() }, [])

  useEffect(() => {
    if (studentDepartment && studentYear) {
      loadHackathons()
      loadMyTeams()
    }
  }, [studentDepartment, studentYear])

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
        const { data: student } = await supabase.from(table).select("id, department, year, email, name, prn").eq("email", user.email).single()
        if (student) {
          setStudentId(student.id); setStudentDepartment(student.department); setStudentYear(student.year); setStudentEmail(student.email); setStudentName(student.name || "")
          break
        }
      }
    } catch (error) { console.error("Error loading student data:", error) }
  }

  const loadHackathons = async () => {
    setLoading(true)
    try {
      console.log("Loading hackathons for:", { studentDepartment, studentYear })
      
      // Fetch hackathons for student's department with published status
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .eq("department", studentDepartment)
        .in("status", ["published", "registration_open", "in_progress"])
        .order("created_at", { ascending: false })
      
      console.log("Hackathons query result:", { data, error, count: data?.length })
      
      if (data) {
        // Normalize student year for comparison (handle different formats)
        const normalizedYear = studentYear.toLowerCase().replace('year', '').trim()
        const yearMappings: Record<string, string[]> = {
          '1': ['1st', '1', 'first', 'first year'],
          '2': ['2nd', '2', 'second', 'second year'],
          '3': ['3rd', '3', 'third', 'third year'],
          '4': ['4th', '4', 'fourth', 'fourth year']
        }
        
        console.log("Year mapping:", { normalizedYear, yearKey })
        
        // Find matching year key
        let yearKey = '1'
        for (const [key, values] of Object.entries(yearMappings)) {
          if (values.some(v => normalizedYear.includes(v.toLowerCase()))) {
            yearKey = key
            break
          }
        }
        
        console.log("Year mapping:", { normalizedYear, yearKey })
        
        // Filter by target years - show if student's year matches OR all years selected
        const filtered = data.filter(h => {
          if (!h.target_years || h.target_years.length === 0) return true
          
          // Check if all years are selected (length 4 means all)
          if (h.target_years.length === 4) {
            console.log(`Hackathon "${h.title}" targets all years (length 4)`)
            return true
          }
          
          // Check if student's year matches any target year format
          const targetYearsLower = h.target_years.map((y: string) => y.toLowerCase())
          const matchesYear = targetYearsLower.some((y: string) => {
            return y.includes(yearKey) || 
                   y.includes(normalizedYear) ||
                   yearMappings[yearKey]?.some(v => y.includes(v))
          })
          console.log(`Hackathon "${h.title}" target_years:`, h.target_years, "matches:", matchesYear)
          return matchesYear
        })
        setHackathons(filtered)
        console.log(`Loaded ${filtered.length} hackathons for ${studentDepartment} year ${studentYear} (normalized: ${yearKey})`)
      }
    } catch (error) { console.error("Error loading hackathons:", error) } finally { setLoading(false) }
  }

  const loadMyTeams = async () => {
    try {
      const { data } = await supabase.from("hackathon_teams").select("*").contains("member_prns", [studentId]).order("registered_at", { ascending: false })
      if (data) setMyTeams(data)
    } catch (error) { console.error("Error loading teams:", error) }
  }

  const loadTeamFiles = async (teamId: string) => {
    try {
      const { data } = await supabase
        .from("hackathon_team_files")
        .select("*")
        .eq("team_id", teamId)
        .order("uploaded_at", { ascending: false })
      if (data) setTeamFiles(data)
    } catch (error) { 
      console.error("Error loading team files:", error)
      setTeamFiles([])
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedTeam) return
    
    setUploadingFile(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedTeam.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from("hackathon-team-files")
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      const { data } = supabase.storage.from("hackathon-team-files").getPublicUrl(fileName)
      
      // Determine file type
      let fType = 'other'
      if (file.type.includes('pdf')) fType = 'pdf'
      else if (file.type.includes('image')) fType = 'image'
      else if (file.type.includes('presentation') || fileExt === 'ppt' || fileExt === 'pptx') fType = 'ppt'
      else if (file.type.includes('document')) fType = 'document'
      
      const { error: dbError } = await supabase.from("hackathon_team_files").insert({
        team_id: selectedTeam.id,
        file_name: file.name,
        file_url: data.publicUrl,
        file_type: fType,
        file_size: file.size,
        uploaded_by: studentId,
        description: fileDescription
      })
      
      if (dbError) throw dbError
      
      toast({ title: "File Uploaded!", description: `${file.name} added to team storage` })
      setFileDescription("")
      loadTeamFiles(selectedTeam.id)
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" })
    } finally { setUploadingFile(false) }
  }

  const handleLinkAdd = async () => {
    if (!fileLink.trim() || !selectedTeam) return
    
    setUploadingFile(true)
    try {
      const { error } = await supabase.from("hackathon_team_files").insert({
        team_id: selectedTeam.id,
        file_name: fileLink.substring(0, 50),
        file_url: fileLink,
        file_type: 'link',
        file_size: 0,
        uploaded_by: studentId,
        description: fileDescription
      })
      
      if (error) throw error
      
      toast({ title: "Link Added!", description: "Link saved to team storage" })
      setFileLink("")
      setFileDescription("")
      loadTeamFiles(selectedTeam.id)
    } catch (error: any) {
      toast({ title: "Failed to Add Link", description: error.message, variant: "destructive" })
    } finally { setUploadingFile(false) }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Delete this file?")) return
    
    try {
      const { error } = await supabase.from("hackathon_team_files").delete().eq("id", fileId)
      if (error) throw error
      toast({ title: "File Deleted" })
      if (selectedTeam) loadTeamFiles(selectedTeam.id)
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" })
    }
  }

  const openTeamFiles = (team: Team) => {
    setSelectedTeam(team)
    setTeamFiles([])
    loadTeamFiles(team.id)
    setShowFilesDialog(true)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />
      case 'image': return <Image className="h-5 w-5 text-green-500" />
      case 'ppt': return <Presentation className="h-5 w-5 text-orange-500" />
      case 'link': return <LinkIcon className="h-5 w-5 text-blue-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  useEffect(() => {
    if (!studentDepartment || !studentYear) return
    
    // Real-time subscription for hackathons
    const channel = supabase
      .channel(`hackathons-student-${studentDepartment}`)
      .on(
        "postgres_changes", 
        { 
          event: "INSERT", 
          schema: "public", 
          table: "hackathons",
          filter: `department=eq.${studentDepartment}`
        }, 
        (payload) => {
          const newH = payload.new as Hackathon
          // Check if hackathon is for student's year (all years = length 4)
          const yearMatch = !newH.target_years || 
                          newH.target_years.length === 0 ||
                          newH.target_years.length === 4
          const statusOk = ['published', 'registration_open', 'in_progress'].includes(newH.status)
          
          if (yearMatch && statusOk) {
            toast({ title: "New Hackathon!", description: `${newH.title} is now open for registration` })
            setHackathons(prev => [newH, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "hackathons",
          filter: `department=eq.${studentDepartment}`
        },
        (payload) => {
          const updated = payload.new as Hackathon
          setHackathons(prev => prev.map(h => h.id === updated.id ? updated : h))
        }
      )
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [studentDepartment, studentYear])

  const handleAddMember = () => setTeamMembers([...teamMembers, { name: "", email: "" }])
  const handleRemoveMember = (index: number) => setTeamMembers(teamMembers.filter((_, i) => i !== index))
  const handleMemberChange = (index: number, field: "name" | "email", value: string) => { const updated = [...teamMembers]; updated[index][field] = value; setTeamMembers(updated) }

  const handleRegister = async () => {
    if (!selectedHackathon) return
    if (!teamName.trim()) { toast({ title: "Team Name Required", variant: "destructive" }); return }
    if (!contactEmail.trim()) { toast({ title: "Contact Email Required", variant: "destructive" }); return }

    const totalMembers = teamMembers.filter(m => m.name.trim()).length + 1
    if (totalMembers < selectedHackathon.team_size_min) { toast({ title: `Min ${selectedHackathon.team_size_min} members required`, variant: "destructive" }); return }
    if (totalMembers > selectedHackathon.team_size_max) { toast({ title: `Max ${selectedHackathon.team_size_max} members allowed`, variant: "destructive" }); return }

    setRegistering(true)
    try {
      const members = [{ name: studentName, email: studentEmail, prn: studentId, is_leader: true }, ...teamMembers.filter(m => m.name.trim()).map(m => ({ name: m.name, email: m.email, prn: "", is_leader: false }))]
      const { error } = await supabase.from("hackathon_teams").insert({ hackathon_id: selectedHackathon.id, team_name: teamName, team_leader_id: studentId, members, member_count: members.length, contact_email: contactEmail, contact_phone: contactPhone, status: "registered" })
      if (error) throw error
      toast({ title: "Registration Successful!", description: `Team "${teamName}" registered` })
      setTeamName(""); setContactEmail(""); setContactPhone(""); setTeamMembers([]); setShowRegisterDialog(false)
      loadMyTeams(); loadHackathons()
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" })
    } finally { setRegistering(false) }
  }

  const isRegistered = (hackathonId: string) => myTeams.some(t => t.hackathon_id === hackathonId)

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date(), deadlineDate = new Date(deadline)
    if (now > deadlineDate) return "expired"
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 3) return "urgent"
    return "open"
  }

  const filteredHackathons = hackathons.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.description.toLowerCase().includes(searchQuery.toLowerCase()) || h.theme.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/student-dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Portal</h1>
            <p className="text-gray-500 mt-1"><Badge variant="secondary">{studentDepartment}</Badge> • <Badge variant="outline">{studentYear} Year</Badge></p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="browse">Browse Hackathons</TabsTrigger>
            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search hackathons..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredHackathons.length === 0 ? (
              <div className="text-center py-12"><Code className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-lg font-medium">No hackathons available</h3><p className="mt-2 text-gray-500">Check back later for new hackathons.</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredHackathons.map((hackathon) => {
                  const deadlineStatus = getDeadlineStatus(hackathon.registration_deadline)
                  const registered = isRegistered(hackathon.id)
                  return (
                    <Card key={hackathon.id} className="overflow-hidden">
                      {hackathon.poster_url && (
                        <div className="w-full bg-gray-100 flex items-center justify-center p-4">
                          <img 
                            src={hackathon.poster_url} 
                            alt={hackathon.title} 
                            className="max-w-full max-h-[200px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openPosterDialog(hackathon.poster_url)}
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div><CardTitle className="text-xl">{hackathon.title}</CardTitle><CardDescription>{hackathon.theme}</CardDescription></div>
                          <div className="flex flex-col gap-1">
                            <Badge className={deadlineStatus === "expired" ? "bg-gray-100 text-gray-600" : deadlineStatus === "urgent" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                              {deadlineStatus === "expired" ? "Closed" : deadlineStatus === "urgent" ? "Closing Soon" : "Open"}
                            </Badge>
                            {registered && <Badge className="bg-blue-100 text-blue-700">Registered</Badge>}
                          </div>
                        </div>
                        {hackathon.category && <Badge variant="outline" className="mt-2 w-fit">{hackathon.category}</Badge>}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="h-4 w-4" />{format(new Date(hackathon.start_date), "PPP")} - {format(new Date(hackathon.end_date), "PPP")}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4" />Deadline: {format(new Date(hackathon.registration_deadline), "PPP")}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4" />{hackathon.location}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-4 w-4" />{hackathon.registered_teams_count} / {hackathon.max_teams} Teams</div>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-2">{hackathon.description}</p>
                        {hackathon.prizes && hackathon.prizes.length > 0 && <div className="flex items-center gap-2 text-sm"><Trophy className="h-4 w-4 text-amber-500" /><span>Prizes: {hackathon.prizes.map((p: any) => p.prize).join(", ")}</span></div>}
                        <div className="flex flex-wrap gap-1 mt-3">{hackathon.target_years.map(y => <Badge key={y} variant="outline" className="text-xs">{y} Year</Badge>)}</div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <Button variant="outline" onClick={() => { setSelectedHackathon(hackathon); setShowDetailsDialog(true) }}>View Details</Button>
                        {!registered && deadlineStatus !== "expired" && <Button onClick={() => { setSelectedHackathon(hackathon); setContactEmail(studentEmail); setShowRegisterDialog(true) }}>Register Team</Button>}
                        {registered && <Badge className="bg-green-100 text-green-700">Already Registered</Badge>}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-teams" className="mt-6">
            {myTeams.length === 0 ? (
              <div className="text-center py-12"><Users className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-lg font-medium">No team registrations yet</h3><p className="mt-2 text-gray-500">Register for a hackathon to see your team here.</p></div>
            ) : (
              <div className="space-y-4">
                {myTeams.map((team) => {
                  const hackathon = hackathons.find(h => h.id === team.hackathon_id)
                  return (
                    <Card key={team.id}>
                      <CardHeader><CardTitle className="text-lg">{team.team_name}</CardTitle><CardDescription>{hackathon?.title || "Hackathon"}</CardDescription></CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={team.status === "registered" ? "bg-green-100 text-green-700" : team.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>{team.status}</Badge>
                          <span className="text-sm text-gray-500">{team.member_count} members</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">{team.members.map((m: any, i: number) => <Badge key={i} variant="outline" className="text-xs">{m.name} {m.is_leader && "(Leader)"}</Badge>)}</div>
                        <Button variant="outline" size="sm" onClick={() => openTeamFiles(team)}>
                          <FileText className="h-4 w-4 mr-1" /> Team Files
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedHackathon?.title}</DialogTitle><DialogDescription>{selectedHackathon?.theme}</DialogDescription></DialogHeader>
            {selectedHackathon && (
              <div className="space-y-4">
                {selectedHackathon.poster_url && (
                  <div className="w-full bg-gray-100 flex items-center justify-center p-4 rounded-lg">
                    <img 
                      src={selectedHackathon.poster_url} 
                      alt={selectedHackathon.title} 
                      className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openPosterDialog(selectedHackathon.poster_url)}
                    />
                  </div>
                )}
                {selectedHackathon.category && <Badge variant="outline">{selectedHackathon.category}</Badge>}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm font-medium text-gray-500">Start Date</Label><p className="text-sm">{format(new Date(selectedHackathon.start_date), "PPP")}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">End Date</Label><p className="text-sm">{format(new Date(selectedHackathon.end_date), "PPP")}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Registration Deadline</Label><p className="text-sm">{format(new Date(selectedHackathon.registration_deadline), "PPP")}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Location</Label><p className="text-sm">{selectedHackathon.location}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Team Size</Label><p className="text-sm">{selectedHackathon.team_size_min} - {selectedHackathon.team_size_max} members</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Teams</Label><p className="text-sm">{selectedHackathon.registered_teams_count} / {selectedHackathon.max_teams}</p></div>
                </div>
                <div><Label className="text-sm font-medium text-gray-500">Description</Label><p className="text-sm mt-1">{selectedHackathon.description}</p></div>
                {selectedHackathon.prizes && selectedHackathon.prizes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Prizes</Label>
                    <ul className="mt-2 space-y-1">{selectedHackathon.prizes.map((prize: any, i: number) => <li key={i} className="text-sm flex items-center gap-2"><Zap className="h-3 w-3 text-blue-500" />{prize.place}: {prize.prize}</li>)}</ul>
                  </div>
                )}
                <div><Label className="text-sm font-medium text-gray-500">Target Years</Label><div className="flex flex-wrap gap-1 mt-1">{selectedHackathon.target_years.map(y => <Badge key={y} variant="outline">{y} Year</Badge>)}</div></div>
                {(selectedHackathon.registration_link || selectedHackathon.website_link) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedHackathon.registration_link && <Button variant="outline" asChild><a href={selectedHackathon.registration_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Registration Link</a></Button>}
                    {selectedHackathon.website_link && <Button variant="outline" asChild><a href={selectedHackathon.website_link} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-2" /> Website</a></Button>}
                  </div>
                )}
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPosterDialog} onOpenChange={setShowPosterDialog}>
          <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <DialogTitle>Poster Preview</DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const link = document.createElement('a')
                  link.href = posterDialogUrl
                  link.download = selectedHackathon?.title?.replace(/\s+/g, '_') || 'hackathon-poster'
                  link.target = '_blank'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPosterDialog(false)}>Close</Button>
              </div>
            </DialogHeader>
            <div className="p-4 flex items-center justify-center bg-gray-100 min-h-[60vh]">
              <img 
                src={posterDialogUrl} 
                alt="Poster Full View" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg" 
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Register Team</DialogTitle><DialogDescription>{selectedHackathon?.title} - Team size: {selectedHackathon?.team_size_min} to {selectedHackathon?.team_size_max} members</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Team Name *</Label><Input placeholder="Enter team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Contact Email *</Label><Input type="email" placeholder="team@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Contact Phone</Label><Input placeholder="Phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Team Members (excluding you)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMember} disabled={teamMembers.length >= (selectedHackathon?.team_size_max || 5) - 1}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
                {teamMembers.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(index, "name", e.target.value)} />
                          <Input placeholder="Email" type="email" value={member.email} onChange={(e) => handleMemberChange(index, "email", e.target.value)} />
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMember(index)}><X className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">You are the team leader. Total members: {teamMembers.filter(m => m.name.trim()).length + 1}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
              <Button onClick={handleRegister} disabled={registering}>{registering ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registering...</> : "Submit Registration"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Files Dialog */}
        <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Team Files - {selectedTeam?.team_name}
              </DialogTitle>
              <DialogDescription>
                Store your team's files, links, and resources privately. Only team members can see these.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-sm">Add New File or Link</h4>
                
                {/* File Upload */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Description (optional)</Label>
                    <Input 
                      placeholder="e.g., Project proposal, Design mockup" 
                      value={fileDescription} 
                      onChange={(e) => setFileDescription(e.target.value)} 
                    />
                  </div>
                  <input 
                    type="file" 
                    id="team-file-upload" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    onClick={() => document.getElementById('team-file-upload')?.click()}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="ml-1">Upload File</span>
                  </Button>
                </div>
                
                {/* Link Add */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Or add a link</Label>
                    <Input 
                      placeholder="https://..." 
                      value={fileLink} 
                      onChange={(e) => setFileLink(e.target.value)} 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLinkAdd}
                    disabled={uploadingFile || !fileLink.trim()}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span className="ml-1">Add Link</span>
                  </Button>
                </div>
              </div>
              
              {/* Files List */}
              <div>
                <h4 className="font-medium text-sm mb-2">Stored Files ({teamFiles.length})</h4>
                {teamFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No files stored yet</p>
                    <p className="text-xs">Upload files or add links to share with your team</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.file_name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(file.uploaded_at), "PPp")} • {formatFileSize(file.file_size)}
                            {file.description && ` • ${file.description}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(file.file_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {file.file_type !== 'link' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = file.file_url
                                link.download = file.file_name
                                link.target = '_blank'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowFilesDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
