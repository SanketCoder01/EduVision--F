import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    // Test basic connection
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('count')
      .limit(1)

    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      students: studentsError ? { error: studentsError.message } : { count: students?.length || 0 },
      faculty: facultyError ? { error: facultyError.message } : { count: faculty?.length || 0 },
      message: 'Database connection test completed'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 