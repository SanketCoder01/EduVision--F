import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const faceImage = formData.get('face_image') as File

    if (!faceImage) {
      return NextResponse.json({ success: false, message: 'Face image is required' }, { status: 400 })
    }

    // Get the pending registration for this user
    const { data: pendingReg, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', user.email)
      .eq('status', 'pending')
      .single()

    if (fetchError || !pendingReg) {
      return NextResponse.json({ success: false, message: 'No pending registration found' }, { status: 404 })
    }

    // Upload face image to Supabase Storage
    const fileName = `faculty-faces/${user.id}-${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, faceImage, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading face image:', uploadError)
      return NextResponse.json({ success: false, message: 'Failed to upload face image' }, { status: 500 })
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName)

    // Update the pending registration with face image URL
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({
        face_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', pendingReg.id)

    if (updateError) {
      console.error('Error updating pending registration:', updateError)
      return NextResponse.json({ success: false, message: 'Failed to update registration' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration completed successfully. Awaiting admin approval.',
      faceUrl: publicUrl
    })

  } catch (error) {
    console.error('Faculty registration completion error:', error)
    return NextResponse.json({ success: false, message: 'An internal server error occurred' }, { status: 500 })
  }
}
