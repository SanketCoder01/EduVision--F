-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for users based on sender/receiver" ON "public"."messages";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."messages";

-- Add new columns to the messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Rename 'from_id' and 'to_id' to 'sender_id' and 'receiver_id' for consistency
ALTER TABLE public.messages RENAME COLUMN from_id TO sender_id;
ALTER TABLE public.messages RENAME COLUMN to_id TO receiver_id;
ALTER TABLE public.messages RENAME COLUMN from_role TO sender_role;
ALTER TABLE public.messages RENAME COLUMN to_role TO receiver_role;

-- Create new policies for row-level security
CREATE POLICY "Enable read access for users based on sender/receiver" ON "public"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."messages"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = sender_id));

-- Create a new bucket for chat attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'chat-attachments', 'chat-attachments', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'chat-attachments'
);

-- Create policies for the chat-attachments bucket
CREATE POLICY "Enable read access for all users" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');
CREATE POLICY "Enable insert for authenticated users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
