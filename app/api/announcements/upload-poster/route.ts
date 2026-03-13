import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for storage operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Also try auth client for user verification
    const authClient = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth error, proceeding with service client...')
    }

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
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
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('announcement-posters')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // If bucket doesn't exist, try to create it
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        const { error: createError } = await supabase.storage.createBucket('announcement-posters', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (createError) {
          console.error('Bucket creation error:', createError)
          // Try upload again anyway
        }
        
        // Try upload again
        const { data: retryData, error: retryError } = await supabase.storage
          .from('announcement-posters')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          })
          
        if (retryError) {
          return NextResponse.json(
            { success: false, error: retryError.message },
            { status: 500 }
          )
        }
        
        // Get public URL for retry
        const { data: { publicUrl } } = supabase.storage
          .from('announcement-posters')
          .getPublicUrl(fileName)

        return NextResponse.json({
          success: true,
          url: publicUrl,
          path: fileName,
        })
      }
      
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('announcement-posters')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
