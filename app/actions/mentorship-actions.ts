"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Get all students for mentorship assignment
export async function getStudentsForMentorship() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("students").select("*").order("name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching students:", error)
    return { success: false, error }
  }
}

// Get mentees for a faculty
export async function getMenteesForFaculty(facultyId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("mentorships")
      .select("*, student:students(*)")
      .eq("faculty_id", facultyId)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching mentees:", error)
    return { success: false, error }
  }
}

// Assign mentees to faculty
export async function assignMentees(formData: {
  facultyId: string
  studentIds: string[]
}) {
  const supabase = createServerSupabaseClient()

  try {
    const mentorships = formData.studentIds.map((studentId) => ({
      faculty_id: formData.facultyId,
      student_id: studentId,
      status: "active",
    }))

    const { data, error } = await supabase.from("mentorships").insert(mentorships).select()

    if (error) throw error

    revalidatePath("/dashboard/mentorship")
    return { success: true, data }
  } catch (error) {
    console.error("Error assigning mentees:", error)
    return { success: false, error }
  }
}

// Schedule a mentorship meeting
export async function scheduleMeeting(formData: {
  facultyId: string
  title: string
  description?: string
  meetingType: "individual" | "group"
  meetingDate: string
  durationMinutes: number
  location?: string
  studentIds: string[]
}) {
  const supabase = createServerSupabaseClient()

  try {
    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from("mentorship_meetings")
      .insert({
        faculty_id: formData.facultyId,
        title: formData.title,
        description: formData.description,
        meeting_type: formData.meetingType,
        meeting_date: formData.meetingDate,
        duration_minutes: formData.durationMinutes,
        location: formData.location,
      })
      .select()
      .single()

    if (meetingError) throw meetingError

    // Add attendees
    const attendees = formData.studentIds.map((studentId) => ({
      meeting_id: meeting.id,
      student_id: studentId,
    }))

    const { error: attendeesError } = await supabase.from("mentorship_meeting_attendees").insert(attendees)

    if (attendeesError) throw attendeesError

    revalidatePath("/dashboard/mentorship")
    return { success: true, data: meeting }
  } catch (error) {
    console.error("Error scheduling meeting:", error)
    return { success: false, error }
  }
}

// Get upcoming meetings for faculty
export async function getUpcomingMeetingsForFaculty(facultyId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("mentorship_meetings")
      .select("*")
      .eq("faculty_id", facultyId)
      .gte("meeting_date", now)
      .order("meeting_date", { ascending: true })

    if (error) throw error

    // Get attendees for each meeting
    const meetingIds = data.map((meeting) => meeting.id)

    if (meetingIds.length > 0) {
      const { data: attendees, error: attendeesError } = await supabase
        .from("mentorship_meeting_attendees")
        .select("*, student:students(*)")
        .in("meeting_id", meetingIds)

      if (attendeesError) throw attendeesError

      // Add attendees to meetings
      const meetingsWithAttendees = data.map((meeting) => {
        const meetingAttendees = attendees.filter((attendee) => attendee.meeting_id === meeting.id)
        return {
          ...meeting,
          attendees: meetingAttendees,
        }
      })

      return { success: true, data: meetingsWithAttendees }
    }

    return { success: true, data: data.map((meeting) => ({ ...meeting, attendees: [] })) }
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error)
    return { success: false, error }
  }
}

// Get past meetings for faculty
export async function getPastMeetingsForFaculty(facultyId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("mentorship_meetings")
      .select("*")
      .eq("faculty_id", facultyId)
      .lt("meeting_date", now)
      .order("meeting_date", { ascending: false })

    if (error) throw error

    // Get attendees for each meeting
    const meetingIds = data.map((meeting) => meeting.id)

    if (meetingIds.length > 0) {
      const { data: attendees, error: attendeesError } = await supabase
        .from("mentorship_meeting_attendees")
        .select("*, student:students(*)")
        .in("meeting_id", meetingIds)

      if (attendeesError) throw attendeesError

      // Add attendees to meetings
      const meetingsWithAttendees = data.map((meeting) => {
        const meetingAttendees = attendees.filter((attendee) => attendee.meeting_id === meeting.id)
        return {
          ...meeting,
          attendees: meetingAttendees,
        }
      })

      return { success: true, data: meetingsWithAttendees }
    }

    return { success: true, data: data.map((meeting) => ({ ...meeting, attendees: [] })) }
  } catch (error) {
    console.error("Error fetching past meetings:", error)
    return { success: false, error }
  }
}

