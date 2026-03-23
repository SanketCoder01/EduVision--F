/**
 * REACT HOOKS FOR REAL-TIME SUBSCRIPTIONS
 * Easy-to-use hooks for components to subscribe to real-time updates
 */

import { useEffect, useRef, useCallback } from 'react'
import { realtimeService, RealtimePayload, StudentFilter, FacultyFilter } from '@/lib/realtime-service'

/**
 * Hook for student to subscribe to assignments
 */
export function useRealtimeAssignments(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToAssignments(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to attendance sessions
 */
export function useRealtimeAttendance(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToAttendanceSessions(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to quizzes
 */
export function useRealtimeQuizzes(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToQuizzes(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to events
 */
export function useRealtimeEvents(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToEvents(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to announcements
 */
export function useRealtimeAnnouncements(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToAnnouncements(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to timetable changes
 */
export function useRealtimeTimetable(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToTimetable(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for student to subscribe to study materials
 */
export function useRealtimeStudyMaterials(
  filter: StudentFilter | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const subscription = realtimeService.subscribeToStudyMaterials(filter, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for faculty to subscribe to assignment submissions
 */
export function useRealtimeSubmissions(
  facultyId: string | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!facultyId) return

    const subscription = realtimeService.subscribeToSubmissions(facultyId, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [facultyId])
}

/**
 * Hook for faculty to subscribe to quiz attempts
 */
export function useRealtimeQuizAttempts(
  facultyId: string | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!facultyId) return

    const subscription = realtimeService.subscribeToQuizAttempts(facultyId, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [facultyId])
}

/**
 * Hook for faculty to subscribe to student queries
 */
export function useRealtimeQueries(
  facultyId: string | null,
  onUpdate: (payload: RealtimePayload) => void
) {
  const callbackRef = useRef(onUpdate)
  
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!facultyId) return

    const subscription = realtimeService.subscribeToStudentQueries(facultyId, (payload) => {
      callbackRef.current(payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [facultyId])
}

/**
 * Hook for all student real-time updates
 */
export function useAllStudentRealtime(
  filter: StudentFilter | null,
  callbacks: {
    onAssignment?: (payload: RealtimePayload) => void
    onAttendance?: (payload: RealtimePayload) => void
    onQuiz?: (payload: RealtimePayload) => void
    onEvent?: (payload: RealtimePayload) => void
    onAnnouncement?: (payload: RealtimePayload) => void
    onTimetable?: (payload: RealtimePayload) => void
    onStudyMaterial?: (payload: RealtimePayload) => void
  }
) {
  const callbacksRef = useRef(callbacks)
  
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    if (!filter?.department || !filter?.year) return

    const { subscriptions, unsubscribe } = realtimeService.subscribeToAllStudentUpdates(filter, {
      onAssignment: callbacksRef.current.onAssignment,
      onAttendance: callbacksRef.current.onAttendance,
      onQuiz: callbacksRef.current.onQuiz,
      onEvent: callbacksRef.current.onEvent,
      onAnnouncement: callbacksRef.current.onAnnouncement,
      onTimetable: callbacksRef.current.onTimetable,
      onStudyMaterial: callbacksRef.current.onStudyMaterial,
    })

    return () => {
      unsubscribe()
    }
  }, [filter?.department, filter?.year])
}

/**
 * Hook for all faculty real-time updates
 */
export function useAllFacultyRealtime(
  filter: FacultyFilter | null,
  callbacks: {
    onSubmission?: (payload: RealtimePayload) => void
    onQuizAttempt?: (payload: RealtimePayload) => void
    onQuery?: (payload: RealtimePayload) => void
    onGrievance?: (payload: RealtimePayload) => void
    onEventRegistration?: (payload: RealtimePayload) => void
  }
) {
  const callbacksRef = useRef(callbacks)
  
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    if (!filter?.facultyId) return

    const { subscriptions, unsubscribe } = realtimeService.subscribeToAllFacultyUpdates(filter, {
      onSubmission: callbacksRef.current.onSubmission,
      onQuizAttempt: callbacksRef.current.onQuizAttempt,
      onQuery: callbacksRef.current.onQuery,
      onGrievance: callbacksRef.current.onGrievance,
      onEventRegistration: callbacksRef.current.onEventRegistration,
    })

    return () => {
      unsubscribe()
    }
  }, [filter?.facultyId, filter?.department])
}

/**
 * Hook for toast notifications on real-time updates
 */
export function useRealtimeToasts() {
  const showToast = useCallback((type: string, payload: RealtimePayload) => {
    const { eventType, new: newRecord } = payload
    
    if (eventType === 'INSERT') {
      const title = newRecord?.title || newRecord?.subject || 'New Update'
      const message = `New ${type} has been added`
      
      // You can integrate with your toast library here
      console.log(`[REALTIME] ${type}: ${title} - ${message}`)
      
      // Return data for toast component to use
      return { title, message, type }
    }
    
    return null
  }, [])

  return { showToast }
}
