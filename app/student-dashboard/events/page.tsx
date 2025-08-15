"use client"

import { useState, useEffect, useCallback } from 'react'
import { Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { getStudentEvents } from './actions'
import EventCard from './_components/EventCard'
import { createClient } from '@/lib/supabase/client'

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [studentId, setStudentId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchEvents = useCallback(async (id: string) => {
    setLoading(true)
    const res = await getStudentEvents(id)
    if (res.success) {
      setEvents(res.data as any[])
      setFilteredEvents(res.data as any[])
    } else {
      toast({ title: 'Error fetching events', description: res.error, variant: 'destructive' })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStudentId(user.id)
        fetchEvents(user.id)
      } else {
        setLoading(false)
      }
    }
    getUser()
  }, [fetchEvents, supabase.auth])

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredEvents(filtered)
  }, [searchQuery, events])

  if (loading) {
    return <div className="p-6 text-center">Loading events...</div>
  }

  if (!studentId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Campus Events</h1>
        <p className="text-gray-600 mt-4">Please sign in to view and register for events.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campus Events</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            studentId={studentId}
            onRegister={() => fetchEvents(studentId)}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500">No upcoming events match your search for your department/year.</p>
        </div>
      )}
    </div>
  )
}

