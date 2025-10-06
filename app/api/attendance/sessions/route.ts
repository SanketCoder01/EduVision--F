import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyEmail = searchParams.get('facultyEmail')
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const active = searchParams.get('active')

    let query = supabase
      .from('attendance_sessions')
      .select('*')

    if (facultyEmail) {
      query = query.eq('faculty_email', facultyEmail)
    }

    if (department) {
      query = query.eq('department', department)
    }

    if (year) {
      query = query.eq('year', year)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
      query = query.gte('expires_at', new Date().toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ sessions: data })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      faculty_email,
      faculty_name,
      department,
      year,
      class_name,
      subject,
      session_date,
      start_time,
      end_time,
      duration_minutes,
      attendance_expiry_minutes,
      student_list_id
    } = body

    // Validate required fields
    if (!faculty_email || !subject || !session_date || !start_time || !end_time || !student_list_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate expires_at
    const sessionDateTime = new Date(`${session_date}T${start_time}`)
    const expires_at = new Date(sessionDateTime.getTime() + attendance_expiry_minutes * 60000)

    const sessionData = {
      faculty_email,
      faculty_name,
      department,
      year,
      class_name,
      subject,
      session_date,
      start_time,
      end_time,
      duration_minutes,
      attendance_expiry_minutes,
      student_list_id,
      session_title: `${subject} - ${class_name}`,
      is_active: true,
      expires_at: expires_at.toISOString()
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Initialize attendance records for all students in the list
    const { data: students, error: studentsError } = await supabase
      .from('student_list_entries')
      .select('*')
      .eq('list_id', student_list_id)

    if (!studentsError && students) {
      const attendanceRecords = students.map(student => ({
        session_id: data.id,
        student_name: student.full_name,
        student_email: student.email,
        student_prn: student.prn,
        student_department: student.department || department,
        student_year: student.year || year,
        status: 'absent'
      }))

      await supabase
        .from('attendance_records')
        .insert(attendanceRecords)

      // Initialize real-time tracking
      const realtimeRecords = students.map(student => ({
        session_id: data.id,
        student_email: student.email,
        student_name: student.full_name,
        student_prn: student.prn,
        status: 'pending'
      }))

      await supabase
        .from('real_time_attendance')
        .insert(realtimeRecords)

      // Send notifications to students
      const notifications = students.map(student => ({
        type: 'attendance_session',
        title: 'New Attendance Session',
        message: `Attendance session for ${subject} is now active. Please mark your attendance.`,
        recipient_email: student.email,
        recipient_type: 'student',
        data: {
          session_id: data.id,
          subject,
          class_name,
          expires_at: expires_at.toISOString()
        }
      }))

      await supabase
        .from('notifications')
        .insert(notifications)
    }

    return NextResponse.json({ session: data })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
