"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { 
  CalendarIcon, Search, Code, Users, Trophy, Clock, MapPin, ArrowLeft, 
  Upload, Globe, Zap, Trash2, Loader2, AlertCircle, Eye, Download
} from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const categories = [
  "Educational Technology", "Sustainability", "Healthcare", "Accessibility",
  "Smart Campus", "Artificial Intelligence", "Blockchain", "Virtual Reality",
  "Mobile Applications", "Internet of Things", "Data Science", "Cybersecurity"
]

const yearOptions = [
  { id: "all", name: "All Years" },
  { id: "1st", name: "1st Year" },
  { id: "2nd", name: "2nd Year" },
  { id: "3rd", name: "3rd Year" },
  { id: "4th", name: "4th Year" }
]

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
  team_name: string
  team_leader_id: string
  members: any[]
  member_count: number
  contact_email: string
  status: string
  registered_at: string
}

export default function HackathonPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [facultyId, setFacultyId] = useState<string>("")
  const [facultyDepartment, setFacultyDepartment] = useState<string>("")
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState("")
  const [category, setCategory] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [regDeadline, setRegDeadline] = useState<Date>()
  const [location, setLocation] = useState("")
  const [maxTeams, setMaxTeams] = useState(50)
  const [teamSizeMin, setTeamSizeMin] = useState(2)
  const [teamSizeMax, setTeamSizeMax] = useState(5)
  const [targetYears, setTargetYears] = useState<string[]>(["all"])
  const [regLink, setRegLink] = useState("")
  const [websiteLink, setWebsiteLink] = useState("")
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>("")
  const [prizes, setPrizes] = useState<string[]>(["", "", ""])
  const [submitting, setSubmitting] = useState(false)
  
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [showTeamsDialog, setShowTeamsDialog] = useState(false)
  const [showPosterDialog, setShowPosterDialog] = useState(false)
  const [posterDialogUrl, setPosterDialogUrl] = useState<string>("")

  const openPosterDialog = (url: string) => {
    setPosterDialogUrl(url)
    setShowPosterDialog(true)
  }

  useEffect(() => { loadFacultyData() }, [])

  useEffect(() => {
    if (facultyId && facultyDepartment) {
      loadHackathons()
      const channel = setupRealtimeSubscription()
      return () => { if (channel) supabase.removeChannel(channel) }
    }
  }, [facultyId, facultyDepartment])

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: faculty } = await supabase
        .from("faculty")
        .select("id, department, name")
        .eq("email", user.email)
        .single()
      if (faculty) {
        setFacultyId(faculty.id)
        setFacultyDepartment(faculty.department)
      }
    } catch (error) { console.error("Error loading faculty:", error) }
  }

  const loadHackathons = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("hackathons")
        .select("*")
        .eq("faculty_id", facultyId)
        .order("created_at", { ascending: false })
      if (data) setHackathons(data)
    } catch (error) { console.error("Error loading hackathons:", error) }
    finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    return supabase
      .channel(`hackathons-${facultyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hackathons", filter: `faculty_id=eq.${facultyId}` },
        (payload) => {
          if (payload.eventType === "INSERT") setHackathons(prev => [payload.new as Hackathon, ...prev])
          else if (payload.eventType === "UPDATE") setHackathons(prev => prev.map(h => h.id === payload.new.id ? payload.new as Hackathon : h))
          else if (payload.eventType === "DELETE") setHackathons(prev => prev.filter(h => h.id !== payload.old.id))
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "hackathon_teams" },
        (payload) => {
          const team = payload.new as Team
          toast({ title: "New Team Registration!", description: `Team "${team.team_name}" registered` })
          loadHackathons()
        })
      .subscribe()
  }

  const loadTeamsForHackathon = async (hackathonId: string) => {
    const { data } = await supabase.from("hackathon_teams").select("*").eq("hackathon_id", hackathonId).order("registered_at", { ascending: false })
    if (data) setTeams(data)
  }

  const handleYearChange = (yearId: string, checked: boolean) => {
    if (yearId === "all") { if (checked) setTargetYears(["all"]) }
    else {
      let newYears = targetYears.filter(y => y !== "all")
      newYears = checked ? [...newYears, yearId] : newYears.filter(y => y !== yearId)
      setTargetYears(newYears.length > 0 ? newYears : ["all"])
    }
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadPoster = async (): Promise<string | null> => {
    if (!posterFile) return null
    const fileExt = posterFile.name.split('.').pop()
    const fileName = `${facultyId}/${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from("hackathon-posters").upload(fileName, posterFile)
    if (error) return null
    const { data } = supabase.storage.from("hackathon-posters").getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!title || !description || !theme || !startDate || !endDate || !regDeadline || !location) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const posterUrl = posterFile ? await uploadPoster() || "" : ""
      const { error } = await supabase.from("hackathons").insert({
        faculty_id: facultyId, title, description, theme, category,
        start_date: startDate.toISOString(), end_date: endDate.toISOString(),
        registration_deadline: regDeadline.toISOString(), location,
        max_teams: maxTeams, team_size_min: teamSizeMin, team_size_max: teamSizeMax,
        department: facultyDepartment,
        target_years: targetYears.includes("all") ? ["1st", "2nd", "3rd", "4th"] : targetYears,
        registration_link: regLink, website_link: websiteLink, poster_url: posterUrl,
        poster_file_name: posterFile?.name || "",
        prizes: prizes.filter(p => p).map((p, i) => ({ place: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} Place`, prize: p })),
        status: "published", published_at: new Date().toISOString()
      })
      if (error) throw error
      toast({ title: "Hackathon Published!", description: "Students will be notified in real-time" })
      setTitle(""); setDescription(""); setTheme(""); setCategory("")
      setStartDate(undefined); setEndDate(undefined); setRegDeadline(undefined)
      setLocation(""); setTargetYears(["all"]); setRegLink(""); setWebsiteLink("")
      setPosterFile(null); setPosterPreview(""); setPrizes(["", "", ""])
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (hackathonId: string) => {
    if (!confirm("Delete this hackathon?")) return
    await supabase.from("hackathons").delete().eq("id", hackathonId)
    toast({ title: "Hackathon Deleted" })
  }

  const filteredHackathons = hackathons.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: "bg-blue-100 text-blue-700", registration_open: "bg-green-100 text-green-700",
      in_progress: "bg-amber-100 text-amber-700", completed: "bg-gray-100 text-gray-700", draft: "bg-gray-100 text-gray-500"
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/other-services')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Portal</h1>
            <p className="text-gray-500 mt-1">Department: <Badge variant="secondary">{facultyDepartment}</Badge></p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[500px] grid-cols-3">
            <TabsTrigger value="browse">My Hackathons</TabsTrigger>
            <TabsTrigger value="post">Post Hackathon</TabsTrigger>
            <TabsTrigger value="teams">Team Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Search hackathons..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="registration_open">Registration Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredHackathons.length === 0 ? (
              <div className="text-center py-12">
                <Code className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No hackathons found</h3>
                <p className="mt-2 text-gray-500">Create your first hackathon to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredHackathons.map((hackathon) => (
                  <Card key={hackathon.id}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                          <CardDescription className="mt-1">{hackathon.theme}</CardDescription>
                          {hackathon.category && <Badge variant="outline" className="mt-2">{hackathon.category}</Badge>}
                        </div>
                        <Badge className={getStatusColor(hackathon.status)}>{hackathon.status.replace('_', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-gray-500" /><span className="text-sm">{format(new Date(hackathon.start_date), "PPP")} to {format(new Date(hackathon.end_date), "PPP")}</span></div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /><span className="text-sm">Deadline: {format(new Date(hackathon.registration_deadline), "PPP")}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-sm">{hackathon.location}</span></div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-500" /><span className="text-sm">{hackathon.registered_teams_count} / {hackathon.max_teams} Teams</span></div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{hackathon.description}</p>
                      {hackathon.poster_url && (
                        <div className="w-full bg-gray-100 flex items-center justify-center p-4 rounded-lg mb-4">
                          <img 
                            src={hackathon.poster_url} 
                            alt={hackathon.title} 
                            className="max-w-full max-h-[200px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openPosterDialog(hackathon.poster_url)}
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {hackathon.target_years.map(year => <Badge key={year} variant="outline" className="text-xs">{year} Year</Badge>)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedHackathon(hackathon); loadTeamsForHackathon(hackathon.id); setShowTeamsDialog(true) }}>
                        <Users className="h-4 w-4 mr-2" /> View Teams ({hackathon.registered_teams_count})
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(hackathon.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="post" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post New Hackathon</CardTitle>
                <CardDescription>Create for <Badge variant="secondary">{facultyDepartment}</Badge> students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Title *</Label><Input placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Theme *</Label><Input placeholder="e.g., AI Innovation" value={theme} onChange={(e) => setTheme(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Location *</Label><Input placeholder="e.g., Main Auditorium" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Describe objectives..." className="min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Start Date *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : "Pick"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label>End Date *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : "Pick"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label>Registration Deadline *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{regDeadline ? format(regDeadline, "PPP") : "Pick"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={regDeadline} onSelect={setRegDeadline} /></PopoverContent></Popover></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Team Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Max Teams</Label><Input type="number" value={maxTeams} onChange={(e) => setMaxTeams(parseInt(e.target.value) || 50)} /></div>
                    <div className="space-y-2"><Label>Min Team Size</Label><Input type="number" value={teamSizeMin} onChange={(e) => setTeamSizeMin(parseInt(e.target.value) || 2)} /></div>
                    <div className="space-y-2"><Label>Max Team Size</Label><Input type="number" value={teamSizeMax} onChange={(e) => setTeamSizeMax(parseInt(e.target.value) || 5)} /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Target Years</h3>
                  <p className="text-sm text-gray-500">Department locked to: {facultyDepartment}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {yearOptions.map(y => (
                      <div key={y.id} className="flex items-center space-x-2">
                        <Checkbox id={y.id} checked={targetYears.includes(y.id)} onCheckedChange={(c) => handleYearChange(y.id, c as boolean)} />
                        <Label htmlFor={y.id} className="text-sm cursor-pointer">{y.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Poster</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {posterPreview ? (
                      <div className="flex flex-col items-center gap-4">
                        <img 
                          src={posterPreview} 
                          alt="Preview" 
                          className="max-w-full max-h-[300px] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openPosterDialog(posterPreview)}
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openPosterDialog(posterPreview)}><Eye className="h-4 w-4 mr-1" />View Full</Button>
                          <Button variant="outline" size="sm" onClick={() => { setPosterFile(null); setPosterPreview("") }}>Remove</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <Input id="poster" type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                        <Button variant="outline" className="mt-4" onClick={() => document.getElementById("poster")?.click()}>Upload Poster</Button>
                        <p className="text-xs text-gray-500 mt-2">Click to select an image file</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Registration Link</Label><Input placeholder="https://forms..." value={regLink} onChange={(e) => setRegLink(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Website</Label><Input placeholder="https://..." value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Prizes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>1st Place</Label><Input placeholder="₹50,000" value={prizes[0]} onChange={(e) => setPrizes([e.target.value, prizes[1], prizes[2]])} /></div>
                    <div className="space-y-2"><Label>2nd Place</Label><Input placeholder="₹30,000" value={prizes[1]} onChange={(e) => setPrizes([prizes[0], e.target.value, prizes[2]])} /></div>
                    <div className="space-y-2"><Label>3rd Place</Label><Input placeholder="₹20,000" value={prizes[2]} onChange={(e) => setPrizes([prizes[0], prizes[1], e.target.value])} /></div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publishing...</> : <><Zap className="h-4 w-4 mr-2" />Publish Hackathon</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Registrations</CardTitle>
                <CardDescription>Select a hackathon to view teams</CardDescription>
              </CardHeader>
              <CardContent>
                {hackathons.length === 0 ? (
                  <div className="text-center py-8"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No hackathons yet</p></div>
                ) : (
                  <div className="space-y-4">
                    <Select onValueChange={(val) => { const h = hackathons.find(h => h.id === val); if (h) { setSelectedHackathon(h); loadTeamsForHackathon(val) } }}>
                      <SelectTrigger><SelectValue placeholder="Select hackathon" /></SelectTrigger>
                      <SelectContent>{hackathons.map(h => <SelectItem key={h.id} value={h.id}>{h.title} ({h.registered_teams_count} teams)</SelectItem>)}</SelectContent>
                    </Select>
                    {selectedHackathon && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-4">Teams for {selectedHackathon.title}</h4>
                        {teams.length === 0 ? (
                          <div className="text-center py-8"><AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No teams yet</p></div>
                        ) : (
                          <div className="space-y-3">
                            {teams.map(team => (
                              <div key={team.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-semibold">{team.team_name}</h5>
                                    <p className="text-sm text-gray-500">Leader: {team.team_leader_id}</p>
                                    <p className="text-sm text-gray-500">Members: {team.member_count}</p>
                                    <p className="text-sm text-gray-500">Email: {team.contact_email}</p>
                                  </div>
                                  <Badge className={team.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{team.status}</Badge>
                                </div>
                                {team.members?.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {team.members.map((m: any, i: number) => <Badge key={i} variant="outline" className="text-xs">{m.name}</Badge>)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showTeamsDialog} onOpenChange={setShowTeamsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Teams for {selectedHackathon?.title}</DialogTitle><DialogDescription>{teams.length} team(s)</DialogDescription></DialogHeader>
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{team.team_name}</h5>
                      <p className="text-sm text-gray-500">Leader: {team.team_leader_id}</p>
                      <p className="text-sm text-gray-500">Members: {team.member_count}</p>
                    </div>
                    <Badge className={team.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{team.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter><Button onClick={() => setShowTeamsDialog(false)}>Close</Button></DialogFooter>
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
      </motion.div>
    </div>
  )
}
