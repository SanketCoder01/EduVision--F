"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateFacultyProfile(formData: { department: string; mobileNumber: string; password?: string; fullName: string; }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User not authenticated' } };
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

  // Upsert profile (id conflict tolerated)
  const { error } = await supabase
    .from('faculty')
    .upsert({
      id: user.id,
      email: user.email, // Use email from the secure session
      full_name: formData.fullName,
      department: formData.department,
      mobile_number: formData.mobileNumber,
    }, { onConflict: 'id' });

  if (error) {
    return { error };
  }

  revalidatePath('/faculty-registration', 'layout');
  return { error: null };
}
