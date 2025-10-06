import { supabase } from './supabase'

export interface AttendanceSession {
  id: string
  faculty_id: string
  faculty_email: string
  faculty_name: string
  department: string
  year: string
  class_name: string
  subject: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_title?: string
  is_active: boolean
  expires_at: string
  created_at: string
  updated_at: string
  faculty?: {
    name: string
    email: string
  }
  total_students?: number
  present_count?: number
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  student_email: string
  student_name: string
  student_department: string
  student_year: string
  status: 'present' | 'absent'
  marked_at?: string
  absence_note?: string
  created_at: string
  updated_at: string
  session?: AttendanceSession
}

export class SupabaseAttendanceService {
  // Create new attendance session
  static async createAttendanceSession(sessionData: Partial<AttendanceSession>): Promise<{ success: boolean; data?: AttendanceSession; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert([sessionData])
        .select()
        .single()

      if (error) {
        console.error('Error creating attendance session:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in createAttendanceSession:', error)
      return { success: false, error: 'Failed to create session' }
    }
  }

  // Get active attendance sessions for student's department and year
  static async getActiveAttendanceSessions(department: string, year: string): Promise<AttendanceSession[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('department', department)
        .eq('year', year)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching attendance sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getActiveAttendanceSessions:', error)
      return []
    }
  }

  // Get faculty's attendance sessions
  static async getFacultyAttendanceSessions(facultyEmail: string): Promise<AttendanceSession[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('faculty_email', facultyEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching faculty sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getFacultyAttendanceSessions:', error)
      return []
    }
  }

  // Get class name based on department and year
  static getClassName(department: string, year: string): string {
    const deptMap: { [key: string]: string } = {
      'CSE': 'Computer Science Engineering',
      'CYBER': 'Cyber Security',
      'AIDS': 'Artificial Intelligence & Data Science',
      'AIML': 'Artificial Intelligence & Machine Learning'
    }
    
    const deptName = deptMap[department] || department
    const yearSuffix = {
      'first': '1st',
      'second': '2nd', 
      'third': '3rd',
      'fourth': '4th'
    }[year] || year
    
    return `${deptName} - ${yearSuffix} Year`
  }

  // Get subjects for department and year
  static getSubjectsForDepartmentYear(department: string, year: string): string[] {
    const subjects: { [key: string]: { [key: string]: string[] } } = {
      'CSE': {
        'first': ['Programming Fundamentals', 'Mathematics I', 'Physics', 'Engineering Drawing', 'Communication Skills'],
        'second': ['Data Structures', 'Object Oriented Programming', 'Mathematics II', 'Digital Electronics', 'Computer Organization'],
        'third': ['Database Management', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Web Development'],
        'fourth': ['Machine Learning', 'Artificial Intelligence', 'Distributed Systems', 'Cybersecurity', 'Project Work']
      },
      'CYBER': {
        'first': ['Cyber Fundamentals', 'Mathematics I', 'Physics', 'Engineering Drawing', 'Communication Skills'],
        'second': ['Network Security', 'Cryptography', 'Mathematics II', 'Digital Forensics', 'Programming'],
        'third': ['Ethical Hacking', 'Malware Analysis', 'Security Protocols', 'Risk Management', 'Incident Response'],
        'fourth': ['Advanced Cybersecurity', 'Penetration Testing', 'Security Audit', 'Capstone Project', 'Industrial Training']
      },
      'AIDS': {
        'first': ['AI Fundamentals', 'Mathematics I', 'Statistics', 'Programming Basics', 'Communication Skills'],
        'second': ['Data Structures', 'Machine Learning Basics', 'Mathematics II', 'Database Systems', 'Python Programming'],
        'third': ['Deep Learning', 'Data Mining', 'Big Data Analytics', 'Natural Language Processing', 'Computer Vision'],
        'fourth': ['Advanced AI', 'Data Science Project', 'MLOps', 'AI Ethics', 'Industry Internship']
      },
      'AIML': {
        'first': ['ML Fundamentals', 'Mathematics I', 'Statistics', 'Programming Basics', 'Communication Skills'],
        'second': ['Algorithms', 'Machine Learning', 'Mathematics II', 'Data Analysis', 'Python Programming'],
        'third': ['Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'Reinforcement Learning'],
        'fourth': ['Advanced ML', 'AI Research Project', 'Model Deployment', 'AI Applications', 'Thesis Work']
      }
    }
    
    return subjects[department]?.[year] || ['General Subject 1', 'General Subject 2', 'General Subject 3']
  }

  // Get student's attendance history
  static async getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
    try {
      console.log('DEBUG: Fetching attendance history for student:', studentId)
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          session:session_id (
            *,
            faculty:faculty_id (name, email)
          )
        `)
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching attendance history:', error)
        return []
      }

      console.log('DEBUG: Found attendance records:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getStudentAttendanceHistory:', error)
      return []
    }
  }

  // Mark attendance for a student
  static async markAttendance(
    sessionId: string,
    studentData: {
      student_id: string
      student_email: string
      student_name: string
      student_department: string
      student_year: string
    },
    status: 'present' | 'absent' = 'present',
    absenceNote?: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if already marked
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('session_id', sessionId)
        .eq('student_id', studentData.student_id)
        .single()

      if (existingRecord) {
        return {
          success: false,
          message: 'Attendance already marked for this session'
        }
      }

      // Insert new attendance record
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          session_id: sessionId,
          student_id: studentData.student_id,
          student_email: studentData.student_email,
          student_name: studentData.student_name,
          student_department: studentData.student_department,
          student_year: studentData.student_year,
          status,
          marked_at: status === 'present' ? new Date().toISOString() : null,
          absence_note: absenceNote
        })
        .select()
        .single()

      if (error) {
        console.error('Error marking attendance:', error)
        return {
          success: false,
          message: 'Failed to mark attendance'
        }
      }

      return {
        success: true,
        message: 'Attendance marked successfully',
        data
      }
    } catch (error) {
      console.error('Error in markAttendance:', error)
      return {
        success: false,
        message: 'Failed to mark attendance'
      }
    }
  }

  // Get attendance records for a session
  static async getSessionAttendanceRecords(sessionId: string): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching session records:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSessionAttendanceRecords:', error)
      return []
    }
  }

  // Close expired sessions
  static async closeExpiredSessions(): Promise<{ success: boolean; closedCount: number; message: string }> {
    try {
      const now = new Date().toISOString()
      
      // First, get the sessions that will be closed for logging
      const { data: expiredSessions, error: fetchError } = await supabase
        .from('attendance_sessions')
        .select('id, subject, faculty_name, class_name, expires_at')
        .eq('is_active', true)
        .lt('expires_at', now)

      if (fetchError) {
        console.error('Error fetching expired sessions:', fetchError)
        return {
          success: false,
          closedCount: 0,
          message: 'Failed to fetch expired sessions'
        }
      }

      const expiredCount = expiredSessions?.length || 0

      if (expiredCount === 0) {
        return {
          success: true,
          closedCount: 0,
          message: 'No expired sessions found'
        }
      }

      // Update expired sessions to closed status
      const { error: updateError } = await supabase
        .from('attendance_sessions')
        .update({ 
          is_active: false,
          status: 'closed'
        })
        .eq('is_active', true)
        .lt('expires_at', now)

      if (updateError) {
        console.error('Error closing expired sessions:', updateError)
        return {
          success: false,
          closedCount: 0,
          message: 'Failed to close expired sessions'
        }
      }

      console.log(`Successfully closed ${expiredCount} expired attendance sessions`)
      
      // Log details of closed sessions
      expiredSessions?.forEach(session => {
        console.log(`Closed session: ${session.subject} - ${session.class_name} (Faculty: ${session.faculty_name})`)
      })

      return {
        success: true,
        closedCount: expiredCount,
        message: `Successfully closed ${expiredCount} expired session(s)`
      }
    } catch (error) {
      console.error('Error in closeExpiredSessions:', error)
      return {
        success: false,
        closedCount: 0,
        message: 'Unexpected error occurred'
      }
    }
  }

  // Get attendance statistics for a student
  static async getStudentAttendanceStats(studentId: string, department: string): Promise<any> {
    try {
      console.log('DEBUG: Fetching attendance stats for student:', studentId)

      // Get total sessions for student's department
      const { data: totalSessions, error: sessionsError } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('department', department)
        .eq('status', 'closed') // Only count closed sessions

      if (sessionsError) {
        console.error('Error fetching total sessions:', sessionsError)
        return null
      }

      // Get student's attendance records
      const { data: attendanceRecords, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          status,
          session:session_id (department)
        `)
        .eq('student_id', studentId)
        .eq('session.department', department)

      if (recordsError) {
        console.error('Error fetching attendance records:', recordsError)
        return null
      }

      const totalSessionsCount = totalSessions?.length || 0
      const presentCount = attendanceRecords?.filter(r => r.status === 'present').length || 0
      const lateCount = attendanceRecords?.filter(r => r.status === 'late').length || 0
      const absentCount = totalSessionsCount - presentCount - lateCount

      const attendancePercentage = totalSessionsCount > 0 
        ? Math.round(((presentCount + lateCount) / totalSessionsCount) * 100)
        : 0

      return {
        totalSessions: totalSessionsCount,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage
      }
    } catch (error) {
      console.error('Error in getStudentAttendanceStats:', error)
      return null
    }
  }

  // Subscribe to real-time attendance updates
  static subscribeToAttendanceUpdates(
    department: string,
    year: string,
    callback: (payload: any) => void
  ) {
    console.log('DEBUG: Setting up attendance real-time subscription')

    const channel = supabase
      .channel('attendance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions',
          filter: `department=eq.${department}`
        },
        (payload) => {
          console.log('DEBUG: Attendance session update:', payload)
          const session = (payload.new || payload.old) as AttendanceSession
          if (session?.year === year) {
            callback(payload)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        (payload) => {
          console.log('DEBUG: Attendance record update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return channel
  }
}
