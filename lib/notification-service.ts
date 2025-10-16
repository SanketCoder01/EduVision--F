import { supabase } from './supabase'

export interface Notification {
  id: string
  user_id: string
  user_type: 'student' | 'faculty' | 'dean'
  content_type: string
  content_id: string
  department: string
  target_years: string[]
  title: string
  message: string
  is_read: boolean
  created_at: string
}

/**
 * Create notifications for students when faculty posts content
 */
export async function createNotificationsForStudents(
  contentType: string,
  contentId: string,
  department: string,
  targetYears: string[],
  title: string,
  message: string
) {
  try {
    // Get all eligible students
    let query = supabase
      .from('students')
      .select('id')
      .eq('department', department)
      .eq('registration_completed', true)

    // If specific years are targeted
    if (targetYears && targetYears.length > 0) {
      query = query.in('year', targetYears)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return
    }

    // Create notification for each student
    const notifications = students?.map(student => ({
      user_id: student.id,
      user_type: 'student' as const,
      content_type: contentType,
      content_id: contentId,
      department,
      target_years: targetYears || [],
      title,
      message
    }))

    if (notifications && notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notification_log')
        .insert(notifications)

      if (insertError) {
        console.error('Error creating notifications:', insertError)
      } else {
        console.log(`Created ${notifications.length} notifications for ${contentType}`)
      }
    }
  } catch (error) {
    console.error('Error in createNotificationsForStudents:', error)
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notification_log')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Get all notifications for a user (with pagination)
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notification_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notification_log')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notification_log')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_log',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notification_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications(userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { error } = await supabase
    .from('notification_log')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true)
    .lt('created_at', thirtyDaysAgo.toISOString())

  if (error) {
    console.error('Error cleaning up notifications:', error)
  }
}

// Helper function to format notification message
export function formatNotificationMessage(notification: Notification): string {
  const contentTypes: Record<string, string> = {
    assignments: 'Assignment',
    announcements: 'Announcement',
    events: 'Event',
    quizzes: 'Quiz',
    study_groups: 'Study Group',
    attendance_sessions: 'Attendance Session'
  }

  const type = contentTypes[notification.content_type] || 'Content'
  return `New ${type}: ${notification.title}`
}
