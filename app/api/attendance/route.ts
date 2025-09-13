import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const user_type = searchParams.get('user_type')
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const subject = searchParams.get('subject')
    const session_id = searchParams.get('session_id')

    if (!user_id || !user_type) {
      return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 })
    }

    if (session_id) {
      // Get specific attendance session
      const { data: session, error } = await supabaseAdmin
        .from('attendance_sessions')
        .select(`
          *,
          faculty:faculty_id (name, email),
          attendance_records (
            id,
            student_id,
            status,
            marked_at,
            location_data,
            face_confidence,
            notes
          )
        `)
        .eq('id', session_id)
        .single()

      if (error) {
        return NextResponse.json({ error: `Failed to fetch session: ${error.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: session })
    }

    if (user_type === 'faculty') {
      // Get attendance sessions created by faculty
      const query = supabaseAdmin
        .from('attendance_sessions')
        .select(`
          *,
          faculty:faculty_id (name, email),
          attendance_records (
            id,
            student_id,
            status,
            marked_at,
            location_data,
            face_confidence
          )
        `)
        .eq('faculty_id', user_id)
        .order('created_at', { ascending: false })

      if (department) {
        query.eq('department', department)
      }
      if (subject) {
        query.eq('subject', subject)
      }

      const { data: sessions, error } = await query

      if (error) {
        return NextResponse.json({ error: `Failed to fetch sessions: ${error.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: sessions })
    } else {
      // Get attendance sessions for student
      const query = supabaseAdmin
        .from('attendance_sessions')
        .select(`
          *,
          faculty:faculty_id (name, email),
          attendance_records!inner (
            id,
            student_id,
            status,
            marked_at,
            location_data,
            face_confidence,
            notes
          )
        `)
        .eq('department', department)
        .contains('target_years', [year])
        .order('created_at', { ascending: false })

      if (subject) {
        query.eq('subject', subject)
      }

      const { data: sessions, error } = await query

      if (error) {
        return NextResponse.json({ error: `Failed to fetch sessions: ${error.message}` }, { status: 500 })
      }

      // Filter sessions to only include student's records
      const filteredSessions = sessions?.map(session => ({
        ...session,
        attendance_records: session.attendance_records.filter(
          (record: any) => record.student_id === user_id
        )
      }))

      return NextResponse.json({ success: true, data: filteredSessions })
    }
  } catch (error) {
    console.error('Attendance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      faculty_id, 
      subject, 
      department, 
      target_years, 
      session_date, 
      session_time, 
      location, 
      duration_minutes,
      auto_close_time,
      description 
    } = body

    if (!faculty_id || !subject || !department || !target_years || !session_date || !session_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create attendance session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('attendance_sessions')
      .insert({
        faculty_id,
        subject,
        department,
        target_years,
        session_date,
        session_time,
        location,
        duration_minutes: duration_minutes || 60,
        auto_close_time,
        description,
        status: 'active'
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: `Failed to create session: ${sessionError.message}` }, { status: 500 })
    }

    // Create notification for students
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: `Attendance Session: ${subject}`,
        message: `Attendance is now open for ${subject}. Please mark your attendance.`,
        type: 'attendance',
        priority: 'high',
        target_audience: 'students',
        department,
        target_years,
        created_by: faculty_id,
        metadata: {
          session_id: session.id,
          subject,
          location,
          session_time
        }
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    // Add to today's hub feed
    const { error: hubError } = await supabaseAdmin
      .from('todays_hub_feed')
      .insert({
        title: `Attendance Session: ${subject}`,
        content: `Attendance session for ${subject} is now active. Location: ${location || 'Classroom'}`,
        type: 'attendance',
        priority: 'high',
        department,
        target_years,
        created_by: faculty_id,
        metadata: {
          session_id: session.id,
          subject,
          location,
          session_time,
          duration_minutes
        }
      })

    if (hubError) {
      console.error('Failed to add to hub feed:', hubError)
    }

    return NextResponse.json({ success: true, data: session, message: 'Attendance session created successfully' })
  } catch (error) {
    console.error('Create attendance session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, status, student_id, attendance_data } = body

    if (student_id && attendance_data) {
      // Student marking attendance
      const { 
        status: attendance_status, 
        location_data, 
        face_confidence, 
        notes 
      } = attendance_data

      if (!session_id || !student_id || !attendance_status) {
        return NextResponse.json({ error: 'Missing required fields for attendance marking' }, { status: 400 })
      }

      // Check if session is active
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('attendance_sessions')
        .select('status, auto_close_time')
        .eq('id', session_id)
        .single()

      if (sessionError || !session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      if (session.status !== 'active') {
        return NextResponse.json({ error: 'Attendance session is not active' }, { status: 400 })
      }

      // Check if auto-close time has passed
      if (session.auto_close_time && new Date() > new Date(session.auto_close_time)) {
        return NextResponse.json({ error: 'Attendance session has expired' }, { status: 400 })
      }

      // Check if student already marked attendance
      const { data: existing } = await supabaseAdmin
        .from('attendance_records')
        .select('id')
        .eq('session_id', session_id)
        .eq('student_id', student_id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Attendance already marked for this session' }, { status: 400 })
      }

      // Mark attendance
      const { data: record, error: recordError } = await supabaseAdmin
        .from('attendance_records')
        .insert({
          session_id,
          student_id,
          status: attendance_status,
          location_data,
          face_confidence,
          notes,
          marked_at: new Date().toISOString()
        })
        .select()
        .single()

      if (recordError) {
        return NextResponse.json({ error: `Failed to mark attendance: ${recordError.message}` }, { status: 500 })
      }

      // Create notification for faculty
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          title: 'Attendance Marked',
          message: `A student has marked attendance for the session.`,
          type: 'attendance',
          priority: 'low',
          target_audience: 'faculty',
          user_id: session.faculty_id,
          metadata: {
            session_id,
            student_id,
            status: attendance_status,
            face_confidence
          }
        })

      if (notificationError) {
        console.error('Failed to create notification:', notificationError)
      }

      return NextResponse.json({ success: true, data: record, message: 'Attendance marked successfully' })
    } else {
      // Faculty updating session status
      if (!session_id || !status) {
        return NextResponse.json({ error: 'Session ID and status are required' }, { status: 400 })
      }

      const { data: session, error } = await supabaseAdmin
        .from('attendance_sessions')
        .update({ status })
        .eq('id', session_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: `Failed to update session: ${error.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: session, message: 'Session updated successfully' })
    }
  } catch (error) {
    console.error('Update attendance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const faculty_id = searchParams.get('faculty_id')

    if (!session_id || !faculty_id) {
      return NextResponse.json({ error: 'Session ID and faculty ID are required' }, { status: 400 })
    }

    // Verify faculty owns the session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('attendance_sessions')
      .select('faculty_id')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.faculty_id !== faculty_id) {
      return NextResponse.json({ error: 'Unauthorized to delete this session' }, { status: 403 })
    }

    // Delete attendance records first (due to foreign key constraint)
    const { error: recordsError } = await supabaseAdmin
      .from('attendance_records')
      .delete()
      .eq('session_id', session_id)

    if (recordsError) {
      return NextResponse.json({ error: `Failed to delete records: ${recordsError.message}` }, { status: 500 })
    }

    // Delete the session
    const { error: deleteError } = await supabaseAdmin
      .from('attendance_sessions')
      .delete()
      .eq('id', session_id)

    if (deleteError) {
      return NextResponse.json({ error: `Failed to delete session: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Attendance session deleted successfully' })
  } catch (error) {
    console.error('Delete attendance session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
