import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our data structures
export interface Student {
  id: string
  name: string
  full_name?: string
  email: string
  prn: string
  department: 'CSE' | 'CY' | 'AIDS' | 'AIML'
  year: 'first' | 'second' | 'third' | 'fourth'
  phone?: string
  face_url?: string
  photo?: string
  avatar?: string
  created_at: string
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: 'CSE' | 'CY' | 'AIDS' | 'AIML'
  designation: string
  phone?: string
  face_url?: string
  photo?: string
  avatar?: string
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  department: string
  target_years: string[]
  assignment_type: 'file_upload' | 'text_based' | 'quiz' | 'coding' | 'normal' | 'ai'
  max_marks: number
  due_date: string
  status: 'draft' | 'published' | 'closed'
  created_at: string
  faculty?: Faculty
}

export interface Announcement {
  id: string
  title: string
  content: string
  department: string
  target_years: string[]
  status: 'draft' | 'published'
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  department: string
  target_years: string[]
  status: 'draft' | 'published'
  created_at: string
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  department: string
  target_years: string[]
  status: 'active' | 'inactive'
  created_at: string
}

export interface AttendanceSession {
  id: string
  title: string
  department: string
  target_years: string[]
  status: 'active' | 'closed'
  created_at: string
}

export interface StudyMaterial {
  id: string
  title: string
  description: string
  department: string
  target_years: string[]
  status: 'active' | 'inactive'
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  created_at: string
}

// Main service class for real-time Supabase operations
export class SupabaseRealtimeService {
  
  // Get assignments for a student based on department and year - USE SUPABASE NOT LOCALSTORAGE
  static async getStudentAssignments(student: Student): Promise<Assignment[]> {
    try {
      // Import the proper service
      const { SupabaseAssignmentService } = await import('./supabase-assignments')
      
      // Use real Supabase data instead of localStorage
      const assignments = await SupabaseAssignmentService.getStudentAssignments(student.department, student.year)
      
      // Transform to match our interface
      return assignments.map((assignment: any) => ({
        ...assignment,
        faculty: assignment.faculty ? {
          id: assignment.faculty.id || assignment.faculty_id,
          name: assignment.faculty.name,
          email: assignment.faculty.email,
          department: assignment.department as 'CSE' | 'CY' | 'AIDS' | 'AIML',
          designation: assignment.faculty.designation || 'Faculty',
          created_at: assignment.faculty.created_at || assignment.created_at
        } : undefined
      }))
    } catch (error) {
      console.error('Error fetching student assignments:', error)
      return []
    }
  }

  // Get announcements for a specific student
  static async getStudentAnnouncements(student: Student): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .or(`department.eq.${student.department},department.eq.All`)
        .contains('target_years', [student.year])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching announcements:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student announcements:', error)
      return []
    }
  }

  // Get events for a specific student
  static async getStudentEvents(student: Student): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .or(`department.eq.${student.department},department.eq.All`)
        .contains('target_years', [student.year])
        .order('event_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching events:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student events:', error)
      return []
    }
  }

  // Get study groups for a specific student
  static async getStudentStudyGroups(student: Student): Promise<StudyGroup[]> {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('status', 'active')
        .eq('department', student.department)
        .contains('target_years', [student.year])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching study groups:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student study groups:', error)
      return []
    }
  }

  // Get attendance sessions for a specific student
  static async getStudentAttendance(student: Student): Promise<AttendanceSession[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('status', 'active')
        .eq('department', student.department)
        .contains('target_years', [student.year])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching attendance sessions:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      return []
    }
  }

  // Get study materials for students
  static async getStudyMaterials(student: Student): Promise<StudyMaterial[]> {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select(`
          *,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          )
        `)
        .eq('department', student.department)
        .contains('target_years', [student.year])
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching study materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching study materials:', error)
      return []
    }
  }

  // Get Today's Hub data for students
  static async getTodaysHubData(student: Student) {
    try {
      const [assignments, announcements, events, studyGroups, attendance] = await Promise.all([
        this.getStudentAssignments(student),
        this.getStudentAnnouncements(student),
        this.getStudentEvents(student),
        this.getStudentStudyGroups(student),
        this.getStudentAttendance(student)
      ])

      return {
        assignments: assignments.slice(0, 5), // Latest 5
        announcements: announcements.slice(0, 3), // Latest 3
        events: events.slice(0, 3), // Next 3
        studyGroups: studyGroups.slice(0, 3), // Latest 3
        attendance: attendance.slice(0, 3) // Latest 3
      }
    } catch (error) {
      console.error('Error fetching student today\'s hub data:', error)
      return {
        assignments: [],
        announcements: [],
        events: [],
        studyGroups: [],
        attendance: []
      }
    }
  }

  // Subscribe to real-time updates for a specific table
  static subscribeToTable(tableName: string, callback: (payload: any) => void, filter?: string) {
    const channelName = `realtime-${tableName}-${Date.now()}`
    
    let channel = supabase.channel(channelName)
    
    const config: any = {
      event: '*',
      schema: 'public',
      table: tableName
    }
    
    if (filter) {
      config.filter = filter
    }
    
    channel = channel.on('postgres_changes', config, (payload) => {
      console.log(`Real-time update for ${tableName}:`, payload)
      callback(payload)
    })
    
    channel.subscribe()
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
      }
    }
  }

  // Subscribe to assignment updates for a student
  static subscribeToStudentAssignments(student: Student, callback: (payload: any) => void) {
    return this.subscribeToTable(
      'assignments',
      callback,
      `department=eq.${student.department}`
    )
  }

  // Subscribe to announcement updates for a student
  static subscribeToStudentAnnouncements(student: Student, callback: (payload: any) => void) {
    return this.subscribeToTable(
      'announcements',
      callback,
      `department=eq.${student.department}`
    )
  }

  // Subscribe to event updates for a student
  static subscribeToStudentEvents(student: Student, callback: (payload: any) => void) {
    return this.subscribeToTable(
      'events',
      callback,
      `department=eq.${student.department}`
    )
  }

  // Subscribe to study group updates for a student
  static subscribeToStudentStudyGroups(student: Student, callback: (payload: any) => void) {
    return this.subscribeToTable(
      'study_groups',
      callback,
      `department=eq.${student.department}`
    )
  }

  // Subscribe to attendance session updates for a student
  static subscribeToStudentAttendance(student: Student, callback: (payload: any) => void) {
    return this.subscribeToTable(
      'attendance_sessions',
      callback,
      `department=eq.${student.department}`
    )
  }

  // Subscribe to all student updates at once
  static subscribeToAllStudentUpdates(student: Student, callbacks: {
    assignments?: (payload: any) => void;
    announcements?: (payload: any) => void;
    events?: (payload: any) => void;
    studyGroups?: (payload: any) => void;
    attendance?: (payload: any) => void;
  }) {
    const subscriptions: any[] = []

    if (callbacks.assignments) {
      subscriptions.push(this.subscribeToStudentAssignments(student, callbacks.assignments))
    }
    if (callbacks.announcements) {
      subscriptions.push(this.subscribeToStudentAnnouncements(student, callbacks.announcements))
    }
    if (callbacks.events) {
      subscriptions.push(this.subscribeToStudentEvents(student, callbacks.events))
    }
    if (callbacks.studyGroups) {
      subscriptions.push(this.subscribeToStudentStudyGroups(student, callbacks.studyGroups))
    }
    if (callbacks.attendance) {
      subscriptions.push(this.subscribeToStudentAttendance(student, callbacks.attendance))
    }

    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe())
      }
    }
  }
}
