import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // Validate email domain
    if (!email.endsWith('@sanjivani.edu.in')) {
      return NextResponse.json(
        { error: 'Only @sanjivani.edu.in email addresses are allowed' },
        { status: 400 }
      )
    }

    // Attempt to sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user exists in the appropriate table
    let userData = null
    let redirectUrl = ''

    if (userType === 'student') {
      // Check all student tables for the user
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st_year', '2nd_year', '3rd_year', '4th_year']
      
      for (const dept of departments) {
        for (const year of years) {
          const tableName = `students_${dept}_${year}`
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('email', email)
            .single()
          
          if (data && !error) {
            userData = data
            redirectUrl = '/student-dashboard'
            break
          }
        }
        if (userData) break
      }
    } else if (userType === 'faculty') {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', email)
        .single()
      
      if (data && !error) {
        userData = data
        redirectUrl = '/dashboard'
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in the system. Please contact administration.' },
        { status: 404 }
      )
    }

    // Return success with user data and redirect URL
    return NextResponse.json({
      success: true,
      user: userData,
      redirectUrl,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
