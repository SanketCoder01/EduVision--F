'use server';

import { createClient } from '@/lib/supabase/server';
import { Hackathon } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function postHackathon(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // TODO: Add role check to ensure only faculty can post
  if (!user) {
    return { error: 'You must be a faculty member to post a hackathon.' };
  }

  const hackathonData = {
    faculty_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    department: formData.getAll('department') as string[],
    year: formData.getAll('year') as string[],
    // Attachment handling will be implemented next
    attachments: [], 
  };

  const { error } = await supabase.from('hackathons').insert(hackathonData);

  if (error) {
    console.error('Error posting hackathon:', error);
    return { error: 'Failed to post hackathon. Please try again.' };
  }

  // TODO: Trigger notifications for targeted students

  revalidatePath('/dashboard/other-services/hackathon');
  return { success: 'Hackathon posted successfully.' };
}

export async function getHackathons(): Promise<Hackathon[]> {
  const supabase = createClient();

  // In the future, this could be filtered based on the logged-in student's profile
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('Error fetching hackathons:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    facultyId: item.faculty_id,
    department: item.department,
    year: item.year,
    attachments: item.attachments,
    postedAt: new Date(item.posted_at),
  }));
}
