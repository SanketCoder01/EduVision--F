/**
 * COMPREHENSIVE REAL-TIME SERVICE FOR EDUVISION
 * 
 * Features:
 * - Department + Year filtering for all modules
 * - Faculty-to-Student real-time (assignments, attendance, quiz, events, announcements, timetable, study materials)
 * - Student-to-Faculty real-time (submissions, queries, reactions)
 * - No mock/static data - pure Supabase real-time
 */

import { supabase } from './supabase'

// Types
export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, any>
  old: Record<string, any>
  schema: string
  table: string
  commit_timestamp: string
}

export interface StudentFilter {
  department: string
  year: string
  studentId?: string
}

export interface FacultyFilter {
  facultyId: string
  department?: string
}

// Subscription cleanup type
export interface Subscription {
  unsubscribe: () => void
}

class RealtimeService {
  private channels: Map<string, any> = new Map()

  /**
   * ============================================
   * STUDENT REAL-TIME SUBSCRIPTIONS
   * (Faculty posts -> Student sees immediately)
   * ============================================
   */

  /**
   * Subscribe to ASSIGNMENTS for a specific department + year
   * Faculty posts assignment for CSE 1st year -> Only CSE 1st year students see it
   */
  subscribeToAssignments(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `assignments-${filter.department}-${filter.year}-${Date.now()}`
    
    // Normalize year format for comparison
    const yearMapping: { [key: string]: string } = {
      '1': 'first',
      '2': 'second', 
      '3': 'third',
      '4': 'fourth',
      '1st': 'first',
      '2nd': 'second',
      '3rd': 'third',
      '4th': 'fourth',
      'first': 'first',
      'second': 'second',
      'third': 'third',
      'fourth': 'fourth'
    }
    const normalizedYear = yearMapping[filter.year.toLowerCase().trim()] || filter.year.toLowerCase().trim()
    const normalizedDept = filter.department.toLowerCase().trim()
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        (payload) => {
          // Filter on client side for department (case-insensitive) and year
          const newRecord = payload.new as Record<string, any>
          const recordDept = (newRecord?.department || '').toLowerCase().trim()
          const recordYears: string[] = newRecord?.target_years || []
          
          // Check department match (case-insensitive)
          const deptMatches = recordDept === normalizedDept
          
          // Check year match
          const yearMatches = recordYears.some((y: string) => {
            const normalizedRecordYear = yearMapping[y.toLowerCase().trim()] || y.toLowerCase().trim()
            return normalizedRecordYear === normalizedYear
          })
          
          if (deptMatches && yearMatches) {
            console.log('DEBUG: Realtime assignment matched:', newRecord?.title, 'dept:', recordDept, 'years:', recordYears)
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to ATTENDANCE SESSIONS for a specific department + year
   * Faculty creates attendance -> Students see immediately
   */
  subscribeToAttendanceSessions(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `attendance-${filter.department}-${filter.year}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions',
          filter: `department=eq.${filter.department}`
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const targetYears: string[] = newRecord?.target_years || []
          if (targetYears && Array.isArray(targetYears)) {
            if (targetYears.includes(filter.year)) {
              callback(payload as RealtimePayload)
            }
          } else {
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to QUIZ for a specific department + year
   * Faculty creates quiz -> Students see immediately
   */
  subscribeToQuizzes(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `quizzes-${filter.department}-${filter.year}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quizzes',
          filter: `department=eq.${filter.department}`
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          // Check year field or target_years
          if (newRecord?.year === filter.year || 
              (newRecord?.target_years && Array.isArray(newRecord.target_years) && newRecord.target_years.includes(filter.year))) {
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to EVENTS for a specific department + year
   * Faculty creates event -> Students see immediately
   */
  subscribeToEvents(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `events-${filter.department}-${filter.year}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `department=eq.${filter.department}`
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const targetYears: string[] = newRecord?.target_years || []
          if (targetYears && Array.isArray(targetYears)) {
            if (targetYears.includes(filter.year)) {
              callback(payload as RealtimePayload)
            }
          } else {
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to ANNOUNCEMENTS for a specific department + year
   * Faculty posts announcement -> Students see immediately
   * Handles: class-specific, department-wide, university-wide
   */
  subscribeToAnnouncements(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `announcements-${filter.department}-${filter.year}-${Date.now()}`
    
    // Normalize year format
    const yearMapping: { [key: string]: string } = {
      '1': 'first', '2': 'second', '3': 'third', '4': 'fourth',
      '1st': 'first', '2nd': 'second', '3rd': 'third', '4th': 'fourth',
      'first': 'first', 'second': 'second', 'third': 'third', 'fourth': 'fourth'
    }
    const normalizedYear = yearMapping[filter.year.toLowerCase().trim()] || filter.year.toLowerCase().trim()
    const normalizedDept = filter.department.toLowerCase().trim()
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const recordDept = (newRecord?.department || '').toLowerCase().trim()
          const recordYears: string[] = newRecord?.target_years || []
          
          // University-wide announcements (no department)
          if (!newRecord?.department) {
            // Check if student's year is in target_years
            if (!recordYears || recordYears.length === 0) {
              callback(payload as RealtimePayload)
            } else {
              const yearMatches = recordYears.some((y: string) => {
                const normalizedRecordYear = yearMapping[y.toLowerCase().trim()] || y.toLowerCase().trim()
                return normalizedRecordYear === normalizedYear
              })
              if (yearMatches) callback(payload as RealtimePayload)
            }
            return
          }
          
          // Department-specific announcements
          if (recordDept === normalizedDept) {
            // All years in department
            if (!recordYears || recordYears.length === 0) {
              callback(payload as RealtimePayload)
            } else {
              // Specific years
              const yearMatches = recordYears.some((y: string) => {
                const normalizedRecordYear = yearMapping[y.toLowerCase().trim()] || y.toLowerCase().trim()
                return normalizedRecordYear === normalizedYear
              })
              if (yearMatches) callback(payload as RealtimePayload)
            }
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to TIMETABLE for a specific department + year
   * Faculty updates timetable -> Students see immediately
   */
  subscribeToTimetable(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `timetables-${filter.department}-${filter.year}-${Date.now()}`
    
    // Normalize year format for comparison
    const yearMapping: { [key: string]: string } = {
      '1': '1st',
      '2': '2nd', 
      '3': '3rd',
      '4': '4th',
      '1st': '1st',
      '2nd': '2nd',
      '3rd': '3rd',
      '4th': '4th',
      'first': '1st',
      'second': '2nd',
      'third': '3rd',
      'fourth': '4th'
    }
    const normalizedYear = yearMapping[filter.year.toLowerCase().trim()] || filter.year
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timetables'
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const recordDept = (newRecord?.department || '').toLowerCase().trim()
          const filterDept = filter.department.toLowerCase().trim()
          const recordYear = newRecord?.year || ''
          
          // Check department and year match
          if (recordDept === filterDept && recordYear === normalizedYear) {
            console.log('Timetable realtime matched:', newRecord?.file_name, 'dept:', recordDept, 'year:', recordYear)
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to STUDY MATERIALS for a specific department + year
   * Faculty uploads material -> Students see immediately
   */
  subscribeToStudyMaterials(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `study-materials-${filter.department}-${filter.year}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_materials',
          filter: `department=eq.${filter.department}`
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const targetYears: string[] = newRecord?.target_years || []
          if (targetYears && Array.isArray(targetYears)) {
            if (targetYears.includes(filter.year)) {
              callback(payload as RealtimePayload)
            }
          } else {
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to STUDY GROUPS for a specific department + year
   */
  subscribeToStudyGroups(filter: StudentFilter, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `study-groups-${filter.department}-${filter.year}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups',
          filter: `department=eq.${filter.department}`
        },
        (payload) => {
          const newRecord = payload.new as Record<string, any>
          const targetYears: string[] = newRecord?.target_years || []
          if (targetYears && Array.isArray(targetYears)) {
            if (targetYears.includes(filter.year)) {
              callback(payload as RealtimePayload)
            }
          } else {
            callback(payload as RealtimePayload)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to GRIEVANCES for students (their own grievances updates)
   */
  subscribeToGrievances(studentId: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `grievances-${studentId}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievances',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          callback(payload as RealtimePayload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to LOST & FOUND items - Broadcast to ALL students
   * Faculty posts item -> ALL students see immediately
   */
  subscribeToLostFound(callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `lost-found-all-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lost_found_items'
        },
        (payload) => {
          // Broadcast to ALL students - no filtering
          console.log('Lost & Found item posted, notifying all students:', payload.new)
          callback(payload as RealtimePayload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * ============================================
   * FACULTY REAL-TIME SUBSCRIPTIONS
   * (Student actions -> Faculty sees immediately)
   * ============================================
   */

  /**
   * Subscribe to ASSIGNMENT SUBMISSIONS for faculty
   * Student submits assignment -> Faculty sees immediately
   */
  subscribeToSubmissions(facultyId: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `submissions-${facultyId}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_submissions'
        },
        async (payload) => {
          // Verify this submission is for an assignment created by this faculty
          const { new: newRecord } = payload
          if (newRecord?.assignment_id) {
            const { data: assignment } = await supabase
              .from('assignments')
              .select('faculty_id')
              .eq('id', newRecord.assignment_id)
              .single()
            
            if (assignment?.faculty_id === facultyId) {
              callback(payload as RealtimePayload)
            }
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to QUIZ ATTEMPTS for faculty
   * Student submits quiz -> Faculty sees immediately
   */
  subscribeToQuizAttempts(facultyId: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `quiz-attempts-${facultyId}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts'
        },
        async (payload) => {
          const { new: newRecord } = payload
          if (newRecord?.quiz_id) {
            const { data: quiz } = await supabase
              .from('quizzes')
              .select('faculty_id')
              .eq('id', newRecord.quiz_id)
              .single()
            
            if (quiz?.faculty_id === facultyId) {
              callback(payload as RealtimePayload)
            }
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to STUDENT QUERIES for faculty
   * Student posts query -> Faculty sees immediately
   */
  subscribeToStudentQueries(facultyId: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `student-queries-${facultyId}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_queries',
          filter: `faculty_id=eq.${facultyId}`
        },
        (payload) => {
          callback(payload as RealtimePayload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to GRIEVANCE UPDATES for faculty (department-wide)
   */
  subscribeToFacultyGrievances(department: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `faculty-grievances-${department}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievances',
          filter: `department=eq.${department}`
        },
        (payload) => {
          callback(payload as RealtimePayload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to EVENT REGISTRATIONS for faculty
   * Student registers for event -> Faculty sees immediately
   */
  subscribeToEventRegistrations(facultyId: string, callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `event-registrations-${facultyId}-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_registrations'
        },
        async (payload) => {
          const { new: newRecord } = payload
          if (newRecord?.event_id) {
            const { data: event } = await supabase
              .from('events')
              .select('faculty_id')
              .eq('id', newRecord.event_id)
              .single()
            
            if (event?.faculty_id === facultyId) {
              callback(payload as RealtimePayload)
            }
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Subscribe to STUDY GROUP POSTS
   */
  subscribeToStudyGroupPosts(callback: (payload: RealtimePayload) => void): Subscription {
    const channelName = `study-group-posts-${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_posts'
        },
        (payload) => {
          callback(payload as RealtimePayload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * ============================================
   * ALL-IN-ONE SUBSCRIPTIONS
   * ============================================
   */

  /**
   * Subscribe to ALL student updates at once
   * Returns object with all subscriptions for easy cleanup
   */
  subscribeToAllStudentUpdates(
    filter: StudentFilter,
    callbacks: {
      onAssignment?: (payload: RealtimePayload) => void
      onAttendance?: (payload: RealtimePayload) => void
      onQuiz?: (payload: RealtimePayload) => void
      onEvent?: (payload: RealtimePayload) => void
      onAnnouncement?: (payload: RealtimePayload) => void
      onTimetable?: (payload: RealtimePayload) => void
      onStudyMaterial?: (payload: RealtimePayload) => void
      onStudyGroup?: (payload: RealtimePayload) => void
      onGrievance?: (payload: RealtimePayload) => void
      onLostFound?: (payload: RealtimePayload) => void
    }
  ): { subscriptions: Subscription[]; unsubscribe: () => void } {
    const subscriptions: Subscription[] = []

    if (callbacks.onAssignment) {
      subscriptions.push(this.subscribeToAssignments(filter, callbacks.onAssignment))
    }
    if (callbacks.onAttendance) {
      subscriptions.push(this.subscribeToAttendanceSessions(filter, callbacks.onAttendance))
    }
    if (callbacks.onQuiz) {
      subscriptions.push(this.subscribeToQuizzes(filter, callbacks.onQuiz))
    }
    if (callbacks.onEvent) {
      subscriptions.push(this.subscribeToEvents(filter, callbacks.onEvent))
    }
    if (callbacks.onAnnouncement) {
      subscriptions.push(this.subscribeToAnnouncements(filter, callbacks.onAnnouncement))
    }
    if (callbacks.onTimetable) {
      subscriptions.push(this.subscribeToTimetable(filter, callbacks.onTimetable))
    }
    if (callbacks.onStudyMaterial) {
      subscriptions.push(this.subscribeToStudyMaterials(filter, callbacks.onStudyMaterial))
    }
    if (callbacks.onStudyGroup) {
      subscriptions.push(this.subscribeToStudyGroups(filter, callbacks.onStudyGroup))
    }
    if (callbacks.onGrievance && filter.studentId) {
      subscriptions.push(this.subscribeToGrievances(filter.studentId, callbacks.onGrievance))
    }
    if (callbacks.onLostFound) {
      subscriptions.push(this.subscribeToLostFound(callbacks.onLostFound))
    }

    return {
      subscriptions,
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe())
      }
    }
  }

  /**
   * Subscribe to ALL faculty updates at once
   */
  subscribeToAllFacultyUpdates(
    filter: FacultyFilter,
    callbacks: {
      onSubmission?: (payload: RealtimePayload) => void
      onQuizAttempt?: (payload: RealtimePayload) => void
      onQuery?: (payload: RealtimePayload) => void
      onGrievance?: (payload: RealtimePayload) => void
      onEventRegistration?: (payload: RealtimePayload) => void
    }
  ): { subscriptions: Subscription[]; unsubscribe: () => void } {
    const subscriptions: Subscription[] = []

    if (callbacks.onSubmission) {
      subscriptions.push(this.subscribeToSubmissions(filter.facultyId, callbacks.onSubmission))
    }
    if (callbacks.onQuizAttempt) {
      subscriptions.push(this.subscribeToQuizAttempts(filter.facultyId, callbacks.onQuizAttempt))
    }
    if (callbacks.onQuery) {
      subscriptions.push(this.subscribeToStudentQueries(filter.facultyId, callbacks.onQuery))
    }
    if (callbacks.onGrievance && filter.department) {
      subscriptions.push(this.subscribeToFacultyGrievances(filter.department, callbacks.onGrievance))
    }
    if (callbacks.onEventRegistration) {
      subscriptions.push(this.subscribeToEventRegistrations(filter.facultyId, callbacks.onEventRegistration))
    }

    return {
      subscriptions,
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe())
      }
    }
  }

  /**
   * Cleanup all channels
   */
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService()
export default realtimeService
