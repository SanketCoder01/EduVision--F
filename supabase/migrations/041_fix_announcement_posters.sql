-- Fix Announcement Posters Storage and Column
-- ============================================

-- Ensure poster_url column exists
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Create the announcement-posters storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('announcement-posters', 'announcement-posters', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Set public access policy for the bucket
CREATE POLICY "Public Access to announcement posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-posters');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-posters' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'announcement-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads  
CREATE POLICY "Users can delete own posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'announcement-posters' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Announcement posters storage configured';
END $$;
