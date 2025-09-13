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
      prn
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
        year: year || null,
        designation: designation || null,
        prn: prn || null,
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
