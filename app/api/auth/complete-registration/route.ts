import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { userType, profile, faceImageData, password } = await request.json()

    // Validate required fields
    if (!profile.email || !profile.name || !profile.field || !profile.course || !profile.department || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, field, course, department, and password are required' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!profile.email.endsWith('@sanjivani.edu.in') && !profile.email.endsWith('@sanjivani.ac.in')) {
      return NextResponse.json(
        { error: 'Only emails ending with @sanjivani.edu.in or @sanjivani.ac.in are allowed' },
        { status: 403 }
      )
    }

    // Check if user already exists in the appropriate table
    const tableName = userType === 'student' ? 'students' : 'faculty'
    const { data: existingUser } = await supabase
      .from(tableName)
      .select('id')
      .eq('email', profile.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Handle face image upload if provided
    let faceUrl = null
    if (faceImageData) {
      try {
        // Decode base64 image
        const base64Data = faceImageData.replace(/^data:image\/jpeg;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')

        // Upload to Supabase Storage
        const filePath = `face-captures/${profile.email}-${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('faces')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('faces').getPublicUrl(filePath)
          faceUrl = urlData.publicUrl
        }
      } catch (uploadError) {
        console.error('Face image upload error:', uploadError)
        // Continue without face image - don't fail the registration
      }
    }

    // Create pending registration record for admin approval
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_registrations')
      .insert({
        email: profile.email,
        user_type: userType,
        name: profile.name,
        field: profile.field,
        course: profile.course,
        department: profile.department,
        year: userType === 'student' ? profile.year : null,
        mobile_number: profile.mobile,
        face_url: faceUrl,
        password_hash: hashedPassword,
        status: 'pending_approval',
        face_registered: !!faceUrl,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (pendingError) {
      console.error('Pending registration error:', pendingError)
      return NextResponse.json(
        { error: 'Failed to submit registration for approval' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted for admin approval. You will receive an email once approved.',
      requiresApproval: true,
      pending_registration_id: pendingData?.id
    })

  } catch (error) {
    console.error('Complete registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
