import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('compiler_assignments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Transform data to match student compiler interface
    const assignment = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      language: data.language,
      dueDate: data.due_date,
      allowCopyPaste: true,
      allowResubmission: true,
      enableMarking: true,
      totalMarks: data.total_marks?.toString() || '100',
      attempts: 'yes',
      maxAttempts: '3',
      rules: data.instructions || '',
      facultyName: data.faculty_name || '',
      givenDate: data.created_at || new Date().toISOString()
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 })
  }
}
