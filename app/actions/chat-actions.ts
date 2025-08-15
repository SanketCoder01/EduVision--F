'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get faculty by department for students to view
export async function getFacultyByDepartment(department: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('faculty')
    .select('id, name, email, designation, department')
    .eq('department', department)
    .order('name');

  if (error) {
    console.error('Error fetching faculty:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Get or create a conversation between a student and a faculty member
export async function getOrCreateConversation(studentId: string, facultyId: string) {
  const supabase = createClient();

  // First, check if a conversation already exists
  let { data: conversation, error: existingError } = await supabase
    .from('conversations')
    .select('*')
    .eq('student_id', studentId)
    .eq('faculty_id', facultyId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116: single row not found
    console.error('Error fetching conversation:', existingError);
    return { success: false, error: existingError };
  }

  // If conversation exists, return it
  if (conversation) {
    return { success: true, data: conversation };
  }

  // If not, create a new one
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({ student_id: studentId, faculty_id: facultyId })
    .select()
    .single();

  if (createError) {
    console.error('Error creating conversation:', createError);
    return { success: false, error: createError };
  }

  return { success: true, data: newConversation };
}

// Send a new message
export async function sendMessage(payload: {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  attachment_url?: string;
  message_type: 'text' | 'image' | 'file';
}) {
  const supabase = createClient();
  const { data, error } = await supabase.from('messages').insert(payload).select().single();

  if (error) {
    return { success: false, error };
  }
  
  revalidatePath(`/student-dashboard/queries/${payload.conversation_id}`);
  revalidatePath(`/dashboard/queries/${payload.conversation_id}`);

  return { success: true, data };
}

// Get all messages for a conversation
export async function getMessages(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

// Get all conversations for a user (student or faculty)
export async function getConversations(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            student:student_id ( id, name, email, profile_image_url ),
            faculty:faculty_id ( id, name, email, profile_image_url )
        `)
        .or(`student_id.eq.${userId},faculty_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

    if (error) {
        return { success: false, error };
    }

    return { success: true, data };
}

// Upload attachment to storage
export async function uploadAttachment(formData: FormData) {
    const supabase = createClient();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file || !conversationId) {
        return { success: false, error: { message: 'File or conversation ID missing.' } };
    }

    const filePath = `${conversationId}/${new Date().getTime()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

    if (error) {
        return { success: false, error };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(data.path);

    return { success: true, data: { url: publicUrl, path: data.path } };
}