// Update meeting attendance and feedback
export async function updateMeetingAttendance(formData: {
  meetingId: string
  attendees: Array<{
    id: string
    attended: boolean
    feedback?: string
  }>
}) {
  const supabase = createServerSupabaseClient()

  try {
    for (const attendee of formData.attendees) {
      const { error } = await supabase
        .from("mentorship_meeting_attendees")
        .update({
          attended: attendee.attended,
          feedback: attendee.feedback,
          updated_at: new Date().toISOString(),
        })
        .eq("id", attendee.id)

      if (error) throw error
    }

    revalidatePath("/dashboard/mentorship")
    return { success: true }
  } catch (error) {
    console.error("Error updating meeting attendance:", error)
    return { success: false, error }
  }
}

// Add confidential note for mentee
export async function addMenteeNote(formData: {
  facultyId: string
  studentId: string
  note: string
  isConfidential: boolean
}) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("mentorship_notes")
      .insert({
        faculty_id: formData.facultyId,
        student_id: formData.studentId,
        note: formData.note,
        is_confidential: formData.isConfidential,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/mentorship")
    return { success: true, data }
  } catch (error) {
    console.error("Error adding mentee note:", error)
    return { success: false, error }
  }
}

// Get mentee notes
export async function getMenteeNotes(facultyId: string, studentId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("mentorship_notes")
      .select("*")
      .eq("faculty_id", facultyId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching mentee notes:", error)
    return { success: false, error }
  }
}

// Get mentee help requests
export async function getMenteeHelpRequests(facultyId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("mentorship_help_requests")
      .select("*, student:students(*)")
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching help requests:", error)
    return { success: false, error }
  }
}

// Update help request status
export async function updateHelpRequestStatus(formData: {
  requestId: string
  status: "pending" | "in_progress" | "resolved"
}) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("mentorship_help_requests")
      .update({
        status: formData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formData.requestId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/mentorship")
    return { success: true, data }
  } catch (error) {
    console.error("Error updating help request status:", error)
    return { success: false, error }
  }
}

// Get mentorship statistics
export async function getMentorshipStatistics(facultyId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get total mentees
    const { data: mentees, error: menteesError } = await supabase
      .from("mentorships")
      .select("id")
      .eq("faculty_id", facultyId)
      .eq("status", "active")

    if (menteesError) throw menteesError

    // Get total meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from("mentorship_meetings")
      .select("id")
      .eq("faculty_id", facultyId)

    if (meetingsError) throw meetingsError

    // Get meeting attendance
    const meetingIds = meetings.map((meeting) => meeting.id)

    let attendedCount = 0
    let missedCount = 0

    if (meetingIds.length > 0) {
      const { data: attendees, error: attendeesError } = await supabase
        .from("mentorship_meeting_attendees")
        .select("attended")
        .in("meeting_id", meetingIds)

      if (attendeesError) throw attendeesError

      attendedCount = attendees.filter((attendee) => attendee.attended).length
      missedCount = attendees.filter((attendee) => !attendee.attended).length
    }

    // Get next meeting
    const now = new Date().toISOString()
    const { data: nextMeeting, error: nextMeetingError } = await supabase
      .from("mentorship_meetings")
      .select("*")
      .eq("faculty_id", facultyId)
      .gte("meeting_date", now)
      .order("meeting_date", { ascending: true })
      .limit(1)
      .single()

    // It's okay if there's no next meeting
    const hasNextMeeting = !nextMeetingError && nextMeeting

    return {
      success: true,
      data: {
        totalMentees: mentees.length,
        totalMeetings: meetings.length,
        attendedMeetings: attendedCount,
        missedMeetings: missedCount,
        nextMeeting: hasNextMeeting ? nextMeeting : null,
      },
    }
  } catch (error) {
    console.error("Error fetching mentorship statistics:", error)
    return { success: false, error }
  }
}
