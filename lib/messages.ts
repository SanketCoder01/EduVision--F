import { createClient } from '@/lib/supabase/client';

/**
 * Fetches the message history between a student and a faculty member.
 * @param studentId The ID of the student.
 * @param facultyId The ID of the faculty member.
 * @returns A Supabase query builder instance for the messages.
 */
export async function fetchMessages(studentId: string, facultyId: string) {
  const supabase = createClient();
  return supabase
    .from('messages')
    .select('id, content, created_at, sender_id, message_type, attachment_url')
    .or(`(sender_id.eq.${studentId},receiver_id.eq.${facultyId}),(sender_id.eq.${facultyId},receiver_id.eq.${studentId})`)
    .order('created_at', { ascending: true });
}

/**
 * Subscribes to new messages in a conversation.
 * @param studentId The ID of the student.
 * @param facultyId The ID of the faculty member.
 * @param callback The function to call when a new message arrives.
 * @returns The Supabase real-time channel subscription.
 */
export function subscribeToMessages(studentId: string, facultyId: string, callback: (payload: any) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`messages:${studentId}:${facultyId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${studentId},receiver_id.eq.${facultyId}),and(sender_id.eq.${facultyId},receiver_id.eq.${studentId}))`
      },
      callback
    )
    .subscribe();

  return channel;
}

export async function sendMessage(sender_id: string, sender_role: string, receiver_id: string, receiver_role: string, content: string, message_type: string = 'text', attachment_url: string | null = null) {
  const supabase = createClient();
  return supabase.from('messages').insert({
    sender_id,
    sender_role,
    receiver_id,
    receiver_role,
    content,
    message_type,
    attachment_url,
  });
}