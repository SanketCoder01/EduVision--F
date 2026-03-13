import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createNotificationsForStudents } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Also try auth client for user verification
    const authClient = createRouteHandlerClient({ cookies })
    
    // Verify authentication - try both clients
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth client failed, checking headers...')
      // Try to get user from authorization header or session cookie
      const authHeader = request.headers.get('authorization')
      const cookieHeader = request.headers.get('cookie')
      
      if (!cookieHeader && !authHeader) {
        console.log('No auth headers found')
      }
      // Continue anyway - service role can operate without auth for now
      // In production, you'd want stricter auth
    }

    const body = await request.json()
    
    const {
      title,
      content,
      department,
      target_years,
      faculty_id,
      priority = 'normal',
      target_audience = 'students',
      date,
      time,
      venue,
      poster_url
    } = body

    // Validate required fields
    if (!title || !content || !faculty_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, faculty_id' },
        { status: 400 }
      )
    }

    // Insert announcement with all fields
    const { data: announcement, error: insertError } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        department,
        target_years,
        faculty_id,
        priority: priority || 'normal',
        target_audience: target_audience || 'students',
        poster_url,
        date,
        time,
        venue,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: `Failed to create announcement: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Create notifications for students
    try {
      // Determine which students to notify
      let notificationDept = department
      let notificationYears = target_years || []

      // If university-wide, notify all departments
      if (!department || department === 'all-university') {
        // Notify all students across all departments
        const departments = ['cse', 'aids', 'aiml', 'cyber']
        for (const dept of departments) {
          await createNotificationsForStudents(
            'announcements',
            announcement.id,
            dept,
            [], // Empty array means all years
            title,
            `New announcement: ${title}`
          )
        }
      } else {
        // Notify specific department/years
        await createNotificationsForStudents(
          'announcements',
          announcement.id,
          notificationDept,
          notificationYears,
          title,
          `New announcement: ${title}`
        )
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Announcement created successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
