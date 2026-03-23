"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AlertCircle, CalendarIcon, Camera, Eye, MapPin, Package, Search, Upload, Loader2, ArrowLeft } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    // Load items immediately - visible to ALL users
    loadItems()
    
    // Setup realtime subscription
    const channel = supabase
      .channel(`lost-found-all-students`)
      .on(
        "postgres_changes", 
        { event: "INSERT", schema: "public", table: "lost_found_items" }, 
        (payload) => {
          const newItem = payload.new as LostFoundItem
          setItems(prev => [newItem, ...prev])
          toast({ title: "New Lost & Found Item", description: `${newItem.item_name} has been posted.` })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      // Lost & Found shows ALL items to ALL students - no filtering
      const { data, error } = await supabase.from("lost_found_items").select("*").order("created_at", { ascending: false })
      if (data) {
        setItems(data)
        console.log(`Loaded ${data.length} lost-found items (visible to ALL students)`)
      }
    } catch (error) { console.error("Error loading items:", error) } finally { setLoading(false) }
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
          <TabsList className="grid w-full md:w-[300px] grid-cols-1">
            <TabsTrigger value="browse">Browse Items</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Lost & Found Items</CardTitle>
                <CardDescription>Items from your department and year</CardDescription>
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
                  <div className="text-center py-12"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-lg font-medium">No items found</h3><p className="text-gray-500">No items match your criteria</p></div>
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
                              <div className="text-xs text-gray-500">Reported by: {item.reporter_id}</div>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setShowDetailsDialog(true) }}><Eye className="h-3 w-3 mr-1" /> View Details</Button>
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
