"use client"

import { useState, useEffect } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Search, MapPin, Clock, User, Phone, Mail, Info, ThumbsUp, Eye, AlertTriangle, ArrowLeft, Upload, Loader2, Package } from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface LostFoundItem {
  id: string
  item_name: string
  item_category: string
  location_found: string
  description: string
  status: string
  image_url: string
  reporter_id: string
  department: string
  target_years: string[]
  resolved_at: string
  created_at: string
}

const categories = ["Electronics", "Electronics Accessories", "Books", "Documents", "Clothing", "Personal Items", "Jewelry", "Keys", "ID Cards", "Other"]
const locations = ["Library", "Student Center", "Engineering Building", "Science Building", "Arts Building", "Cafeteria", "Gym", "Dormitories", "Parking Lot", "Computer Lab", "Other"]
const years = [
  { id: "first", name: "1st Year" },
  { id: "second", name: "2nd Year" },
  { id: "third", name: "3rd Year" },
  { id: "fourth", name: "4th Year" },
  { id: "all", name: "All Years" }
]

export default function LostFoundPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [facultyId, setFacultyId] = useState<string>("")
  const [facultyDepartment, setFacultyDepartment] = useState<string>("")
  const [facultyName, setFacultyName] = useState<string>("")
  const [facultyEmail, setFacultyEmail] = useState<string>("")
  
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  
  const [activeTab, setActiveTab] = useState("browse")
  const [itemTitle, setItemTitle] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemLocation, setItemLocation] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemImage, setItemImage] = useState<File | null>(null)
  const [itemImagePreview, setItemImagePreview] = useState("")
  const [itemStatus, setItemStatus] = useState("Found")
  const [selectedYears, setSelectedYears] = useState<string[]>(["all"])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadFacultyData() }, [])

  useEffect(() => {
    if (facultyDepartment) {
      loadItems()
      setupRealtimeSubscription()
    }
  }, [facultyDepartment])

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      
      const { data: faculty } = await supabase.from("faculty").select("id, department, name, email").eq("email", user.email).single()
      if (faculty) {
        setFacultyId(faculty.id); setFacultyDepartment(faculty.department); setFacultyName(faculty.name || ""); setFacultyEmail(faculty.email)
      }
    } catch (error) { console.error("Error loading faculty data:", error) }
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      // Faculty sees all items from their department for management
      const { data, error } = await supabase.from("lost_found_items").select("*").eq("department", facultyDepartment).order("created_at", { ascending: false })
      if (data) setItems(data)
    } catch (error) { console.error("Error loading items:", error) } finally { setLoading(false) }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel(`lost-found-faculty`).on("postgres_changes", { event: "*", schema: "public", table: "lost_found_items", filter: `department=eq.${facultyDepartment}` }, () => {
      loadItems()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const handleYearChange = (yearId: string, checked: boolean) => {
    if (yearId === "all") {
      setSelectedYears(checked ? ["all"] : [])
    } else {
      let updated = selectedYears.filter(y => y !== "all")
      if (checked) updated = [...updated, yearId]
      else updated = updated.filter(y => y !== yearId)
      setSelectedYears(updated)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setItemImage(file); setItemImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${facultyId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from("lost-found-images").upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from("lost-found-images").getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemTitle || !itemCategory || !itemLocation || !itemDescription || !date) {
      toast({ title: "Missing Information", variant: "destructive" }); return
    }
    
    setSubmitting(true)
    try {
      let imageUrl = ""
      if (itemImage) imageUrl = await uploadImage(itemImage)
      
      // Items visible to ALL students across all departments and years
      const targetYearsValue = selectedYears.includes("all") 
        ? ["1st", "2nd", "3rd", "4th"] 
        : selectedYears.filter(y => y !== "all")
      
      const { error } = await supabase.from("lost_found_items").insert({
        item_name: itemTitle, 
        item_category: itemCategory.toLowerCase(), 
        location_found: itemLocation, 
        description: itemDescription,
        status: itemStatus.toLowerCase() === 'lost' ? 'found' : itemStatus.toLowerCase(), 
        image_url: imageUrl,
        reporter_id: facultyId, 
        reporter_name: facultyName,
        department: facultyDepartment,
        target_years: targetYearsValue,
        created_at: new Date().toISOString()
      })
      
      if (error) throw error
      toast({ title: "Success", description: `${itemStatus} item reported successfully! Visible to all students` })
      setItemTitle(""); setItemCategory(""); setItemLocation(""); setItemDescription(""); setItemImage(null); setItemImagePreview(""); setDate(new Date()); setActiveTab("browse")
      loadItems()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleResolve = async (itemId: string) => {
    try {
      const { error } = await supabase.from("lost_found_items").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", itemId)
      if (error) throw error
      toast({ title: "Item Resolved", description: "The item has been marked as resolved" })
      loadItems()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.item_category === selectedCategory.toLowerCase()
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "found": return "bg-green-100 text-green-800"
      case "lost": return "bg-amber-100 text-amber-800"
      case "resolved": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lost & Found Portal</h1>
            <p className="text-gray-500 mt-1"><Badge variant="secondary">{facultyDepartment}</Badge></p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Items</TabsTrigger>
            <TabsTrigger value="report-lost">Report Lost</TabsTrigger>
            <TabsTrigger value="report-found">Report Found</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search items..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-lg font-medium">No items found</h3><p className="text-gray-500">No items match your criteria</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {item.image_url ? <img src={item.image_url} alt={item.item_name} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gray-100 flex items-center justify-center"><Info className="h-10 w-10 text-gray-300" /></div>}
                      <Badge className={cn("absolute top-2 right-2", getStatusColor(item.status))}>{item.status}</Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{item.item_name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="mr-2">{item.item_category}</Badge>
                        <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-1" />{format(new Date(item.created_at), "PP")}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-start mb-2"><MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" /><p className="text-sm text-gray-600">{item.location_found}</p></div>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{item.target_years.map(y => <Badge key={y} variant="outline" className="text-xs">{y} Year</Badge>)}</div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setShowDetailsDialog(true) }}><Eye className="h-4 w-4 mr-1" /> Details</Button>
                      {item.status !== "resolved" && <Button size="sm" onClick={() => handleResolve(item.id)}>Mark Resolved</Button>}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="report-lost" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Report a Lost Item</CardTitle><CardDescription>Provide details to help locate the item</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Item Title *</Label><Input placeholder="e.g., Black Laptop Bag" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Category *</Label><Select value={itemCategory} onValueChange={setItemCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Last Seen Location *</Label><Select value={itemLocation} onValueChange={setItemLocation}><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Date Lost *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent></Popover></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Detailed description..." className="min-h-[120px]" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Image (Optional)</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                          {itemImagePreview ? <div className="relative"><img src={itemImagePreview} alt="Preview" className="mx-auto max-h-[150px] rounded-lg" /><Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setItemImage(null); setItemImagePreview("") }}>Remove</Button></div> : <div><Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" /><Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}><Upload className="h-4 w-4 mr-2" /> Upload</Button></div>}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">📢 This item will be visible to <strong>ALL students</strong> across all departments and years.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setActiveTab("browse")}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Report"}</Button></div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report-found" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Report a Found Item</CardTitle><CardDescription>Help return the item to its owner</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { setItemStatus("Found"); handleSubmit(e) }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Item Title *</Label><Input placeholder="e.g., Blue Water Bottle" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Category *</Label><Select value={itemCategory} onValueChange={setItemCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Found Location *</Label><Select value={itemLocation} onValueChange={setItemLocation}><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Date Found *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent></Popover></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Description *</Label><Textarea placeholder="Detailed description..." className="min-h-[120px]" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Image (Optional)</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                          {itemImagePreview ? <div className="relative"><img src={itemImagePreview} alt="Preview" className="mx-auto max-h-[150px] rounded-lg" /><Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setItemImage(null); setItemImagePreview("") }}>Remove</Button></div> : <div><Input id="image2" type="file" accept="image/*" onChange={handleImageChange} className="hidden" /><Button type="button" variant="outline" onClick={() => document.getElementById("image2")?.click()}><Upload className="h-4 w-4 mr-2" /> Upload</Button></div>}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">📢 This item will be visible to <strong>ALL students</strong> across all departments and years.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setActiveTab("browse")}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Report"}</Button></div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{selectedItem?.item_name}</DialogTitle><DialogDescription>{selectedItem?.item_category}</DialogDescription></DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.item_name} className="w-full h-48 object-cover rounded-lg" />}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm text-gray-500">Location</Label><p className="text-sm flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedItem.location_found}</p></div>
                  <div><Label className="text-sm text-gray-500">Date</Label><p className="text-sm flex items-center gap-1"><CalendarIcon className="h-4 w-4" />{format(new Date(selectedItem.created_at), "PP")}</p></div>
                  <div><Label className="text-sm text-gray-500">Status</Label><Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge></div>
                  <div><Label className="text-sm text-gray-500">Department</Label><p className="text-sm">{selectedItem.department}</p></div>
                </div>
                <div><Label className="text-sm text-gray-500">Description</Label><p className="text-sm mt-1">{selectedItem.description}</p></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
