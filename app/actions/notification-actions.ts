'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createNotification(notification: {
  user_id: string;
  title: string;
  message: string;
  type: 'timetable' | 'assignment' | 'announcement' | 'message';
  link?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.from('notifications').insert(notification).select().single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }

  // Revalidate path to update notification indicators
  revalidatePath('/student-dashboard');
  revalidatePath('/dashboard');

  return { success: true, data };
}

export async function getNotifications() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated', data: [] };
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error, data: [] };
  }

  return { success: true, data };
}

export async function markAsRead(notificationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }

  revalidatePath('/student-dashboard');
  revalidatePath('/dashboard');
  
  return { success: true };
}
