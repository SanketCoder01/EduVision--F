"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Search, Bell, CheckCircle, X } from "lucide-react"
import { realtimeService, RealtimePayload } from "@/lib/realtime-service"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  department: string
  target_departments: string[]
  venue: string
  event_date: string
  event_time: string
  poster_url?: string
  max_participants?: number
  enable_payment: boolean
  payment_amount?: number
  allow_registration: boolean
  created_at: string
  registered_students?: number
  attended_students?: number
}

interface Registration {
  id: string
  event_id: string
  student_name: string
  student_prn: string
  student_email: string
  student_class: string
  paid: boolean
  attended: boolean
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
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([])
  const [showQR, setShowQR] = useState<string | null>(null)
  const [expandedPoster, setExpandedPoster] = useState<string | null>(null)
  const { toast } = useToast()

  const subscriptionsRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    fetchStudentData()
    
    return () => {
      if (subscriptionsRef.current) {
        subscriptionsRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (student) {
      fetchEvents()
      fetchMyRegistrations()
      setupRealtimeSubscriptions(student)
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
      
      // Fetch events from the events table
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter events for student's department
      const relevantEvents = data?.filter(event => {
        // Check if event is for student's department or has no department restriction
        const deptMatch = !event.department || 
                         event.department === student.department ||
                         event.target_departments?.includes(student.department)
        return deptMatch
      }) || []

      setEvents(relevantEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('student_email', student.email)
      
      if (error) throw error
      setMyRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  const setupRealtimeSubscriptions = (studentData: any) => {
    // Clean up previous subscriptions
    if (subscriptionsRef.current) {
      subscriptionsRef.current.unsubscribe()
    }
    
    // Use centralized realtime service with department + year filtering
    subscriptionsRef.current = realtimeService.subscribeToEvents(
      { department: studentData.department, year: studentData.year },
      (payload: RealtimePayload) => {
        console.log('Event change detected:', payload)
        fetchEvents()
        fetchMyRegistrations() // Refresh registrations too
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Event Added!",
            description: `Check out: ${payload.new.title}`,
          })
        }
      }
    )

    // Subscribe to registration changes for real-time attendance updates
    const registrationChannel = supabase
      .channel('registration-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'event_registrations',
        filter: `student_email=eq.${studentData.email}`
      }, (payload) => {
        console.log('Registration updated:', payload)
        fetchMyRegistrations()
        
        if (payload.new.attended !== payload.old?.attended) {
          toast({
            title: payload.new.attended ? "Attendance Marked!" : "Attendance Updated",
            description: `Your attendance for the event has been ${payload.new.attended ? 'marked present' : 'updated'}`,
          })
        }
      })
      .subscribe()
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

  const handleRegister = async (event: Event) => {
    try {
      // Check if already registered
      const existingReg = myRegistrations.find(r => r.event_id === event.id)
      if (existingReg) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this event",
        })
        return
      }

      // If payment required, show QR
      if (event.enable_payment && event.payment_amount) {
        setShowQR(event.id)
        return
      }

      // Register the student
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          student_id: student.id,
          student_name: student.name || student.full_name,
          student_prn: student.prn,
          student_email: student.email,
          student_class: student.class || `${student.department} ${student.year}`,
          paid: false,
          attended: false
        })

      if (error) throw error

      toast({
        title: "Registration Successful!",
        description: "You have been registered for this event",
      })
      fetchMyRegistrations()
    } catch (error) {
      console.error('Error registering:', error)
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive"
      })
    }
  }

  const handlePaymentConfirm = async (event: Event) => {
    try {
      // Register with payment confirmed
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          student_id: student.id,
          student_name: student.name || student.full_name,
          student_prn: student.prn,
          student_email: student.email,
          student_class: student.class || `${student.department} ${student.year}`,
          paid: true,
          attended: false
        })

      if (error) throw error

      setShowQR(null)
      toast({
        title: "Payment & Registration Successful!",
        description: "Your payment has been recorded and you are registered",
      })
      fetchMyRegistrations()
    } catch (error) {
      console.error('Error with payment:', error)
      toast({
        title: "Error",
        description: "Failed to complete registration",
        variant: "destructive"
      })
    }
  }

  const getMyRegistration = (eventId: string) => {
    return myRegistrations.find(r => r.event_id === eventId)
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
                {event.poster_url && (
                  <div className="relative h-48 w-full cursor-pointer" onClick={() => setExpandedPoster(event.poster_url || null)}>
                    <img 
                      src={event.poster_url} 
                      alt={event.title}
                      className="w-full h-full object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type?.charAt(0).toUpperCase() + event.event_type?.slice(1) || 'Event'}
                    </Badge>
                    {event.enable_payment && event.payment_amount && (
                      <Badge className="bg-green-100 text-green-700">
                        ₹{event.payment_amount}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{event.event_date} at {event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    {event.max_participants && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Max {event.max_participants} participants</span>
                      </div>
                    )}
                  </div>

                  {event.allow_registration && (
                    <div className="space-y-2">
                      {/* Show registration status */}
                      {getMyRegistration(event.id) ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Registered</span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge className={getMyRegistration(event.id)!.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                              {getMyRegistration(event.id)!.paid ? "Paid" : "Payment Pending"}
                            </Badge>
                            <Badge className={getMyRegistration(event.id)!.attended ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                              {getMyRegistration(event.id)!.attended ? "Attended" : "Not Attended"}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleRegister(event)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Register Now
                        </Button>
                      )}
                    </div>
                  )}

                  {/* QR Code Modal */}
                  {showQR === event.id && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <Card className="max-w-sm w-full">
                        <CardHeader>
                          <CardTitle>Payment Required</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <img 
                              src="/images/QR.jpg" 
                              alt="Payment QR Code"
                              className="w-48 h-48 mx-auto rounded-lg border"
                            />
                            <p className="mt-2 text-lg font-bold">₹{event.payment_amount}</p>
                            <p className="text-sm text-gray-500">Scan QR to pay</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setShowQR(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handlePaymentConfirm(event)}
                            >
                              I've Paid
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
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

      {/* Full-screen Poster Modal */}
      {expandedPoster && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedPoster(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setExpandedPoster(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={expandedPoster} 
            alt="Event Poster" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}
