import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

export async function GET(request: NextRequest) {
  try {
    // Get all pending registrations
    const { data: pendingRegs, error: pendingError } = await supabase
      .from('pending_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (pendingError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching pending registrations',
        error: pendingError.message 
      }, { status: 500 })
    }

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (studentsError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching students',
        error: studentsError.message 
      }, { status: 500 })
    }

    // Get all faculty
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('*')
      .order('created_at', { ascending: false })

    if (facultyError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching faculty',
        error: facultyError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        pending_registrations: pendingRegs || [],
        students: students || [],
        faculty: faculty || [],
        summary: {
          total_pending: pendingRegs?.length || 0,
          total_students: students?.length || 0,
          total_faculty: faculty?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('Error in test approval:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
