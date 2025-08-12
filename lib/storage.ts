import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function uploadAssignmentFile(userId: string, file: File) {
  const filePath = `user_${userId}/${file.name}`;
  return supabase.storage.from('assignments').upload(filePath, file);
}

export const uploadChatAttachment = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError.message);
    return { error: uploadError, publicURL: null };
  }

  const { data } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(filePath);

  return { error: null, publicURL: data.publicUrl };
};