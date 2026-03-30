"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  ChefHat, LogOut, Plus, Trash2, Edit, Upload, Camera, X,
  Save, Loader2, Phone, MapPin, Mail, User, Building,
  ChevronLeft, ChevronRight, Package, IndianRupee, ArrowLeft,
  LayoutDashboard, UtensilsCrossed, Settings, TrendingUp, Star
} from "lucide-react"

const MENU_CATEGORIES = ["Breakfast", "Main Course", "Snacks", "Beverages", "Desserts", "Thalis", "Other"]
const CAT_COLORS: Record<string, string> = {
  "Breakfast": "bg-yellow-100 text-yellow-700", "Main Course": "bg-red-100 text-red-700",
  "Snacks": "bg-orange-100 text-orange-700", "Beverages": "bg-blue-100 text-blue-700",
  "Desserts": "bg-pink-100 text-pink-700", "Thalis": "bg-purple-100 text-purple-700",
  "Other": "bg-gray-100 text-gray-700",
}
const CAT_EMOJI: Record<string, string> = {
  "Breakfast": "🌅", "Main Course": "🍽️", "Snacks": "🍟", "Beverages": "🥤",
  "Desserts": "🍨", "Thalis": "🪔", "Other": "🍴",
}

export default function CafeteriaDashboard() {
  const router = useRouter()
  const { toast } = useToast()

  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [owner, setOwner] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'dashboard' | 'profile' | 'menu-form'>('dashboard')
  const [activeCategory, setActiveCategory] = useState("All")
  const channelRef = useRef<any>(null)

  // Registration form
  const [regForm, setRegForm] = useState({ cafe_name: "", owner_name: "", address: "", phone: "", email: "", description: "" })
  const [outsideImages, setOutsideImages] = useState<File[]>([])
  const [outsidePreviews, setOutsidePreviews] = useState<string[]>([])
  const [insideImages, setInsideImages] = useState<File[]>([])
  const [insidePreviews, setInsidePreviews] = useState<string[]>([])

  // Menu form
  const [editingItem, setEditingItem] = useState<any>(null)
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "Main Course", description: "" })
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null)
  const [menuImagePreview, setMenuImagePreview] = useState("")

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/cafeteria-login'); return }
    setAuthUser(user)
    const { data: ownerData } = await supabase.from('cafeteria_owners').select('*').eq('auth_id', user.id).maybeSingle()
    if (ownerData) {
      setOwner(ownerData)
      setRegForm({ cafe_name: ownerData.cafe_name || "", owner_name: ownerData.owner_name || "", address: ownerData.address || "", phone: ownerData.phone || "", email: ownerData.email || "", description: ownerData.description || "" })
      setView('dashboard')
      fetchMenuItems(ownerData.id)
      setupRealtime(ownerData.id)
    } else { setView('profile') }
    setLoading(false)
  }

  const fetchMenuItems = async (ownerId: string) => {
    const { data } = await supabase.from('cafeteria_menu_items').select('*').eq('owner_id', ownerId).order('category').order('created_at', { ascending: false })
    setMenuItems(data || [])
  }

  const setupRealtime = (ownerId: string) => {
    channelRef.current?.unsubscribe()
    channelRef.current = supabase.channel(`cafe-owner-${ownerId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cafeteria_menu_items", filter: `owner_id=eq.${ownerId}` }, () => fetchMenuItems(ownerId))
      .subscribe()
  }

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const path = `cafeteria/${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regForm.cafe_name || !regForm.owner_name || !regForm.address || !regForm.phone || !regForm.email) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return
    }
    setSaving(true)
    try {
      const outsideUrls: string[] = [...(owner?.outside_images || [])]
      for (const f of outsideImages) outsideUrls.push(await uploadImage(f, 'outside'))

      const insideUrls: string[] = [...(owner?.inside_images || [])]
      for (const f of insideImages) insideUrls.push(await uploadImage(f, 'inside'))

      const payload = { auth_id: authUser.id, ...regForm, outside_images: outsideUrls.slice(0, 2), inside_images: insideUrls.slice(0, 8) }

      const result = owner
        ? await supabase.from('cafeteria_owners').update(payload).eq('id', owner.id).select().maybeSingle()
        : await supabase.from('cafeteria_owners').insert([payload]).select().maybeSingle()

      if (result.error) throw result.error
      setOwner(result.data)
      setupRealtime(result.data.id)
      setOutsideImages([]); setOutsidePreviews([]); setInsideImages([]); setInsidePreviews([])
      setView('dashboard')
      toast({ title: owner ? "Profile updated!" : "Cafeteria registered! 🎉", description: "Now live for all students & faculty." })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSaving(false) }
  }

  const handleSaveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) { toast({ title: "Name and price required", variant: "destructive" }); return }
    setSaving(true)
    try {
      let imageUrl = editingItem?.image_url || ""
      if (menuImageFile) imageUrl = await uploadImage(menuImageFile, 'menu')

      const payload = {
        owner_id: owner.id, name: menuForm.name.trim(),
        price: parseFloat(menuForm.price), category: menuForm.category,
        description: menuForm.description.trim(), image_url: imageUrl,
      }

      const { error } = editingItem
        ? await supabase.from('cafeteria_menu_items').update(payload).eq('id', editingItem.id)
        : await supabase.from('cafeteria_menu_items').insert([payload])

      if (error) throw error
      toast({ title: editingItem ? "Item updated!" : "✅ Item added to menu!" })
      setView('dashboard'); setEditingItem(null)
      setMenuForm({ name: "", price: "", category: "Main Course", description: "" })
      setMenuImageFile(null); setMenuImagePreview("")
      fetchMenuItems(owner.id)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSaving(false) }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Remove this item from menu?")) return
    const { error } = await supabase.from('cafeteria_menu_items').delete().eq('id', id)
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return }
    setMenuItems(prev => prev.filter(i => i.id !== id))
    toast({ title: "Item removed" })
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setMenuForm({ name: item.name, price: String(item.price), category: item.category, description: item.description || "" })
    setMenuImagePreview(item.image_url || ""); setMenuImageFile(null)
    setView('menu-form')
  }

  const categories = ["All", ...MENU_CATEGORIES.filter(c => menuItems.some(i => i.category === c))]
  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter(i => i.category === activeCategory)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-14 h-14 animate-spin text-orange-500 mx-auto mb-4" /><p className="text-gray-500">Loading dashboard...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">{owner?.cafe_name || "My Restaurant"}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Owner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {owner && view === 'dashboard' && (
              <button onClick={() => setView('profile')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
                <Settings className="w-3.5 h-3.5" /> Profile
              </button>
            )}
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/cafeteria-login') }} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all border border-red-200 hover:border-red-500">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── REGISTRATION FORM (first time or edit) ── */}
        {(!owner || view === 'profile') && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {owner && (
              <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                <h2 className="text-xl font-bold text-white">{owner ? "Edit Restaurant Profile" : "Register Your Restaurant"}</h2>
                <p className="text-orange-100 text-sm mt-0.5">{owner ? "Update your cafe details" : "Get listed and start serving students & faculty"}</p>
              </div>
              <form onSubmit={handleRegister} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Restaurant Name *", key: "cafe_name", placeholder: "e.g. Mama's Kitchen" },
                    { label: "Owner Name *", key: "owner_name", placeholder: "Your full name" },
                    { label: "Phone *", key: "phone", placeholder: "+91 98765 43210" },
                    { label: "Email *", key: "email", placeholder: "restaurant@email.com" },
                  ].map(f => (
                    <div key={f.key}>
                      <Label className="text-sm font-medium text-gray-700">{f.label}</Label>
                      <Input value={(regForm as any)[f.key]} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="mt-1 h-10" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Address *</Label>
                    <Textarea value={regForm.address} onChange={e => setRegForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address near campus..." className="mt-1" rows={2} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">About Your Restaurant</Label>
                    <Textarea value={regForm.description} onChange={e => setRegForm(p => ({ ...p, description: e.target.value }))} placeholder="Veg / Non-veg, specialties, timings..." className="mt-1" rows={2} />
                  </div>
                </div>

                {/* Outside Photos */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Exterior Photos (max 2) — shown as hero thumbnail</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {[...outsidePreviews, ...(owner?.outside_images || []).slice(outsidePreviews.length)].slice(0, 2).map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden h-32 border border-gray-200">
                        <img src={src} className="w-full h-full object-cover" />
                        {i < outsidePreviews.length && <button type="button" onClick={() => { setOutsideImages(p => p.filter((_, idx) => idx !== i)); setOutsidePreviews(p => p.filter((_, idx) => idx !== i)) }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><X className="w-3 h-3" /></button>}
                      </div>
                    ))}
                    {(outsidePreviews.length + (owner?.outside_images?.length || 0)) < 2 && (
                      <label className="border-2 border-dashed border-orange-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors">
                        <Camera className="w-6 h-6 text-orange-400 mb-1" /><span className="text-xs text-orange-400">Add Photo</span>
                        <input type="file" accept="image/*" className="hidden" multiple onChange={e => { const f = Array.from(e.target.files || []); setOutsideImages(p => [...p, ...f].slice(0, 2)); setOutsidePreviews(p => [...p, ...f.map(x => URL.createObjectURL(x))].slice(0, 2)) }} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Inside Photos */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Interior Photos (max 8)</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[...insidePreviews, ...(owner?.inside_images || []).slice(insidePreviews.length)].slice(0, 8).map((src, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden h-20 border border-gray-100">
                        <img src={src} className="w-full h-full object-cover" />
                        {i < insidePreviews.length && <button type="button" onClick={() => { setInsideImages(p => p.filter((_, idx) => idx !== i)); setInsidePreviews(p => p.filter((_, idx) => idx !== i)) }} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>}
                      </div>
                    ))}
                    {(insidePreviews.length + (owner?.inside_images?.length || 0)) < 8 && (
                      <label className="border-2 border-dashed border-orange-100 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors">
                        <Plus className="w-4 h-4 text-orange-300" />
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []); setInsideImages(p => [...p, ...f].slice(0, 8)); setInsidePreviews(p => [...p, ...f.map(x => URL.createObjectURL(x))].slice(0, 8)) }} />
                      </label>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white px-6">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {owner ? "Save Changes" : "Register Restaurant"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── MAIN DASHBOARD ── */}
        {owner && view === 'dashboard' && (
          <div className="space-y-6">
            {/* Cafe Hero Banner */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-500">
                {(owner.outside_images || []).length > 0
                  ? <img src={owner.outside_images[0]} className="w-full h-full object-cover opacity-50" />
                  : <div className="w-full h-full flex items-center justify-center opacity-20"><ChefHat className="w-32 h-32 text-white" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold">{owner.cafe_name}</h2>
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5"><User className="w-3 h-3" />{owner.owner_name}</p>
                </div>
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                </div>
              </div>
              <div className="p-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-400" />{owner.address}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-green-400" />{owner.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-400" />{owner.email}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Items", value: menuItems.length, icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Categories", value: new Set(menuItems.map(i => i.category)).size, icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Avg Price", value: menuItems.length ? `₹${Math.round(menuItems.reduce((s, i) => s + i.price, 0) / menuItems.length)}` : "–", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                  <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
                </div>
              ))}
            </div>

            {/* Menu Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Menu Items</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time updates on student & faculty screens</p>
                </div>
                <button
                  onClick={() => { setEditingItem(null); setMenuForm({ name: "", price: "", category: "Main Course", description: "" }); setMenuImageFile(null); setMenuImagePreview(""); setView('menu-form') }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                ><Plus className="w-4 h-4" /> Add Item</button>
              </div>

              {/* Category Filter Tabs */}
              {menuItems.length > 0 && (
                <div className="px-5 pt-4 flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${activeCategory === cat ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500'}`}>
                      {cat === "All" ? "🍴 All" : `${CAT_EMOJI[cat] || ""} ${cat}`}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3"><Package className="w-8 h-8 text-orange-200" /></div>
                    <p className="text-gray-500 font-medium">No menu items yet</p>
                    <p className="text-gray-400 text-sm mt-1 mb-5">Add your first dish to get started</p>
                    <button onClick={() => { setEditingItem(null); setMenuForm({ name: "", price: "", category: "Main Course", description: "" }); setMenuImageFile(null); setMenuImagePreview(""); setView('menu-form') }} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-xl transition-colors mx-auto">
                      <Plus className="w-4 h-4" /> Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredItems.map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                          <div className="relative h-40 bg-orange-50">
                            {item.image_url
                              ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-10 h-10 text-orange-200" /></div>
                            }
                            <div className="absolute top-2 left-2">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[item.category] || 'bg-gray-100 text-gray-700'}`}>
                                {CAT_EMOJI[item.category]} {item.category}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-orange-600 font-bold text-sm px-2 py-0.5 rounded-lg shadow-sm">
                              ₹{item.price}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                            {item.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>}
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 py-2 rounded-xl border border-gray-200 hover:border-orange-200 transition-all font-medium">
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button onClick={() => handleDeleteMenuItem(item.id)} className="flex items-center justify-center w-9 h-9 text-red-400 hover:text-white hover:bg-red-500 rounded-xl border border-gray-200 hover:border-red-500 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD / EDIT ITEM FORM ── */}
        {owner && view === 'menu-form' && (
          <div className="max-w-xl mx-auto">
            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Menu
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 flex items-center gap-3">
                <UtensilsCrossed className="w-7 h-7 text-white/80" />
                <div>
                  <h2 className="text-lg font-bold text-white">{editingItem ? "Edit Dish" : "Add New Dish"}</h2>
                  <p className="text-orange-100 text-xs">Changes go live instantly on all screens</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-medium">Dish Name *</Label>
                  <Input value={menuForm.name} onChange={e => setMenuForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Paneer Butter Masala" className="mt-1.5 h-11 text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Price (₹) *</Label>
                    <div className="relative mt-1.5">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input type="number" value={menuForm.price} onChange={e => setMenuForm(p => ({ ...p, price: e.target.value }))} placeholder="80" className="pl-9 h-11 text-base" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select value={menuForm.category} onValueChange={v => setMenuForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>{MENU_CATEGORIES.map(c => <SelectItem key={c} value={c}>{CAT_EMOJI[c]} {c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea value={menuForm.description} onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))} placeholder="Ingredients, spice level, special notes..." className="mt-1.5 resize-none" rows={2} />
                </div>
                <div>
                  <Label className="text-sm font-medium">Dish Photo</Label>
                  <div className="mt-1.5 border-2 border-dashed border-orange-100 rounded-xl p-4 bg-orange-50/30 hover:bg-orange-50 transition-colors text-center">
                    {menuImagePreview ? (
                      <div className="relative inline-block">
                        <img src={menuImagePreview} className="mx-auto max-h-44 rounded-xl border border-orange-100 shadow-sm" />
                        <button type="button" onClick={() => { setMenuImageFile(null); setMenuImagePreview("") }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-orange-100"><Camera className="w-6 h-6 text-orange-400" /></div>
                        <p className="text-xs text-gray-400 mb-3">A dish photo increases orders</p>
                        <Input type="file" accept="image/*" className="hidden" id="dish-img" onChange={e => { const f = e.target.files?.[0]; if (f) { setMenuImageFile(f); setMenuImagePreview(URL.createObjectURL(f)) } }} />
                        <button type="button" onClick={() => document.getElementById("dish-img")?.click()} className="text-xs text-orange-500 border border-orange-300 hover:bg-orange-500 hover:text-white px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 mx-auto">
                          <Upload className="w-3.5 h-3.5" /> Upload Photo
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setView('dashboard')} className="flex-1 py-3 text-sm font-medium border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleSaveMenuItem} disabled={saving} className="flex-1 py-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingItem ? "Update Dish" : "Publish to Menu"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
