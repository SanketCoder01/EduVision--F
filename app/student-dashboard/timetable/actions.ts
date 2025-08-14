"use server"

import { createClient } from '@/lib/supabase/server';

export interface StudentTimetableEntry {
  id: string;
  faculty_id: string;
  department: string;
  year: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
  schedule_data?: any;
}

export async function getStudentTimetables() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  // Get student profile to determine department and year
  const { data: studentProfile, error: profileError } = await supabase
    .from('students')
    .select('department, year')
    .eq('id', user.id)
    .single();

  if (profileError || !studentProfile) {
    return { error: { message: 'Student profile not found' } };
  }

  // Get timetables for student's department and year
  const { data, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('department', studentProfile.department)
    .eq('year', studentProfile.year)
    .order('uploaded_at', { ascending: false });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data, studentProfile };
}

export async function getTodaySchedule() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  // Get student profile
  const { data: studentProfile, error: profileError } = await supabase
    .from('students')
    .select('department, year')
    .eq('id', user.id)
    .single();

  if (profileError || !studentProfile) {
    return { error: { message: 'Student profile not found' } };
  }

  // Get current day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Get timetables with schedule data for today
  const { data, error } = await supabase
    .from('timetables')
    .select('schedule_data')
    .eq('department', studentProfile.department)
    .eq('year', studentProfile.year)
    .not('schedule_data', 'is', null);

  if (error) {
    return { error: { message: error.message } };
  }

  // Extract today's schedule from all timetables
  const todaySchedule: any[] = [];
  data?.forEach(timetable => {
    if (timetable.schedule_data?.[today]) {
      todaySchedule.push(...timetable.schedule_data[today]);
    }
  });

  return { data: todaySchedule, day: today };
}
