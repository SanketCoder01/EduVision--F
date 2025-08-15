"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Item { id: string; title: string; created_at?: string; description?: string }

export default function TodaysHubPage() {
  const [assignments, setAssignments] = useState<Item[]>([])
  const [announcements, setAnnouncements] = useState<Item[]>([])
  const [lostFound, setLostFound] = useState<Item[]>([])
  const [grievances, setGrievances] = useState<Item[]>([])

  useEffect(() => {
    const load = async () => {
      // Attempt to get user's dept/year from localStorage (fallback to all)
      const stored = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
      let dept: string | undefined
      let year: string | undefined
      let userId: string | undefined
      if (stored) {
        try { const u = JSON.parse(stored); dept = u.department; year = u.year || u.class_year; userId = u.id } catch {}
      }

      // Assignments targeted by dept/year
      const a = await supabase
        .from('assignments')
        .select('id,title,created_at,description,department,year')
        .order('created_at', { ascending: false })
        .limit(10)
      const aRows = (a.data || []).filter((row: any) => {
        if (!dept || !year) return true
        const ds = Array.isArray(row.department) ? row.department : []
        const ys = Array.isArray(row.year) ? row.year : []
        return ds.includes(dept) && ys.includes(String(year))
      })
      setAssignments(aRows)

      // Announcements targeted by dept/year
      const an = await supabase
        .from('announcements')
        .select('id,title,created_at,description,department,year')
        .order('created_at', { ascending: false })
        .limit(10)
      const anRows = (an.data || []).filter((row: any) => {
        if (!dept || !year) return true
        const ds = Array.isArray(row.department) ? row.department : []
        const ys = Array.isArray(row.year) ? row.year : []
        return ds.includes(dept) && ys.includes(String(year))
      })
      setAnnouncements(anRows)

      // Lost & Found: university-wide
      const lf = await supabase
        .from('lost_found_items')
        .select('id,title,created_at,description')
        .order('created_at', { ascending: false })
        .limit(10)
      setLostFound(lf.data || [])

      // Grievances: private to current user
      if (userId) {
        const gr = await supabase
          .from('grievances')
          .select('id,title,created_at,description,student_id')
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
        setGrievances(gr.data || [])
      } else {
        setGrievances([])
      }
    }
    load()
  }, [])

  const toneBg: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
  }

  const Section = ({ title, items, tone }: { title: string; items: Item[]; tone: 'blue'|'green'|'purple'|'orange' }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base md:text-lg font-semibold">{title}</h2>
          <Badge className={`${toneBg[tone]} text-white`}>{items.length}</Badge>
        </div>
        <div className="space-y-2.5">
          {items.length === 0 && <div className="text-sm text-gray-500">Nothing new right now.</div>}
          {items.map((it) => (
            <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50">
              <div className="font-medium text-sm md:text-base">{it.title}</div>
              {it.description && <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{it.description}</div>}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-3 md:space-y-4">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold">Today's Hub</motion.h1>
      <Section title="Assignments" items={assignments} tone="blue" />
      <Section title="Announcements" items={announcements} tone="green" />
      <Section title="Lost & Found" items={lostFound} tone="orange" />
      <Section title="Your Grievances (Private)" items={grievances} tone="purple" />
    </div>
  )
}
