import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'faculty' or 'student'
    const department = searchParams.get('department')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    if (type === 'faculty') {
      let query = supabaseAdmin
        .from('faculty')
        .select('id, employee_id, name, full_name, email, phone, department, designation, qualification, experience_years, college_name, photo, face_url, created_at, status')
        .order('created_at', { ascending: false })

      if (department && department !== 'all') {
        query = query.eq('department', department)
      }

      const { data, error } = await query

      if (error) throw error
      return NextResponse.json({ success: true, data })

    } else if (type === 'student') {
      let query = supabaseAdmin
        .from('students')
        .select('id, prn, name, full_name, email, phone, department, year, college_name, photo, face_url, created_at, status')
        .order('created_at', { ascending: false })

      if (department && department !== 'all') {
        query = query.eq('department', department)
      }

      const { data, error } = await query

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }

    // Get both if no type specified
    const [facultyResult, studentsResult] = await Promise.all([
      supabaseAdmin
        .from('faculty')
        .select('id, employee_id, name, full_name, email, phone, department, designation, college_name, photo, created_at, status')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('students')
        .select('id, prn, name, full_name, email, phone, department, year, college_name, photo, created_at, status')
        .order('created_at', { ascending: false })
    ])

    return NextResponse.json({
      success: true,
      faculty: facultyResult.data || [],
      students: studentsResult.data || []
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({
      error: "Failed to fetch users",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
