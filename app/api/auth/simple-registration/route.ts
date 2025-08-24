import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, name, department, year, user_type, mobile, photo } = await request.json()

    console.log('Simple registration request:', {
      email,
      name,
      department,
      year,
      user_type,
      mobile: mobile ? 'provided' : 'missing',
      photo: photo ? 'provided' : 'missing'
    })

    // Basic validation
    if (!email || !name || !department || !user_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    if (user_type === 'student' && !year) {
      return NextResponse.json({
        success: false,
        error: 'Year is required for students'
      }, { status: 400 })
    }

    // Simulate successful registration (for testing)
    console.log('Registration would be successful for:', email)

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully (test mode)',
      data: {
        email,
        name,
        department,
        year,
        user_type
      }
    })

  } catch (error: any) {
    console.error('Simple registration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
