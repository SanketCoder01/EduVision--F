import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const faceImage = formData.get('face_image') as File
    
    if (!faceImage) {
      return NextResponse.json({ success: false, message: 'No image provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileName = `face_${user.id}_${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('faces')
      .upload(fileName, faceImage, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('faces')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      success: true, 
      face_url: publicUrl,
      message: 'Face image uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload face API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
