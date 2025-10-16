"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Search, Bell, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  department: string
  target_years: string[]
  venue: string
  event_date: string
  end_date?: string
  max_participants?: number
  registered_count: number
  status: string
  created_at: string
}

const eventTypes = [
  { value: 'seminar', label: 'Seminar', color: 'bg-blue-100 text-blue-700' },
  { value: 'workshop', label: 'Workshop', color: 'bg-purple-100 text-purple-700' },
  { value: 'conference', label: 'Conference', color: 'bg-green-100 text-green-700' },
  { value: 'cultural', label: 'Cultural', color: 'bg-pink-100 text-pink-700' },
  { value: 'sports', label: 'Sports', color: 'bg-orange-100 text-orange-700' },
  { value: 'technical', label: 'Technical', color: 'bg-indigo-100 text-indigo-700' }
]

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudentData()
  }, [])

  useEffect(() => {
    if (student) {
      fetchEvents()
      subscribeToEvents()
    }
  }, [student])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedType])

  const fetchStudentData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('email', session.user.email)
        .single()

      setStudent(studentData)
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Fetch events that match student's department or are for all departments
      const { data, error } = await supabase
        .from('dean_events')
        .select('*')
        .or(`department.eq.${student.department},department.eq.All Departments`)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })

      if (error) throw error

      // Filter by student's year
      const relevantEvents = data?.filter(event => 
        event.target_years?.includes('all') || event.target_years?.includes(student.year)
      ) || []

      setEvents(relevantEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('student_events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dean_events' },
        (payload) => {
          console.log('Event change detected:', payload)
          fetchEvents()
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Event Added!",
              description: `Check out: ${(payload.new as any).title}`,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.event_type === selectedType)
    }

    setFilteredEvents(filtered)
  }

  const handleRegister = async (eventId: string) => {
    try {
      // Implement registration logic here
      toast({
        title: "Registration Successful",
        description: "You have been registered for this event",
      })
    } catch (error) {
      console.error('Error registering:', error)
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive"
      })
    }
  }

  const getEventTypeColor = (type: string) => {
    return eventTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Events</h1>
          <p className="text-gray-600 mt-1">Discover and register for upcoming events</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.event_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.registered_count} / {event.max_participants || '∞'} registered</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleRegister(event.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">Check back later for upcoming events</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
