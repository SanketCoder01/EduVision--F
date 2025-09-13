'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SupabaseRealtimeService, supabase } from '@/lib/supabase-realtime'
import { toast } from '@/hooks/use-toast'

interface RealtimeDataContextType {
  assignments: any[]
  announcements: any[]
  studyGroups: any[]
  notifications: any[]
  todaysHubData: any
  refreshData: () => Promise<void>
  isLoading: boolean
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined)

interface RealtimeDataProviderProps {
  children: ReactNode
  userId: string
  userType: 'student' | 'faculty'
  userProfile: any
}

export function RealtimeDataProvider({ 
  children, 
  userId, 
  userType, 
  userProfile 
}: RealtimeDataProviderProps) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [todaysHubData, setTodaysHubData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  // Initial data fetch
  useEffect(() => {
    if (userId && userProfile) {
      refreshData()
    }
  }, [userId, userProfile])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId || !userProfile) return

    const subscriptions: any[] = []

    // Subscribe to assignments changes
    const assignmentsChannel = supabase
      .channel('assignments_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        async (payload) => {
          console.log('Assignment change detected:', payload)
          await fetchAssignments()
          
          if (payload.eventType === 'INSERT' && payload.new.status === 'published') {
            toast({
              title: 'New Assignment Published',
              description: `"${payload.new.title}" has been published`,
              duration: 5000,
            })
          }
        }
      )
      .subscribe()

    subscriptions.push(assignmentsChannel)

    // Subscribe to announcements changes
    const announcementsChannel = supabase
      .channel('announcements_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        async (payload) => {
          console.log('Announcement change detected:', payload)
          await fetchAnnouncements()
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Announcement',
              description: `"${payload.new.title}" has been posted`,
              duration: 5000,
            })
          }
        }
      )
      .subscribe()

    subscriptions.push(announcementsChannel)

    // Subscribe to study groups changes
    const studyGroupsChannel = supabase
      .channel('study_groups_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups'
        },
        async (payload) => {
          console.log('Study group change detected:', payload)
          await fetchStudyGroups()
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Study Group',
              description: `"${payload.new.name}" study group has been created`,
              duration: 5000,
            })
          }
        }
      )
      .subscribe()

    subscriptions.push(studyGroupsChannel)

    // Subscribe to assignment submissions changes (for faculty)
    if (userType === 'faculty') {
      const submissionsChannel = supabase
        .channel('submissions_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assignment_submissions'
          },
          async (payload) => {
            console.log('New submission detected:', payload)
            await fetchAssignments()
            
            toast({
              title: 'New Assignment Submission',
              description: 'A student has submitted an assignment',
              duration: 5000,
            })
          }
        )
        .subscribe()

      subscriptions.push(submissionsChannel)
    }

    // Subscribe to today's hub feed changes
    const hubFeedChannel = supabase
      .channel('todays_hub_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todays_hub_feed'
        },
        async (payload) => {
          console.log('Today\'s hub feed change detected:', payload)
          await fetchTodaysHubData()
        }
      )
      .subscribe()

    subscriptions.push(hubFeedChannel)

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription)
      })
    }
  }, [userId, userProfile, userType])

  const fetchAssignments = async () => {
    try {
      if (userType === 'student') {
        const response = await fetch(
          `/api/assignments?student_id=${userId}&department=${userProfile.department}&year=${userProfile.year}`
        )
        const result = await response.json()
        if (result.success) {
          setAssignments(result.data)
        }
      } else {
        const response = await fetch(`/api/assignments?faculty_id=${userId}`)
        const result = await response.json()
        if (result.success) {
          setAssignments(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      if (userType === 'student') {
        const response = await fetch(
          `/api/announcements?student_id=${userId}&department=${userProfile.department}&year=${userProfile.year}`
        )
        const result = await response.json()
        if (result.success) {
          setAnnouncements(result.data)
        }
      } else {
        const response = await fetch(`/api/announcements?faculty_id=${userId}`)
        const result = await response.json()
        if (result.success) {
          setAnnouncements(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchStudyGroups = async () => {
    try {
      if (userType === 'student') {
        const response = await fetch(
          `/api/study-groups?student_id=${userId}&department=${userProfile.department}&year=${userProfile.year}`
        )
        const result = await response.json()
        if (result.success) {
          setStudyGroups(result.data)
        }
      } else {
        const response = await fetch(`/api/study-groups?faculty_id=${userId}`)
        const result = await response.json()
        if (result.success) {
          setStudyGroups(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching study groups:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?user_id=${userId}&limit=50`)
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchTodaysHubData = async () => {
    try {
      if (userType === 'student') {
        const data = await SupabaseRealtimeService.getStudentTodaysHubData(userProfile)
        setTodaysHubData(data)
      } else {
        const data = await SupabaseRealtimeService.getFacultyTodaysHubData(userId)
        setTodaysHubData(data)
      }
    } catch (error) {
      console.error('Error fetching today\'s hub data:', error)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchAssignments(),
        fetchAnnouncements(),
        fetchStudyGroups(),
        fetchNotifications(),
        fetchTodaysHubData()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: RealtimeDataContextType = {
    assignments,
    announcements,
    studyGroups,
    notifications,
    todaysHubData,
    refreshData,
    isLoading
  }

  return (
    <RealtimeDataContext.Provider value={contextValue}>
      {children}
    </RealtimeDataContext.Provider>
  )
}

export function useRealtimeData() {
  const context = useContext(RealtimeDataContext)
  if (context === undefined) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider')
  }
  return context
}
