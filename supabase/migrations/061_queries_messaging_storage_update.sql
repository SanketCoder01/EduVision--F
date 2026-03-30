-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Alter query_messages table to support attachments
ALTER TABLE public.query_messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880, '{image/jpeg,image/png,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Avatars Policies
CREATE POLICY "Public avatars are viewable by everyone." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatars." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update their own avatars." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete their own avatars." ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- 3. Create query_attachments bucket if not exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('query_attachments', 'query_attachments', true, false, 52428800, '{image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain}')
ON CONFLICT (id) DO NOTHING;

-- Attachments Policies
CREATE POLICY "Public query_attachments are viewable by everyone." ON storage.objects FOR SELECT USING (bucket_id = 'query_attachments');
CREATE POLICY "Users can upload query_attachments." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'query_attachments');
CREATE POLICY "Users can update query_attachments." ON storage.objects FOR UPDATE USING (bucket_id = 'query_attachments');
CREATE POLICY "Users can delete query_attachments." ON storage.objects FOR DELETE USING (bucket_id = 'query_attachments');
