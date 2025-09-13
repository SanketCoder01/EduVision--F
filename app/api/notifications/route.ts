import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    return NextResponse.json({ 
      success: true, 
      data: notifications,
      unread_count: unreadCount || 0
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      type,
      title,
      message,
      data = {},
      read = false
    } = body

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return NextResponse.json({ 
        error: 'User ID, type, title, and message are required' 
      }, { status: 400 })
    }

    // Create notification
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        read,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to create notification: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: notification,
      message: 'Notification created successfully' 
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_ids, user_id, mark_all = false } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user_id)

    if (mark_all) {
      // Mark all notifications as read for the user
      query = query.eq('read', false)
    } else if (notification_ids && notification_ids.length > 0) {
      // Mark specific notifications as read
      query = query.in('id', notification_ids)
    } else {
      return NextResponse.json({ 
        error: 'Either notification_ids or mark_all must be provided' 
      }, { status: 400 })
    }

    const { data, error } = await query.select()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to mark notifications as read: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: `${data?.length || 0} notifications marked as read` 
    })
  } catch (error: any) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationIds = searchParams.get('notification_ids')?.split(',')
    const userId = searchParams.get('user_id')
    const deleteAll = searchParams.get('delete_all') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (deleteAll) {
      // Delete all notifications for the user
    } else if (notificationIds && notificationIds.length > 0) {
      // Delete specific notifications
      query = query.in('id', notificationIds)
    } else {
      return NextResponse.json({ 
        error: 'Either notification_ids or delete_all must be provided' 
      }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ 
        error: `Failed to delete notifications: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notifications deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
