import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      user_id,
      email,
      name,
      user_type,
      department,
      year,
      designation,
      prn,
      phone,
      address,
      face_image
    } = body

    // Validate required fields
    if (!user_id || !email || !name || !user_type || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine which table to use
    const tableName = user_type === 'student' ? 'students' : 'faculty'
    
    // Prepare the data object based on user type
    const profileData: any = {
      name,
      full_name: name,
      email,
      department,
      phone,
      address,
      face_url: face_image,
      photo: face_image,
      avatar: face_image,
      registration_completed: true,
      updated_at: new Date().toISOString()
    }

    // Add student-specific or faculty-specific fields
    if (user_type === 'student') {
      profileData.year = year
      profileData.prn = prn
    } else if (user_type === 'faculty') {
      profileData.designation = designation
    }

    // First, try to find existing record by email
    const { data: existingUser } = await supabaseAdmin
      .from(tableName)
      .select('id')
      .eq('email', email)
      .single()

    let data, error

    if (existingUser) {
      // Update existing record
      const updateResult = await supabaseAdmin
        .from(tableName)
        .update(profileData)
        .eq('email', email)
        .select()
        .single()
      
      data = updateResult.data
      error = updateResult.error
    } else {
      // Insert new record
      const insertResult = await supabaseAdmin
        .from(tableName)
        .insert(profileData)
        .select()
        .single()
      
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to save profile: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Profile completed successfully',
      user_type
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
