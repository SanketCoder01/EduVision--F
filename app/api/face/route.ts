import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/face
// Body: { imageBase64: string, type?: 'student' | 'faculty' }
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, type } = await req.json()
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userType = (type === 'faculty' ? 'faculty' : 'students') as 'faculty' | 'students'

    // Convert base64 to Uint8Array
    const base64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

    const filePath = `${user.id}.jpg`

    // Upload to storage (faces bucket)
    const { error: uploadErr } = await supabase
      .storage
      .from('faces')
      .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true })

    if (uploadErr) {
      console.error('Face upload error:', uploadErr)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Public URL
    const { data: pub } = supabase.storage.from('faces').getPublicUrl(filePath)
    const faceUrl = pub?.publicUrl || null

    // Update profile row
    const { error: updateErr } = await supabase
      .from(userType)
      .update({ face_registered: true, face_url: faceUrl, photo: faceUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateErr) {
      console.error('Face profile update error:', updateErr)
      return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, faceUrl })
  } catch (e) {
    console.error('Face API error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
