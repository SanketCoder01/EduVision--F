import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('DEBUG EVENTS UPLOAD: Starting poster upload...')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const authClient = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await authClient.auth.getUser()
    console.log('DEBUG EVENTS UPLOAD: User:', user?.email || 'No user')

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('DEBUG EVENTS UPLOAD: File received:', file?.name, file?.type, file?.size)
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Please upload an image file' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const userId = user?.id || 'anonymous'
    const fileName = `posters/${userId}/${Date.now()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('DEBUG EVENTS UPLOAD: Uploading to event-posters bucket...')
    const { data, error: uploadError } = await supabase.storage
      .from('event-posters')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('DEBUG EVENTS UPLOAD: Upload error:', uploadError)
      
      // Try creating bucket if not found
      if (uploadError.message?.includes('Bucket not found') || String(uploadError).includes('not found')) {
        await supabase.storage.createBucket('event-posters', { public: true, fileSizeLimit: 5242880 })
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, buffer, { contentType: file.type, cacheControl: '3600', upsert: true })
        
        if (retryError) {
          return NextResponse.json({ success: false, error: retryError.message }, { status: 500 })
        }
        
        const { data: { publicUrl } } = supabase.storage.from('event-posters').getPublicUrl(fileName)
        return NextResponse.json({ success: true, url: publicUrl, path: fileName })
      }
      
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('event-posters').getPublicUrl(fileName)
    console.log('DEBUG EVENTS UPLOAD: Public URL:', publicUrl)

    return NextResponse.json({ success: true, url: publicUrl, path: fileName })
  } catch (error) {
    console.error('DEBUG EVENTS UPLOAD: Server error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
