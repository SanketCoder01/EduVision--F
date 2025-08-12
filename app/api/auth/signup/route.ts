import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { userData, userType } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Validate required fields
    if (!userData.email || !userData.name || !userData.department || !userData.mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email domain based on user type
    const isValidDomain = userType === 'student' 
      ? userData.email.endsWith('@sanjivani.edu.in')
      : userData.email.endsWith('@set') || userData.email.endsWith('@sanjivani')

    if (!isValidDomain) {
      return NextResponse.json(
        { error: `Invalid email domain for ${userType}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from(userType === 'student' ? 'students' : 'faculty')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Prepare user data for insertion
    const userRecord = {
      email: userData.email,
      name: userData.name,
      department: userData.department,
      mobile: userData.mobile,
      photo: userData.photo || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add year for students
    if (userType === 'student' && userData.year) {
      userRecord.year = userData.year
    }

    // Insert user data
    const { data, error } = await supabase
      .from(userType === 'student' ? 'students' : 'faculty')
      .insert([userRecord])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: data,
      message: `${userType} account created successfully`
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Signup API endpoint' })
}
