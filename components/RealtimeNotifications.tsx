"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, BookOpen, Calendar, FileText, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { realtimeService, RealtimePayload, StudentFilter, FacultyFilter } from '@/lib/realtime-service'
import { toast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: any
}

interface RealtimeNotificationsProps {
  userType: 'student' | 'faculty'
  filter: StudentFilter | FacultyFilter
}

export default function RealtimeNotifications({ userType, filter }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const addNotification = useCallback((type: string, payload: RealtimePayload) => {
    const { eventType, new: newRecord } = payload
    
    if (eventType === 'INSERT') {
      const title = newRecord?.title || newRecord?.subject || newRecord?.name || 'New Update'
      
      const iconMap: Record<string, any> = {
        assignments: BookOpen,
        attendance_sessions: CheckCircle,
        quizzes: FileText,
        events: Calendar,
        announcements: Bell,
        timetable_entries: Clock,
        study_materials: BookOpen,
        study_groups: Users,
        assignment_submissions: CheckCircle,
        quiz_attempts: FileText,
        student_queries: AlertCircle,
        grievances: AlertCircle,
        event_registrations: Users,
      }

      const typeLabels: Record<string, string> = {
        assignments: 'New Assignment',
        attendance_sessions: 'Attendance Session',
        quizzes: 'New Quiz',
        events: 'New Event',
        announcements: 'Announcement',
        timetable_entries: 'Timetable Update',
        study_materials: 'Study Material',
        study_groups: 'Study Group',
        assignment_submissions: 'New Submission',
        quiz_attempts: 'Quiz Attempt',
        student_queries: 'Student Query',
        grievances: 'Grievance Update',
        event_registrations: 'Event Registration',
      }

      const notification: Notification = {
        id: `${type}-${Date.now()}`,
        type,
        title,
        message: typeLabels[type] || 'New Update',
        timestamp: new Date(),
        read: false,
        icon: iconMap[type] || Bell,
      }

      setNotifications(prev => [notification, ...prev].slice(0, 20))

      // Show toast notification
      toast({
        title: notification.message,
        description: title,
      })
    }
  }, [])

  useEffect(() => {
    if (!filter) return

    if (userType === 'student') {
      const studentFilter = filter as StudentFilter
      if (!studentFilter.department || !studentFilter.year) return

      const { unsubscribe } = realtimeService.subscribeToAllStudentUpdates(studentFilter, {
        onAssignment: (p) => addNotification('assignments', p),
        onAttendance: (p) => addNotification('attendance_sessions', p),
        onQuiz: (p) => addNotification('quizzes', p),
        onEvent: (p) => addNotification('events', p),
        onAnnouncement: (p) => addNotification('announcements', p),
        onTimetable: (p) => addNotification('timetable_entries', p),
        onStudyMaterial: (p) => addNotification('study_materials', p),
        onStudyGroup: (p) => addNotification('study_groups', p),
      })

      return () => unsubscribe()
    } else {
      const facultyFilter = filter as FacultyFilter
      if (!facultyFilter.facultyId) return

      const { unsubscribe } = realtimeService.subscribeToAllFacultyUpdates(facultyFilter, {
        onSubmission: (p) => addNotification('assignment_submissions', p),
        onQuizAttempt: (p) => addNotification('quiz_attempts', p),
        onQuery: (p) => addNotification('student_queries', p),
        onGrievance: (p) => addNotification('grievances', p),
        onEventRegistration: (p) => addNotification('event_registrations', p),
      })

      return () => unsubscribe()
    }
  }, [userType, filter, addNotification])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">Real-time updates will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <notification.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
