'use server';

import { createClient } from '@/lib/supabase/server';

export async function getStudentSeatAssignments() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (studentError || !student) {
    return { error: 'Could not find your student profile.' };
  }

  const { data, error } = await supabase
    .from('event_seat_assignments')
    .select(`
      seat_number,
      events (*)
    `)
    .eq('student_id', student.id);

  if (error) {
    console.error('Error fetching seat assignments:', error);
    return { error: 'Failed to fetch your seat assignments.' };
  }

  return { assignments: data };
}
