"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format, isToday, parseISO } from 'date-fns'
import { Calendar, Clock, BookOpen, FileText, Users, MessageSquare, Loader2 } from "lucide-react"
import { BaseHub } from "./base-hub"
import { Button } from "@/components/ui/button"

interface ClassSchedule {
  id: string
  name: string
  time: string
  location: string
  students: number
}

interface Submission {
  id: string
  assignment: string
  student: string
  submittedAt: string
  status: 'submitted' | 'graded' | 'late'
}

interface Message {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  read: boolean
}

export function FacultyHub() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [recentMessages, setRecentMessages] = useState<Message[]>([])

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
            name: 'Data Structures - Section A',
            time: '10:00 AM - 11:30 AM',
            location: 'Room 201',
            students: 45
          },
          {
            id: '2',
            name: 'Algorithms - Section B',
            time: '2:00 PM - 3:30 PM',
            location: 'Room 205',
            students: 38
          }
        ])

        setRecentSubmissions([
          {
            id: 's1',
            assignment: 'Assignment 3: Binary Trees',
            student: 'John Smith',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'submitted'
          },
          {
            id: 's2',
            assignment: 'Assignment 3: Binary Trees',
            student: 'Sarah Johnson',
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            status: 'submitted'
          },
          {
            id: 's3',
            assignment: 'Problem Set 2',
            student: 'Michael Brown',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'late'
          }
        ])

        setRecentMessages([
          {
            id: 'm1',
            from: 'Alex Johnson',
            subject: 'Question about Assignment 3',
            preview: 'I had a question about problem 2 on the assignment...',
            time: '30m ago',
            read: false
          },
          {
            id: 'm2',
            from: 'Computer Science Department',
            subject: 'Faculty Meeting Reminder',
            preview: 'This is a reminder about the faculty meeting...',
            time: '2h ago',
            read: true
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
      description: `${cls.time} • ${cls.students} students`,
      time: cls.time.split(' - ')[0],
      type: 'class' as const,
      action: () => router.push(`/dashboard/class/${cls.id}`)
    })),
    ...recentSubmissions.slice(0, 2).map(sub => ({
      id: `sub-${sub.id}`,
      title: `New submission: ${sub.assignment}`,
      description: `From: ${sub.student}`,
      time: format(parseISO(sub.submittedAt), 'h:mm a'),
      type: 'submission' as const,
      action: () => router.push(`/dashboard/assignments/submissions/${sub.id}`)
    })),
    ...recentMessages.slice(0, 1).map(msg => ({
      id: `msg-${msg.id}`,
      title: msg.from,
      description: msg.preview,
      time: msg.time,
      type: 'message' as const,
      action: () => router.push('/dashboard/messages')
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
      subtitle={`${format(new Date(), 'EEEE, MMMM d, yyyy')} • Your daily overview`}
      loading={loading}
      items={hubItems}
      emptyMessage="You don't have any classes or pending items today."
      emptyIcon={<Calendar className="h-8 w-8 text-muted-foreground" />}
    />
  )
}
