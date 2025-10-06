"use client"

import { useState, useEffect, useCallback } from 'react'
import { SupabaseRealtimeService, Student, Assignment, Announcement, Event, StudyGroup, AttendanceSession } from '@/lib/supabase-realtime'
import { toast } from '@/hooks/use-toast'

interface StudentData {
  assignments: Assignment[]
  announcements: Announcement[]
  events: Event[]
  studyGroups: StudyGroup[]
  attendance: AttendanceSession[]
}

interface UseRealtimeStudentDataReturn {
  data: StudentData
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useRealtimeStudentData(student: Student | null): UseRealtimeStudentDataReturn {
  const [data, setData] = useState<StudentData>({
    assignments: [],
    announcements: [],
    events: [],
    studyGroups: [],
    attendance: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    if (!student) return

    try {
      setLoading(true)
      setError(null)

      const [assignments, announcements, events, studyGroups, attendance] = await Promise.all([
        SupabaseRealtimeService.getStudentAssignments(student),
        SupabaseRealtimeService.getStudentAnnouncements(student),
        SupabaseRealtimeService.getStudentEvents(student),
        SupabaseRealtimeService.getStudentStudyGroups(student),
        SupabaseRealtimeService.getStudentAttendance(student)
      ])

      setData({
        assignments,
        announcements,
        events,
        studyGroups,
        attendance
      })
    } catch (err) {
      console.error('Error fetching student data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [student])

  useEffect(() => {
    if (!student) {
      setLoading(false)
      return
    }

    // Initial data load
    refreshData()

    // Set up real-time subscriptions
    const subscription = SupabaseRealtimeService.subscribeToAllStudentUpdates(student, {
      assignments: (payload) => {
        console.log('Assignment update:', payload)
        
        // Show notification for new assignments
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Assignment Posted",
            description: `${payload.new.title} has been posted by your faculty.`,
          })
        }
        
        // Refresh assignments data
        SupabaseRealtimeService.getStudentAssignments(student).then(assignments => {
          setData(prev => ({ ...prev, assignments }))
        })
      },
      
      announcements: (payload) => {
        console.log('Announcement update:', payload)
        
        // Show notification for new announcements
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Announcement",
            description: `${payload.new.title}`,
          })
        }
        
        // Refresh announcements data
        SupabaseRealtimeService.getStudentAnnouncements(student).then(announcements => {
          setData(prev => ({ ...prev, announcements }))
        })
      },
      
      events: (payload) => {
        console.log('Event update:', payload)
        
        // Show notification for new events
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Event",
            description: `${payload.new.title} - ${new Date(payload.new.event_date).toLocaleDateString()}`,
          })
        }
        
        // Refresh events data
        SupabaseRealtimeService.getStudentEvents(student).then(events => {
          setData(prev => ({ ...prev, events }))
        })
      },
      
      studyGroups: (payload) => {
        console.log('Study group update:', payload)
        
        // Show notification for new study groups
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Study Group",
            description: `${payload.new.name} study group has been created.`,
          })
        }
        
        // Refresh study groups data
        SupabaseRealtimeService.getStudentStudyGroups(student).then(studyGroups => {
          setData(prev => ({ ...prev, studyGroups }))
        })
      },
      
      attendance: (payload) => {
        console.log('Attendance update:', payload)
        
        // Show notification for new attendance sessions
        if (payload.eventType === 'INSERT') {
          toast({
            title: "Attendance Session Started",
            description: `${payload.new.title} - Mark your attendance now!`,
          })
        }
        
        // Refresh attendance data
        SupabaseRealtimeService.getStudentAttendance(student).then(attendance => {
          setData(prev => ({ ...prev, attendance }))
        })
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [student, refreshData])

  return {
    data,
    loading,
    error,
    refreshData
  }
}
