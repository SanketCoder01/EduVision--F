"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateFacultyProfile(formData: { department: string; mobileNumber: string; password?: string; }) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
  }

  // Check if profile already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from('faculty')
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
  const { error } = await supabase.from('faculty').insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata.full_name || user.email,
    department: formData.department,
    mobile_number: formData.mobileNumber,
  });

  if (error) {
    return { error };
  }

  revalidatePath('/faculty-registration', 'layout');
  return { error: null };
}
