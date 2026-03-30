import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { department, year, subjects } = await request.json()

    if (!department || !year || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Create subject entries
    const subjectEntries = subjects.map(subject => ({
      name: subject.name,
      code: subject.code || `${department.toUpperCase()}-${year}-${subject.name.substring(0, 3).toUpperCase()}`,
      department: department.toLowerCase(),
      year: year,
      is_active: true,
      created_by: 'dean',
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert(subjectEntries)
      .select()

    if (error) {
      // If subjects table doesn't exist, create it
      if (error.code === '42P01') {
        await supabaseAdmin.rpc('create_subjects_table_if_not_exists')
        
        const retryResult = await supabaseAdmin
          .from('subjects')
          .insert(subjectEntries)
          .select()
        
        if (retryResult.error) throw retryResult.error
        return NextResponse.json({ success: true, data: retryResult.data })
      }
      throw error
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error("Error assigning subjects:", error)
    return NextResponse.json({
      error: "Failed to assign subjects",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const year = searchParams.get('year')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    let query = supabaseAdmin
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (department && department !== 'all') {
      query = query.eq('department', department.toLowerCase())
    }

    if (year && year !== 'all') {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({
      error: "Failed to fetch subjects",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('id')

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { error } = await supabaseAdmin
      .from('subjects')
      .update({ is_active: false })
      .eq('id', subjectId)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Subject deactivated" })

  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({
      error: "Failed to delete subject",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
