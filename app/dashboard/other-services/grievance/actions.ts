'use server';

import { createClient } from '@/lib/supabase/server';
import { Grievance } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function submitGrievance(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to submit a grievance.' };
  }

  const grievanceData = {
    student_id: user.id,
    subject: formData.get('subject') as string,
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    is_private: true, // Grievances are always private
    status: 'Pending',
  };

  const { error } = await supabase.from('grievances').insert(grievanceData);

  if (error) {
    console.error('Error submitting grievance:', error);
    return { error: 'Failed to submit grievance. Please try again.' };
  }

  revalidatePath('/dashboard/other-services/grievance');
  return { success: 'Grievance submitted successfully.' };
}

export async function getGrievances(): Promise<Grievance[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // This logic will need to be adjusted based on roles.
  // For now, students can only see their own grievances.
  // Faculty would see all grievances.
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching grievances:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    studentId: item.student_id,
    studentName: 'N/A', // Will be fetched from profiles table later
    subject: item.subject,
    category: item.category,
    description: item.description,
    status: item.status,
    submittedAt: new Date(item.submitted_at),
    isPrivate: item.is_private,
  }));
}
