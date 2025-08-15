"use client"

import { useEffect } from "react"
import supabase from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function RealtimeToasts() {
  const { toast } = useToast()

  useEffect(() => {
    // Subscribe to inserts on key tables
    const channel = supabase
      .channel('realtime-hub')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assignments' }, (payload) => {
        toast({ title: 'New Assignment', description: payload?.new?.title || 'A new assignment was posted.' })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        toast({ title: 'New Announcement', description: payload?.new?.title || 'A new announcement was posted.' })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lost_found_items' }, (payload) => {
        toast({ title: 'Lost & Found', description: payload?.new?.title || 'A new lost/found item was posted.' })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grievances' }, () => {
        toast({ title: 'Grievance Update', description: 'A new grievance was submitted/updated.' })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return null
}
