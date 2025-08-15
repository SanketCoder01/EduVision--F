"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EventData {
  title: string
  description: string
  event_type: string
  date: string
  time: string
  venue: string
  poster_url?: string
  max_participants?: number
  target_departments: string[]
  target_years?: string[]
  enable_payment: boolean
  payment_amount?: number
  allow_registration: boolean
  registration_start?: string
  registration_end: string
  registration_fields?: any[]
  venue_type?: string
  created_by: string
  faculty_name: string
  faculty_department: string
}

export interface SeatAssignment {
  event_id: string
  venue_type: 'seminar-hall' | 'solar-shade'
  department: string
  year: string
  gender?: string
  seat_numbers: number[]
  row_numbers: number[]
}

export async function createEvent(eventData: EventData) {
  try {
    const supabase = createClient()

    // Convert date and time to proper timestamp
    const eventDateTime = new Date(`${eventData.date}T${eventData.time}`)
    const registrationEnd = new Date(eventData.registration_end)
    const registrationStart = eventData.registration_start ? new Date(eventData.registration_start) : new Date()

    const eventPayload = {
      ...eventData,
      event_date: eventDateTime.toISOString(),
      registration_start: registrationStart.toISOString(),
      registration_end: registrationEnd.toISOString(),
      department: eventData.target_departments,
      year: eventData.target_years || ['1st Year', '2nd Year', '3rd Year', '4th Year']
    }

    const { data, error } = await supabase
      .from('events')
      .insert([eventPayload])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    revalidatePath('/student-dashboard/events')
    return { success: true, data }
  } catch (error) {
    console.error('Error creating event:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function getFacultyEvents(facultyId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_registrations (
          id,
          student_id,
          student_name,
          student_email,
          student_department,
          student_year,
          student_phone,
          registration_date,
          status
        ),
        event_attendance (
          id,
          student_id,
          attendance_status,
          marked_at,
          notes
        )
      `)
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching events:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

export async function createSeatAssignment(seatData: SeatAssignment) {
  try {
    const supabase = createClient()

    // Check for conflicts
    const { data: existingAssignments, error: checkError } = await supabase
      .from('seat_assignments')
      .select('seat_numbers')
      .eq('event_id', seatData.event_id)

    if (checkError) {
      console.error('Error checking seat conflicts:', checkError)
      return { success: false, error: checkError.message }
    }

    // Check for overlapping seat numbers
    const existingSeatNumbers = existingAssignments?.flatMap(a => a.seat_numbers) || []
    const conflicts = seatData.seat_numbers.filter(seat => existingSeatNumbers.includes(seat))
    
    if (conflicts.length > 0) {
      return { 
        success: false, 
        error: `Seats ${conflicts.join(', ')} are already assigned` 
      }
    }

    const { data, error } = await supabase
      .from('seat_assignments')
      .insert([seatData])
      .select()
      .single()

    if (error) {
      console.error('Error creating seat assignment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true, data }
  } catch (error) {
    console.error('Error creating seat assignment:', error)
    return { success: false, error: 'Failed to create seat assignment' }
  }
}

export async function getEventSeatAssignments(eventId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('seat_assignments')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching seat assignments:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching seat assignments:', error)
    return { success: false, error: 'Failed to fetch seat assignments' }
  }
}

export async function updateSeatAssignment(assignmentId: string, seatNumbers: number[]) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('seat_assignments')
      .update({ 
        seat_numbers: seatNumbers,
        row_numbers: seatNumbers.map(seat => Math.ceil(seat / 16)) // Assuming 16 seats per row
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating seat assignment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating seat assignment:', error)
    return { success: false, error: 'Failed to update seat assignment' }
  }
}

export async function deleteSeatAssignment(assignmentId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('seat_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('Error deleting seat assignment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true }
  } catch (error) {
    console.error('Error deleting seat assignment:', error)
    return { success: false, error: 'Failed to delete seat assignment' }
  }
}

export async function registerForEvent(eventId: string, studentData: {
  student_id: string
  student_name: string
  student_email: string
  student_department: string
  student_year: string
  student_phone?: string
}) {
  try {
    const supabase = createClient()

    // Check if registration is still open
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('registration_end, max_participants')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return { success: false, error: 'Event not found' }
    }

    const now = new Date()
    const registrationEnd = new Date(event.registration_end)

    if (now > registrationEnd) {
      return { success: false, error: 'Registration deadline has passed' }
    }

    // Check if max participants reached
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered')

      if (count && count >= event.max_participants) {
        return { success: false, error: 'Event is full' }
      }
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        ...studentData
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'You are already registered for this event' }
      }
      console.error('Error registering for event:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/student-dashboard/events')
    revalidatePath('/dashboard/events')
    return { success: true, data }
  } catch (error) {
    console.error('Error registering for event:', error)
    return { success: false, error: 'Failed to register for event' }
  }
}

export async function markEventAttendance(eventId: string, studentId: string, attendanceStatus: 'present' | 'absent' | 'late', markedBy: string, notes?: string) {
  try {
    const supabase = createClient()

    // Get registration info
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .single()

    if (regError || !registration) {
      return { success: false, error: 'Student not registered for this event' }
    }

    // Insert or update attendance record
    const { data, error } = await supabase
      .from('event_attendance')
      .upsert({
        event_id: eventId,
        student_id: studentId,
        registration_id: registration.id,
        marked_by: markedBy,
        attendance_status: attendanceStatus,
        notes: notes || null
      }, {
        onConflict: 'event_id,student_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error marking attendance:', error)
      return { success: false, error: error.message }
    }

    // Update registration status
    await supabase
      .from('event_registrations')
      .update({ status: attendanceStatus === 'present' ? 'attended' : 'registered' })
      .eq('id', registration.id)

    revalidatePath('/dashboard/events')
    revalidatePath('/dashboard/attendance')
    return { success: true, data }
  } catch (error) {
    console.error('Error marking attendance:', error)
    return { success: false, error: 'Failed to mark attendance' }
  }
}

export async function getEventRegistrations(eventId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event_attendance (
          attendance_status,
          marked_at,
          notes
        )
      `)
      .eq('event_id', eventId)
      .order('registration_date', { ascending: true })

    if (error) {
      console.error('Error fetching registrations:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return { success: false, error: 'Failed to fetch registrations' }
  }
}

export async function getStudentEvents(studentDepartment: string, studentYear: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .contains('department', [studentDepartment])
      .contains('year', [studentYear])
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching student events:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching student events:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

export async function getEventAttendanceForAttendanceSection() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        *,
        events (
          title,
          event_type,
          event_date,
          faculty_name
        )
      `)
      .order('marked_at', { ascending: false })

    if (error) {
      console.error('Error fetching event attendance:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching event attendance:', error)
    return { success: false, error: 'Failed to fetch event attendance' }
  }
}
