'use server';

import { createClient } from '@/lib/supabase/server';

export async function getFacultyEvents() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to view events.' };
  }

  const { data: faculty, error: facultyError } = await supabase
    .from('faculty')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (facultyError || !faculty) {
    return { error: 'Could not find faculty profile.' };
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('faculty_id', faculty.id);

  if (eventsError) {
    return { error: 'Failed to fetch events.' };
  }

  return { events };
}

export async function getSeatingChartData(eventId: string) {
  const supabase = createClient();

  // 1. Get event details, especially the venue
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('venue')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return { error: 'Failed to fetch event details.' };
  }

  // 2. Get all students registered for the event
  const { data: registrations, error: registrationError } = await supabase
    .from('event_registrations')
    .select('student_id')
    .eq('event_id', eventId);

  if (registrationError) {
    return { error: 'Failed to fetch student registrations.' };
  }

  const studentIds = registrations.map(r => r.student_id);

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, department, year, gender')
    .in('id', studentIds);

  if (studentsError) {
    return { error: 'Failed to fetch student details.' };
  }

  // 3. Get all existing seat assignments for the event
  const { data: assignments, error: assignmentsError } = await supabase
    .from('event_seat_assignments')
    .select('*')
    .eq('event_id', eventId);

  if (assignmentsError) {
    return { error: 'Failed to fetch seat assignments.' };
  }

  return { venue: event.venue, students, assignments };
}

export async function assignSeat(eventId: string, studentId: string, seatNumber: string) {
  const supabase = createClient();

  // First, check if the student is already assigned to this seat to avoid unnecessary writes.
  const { data: existing, error: existingError } = await supabase
    .from('event_seat_assignments')
    .select('id')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .eq('seat_number', seatNumber)
    .single();

  if (existing) {
    return { success: true }; // No change needed
  }

  // Upsert the assignment. This will create or update the student's seat.
  // onConflict on `(event_id, student_id)` ensures a student only has one seat per event.
  const { data, error } = await supabase
    .from('event_seat_assignments')
    .upsert(
      {
        event_id: eventId,
        student_id: studentId,
        seat_number: seatNumber,
      },
      { onConflict: 'event_id, student_id' }
    )
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique_violation on (event_id, seat_number)
      return { error: `Seat ${seatNumber} is already occupied.` };
    }
    console.error('Seat assignment error:', error);
    return { error: 'An unexpected error occurred while assigning the seat.' };
  }

  return { data };
}
