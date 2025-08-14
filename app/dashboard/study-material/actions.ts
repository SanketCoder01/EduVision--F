"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface StudyMaterialEntry {
  id: string;
  faculty_id: string;
  department: string;
  year: string;
  subject: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

export async function uploadStudyMaterial(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  const file = formData.get('file') as File;
  const department = formData.get('department') as string;
  const year = formData.get('year') as string;
  const subject = formData.get('subject') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!file || !department || !year || !subject || !title) {
    return { error: { message: 'Missing required fields' } };
  }

  try {
    // Upload file to Supabase Storage
    const fileName = `${department}-${year}-${subject}-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file);

    if (uploadError) {
      return { error: { message: `Upload failed: ${uploadError.message}` } };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('study-materials')
      .getPublicUrl(fileName);

    // Save study material record to database
    const { data, error: dbError } = await supabase
      .from('study_materials')
      .insert({
        faculty_id: user.id,
        department,
        year,
        subject,
        title,
        description,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      return { error: { message: `Database error: ${dbError.message}` } };
    }

    revalidatePath('/dashboard/study-material');
    return { success: true, data };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

export async function getStudyMaterials() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('faculty_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function deleteStudyMaterial(id: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  // Get study material to delete file from storage
  const { data: material } = await supabase
    .from('study_materials')
    .select('file_url')
    .eq('id', id)
    .eq('faculty_id', user.id)
    .single();

  if (material?.file_url) {
    // Extract file path from URL
    const fileName = material.file_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('study-materials').remove([fileName]);
    }
  }

  const { error } = await supabase
    .from('study_materials')
    .delete()
    .eq('id', id)
    .eq('faculty_id', user.id);

  if (error) {
    return { error: { message: error.message } };
  }

  revalidatePath('/dashboard/study-material');
  return { success: true };
}
