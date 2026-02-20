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
      name,
      phone,
      address,
      department,
      year,
      designation,
      prn,
      user_type, // 'faculty' or 'student'
      photo_url
    } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update the profile data in user_profiles table
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        name,
        phone,
        address,
        department,
        year: year || null, // user_profiles table has year column for students
        designation: designation || null,
        face_image: photo_url || null, // user_profiles uses face_image column
        // Note: prn is not in user_profiles, only in student tables
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 }
      )
    }

    // Update faculty or student table as well
    if (user_type === 'faculty') {
      await supabaseAdmin
        .from('faculty')
        .update({
          name,
          full_name: name,
          phone,
          department,
          designation: designation || null,
          photo: photo_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
    } else if (user_type === 'student' && department && year) {
      // Determine which student table to update based on department and year
      const yearMap: Record<string, string> = {
        '1st_year': '1st',
        '2nd_year': '2nd',
        '3rd_year': '3rd',
        '4th_year': '4th',
        'first': '1st',
        'second': '2nd',
        'third': '3rd',
        'fourth': '4th'
      }
      const yearSuffix = yearMap[year.toLowerCase()] || year
      const tableName = `students_${department}_${yearSuffix}_year`
      
      await supabaseAdmin
        .from(tableName)
        .update({
          name,
          full_name: name,
          phone,
          prn: prn || null,
          photo: photo_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
    }

    // Create a real-time notification for profile update
    await supabaseAdmin
      .from('profile_updates')
      .insert({
        user_id,
        department: department || null,
        updated_at: new Date().toISOString(),
        changes: { name, phone, address, department, designation, year, prn, photo: photo_url }
      })

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
