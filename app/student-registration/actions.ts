"use server"

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface StudentProfile {
  id: string;
  email: string | undefined;
  full_name: string | null;
  department: string;
  year_of_study: string;
  mobile_number: string;
}

export async function updateStudentProfile(formData: { department: string; year: string; mobileNumber: string; password?: string; confirmPassword?: string; }) {
  const supabase = createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'Could not identify user. Please try logging in again.' } };
  }

  // Check if profile already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from('students')
    .select('id')
    .eq('id', user.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    return { error: selectError };
  }

  if (existingProfile) {
    return { error: { message: 'A profile for this user already exists. Please try logging in.' } };
  }

  // Update password if provided
  if (formData.password) {
    if (formData.password.length < 6) {
      return { error: { message: 'Password must be at least 6 characters long.' } };
    }
    const { error: passwordError } = await supabase.auth.updateUser({ password: formData.password });
    if (passwordError) {
      return { error: passwordError };
    }
  }

  // Insert new profile
  const { error } = await supabase.from('students').insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata.full_name || user.email,
    department: formData.department,
    year_of_study: formData.year,
    mobile_number: formData.mobileNumber,
  });

  if (error) {
    return { error };
  }

  revalidatePath('/student-registration', 'layout');
  return { error: null };
}
