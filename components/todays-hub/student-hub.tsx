"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format, isToday, parseISO } from 'date-fns'
import { Calendar, Clock, BookOpen, FileText, AlertCircle, Loader2 } from "lucide-react"
import { BaseHub } from "./base-hub"
import { Button } from "@/components/ui/button"

interface ClassSchedule {
  id: string
  name: string
  time: string
  location: string
  faculty: string
}

interface Assignment {
  id: string
  title: string
  dueDate: string
  subject: string
  status: 'pending' | 'submitted' | 'late'
}

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  type: 'department' | 'university' | 'class'
}

export function StudentHub() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([])
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([])
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([])

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data
        setTodayClasses([
          {
            id: '1',
            name: 'Data Structures',
            time: '10:00 AM - 11:30 AM',
            location: 'Room 201',
            faculty: 'Dr. Smith'
          },
          {
            id: '2',
            name: 'Algorithms',
            time: '2:00 PM - 3:30 PM',
            location: 'Room 205',
            faculty: 'Prof. Johnson'
          }
        ])

        setUpcomingAssignments([
          {
            id: 'a1',
            title: 'Assignment 3: Binary Trees',
            dueDate: '2025-08-15T23:59:00',
            subject: 'Data Structures',
            status: 'pending'
          },
          {
            id: 'a2',
            title: 'Problem Set 2',
            dueDate: '2025-08-16T23:59:00',
            subject: 'Algorithms',
            status: 'pending'
          }
        ])

        setRecentAnnouncements([
          {
            id: 'ann1',
            title: 'Campus Maintenance',
            content: 'The library will be closed this weekend for maintenance.',
            createdAt: new Date().toISOString(),
            type: 'university'
          },
          {
            id: 'ann2',
            title: 'Midterm Schedule',
            content: 'Midterm exams will be held next week as per the schedule.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: 'department'
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Process data for the hub
  const hubItems = [
    ...todayClasses.map(cls => ({
      id: `class-${cls.id}`,
      title: cls.name,
      description: `${cls.time} • ${cls.location}`,
      time: cls.time.split(' - ')[0],
      type: 'class' as const,
      action: () => router.push(`/student-dashboard/class/${cls.id}`)
    })),
    ...upcomingAssignments.slice(0, 2).map(assign => ({
      id: `assign-${assign.id}`,
      title: assign.title,
      description: `Due: ${format(parseISO(assign.dueDate), 'MMM d, yyyy')}`,
      time: format(parseISO(assign.dueDate), 'h:mm a'),
      type: 'assignment' as const,
      action: () => router.push(`/student-dashboard/assignments/${assign.id}`)
    })),
    ...recentAnnouncements.slice(0, 1).map(ann => ({
      id: `ann-${ann.id}`,
      title: ann.title,
      description: ann.content,
      time: format(parseISO(ann.createdAt), 'h:mm a'),
      type: 'announcement' as const,
      action: () => router.push('/student-dashboard/announcements')
    }))
  ].sort((a, b) => {
    // Sort by time if available, otherwise put items without time at the end
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })

  return (
    <BaseHub
      title="Today's Hub"
      subtitle={`${format(new Date(), 'EEEE, MMMM d, yyyy')} • Welcome back!`}
      loading={loading}
      items={hubItems}
      emptyMessage="You don't have any classes or assignments today. Enjoy your day!"
      emptyIcon={<Calendar className="h-8 w-8 text-muted-foreground" />}
    />
  )
}
