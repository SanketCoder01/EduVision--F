'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createNotificationsForStudents } from '@/lib/notification-service'

/**
 * Upload announcement poster to Supabase Storage
 * Calls API route to handle file upload with proper auth
 */
export async function uploadAnnouncementPoster(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003'}/api/announcements/upload-poster`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete announcement poster from Supabase Storage
 * Calls API route to handle deletion with proper auth
 */
export async function deleteAnnouncementPoster(path: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003'}/api/announcements/delete-poster?path=${encodeURIComponent(path)}`,
      { method: 'DELETE' }
    )

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create announcement with optional poster
 */
export async function createAnnouncement(data: {
  title: string
  content: string
  department: string | null
  target_years: string[]
  faculty_id: string
  priority: string
  target_audience: string
  poster_url?: string
  date?: string
  time?: string
  venue?: string
}) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Insert announcement
    const { data: announcement, error: insertError } = await supabase
      .from('announcements')
      .insert({
        title: data.title,
        content: data.content,
        department: data.department,
        target_years: data.target_years,
        faculty_id: data.faculty_id,
        priority: data.priority || 'normal',
        target_audience: data.target_audience || 'students',
        poster_url: data.poster_url,
        date: data.date,
        time: data.time,
        venue: data.venue,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return {
        success: false,
        error: `Failed to create announcement: ${insertError.message}`,
      }
    }

    // Create notifications for students
    try {
      if (!data.department || data.department === 'all-university') {
        // Notify all students across all departments
        const departments = ['cse', 'aids', 'aiml', 'cyber']
        for (const dept of departments) {
          await createNotificationsForStudents(
            'announcements',
            announcement.id,
            dept,
            [], // Empty array means all years
            data.title,
            `New announcement: ${data.title}`
          )
        }
      } else {
        // Notify specific department/years
        await createNotificationsForStudents(
          'announcements',
          announcement.id,
          data.department,
          data.target_years,
          data.title,
          `New announcement: ${data.title}`
        )
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail the request if notifications fail
    }

    return {
      success: true,
      data: announcement,
      message: 'Announcement created successfully',
    }
  } catch (error) {
    console.error('API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
