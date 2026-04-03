"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Phone, Mail, ChefHat, Search, ChevronLeft, ChevronRight, Package, X, User, Star } from "lucide-react"

interface CafeOwner {
  id: string; cafe_name: string; owner_name: string; address: string; phone: string
  email: string; description: string; outside_images: string[]; inside_images: string[]; created_at: string
}
interface MenuItem {
  id: string; owner_id: string; name: string; price: number
  category: string; description: string; image_url: string
}

const CATEGORIES = ["All", "Breakfast", "Main Course", "Snacks", "Beverages", "Desserts", "Thalis", "Other"]
const CAT_EMOJI: Record<string, string> = { "Breakfast": "🌅", "Main Course": "🍽️", "Snacks": "🍟", "Beverages": "🥤", "Desserts": "🍨", "Thalis": "🪔", "Other": "🍴", "All": "🍴" }

export default function CafeteriaViewer({ backHref = "/" }: { backHref?: string }) {
  const [cafes, setCafes] = useState<CafeOwner[]>([])
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCafe, setSelectedCafe] = useState<CafeOwner | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [outerSlide, setOuterSlide] = useState<Record<string, number>>({})
  const [innerSlide, setInnerSlide] = useState(0)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchCafes()
    channelRef.current = supabase.channel('cafe-viewer-rt')
      .on("postgres_changes", { event: "*", schema: "public", table: "cafeteria_owners" }, fetchCafes)
      .on("postgres_changes", { event: "*", schema: "public", table: "cafeteria_menu_items" }, fetchCafes)
      .subscribe()
    return () => { channelRef.current?.unsubscribe() }
  }, [])

  const fetchCafes = async () => {
    try {
      const { data: owners } = await supabase.from('cafeteria_owners').select('*').order('created_at', { ascending: false })
      if (!owners || owners.length === 0) { setLoading(false); return }
      setCafes(owners)
      const { data: items } = await supabase.from('cafeteria_menu_items').select('*').order('created_at', { ascending: false })
      const grouped: Record<string, MenuItem[]> = {}
      ;(items || []).forEach(item => {
        if (!grouped[item.owner_id]) grouped[item.owner_id] = []
        grouped[item.owner_id].push(item)
      })
      setMenuItems(grouped)
    } catch (err) { console.error('Error:', err) }
    finally { setLoading(false) }
  }

  const cafeItems = (cafeId: string) => {
    const items = menuItems[cafeId] || []
    return items.filter(i => {
      const cat = selectedCategory === "All" || i.category === selectedCategory
      const srch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())
      return cat && srch
    })
  }

  const allModalImages = selectedCafe ? [...(selectedCafe.outside_images || []), ...(selectedCafe.inside_images || [])] : []

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-3" /><p className="text-gray-500">Loading cafeterias...</p></div>
    </div>
  )

  if (cafes.length === 0) return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><ChefHat className="w-10 h-10 text-orange-300" /></div>
      <h3 className="text-xl font-semibold text-gray-700">No cafeterias listed yet</h3>
      <p className="text-gray-400 mt-1 text-sm">Cafeteria owners register via the footer link</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ChefHat className="w-6 h-6 text-orange-500" />Nearby Cafeterias</h2>
          <p className="text-gray-400 text-sm mt-0.5">{cafes.length} cafeteria{cafes.length > 1 ? 's' : ''} · Live menu</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-medium">🔴 Live</Badge>
      </div>

      {/* Cafe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cafes.map(cafe => {
          const imgs = cafe.outside_images || []
          const idx = outerSlide[cafe.id] || 0
          const count = (menuItems[cafe.id] || []).length

          return (
            <motion.div key={cafe.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-200"
              onClick={() => { setSelectedCafe(cafe); setInnerSlide(0); setSelectedCategory("All"); setSearch("") }}
            >
              {/* Image */}
              <div className="relative h-44 bg-orange-50">
                {imgs.length > 0 ? (
                  <>
                    <img src={imgs[idx]} alt={cafe.cafe_name} className="w-full h-full object-cover" />
                    {imgs.length > 1 && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setOuterSlide(p => ({ ...p, [cafe.id]: (idx - 1 + imgs.length) % imgs.length })) }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={e => { e.stopPropagation(); setOuterSlide(p => ({ ...p, [cafe.id]: (idx + 1) % imgs.length })) }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4" /></button>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-14 h-14 text-orange-200" /></div>
                )}
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-bold text-base drop-shadow">{cafe.cafe_name}</h3>
                  <span className="text-xs text-white/70">{count} items on menu</span>
                </div>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-orange-600 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  🍽️ Open
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate mb-1"><MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" /><span className="truncate">{cafe.address}</span></div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2"><Phone className="w-3 h-3 text-green-400" />{cafe.phone}</div>
                {cafe.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{cafe.description}</p>}
                <button onClick={e => { e.stopPropagation(); setSelectedCafe(cafe); setInnerSlide(0); setSelectedCategory("All"); setSearch("") }} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                  View Menu & Details
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Full Detail Modal */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-4 px-3" onClick={() => setSelectedCafe(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

              {/* Image slider */}
              <div className="relative h-64 bg-gray-100">
                {allModalImages.length > 0 ? (
                  <>
                    <img src={allModalImages[innerSlide]} alt="cafe" className="w-full h-full object-cover" />
                    {allModalImages.length > 1 && (
                      <>
                        <button onClick={() => setInnerSlide(p => (p - 1 + allModalImages.length) % allModalImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setInnerSlide(p => (p + 1) % allModalImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 px-2 py-0.5 rounded-full">{innerSlide + 1}/{allModalImages.length}</span>
                      </>
                    )}
                    <Badge className={`absolute top-3 left-3 text-xs border-0 ${innerSlide < (selectedCafe.outside_images || []).length ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                      {innerSlide < (selectedCafe.outside_images || []).length ? '📸 Outside' : '🏠 Inside'}
                    </Badge>
                  </>
                ) : <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-16 h-16 text-gray-200" /></div>}
              </div>
              {/* Thumbnails */}
              {allModalImages.length > 1 && (
                <div className="flex gap-1.5 p-2 bg-gray-50 overflow-x-auto">
                  {allModalImages.map((src, i) => <button key={i} onClick={() => setInnerSlide(i)} className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === innerSlide ? 'border-orange-500' : 'border-transparent'}`}><img src={src} className="w-full h-full object-cover" /></button>)}
                </div>
              )}

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCafe.cafe_name}</h2>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5"><User className="w-3.5 h-3.5" />{selectedCafe.owner_name}</p>
                  </div>
                  <button onClick={() => setSelectedCafe(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-400" />{selectedCafe.address}</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-400" />{selectedCafe.phone}</div>
                  <div className="flex items-center gap-2 sm:col-span-2"><Mail className="w-4 h-4 text-blue-400" />{selectedCafe.email}</div>
                </div>
                {selectedCafe.description && <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-xl border border-orange-100">{selectedCafe.description}</p>}

                {/* Menu */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2"><ChefHat className="w-5 h-5 text-orange-500" />Menu <span className="text-sm font-normal text-gray-400">({(menuItems[selectedCafe.id] || []).length} items)</span></h3>

                  {/* Category Tabs */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {CATEGORIES.filter(c => c === "All" || (menuItems[selectedCafe.id] || []).some(i => i.category === c)).map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'}`}>
                        {CAT_EMOJI[cat]} {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..." className="pl-9 h-9 text-sm" />
                  </div>

                  {/* Item List - Simple name-price format, no images */}
                  <div className="space-y-1 max-h-96 overflow-y-auto pr-0.5">
                    {cafeItems(selectedCafe.id).length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <Package className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No items in this category</p>
                      </div>
                    ) : (
                      cafeItems(selectedCafe.id).map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">{CAT_EMOJI[item.category]} {item.category}</Badge>
                          </div>
                          <span className="font-bold text-orange-600 text-base flex-shrink-0">₹{item.price}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
