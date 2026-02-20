import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const user_type = searchParams.get('user_type')
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const subject = searchParams.get('subject')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    if (!user_id || !user_type) {
      return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 })
    }

    if (user_type === 'student') {
      // Get student attendance statistics
      let query = supabaseAdmin
        .from('attendance_records')
        .select(`
          *,
          attendance_sessions!inner (
            id,
            subject,
            session_date,
            session_time,
            department,
            target_years,
            faculty:faculty_id (name)
          )
        `)
        .eq('student_id', user_id)
        .eq('attendance_sessions.department', department)
        .contains('attendance_sessions.target_years', [year])

      if (subject) {
        query = query.eq('attendance_sessions.subject', subject)
      }
      if (date_from) {
        query = query.gte('attendance_sessions.session_date', date_from)
      }
      if (date_to) {
        query = query.lte('attendance_sessions.session_date', date_to)
      }

      const { data: records, error } = await query.order('marked_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: `Failed to fetch attendance: ${error.message}` }, { status: 500 })
      }

      // Calculate statistics
      const totalSessions = records?.length || 0
      const presentCount = records?.filter(r => r.status === 'present').length || 0
      const absentCount = records?.filter(r => r.status === 'absent').length || 0
      const lateCount = records?.filter(r => r.status === 'late').length || 0
      const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0

      // Group by subject
      const subjectStats = records?.reduce((acc: any, record: any) => {
        const subject = record.attendance_sessions.subject
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            rate: 0
          }
        }
        acc[subject].total++
        if (record.status === 'present') acc[subject].present++
        if (record.status === 'absent') acc[subject].absent++
        if (record.status === 'late') acc[subject].late++
        acc[subject].rate = (acc[subject].present / acc[subject].total) * 100
        return acc
      }, {})

      // Group by month for trend analysis
      const monthlyStats = records?.reduce((acc: any, record: any) => {
        const month = new Date(record.attendance_sessions.session_date).toISOString().substring(0, 7)
        if (!acc[month]) {
          acc[month] = {
            month,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            rate: 0
          }
        }
        acc[month].total++
        if (record.status === 'present') acc[month].present++
        if (record.status === 'absent') acc[month].absent++
        if (record.status === 'late') acc[month].late++
        acc[month].rate = (acc[month].present / acc[month].total) * 100
        return acc
      }, {})

      return NextResponse.json({
        success: true,
        data: {
          overall: {
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100
          },
          subjectStats: Object.values(subjectStats || {}),
          monthlyStats: Object.values(monthlyStats || {}),
          recentRecords: records?.slice(0, 10) || []
        }
      })

    } else if (user_type === 'faculty') {
      // Get faculty attendance statistics for their sessions
      let sessionQuery = supabaseAdmin
        .from('attendance_sessions')
        .select(`
          *,
          attendance_records (
            id,
            student_id,
            status,
            marked_at,
            face_confidence
          )
        `)
        .eq('faculty_id', user_id)

      if (department) {
        sessionQuery = sessionQuery.eq('department', department)
      }
      if (subject) {
        sessionQuery = sessionQuery.eq('subject', subject)
      }
      if (date_from) {
        sessionQuery = sessionQuery.gte('session_date', date_from)
      }
      if (date_to) {
        sessionQuery = sessionQuery.lte('session_date', date_to)
      }

      const { data: sessions, error } = await sessionQuery.order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: `Failed to fetch sessions: ${error.message}` }, { status: 500 })
      }

      // Calculate statistics
      const totalSessions = sessions?.length || 0
      const totalRecords = sessions?.reduce((sum, session) => sum + (session.attendance_records?.length || 0), 0) || 0
      const presentRecords = sessions?.reduce((sum, session) => 
        sum + (session.attendance_records?.filter((r: any) => r.status === 'present').length || 0), 0) || 0
      const absentRecords = sessions?.reduce((sum, session) => 
        sum + (session.attendance_records?.filter((r: any) => r.status === 'absent').length || 0), 0) || 0
      const lateRecords = sessions?.reduce((sum, session) => 
        sum + (session.attendance_records?.filter((r: any) => r.status === 'late').length || 0), 0) || 0
      
      const overallAttendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

      // Group by subject
      const subjectStats = sessions?.reduce((acc: any, session: any) => {
        const subject = session.subject
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            sessions: 0,
            totalRecords: 0,
            present: 0,
            absent: 0,
            late: 0,
            rate: 0
          }
        }
        acc[subject].sessions++
        acc[subject].totalRecords += session.attendance_records?.length || 0
        acc[subject].present += session.attendance_records?.filter((r: any) => r.status === 'present').length || 0
        acc[subject].absent += session.attendance_records?.filter((r: any) => r.status === 'absent').length || 0
        acc[subject].late += session.attendance_records?.filter((r: any) => r.status === 'late').length || 0
        acc[subject].rate = acc[subject].totalRecords > 0 ? (acc[subject].present / acc[subject].totalRecords) * 100 : 0
        return acc
      }, {})

      // Session-wise statistics
      const sessionStats = sessions?.map(session => ({
        id: session.id,
        subject: session.subject,
        date: session.session_date,
        time: session.session_time,
        totalStudents: session.attendance_records?.length || 0,
        present: session.attendance_records?.filter((r: any) => r.status === 'present').length || 0,
        absent: session.attendance_records?.filter((r: any) => r.status === 'absent').length || 0,
        late: session.attendance_records?.filter((r: any) => r.status === 'late').length || 0,
        attendanceRate: session.attendance_records?.length > 0 ? 
          ((session.attendance_records?.filter((r: any) => r.status === 'present').length || 0) / session.attendance_records.length) * 100 : 0
      })) || []

      return NextResponse.json({
        success: true,
        data: {
          overall: {
            totalSessions,
            totalRecords,
            presentRecords,
            absentRecords,
            lateRecords,
            overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100
          },
          subjectStats: Object.values(subjectStats || {}),
          sessionStats: sessionStats.slice(0, 20), // Recent 20 sessions
          recentSessions: sessions?.slice(0, 10) || []
        }
      })

    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Attendance stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
