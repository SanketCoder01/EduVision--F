import { supabase } from './supabase'

export interface AttendanceSession {
  id: string
  subject: string
  department: string
  target_years: string[]
  date: string
  start_time: string
  end_time: string
  classroom: string
  floor: string
  faculty_id: string
  status: 'active' | 'closed' | 'scheduled'
  created_at: string
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
  status: 'present' | 'absent' | 'late'
  marked_at: string
  face_verified: boolean
  location_verified: boolean
  face_confidence?: number
  location_data?: any
  session?: AttendanceSession
}

export class SupabaseAttendanceService {
  // Get active attendance sessions for student's department and year
  static async getActiveAttendanceSessions(department: string, year: string): Promise<AttendanceSession[]> {
    try {
      console.log('DEBUG: Fetching active attendance sessions for:', { department, year })
      
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select(`
          *,
          faculty:faculty_id (name, email)
        `)
        .eq('department', department)
        .contains('target_years', [year])
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching attendance sessions:', error)
        return []
      }

      console.log('DEBUG: Found attendance sessions:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getActiveAttendanceSessions:', error)
      return []
    }
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
    studentId: string, 
    status: 'present' | 'late' = 'present',
    faceVerified: boolean = true,
    locationVerified: boolean = true,
    faceConfidence?: number,
    locationData?: any
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('DEBUG: Marking attendance:', { sessionId, studentId, status })

      // Check if already marked
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('session_id', sessionId)
        .eq('student_id', studentId)
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
          student_id: studentId,
          status,
          marked_at: new Date().toISOString(),
          face_verified: faceVerified,
          location_verified: locationVerified,
          face_confidence: faceConfidence,
          location_data: locationData
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

      console.log('DEBUG: Attendance marked successfully:', data)
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
          if (session?.target_years?.includes(year)) {
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
