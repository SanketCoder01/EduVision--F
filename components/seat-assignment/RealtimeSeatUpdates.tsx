"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface SeatAssignment {
  id: string
  event_id: string
  department: string
  year: string
  gender?: string
  seat_numbers: number[]
  row_numbers: number[]
  created_at: string
}

interface RealtimeSeatUpdatesProps {
  eventId: string
  onAssignmentChangeAction: (assignments: SeatAssignment[]) => void
  children: React.ReactNode
}

export default function RealtimeSeatUpdates({ 
  eventId, 
  onAssignmentChangeAction, 
  children 
}: RealtimeSeatUpdatesProps) {
  const { toast } = useToast()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Initial fetch
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from('seat_assignments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching seat assignments:', error)
        return
      }

      onAssignmentChangeAction(data || [])
    }

    fetchAssignments()

    // Set up real-time subscription
    const channel = supabase
      .channel(`seat_assignments_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_assignments',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Real-time seat assignment change:', payload)
          
          // Refetch all assignments when any change occurs
          fetchAssignments()
          
          // Show toast notification for changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Seat Assignment",
              description: "Seats have been assigned by another user.",
            })
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Seat Assignment Removed",
              description: "A seat assignment has been removed.",
            })
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Seat Assignment Updated",
              description: "A seat assignment has been modified.",
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, onAssignmentChangeAction, supabase, toast])

  return <>{children}</>
}
