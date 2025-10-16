"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye, Send } from "lucide-react"
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
  created_by: string
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

const departments = [
  'Computer Science & Engineering',
  'Cyber Security',
  'AI & Data Science',
  'AI & Machine Learning',
  'All Departments'
]

const years = ['first', 'second', 'third', 'fourth', 'all']

export default function EventsModule({ dean }: { dean: any }) {
  const [events, setEvents] = useState<Event[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'seminar',
    department: 'All Departments',
    target_years: ['all'],
    venue: '',
    event_date: '',
    end_date: '',
    max_participants: 100
  })

  useEffect(() => {
    fetchEvents()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('dean_events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dean_events' },
        (payload) => {
          console.log('Event change:', payload)
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('dean_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Insert event into database
      const { data: eventData, error: eventError } = await supabase
        .from('dean_events')
        .insert([{
          ...formData,
          created_by: dean.id,
          status: 'upcoming',
          registered_count: 0
        }])
        .select()
        .single()

      if (eventError) throw eventError

      // Send real-time notifications to students
      await sendEventNotifications(eventData)

      toast({
        title: "Event Created Successfully",
        description: "Students will be notified about this event",
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: 'seminar',
        department: 'All Departments',
        target_years: ['all'],
        venue: '',
        event_date: '',
        end_date: '',
        max_participants: 100
      })
      setShowCreateForm(false)
      fetchEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendEventNotifications = async (event: any) => {
    try {
      // Get target students based on department and years
      let query = supabase
        .from('students')
        .select('id, name, email, department, year')
        .eq('status', 'active')

      // Filter by department
      if (event.department !== 'All Departments') {
        query = query.eq('department', event.department)
      }

      // Filter by years
      if (!event.target_years.includes('all')) {
        query = query.in('year', event.target_years)
      }

      const { data: students, error } = await query

      if (error) throw error

      // Create notifications for each student
      const notifications = students?.map(student => ({
        user_id: student.id,
        type: 'event',
        title: `New Event: ${event.title}`,
        message: `${event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} on ${new Date(event.event_date).toLocaleDateString()}`,
        link: `/student-dashboard/events`,
        read: false,
        created_at: new Date().toISOString()
      })) || []

      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications)
      }

      console.log(`Sent notifications to ${notifications.length} students`)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('dean_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      toast({
        title: "Event Deleted",
        description: "Event has been removed successfully",
      })
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "Failed to delete event",
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
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading && events.length === 0) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600 mt-1">Create and manage university events with real-time student notifications</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., AI/ML Workshop"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <select
                      id="event_type"
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g., Auditorium, Lab 101"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Years</Label>
                    <div className="flex flex-wrap gap-2">
                      {years.map(year => (
                        <label key={year} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.target_years.includes(year)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  target_years: [...formData.target_years, year] 
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  target_years: formData.target_years.filter(y => y !== year) 
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{year === 'all' ? 'All Years' : `${year} Year`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the event details, agenda, speakers, etc."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create & Notify Students'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
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
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                
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

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{event.department}</Badge>
                  {event.target_years?.map(year => (
                    <Badge key={year} variant="outline" className="text-xs capitalize">
                      {year === 'all' ? 'All Years' : year}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && !showCreateForm && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started</p>
            <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
