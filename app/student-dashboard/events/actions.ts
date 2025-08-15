"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStudentEvents(studentId: string) {
  try {
    const supabase = createClient()

    // Get student's department and year
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('department, year')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: studentError.message }
    }

    // Get upcoming/active events targeted to student's department and year
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        event_registrations (
          id,
          student_id,
          status
        )
      `)
      .contains('department', [student.department])
      .contains('year', [student.year])
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return { success: false, error: eventsError.message }
    }

    return { success: true, data: events || [] }
  } catch (error) {
    console.error('Error fetching student events:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

export async function getStudentSeatAssignment(eventId: string, studentId: string) {
  try {
    const supabase = createClient()

    // Get student's details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('department, year, gender')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: studentError.message }
    }

    // Get seat assignments for this event that match student's profile
    const { data: assignments, error: assignmentsError } = await supabase
      .from('seat_assignments')
      .select('*')
      .eq('event_id', eventId)
      .eq('department', student.department)
      .eq('year', student.year)
      .or(`gender.is.null,gender.eq.${student.gender}`)

    if (assignmentsError) {
      console.error('Error fetching seat assignments:', assignmentsError)
      return { success: false, error: assignmentsError.message }
    }

    return { success: true, data: assignments || [] }
  } catch (error) {
    console.error('Error fetching seat assignment:', error)
    return { success: false, error: 'Failed to fetch seat assignment' }
  }
}

export async function registerStudentForEvent(eventId: string, studentId: string, _registrationData?: any) {
  try {
    const supabase = createClient()

    // Check registration window and capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('registration_start, registration_end, max_participants')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return { success: false, error: 'Event not found' }
    }

    const now = new Date()
    const regStart = event.registration_start ? new Date(event.registration_start) : null
    const regEnd = event.registration_end ? new Date(event.registration_end) : null

    if (regStart && now < regStart) {
      return { success: false, error: 'Registration has not started yet' }
    }
    if (regEnd && now > regEnd) {
      return { success: false, error: 'Registration deadline has passed' }
    }

    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking registration:', checkError)
      return { success: false, error: checkError.message }
    }
    if (existingRegistration) {
      return { success: false, error: 'You are already registered for this event' }
    }

    // Check capacity
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered')
      if (typeof count === 'number' && count >= event.max_participants) {
        return { success: false, error: 'Event is full' }
      }
    }

    // Get student profile to normalize registration fields
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, department, year, phone')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Student not found' }
    }

    // Create registration with normalized fields
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        student_id: student.id,
        student_name: student.name ?? null,
        student_email: student.email ?? null,
        student_department: student.department,
        student_year: student.year,
        student_phone: student.phone ?? null,
        status: 'registered'
      }])
      .select()
      .single()

    if (error) {
      if ((error as any).code === '23505') {
        return { success: false, error: 'You are already registered for this event' }
      }
      console.error('Error creating registration:', error)
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

export async function updatePaymentStatus(registrationId: string, paymentStatus: 'pending' | 'paid' | 'failed') {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_registrations')
      .update({ payment_status: paymentStatus })
      .eq('id', registrationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/student-dashboard/events')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { success: false, error: 'Failed to update payment status' }
  }
}
