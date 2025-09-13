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

    // Create the user_profiles table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty')),
        department VARCHAR(100) NOT NULL,
        year VARCHAR(20),
        designation VARCHAR(100),
        prn VARCHAR(50),
        phone VARCHAR(20),
        address TEXT,
        face_image TEXT,
        profile_completed BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id),
        UNIQUE(email)
      );
    `

    // Execute table creation
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableQuery
    })

    if (createError) {
      console.log('Table might already exist:', createError.message)
    }

    // Insert the profile data
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id,
        email,
        name,
        user_type,
        department,
        year: user_type === 'student' ? year : null,
        designation: user_type === 'faculty' ? designation : null,
        prn: user_type === 'student' ? prn : null,
        phone,
        address,
        face_image,
        profile_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to save profile: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
      message: 'Profile completed successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
