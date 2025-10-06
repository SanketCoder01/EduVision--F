import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      session_id,
      student_email,
      student_name,
      student_prn,
      student_department,
      student_year,
      status,
      face_confidence,
      location_verified,
      absence_note
    } = body

    // Validate required fields
    if (!session_id || !student_email || !student_name || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if session exists and is still active
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (!session.is_active || new Date(session.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Session has expired' }, { status: 400 })
    }

    // Check if attendance already marked
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', session_id)
      .eq('student_email', student_email)
      .single()

    if (existingRecord) {
      return NextResponse.json({ error: 'Attendance already marked for this session' }, { status: 400 })
    }

    // Create attendance record
    const attendanceData = {
      session_id,
      student_name,
      student_email,
      student_prn,
      student_department,
      student_year,
      status,
      marked_at: new Date().toISOString(),
      face_confidence: face_confidence || null,
      location_verified: location_verified || false,
      absence_note: absence_note || null
    }

    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance_records')
      .upsert([attendanceData], { onConflict: 'session_id,student_email' })
      .select()
      .single()

    if (attendanceError) {
      return NextResponse.json({ error: attendanceError.message }, { status: 400 })
    }

    // Update real-time attendance
    await supabase
      .from('real_time_attendance')
      .upsert({
        session_id,
        student_email,
        student_name,
        student_prn,
        status,
        marked_at: new Date().toISOString()
      }, { onConflict: 'session_id,student_email' })

    return NextResponse.json({ 
      success: true, 
      record: attendanceRecord,
      message: `Attendance marked as ${status} successfully`
    })
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const studentEmail = searchParams.get('studentEmail')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)

    if (studentEmail) {
      query = query.eq('student_email', studentEmail)
    }

    const { data, error } = await query.order('student_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ records: data })
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
