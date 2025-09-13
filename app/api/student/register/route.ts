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
      name,
      full_name,
      email,
      prn,
      department,
      year,
      phone,
      address,
      date_of_birth,
      gender,
      blood_group,
      emergency_contact,
      parent_name,
      parent_phone,
      admission_year,
      table_name
    } = body

    console.log('DEBUG: Registering student in table:', table_name)
    console.log('DEBUG: Student data:', { name, email, department, year })

    // Validate required fields
    if (!name || !full_name || !email || !prn || !department || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!email.endsWith('@sanjivani.edu.in')) {
      return NextResponse.json(
        { error: 'Invalid email domain. Please use @sanjivani.edu.in email.' },
        { status: 400 }
      )
    }

    // Insert student into appropriate department-year table
    const { data: student, error: insertError } = await supabase
      .from(table_name)
      .insert({
        name,
        full_name,
        email,
        prn,
        department,
        year,
        phone,
        address,
        date_of_birth: date_of_birth || null,
        gender,
        blood_group,
        emergency_contact,
        parent_name,
        parent_phone,
        admission_year
      })
      .select()
      .single()

    if (insertError) {
      console.error('DEBUG: Insert error:', insertError)
      
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Student with this email or PRN already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to register student: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('DEBUG: Student registered successfully:', student)

    // Also insert into main students table for backward compatibility (optional)
    try {
      await supabase
        .from('students')
        .insert({
          id: student.id,
          name,
          full_name,
          email,
          prn,
          department,
          year,
          phone,
          address,
          date_of_birth: date_of_birth || null,
          gender,
          blood_group,
          emergency_contact,
          parent_name,
          parent_phone,
          admission_year
        })
        .select()
        .single()
      
      console.log('DEBUG: Student also added to main students table')
    } catch (mainTableError) {
      console.log('DEBUG: Main table insert failed (this is optional):', mainTableError)
      // Don't fail the registration if main table insert fails
    }

    return NextResponse.json({
      message: 'Student registered successfully',
      student_id: student.id,
      table_name,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year
      }
    })

  } catch (error) {
    console.error('DEBUG: Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
