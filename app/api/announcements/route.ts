import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch announcements for student or faculty
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const facultyId = searchParams.get('faculty_id')
    const department = searchParams.get('department')
    const year = searchParams.get('year')

    if (studentId) {
      // Get announcements for student based on department and year
      const { data: announcements, error } = await supabaseAdmin
        .from('announcements')
        .select(`
          *,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          )
        `)
        .or(`department.is.null,department.eq.${department}`)
        .or(`target_years.is.null,target_years.cs.{${year}}`)
        .in('target_audience', ['all', 'students'])
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: announcements })
    }

    if (facultyId) {
      // Get announcements created by faculty
      const { data: announcements, error } = await supabaseAdmin
        .from('announcements')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: announcements })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      faculty_id,
      department,
      target_years = [],
      priority = 'normal',
      target_audience = 'students'
    } = body

    // Validate required fields
    if (!title || !content || !faculty_id) {
      return NextResponse.json({ 
        error: 'Title, content, and faculty ID are required' 
      }, { status: 400 })
    }

    // Create announcement
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        content,
        faculty_id,
        department,
        target_years,
        priority,
        target_audience,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to create announcement: ${error.message}` 
      }, { status: 500 })
    }

    // Create notifications for target audience
    await createAnnouncementNotifications(
      announcement.id,
      title,
      content,
      department,
      target_years,
      target_audience,
      priority
    )

    return NextResponse.json({ 
      success: true, 
      data: announcement,
      message: 'Announcement created successfully' 
    })
  } catch (error: any) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Update announcement
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to update announcement: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: announcement,
      message: 'Announcement updated successfully' 
    })
  } catch (error: any) {
    console.error('Error updating announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Delete announcement
    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ 
        error: `Failed to delete announcement: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Announcement deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create notifications for announcement
async function createAnnouncementNotifications(
  announcementId: string,
  title: string,
  content: string,
  department?: string,
  targetYears: string[] = [],
  targetAudience: string = 'students',
  priority: string = 'normal'
) {
  try {
    let query = supabaseAdmin
      .from('user_profiles')
      .select('user_id, name, email, user_type, department, year')

    // Filter by target audience
    if (targetAudience === 'students') {
      query = query.eq('user_type', 'student')
    } else if (targetAudience === 'faculty') {
      query = query.eq('user_type', 'faculty')
    }

    // Filter by department if specified
    if (department) {
      query = query.eq('department', department)
    }

    // Filter by target years if specified (for students)
    if (targetYears.length > 0 && targetAudience !== 'faculty') {
      query = query.in('year', targetYears)
    }

    const { data: users, error } = await query

    if (error || !users?.length) {
      console.error('Error fetching users for announcement notifications:', error)
      return
    }

    // Create notifications for each user
    const notifications = users.map(user => ({
      user_id: user.user_id,
      type: 'announcement',
      title: `New Announcement: ${title}`,
      message: content.length > 100 ? content.substring(0, 100) + '...' : content,
      data: {
        announcement_id: announcementId,
        announcement_title: title,
        priority,
        department,
        target_years: targetYears
      },
      read: false,
      created_at: new Date().toISOString()
    }))

    // Insert notifications
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating announcement notifications:', notificationError)
    }

    // Update today's hub feed
    const hubFeedEntry = {
      type: 'announcement',
      title,
      content: content.length > 200 ? content.substring(0, 200) + '...' : content,
      department,
      target_years: targetYears,
      data: {
        announcement_id: announcementId,
        priority,
        target_audience: targetAudience
      },
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('todays_hub_feed')
      .insert(hubFeedEntry)

  } catch (error) {
    console.error('Error creating announcement notifications:', error)
  }
}
