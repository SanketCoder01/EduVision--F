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

    if (!facultyEmail) {
      return NextResponse.json({ error: 'Faculty email is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_lists')
      .select('*')
      .eq('faculty_email', facultyEmail)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ lists: data })
  } catch (error) {
    console.error('Error fetching student lists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      faculty_email,
      department,
      year,
      students
    } = body

    // Validate required fields
    if (!name || !faculty_email || !department || !students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create student list
    const { data: listData, error: listError } = await supabase
      .from('student_lists')
      .insert({
        name,
        faculty_email,
        department,
        year: year || '',
        student_count: students.length
      })
      .select()
      .single()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 })
    }

    // Add students to the list
    const studentsWithListId = students.map((student: any) => ({
      list_id: listData.id,
      full_name: student.full_name,
      email: student.email,
      prn: student.prn,
      department: student.department || department,
      year: student.year || year,
      faculty_email
    }))

    const { error: studentsError } = await supabase
      .from('student_list_entries')
      .insert(studentsWithListId)

    if (studentsError) {
      // If students insertion fails, delete the list
      await supabase
        .from('student_lists')
        .delete()
        .eq('id', listData.id)
      
      return NextResponse.json({ error: studentsError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      list: listData,
      message: `Student list "${name}" created with ${students.length} students`
    })
  } catch (error) {
    console.error('Error creating student list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')
    const facultyEmail = searchParams.get('facultyEmail')

    if (!listId || !facultyEmail) {
      return NextResponse.json({ error: 'List ID and faculty email are required' }, { status: 400 })
    }

    // Verify the list belongs to the faculty
    const { data: list, error: listError } = await supabase
      .from('student_lists')
      .select('*')
      .eq('id', listId)
      .eq('faculty_email', facultyEmail)
      .single()

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 })
    }

    // Delete students first (cascade should handle this, but being explicit)
    await supabase
      .from('student_list_entries')
      .delete()
      .eq('list_id', listId)

    // Delete the list
    const { error: deleteError } = await supabase
      .from('student_lists')
      .delete()
      .eq('id', listId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Student list deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting student list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
