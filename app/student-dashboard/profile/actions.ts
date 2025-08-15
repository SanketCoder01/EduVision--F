"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStudentProfile() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to view your profile.' };
  }

  const { data: profile, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching student profile:', error);
    return { error: 'Failed to fetch profile data.' };
  }

  return { profile };
}

export async function updateStudentProfile(formData: { name: string; mobile: string; address: string; }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const { error } = await supabase
    .from('students')
    .update({
      full_name: formData.name,
      mobile_number: formData.mobile,
      address: formData.address,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating student profile:', error);
    return { error: 'Failed to update profile.' };
  }

  revalidatePath('/student-dashboard/profile');
  return { success: true };
}

export async function updateUserPassword(password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Error updating password:', error);
    return { error: 'Failed to update password. Please make sure it meets the requirements.' };
  }

  return { success: true };
}
