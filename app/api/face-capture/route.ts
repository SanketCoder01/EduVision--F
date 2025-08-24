import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { email, imageData } = await request.json()

    if (!email || !imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and image data are required' 
      }, { status: 400 })
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `face_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('faces')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Face image upload error:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload image' 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('faces')
      .getPublicUrl(fileName)

    // Update pending registration with face image
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({ face_url: urlData.publicUrl })
      .eq('email', email)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update registration' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Face image captured and saved successfully',
      imageUrl: urlData.publicUrl
    })
  } catch (error: any) {
    console.error('Face capture error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
