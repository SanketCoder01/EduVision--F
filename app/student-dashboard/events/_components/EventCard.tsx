"use client"

import { Calendar, Clock, Users, DollarSign, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { registerStudentForEvent } from '../actions'
import { Event } from '@/types/events'

interface EventCardProps {
  event: Event
  studentId: string
  onRegister: () => void
}

export default function EventCard({ event, studentId, onRegister }: EventCardProps) {
  const { toast } = useToast()

  const now = new Date()
  const isRegOpen = () => {
    const start = event.registration_start ? new Date(event.registration_start) : null
    const end = event.registration_end ? new Date(event.registration_end) : null
    if (start && now < start) return false
    if (end && now > end) return false
    return true
  }

  const regCount = (event.event_registrations || []).filter(r => r.status === 'registered').length
  const isAlreadyRegistered = (event.event_registrations || []).some(r => r.student_id === studentId)
  const full = event.max_participants ? regCount >= event.max_participants : false
  const open = isRegOpen()
  const disabled = isAlreadyRegistered || !open || full
  const eventDate = event.event_date ? new Date(event.event_date) : null

  const handleRegister = async () => {
    const res = await registerStudentForEvent(event.id, studentId)
    if (res.success) {
      toast({ title: 'Successfully registered!', description: `You are now registered for ${event.title}.` })
      onRegister()
    } else {
      toast({ title: 'Registration failed', description: res.error, variant: 'destructive' })
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img src={event.poster_url || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
          {isAlreadyRegistered && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600 text-white">
                <Check className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            </div>
          )}
          {event.enable_payment && event.payment_amount && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-blue-600 text-white">
                <DollarSign className="h-3 w-3 mr-1" />₹{event.payment_amount}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {eventDate ? eventDate.toLocaleString() : 'TBA'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              Registration: {event.registration_start ? new Date(event.registration_start).toLocaleDateString() : 'Now'} - {event.registration_end ? new Date(event.registration_end).toLocaleDateString() : 'TBA'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              {regCount} registered{event.max_participants ? ` / ${event.max_participants} max` : ''}
            </div>
          </div>

          <Button className="w-full" onClick={handleRegister} disabled={disabled} variant={disabled ? "outline" : "default"}>
            {isAlreadyRegistered ? "Already Registered" : full ? "Event Full" : open ? "Register Now" : "Registration Closed"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
