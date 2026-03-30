"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AlertCircle, CalendarIcon, Camera, Eye, MapPin, Package, Search, Upload, Loader2, ArrowLeft, Trash2, Plus } from "lucide-react"

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
  claimed_by: string
  claimed_at: string
  created_at: string
  updated_at: string
}

const categories = ["Electronics", "Electronics Accessories", "Books", "Documents", "Clothing", "Personal Items", "Jewelry", "Keys", "ID Cards", "Other"]
const locations = ["Library", "Student Center", "Engineering Building", "Science Building", "Arts Building", "Cafeteria", "Gym", "Dormitories", "Parking Lot", "Computer Lab", "Other"]

export default function LostFoundPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Report form state
  const [reportForm, setReportForm] = useState({
    item_name: "",
    item_category: "",
    location_found: "",
    description: "",
    status: "lost",
    image_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    loadItems()
    getCurrentUser()
    
    const channel = supabase
      .channel(`lost-found-all`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lost_found_items" }, (payload) => {
        const newItem = payload.new as LostFoundItem
        setItems(prev => [newItem, ...prev])
        toast({ title: "New Lost & Found Item", description: `${newItem.item_name} has been posted.` })
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "lost_found_items" }, (payload) => {
        setItems(prev => prev.filter(i => i.id !== (payload.old as any).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("lost_found_items").select("*").order("created_at", { ascending: false })
      if (data) setItems(data)
    } catch (error) { console.error("Error loading items:", error) } 
    finally { setLoading(false) }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return
    
    setDeletingId(itemId)
    try {
      const { error } = await supabase.from("lost_found_items").delete().eq("id", itemId)
      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== itemId))
      toast({ title: "Item deleted", description: "Your lost & found item has been removed." })
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message || "Failed to delete item", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.item_name || !reportForm.item_category || !reportForm.location_found) {
      toast({ title: "Please fill required fields", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast({ title: "Not logged in", variant: "destructive" }); return }

      let image_url = ""
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `lost_found/${user.id}/${Date.now()}.${ext}`
        const { data: up } = await supabase.storage.from('uploads').upload(path, imageFile, { upsert: true })
        if (up) {
          const { data: pub } = supabase.storage.from('uploads').getPublicUrl(path)
          image_url = pub.publicUrl
        }
      }

      const { error } = await supabase.from("lost_found_items").insert([{
        ...reportForm,
        image_url,
        reporter_id: user.id,
      }])
      if (error) throw error

      toast({ title: "Item reported!", description: `${reportForm.item_name} has been posted.` })
      setReportForm({ item_name: "", item_category: "", location_found: "", description: "", status: "lost", image_url: "" })
      setImageFile(null)
      setImagePreview("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
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
      case "found": return "bg-green-100 text-green-700"
      case "lost": return "bg-red-100 text-red-700"
      case "resolved": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/student-dashboard/other-services')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Package className="h-6 w-6" /></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lost & Found Portal</h1>
                <p className="text-gray-500">All reported items • Visible to everyone</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[320px] grid-cols-2">
            <TabsTrigger value="browse">Browse Items</TabsTrigger>
            <TabsTrigger value="report"><Plus className="w-3 h-3 mr-1" />Report Item</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Lost & Found Items</CardTitle>
                <CardDescription>Items from all students — you can delete your own posts</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search items..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="found">Found</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-lg font-medium">No items found</h3></div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image_url ? <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-gray-300" /></div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.item_name}</h3>
                                <p className="text-sm text-gray-600">Category: {item.item_category}</p>
                              </div>
                              <Badge className={cn("border-0 mt-2 sm:mt-0", getStatusColor(item.status))}>{item.status}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center text-xs text-gray-500"><CalendarIcon className="h-3 w-3 mr-1" />{format(new Date(item.created_at), "PP")}</div>
                              <div className="flex items-center text-xs text-gray-500"><MapPin className="h-3 w-3 mr-1" />{item.location_found}</div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                            <div className="mt-4 flex justify-between items-center">
                              <div className="text-xs text-gray-500">Posted by: {item.reporter_id === currentUserId ? <span className="text-blue-600 font-medium">You</span> : "Another student"}</div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setShowDetailsDialog(true) }}>
                                  <Eye className="h-3 w-3 mr-1" /> View
                                </Button>
                                {/* Delete button only for own items */}
                                {item.reporter_id === currentUserId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={deletingId === item.id}
                                  >
                                    {deletingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                                    Delete
                                  </Button>
                                )}
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
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report a Lost or Found Item</CardTitle>
                <CardDescription>Fill in the details of the item you've lost or found</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Item Name *</Label>
                      <Input placeholder="e.g., Black Wallet" value={reportForm.item_name} onChange={e => setReportForm(p => ({ ...p, item_name: e.target.value }))} className="mt-1" required />
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select value={reportForm.status} onValueChange={v => setReportForm(p => ({ ...p, status: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lost">Lost (I lost this item)</SelectItem>
                          <SelectItem value="found">Found (I found this item)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select value={reportForm.item_category} onValueChange={v => setReportForm(p => ({ ...p, item_category: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Select value={reportForm.location_found} onValueChange={v => setReportForm(p => ({ ...p, location_found: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the item (color, size, any distinguishing marks...)" value={reportForm.description} onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Image (optional)</Label>
                    <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 rounded-lg" />
                          <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={() => { setImageFile(null); setImagePreview("") }}>Remove</Button>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="lost-found-img" />
                          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("lost-found-img")?.click()}>
                            <Upload className="w-3 h-3 mr-2" /> Choose Image
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                    {submitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{selectedItem?.item_name}</DialogTitle><DialogDescription>{selectedItem?.item_category}</DialogDescription></DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.item_name} className="w-full h-48 object-cover rounded-lg" />}
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm text-gray-500">Location</Label><p className="text-sm flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedItem.location_found}</p></div>
                  <div><Label className="text-sm text-gray-500">Date</Label><p className="text-sm">{format(new Date(selectedItem.created_at), "PP")}</p></div>
                  <div><Label className="text-sm text-gray-500">Status</Label><Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge></div>
                  <div><Label className="text-sm text-gray-500">Department</Label><p className="text-sm">{selectedItem.department || 'N/A'}</p></div>
                </div>
                <div><Label className="text-sm text-gray-500">Description</Label><p className="text-sm mt-1">{selectedItem.description}</p></div>
              </div>
            )}
            <DialogFooter>
              {selectedItem?.reporter_id === currentUserId && (
                <Button variant="destructive" size="sm" onClick={() => { handleDeleteItem(selectedItem!.id); setShowDetailsDialog(false) }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete My Post
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
