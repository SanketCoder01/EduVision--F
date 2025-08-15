"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/app/actions/notification-actions';

export interface TimetableEntry {
  id: string;
  faculty_id: string;
  department: string;
  year: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
  schedule_data?: any; // Parsed schedule for notifications
}

export async function uploadTimetable(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  const file = formData.get('file') as File;
  const department = formData.get('department') as string;
  const year = formData.get('year') as string;

  if (!file || !department || !year) {
    return { error: { message: 'Missing required fields' } };
  }

  try {
    // Upload file to Supabase Storage
    const fileName = `${department}-${year}-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('timetables')
      .upload(fileName, file);

    if (uploadError) {
      return { error: { message: `Upload failed: ${uploadError.message}` } };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('timetables')
      .getPublicUrl(fileName);

    // Save timetable record to database
    const { data, error: dbError } = await supabase
      .from('timetables')
      .insert({
        faculty_id: user.id,
        department,
        year,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      return { error: { message: `Database error: ${dbError.message}` } };
    }

    // Notify relevant students
    try {
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('user_id')
        .eq('department', department)
        .eq('year', year);

      if (studentsError) {
        throw studentsError;
      }

      if (students && students.length > 0) {
        const notificationPromises = students.map(student => 
          createNotification({
            user_id: student.user_id,
            title: 'New Timetable Uploaded',
            message: `A new timetable for ${department} - Year ${year} has been published.`,
            type: 'timetable',
            link: '/student-dashboard/timetable'
          })
        );
        await Promise.all(notificationPromises);
      }
    } catch (notificationError: any) {
      // Log the error but don't fail the entire operation
      console.error('Failed to send notifications:', notificationError.message);
    }

    revalidatePath('/dashboard/timetable');
    return { success: true, data };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

export async function getTimetables() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('faculty_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function deleteTimetable(id: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  // Get timetable to delete file from storage
  const { data: timetable } = await supabase
    .from('timetables')
    .select('file_url')
    .eq('id', id)
    .eq('faculty_id', user.id)
    .single();

  if (timetable?.file_url) {
    // Extract file path from URL
    const fileName = timetable.file_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('timetables').remove([fileName]);
    }
  }

  const { error } = await supabase
    .from('timetables')
    .delete()
    .eq('id', id)
    .eq('faculty_id', user.id);

  if (error) {
    return { error: { message: error.message } };
  }

  revalidatePath('/dashboard/timetable');
  return { success: true };
}
