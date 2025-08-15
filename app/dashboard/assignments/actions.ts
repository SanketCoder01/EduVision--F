"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAssignment(formData: FormData) {
  const supabase = createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // 2. Fetch Faculty Profile
  const { data: facultyProfile, error: profileError } = await supabase
    .from('faculty')
    .select('id, department')
    .eq('id', user.id)
    .single();

  if (profileError || !facultyProfile) {
    return { success: false, message: 'Faculty profile not found.' };
  }

  // 3. Extract and Validate Data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    question: formData.get('question') as string,
    due_date: formData.get('due_date') as string,
    target_departments: formData.getAll('target_departments'),
    target_years: formData.getAll('target_years'),
    max_marks: Number(formData.get('max_marks')),
    attachment: formData.get('attachment') as File,
  };

  if (!rawData.title || !rawData.due_date || !rawData.target_departments.length || !rawData.target_years.length) {
    return { success: false, message: 'Missing required fields.' };
  }

  // 4. Handle File Upload
  let attachment_url = null;
  if (rawData.attachment && rawData.attachment.size > 0) {
    const filePath = `assignments/${facultyProfile.id}/${Date.now()}-${rawData.attachment.name}`;
    const { error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(filePath, rawData.attachment);

    if (uploadError) {
      return { success: false, message: `Failed to upload attachment: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(filePath);
    attachment_url = urlData.publicUrl;
  }

  // 5. Insert into Database
  const { error: insertError } = await supabase.from('assignments').insert({
    title: rawData.title,
    description: rawData.description,
    question: rawData.question,
    due_date: rawData.due_date,
    target_departments: rawData.target_departments,
    target_years: rawData.target_years,
    max_marks: rawData.max_marks,
    faculty_id: facultyProfile.id,
    attachment_url: attachment_url,
    department: facultyProfile.department, // Ensure department is set
  });

  if (insertError) {
    return { success: false, message: `Database error: ${insertError.message}` };
  }

  revalidatePath('/dashboard/assignments');
  return { success: true, message: 'Assignment created successfully!' };
}
