import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('DEBUG UPLOAD: Starting poster upload...')
  
  try {
    // Create Supabase client with service role for storage operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('DEBUG UPLOAD: Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
    console.log('DEBUG UPLOAD: Service key:', supabaseServiceKey ? 'Set' : 'Missing')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Also try auth client for user verification
    const authClient = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    console.log('DEBUG UPLOAD: User:', user?.email || 'No user')
    console.log('DEBUG UPLOAD: Auth error:', authError?.message || 'None')

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('DEBUG UPLOAD: File received:', file?.name, file?.type, file?.size)
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Please upload an image file' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const userId = user?.id || 'anonymous'
    const fileName = `posters/${userId}/${Date.now()}.${fileExt}`
    
    console.log('DEBUG UPLOAD: Generated filename:', fileName)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('DEBUG UPLOAD: Buffer size:', buffer.length)

    // Upload to Supabase Storage
    console.log('DEBUG UPLOAD: Attempting upload to announcement-posters bucket...')
    const { data, error: uploadError } = await supabase.storage
      .from('announcement-posters')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    console.log('DEBUG UPLOAD: Upload result:', data)
    console.log('DEBUG UPLOAD: Upload error:', uploadError)

    if (uploadError) {
      console.error('DEBUG UPLOAD: Upload error details:', uploadError)
      
      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found') || String(uploadError).includes('not found')) {
        console.log('DEBUG UPLOAD: Bucket not found, creating...')
        const { error: createError } = await supabase.storage.createBucket('announcement-posters', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        })
        
        console.log('DEBUG UPLOAD: Bucket create error:', createError)
        
        // Try upload again
        const { data: retryData, error: retryError } = await supabase.storage
          .from('announcement-posters')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true,
          })
          
        console.log('DEBUG UPLOAD: Retry result:', retryData)
        console.log('DEBUG UPLOAD: Retry error:', retryError)
          
        if (retryError) {
          return NextResponse.json(
            { success: false, error: retryError.message || 'Upload failed after retry' },
            { status: 500 }
          )
        }
        
        // Get public URL for retry
        const { data: { publicUrl } } = supabase.storage
          .from('announcement-posters')
          .getPublicUrl(fileName)
        
        console.log('DEBUG UPLOAD: Public URL (retry):', publicUrl)

        return NextResponse.json({
          success: true,
          url: publicUrl,
          path: fileName,
        })
      }
      
      return NextResponse.json(
        { success: false, error: uploadError.message || 'Upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('announcement-posters')
      .getPublicUrl(fileName)
    
    console.log('DEBUG UPLOAD: Final public URL:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('DEBUG UPLOAD: Server error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
