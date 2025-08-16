import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { userType, profile, faceImageData, password } = body as {
      userType: 'student' | 'faculty'
      profile: {
        name: string
        email: string
        department: string
        year?: string
        mobile?: string
        photo?: string | null
      }
      faceImageData: string
      password?: string
    }

    // Optionally set password so user can login with email/password later
    if (password && password.length >= 8) {
      const { error: pwError } = await supabase.auth.updateUser({ password })
      if (pwError) {
        console.error('Set password error', pwError)
        // continue anyway, don't fail whole flow
      }
    }

    // Upload face image
    let publicUrl: string | null = null
    try {
      const fileName = `${user.id}_${Date.now()}.jpg`
      const buffer = Buffer.from(faceImageData.split(',')[1], 'base64')
      const { error: uploadError } = await supabase.storage
        .from('faces')
        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })
      if (!uploadError) {
        const { data: pub } = supabase.storage.from('faces').getPublicUrl(fileName)
        publicUrl = pub.publicUrl
      } else {
        console.error('Face upload error', uploadError)
      }
    } catch (e) {
      console.error('Face upload exception', e)
    }

    // Determine correct table name based on department and year
    let tableName = 'faculty'
    if (userType === 'student' && profile.department && profile.year) {
      // Map to specific department-year table
      const deptMap: { [key: string]: string } = {
        'Computer Science and Engineering': 'cse',
        'Cyber Security': 'cyber',
        'Artificial Intelligence and Data Science': 'aids',
        'Artificial Intelligence and Machine Learning': 'aiml'
      }
      const yearMap: { [key: string]: string } = {
        '1st Year': '1st_year',
        '2nd Year': '2nd_year',
        '3rd Year': '3rd_year',
        '4th Year': '4th_year'
      }
      
      const deptCode = deptMap[profile.department]
      const yearCode = yearMap[profile.year]
      
      if (deptCode && yearCode) {
        tableName = `students_${deptCode}_${yearCode}`
      } else {
        // Fallback to general students table if mapping fails
        tableName = 'students'
      }
    }

    const userRecord: any = {
      user_id: user.id,
      name: profile.name,
      email: profile.email,
      department: profile.department,
      photo: profile.photo || null,
      face_url: publicUrl,
      face_registered: Boolean(publicUrl),
    }
    if (userType === 'student' && profile.year) userRecord.year = profile.year
    if (profile.mobile) userRecord.phone = profile.mobile

    // Try upserting into correct department-year table
    let upsertError = null as any
    try {
      const res = await supabase.from(tableName).upsert([userRecord], { onConflict: 'user_id' })
      upsertError = res.error
    } catch (e) {
      upsertError = e
    }

    if (upsertError) {
      console.error('Profile upsert error on', tableName, upsertError)
      // Fallback: upsert into generic users table if present
      try {
        const usersPayload: any = {
          id: user.id,
          email: profile.email,
          name: profile.name,
          user_type: userType,
          department: profile.department,
          year: userType === 'student' ? profile.year || null : null,
          profile_image_url: profile.photo || publicUrl || null,
        }
        await supabase.from('users').upsert([usersPayload], { onConflict: 'id' })
      } catch (e2) {
        console.error('Fallback users upsert failed', e2)
      }
    }

    return NextResponse.json({ success: true, face_url: publicUrl })
  } catch (e) {
    console.error('Complete-registration API error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
