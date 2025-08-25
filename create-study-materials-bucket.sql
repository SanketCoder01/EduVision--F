-- Create study-materials storage bucket for EduVision
-- This script creates the missing storage bucket that's causing upload failures

-- Create the study-materials bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for study-materials bucket
-- Allow anyone to upload (since we removed authentication)
CREATE POLICY "Allow public uploads to study-materials" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'study-materials');

-- Allow anyone to view study materials
CREATE POLICY "Allow public access to study-materials" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'study-materials');

-- Allow deletion for cleanup (optional)
CREATE POLICY "Allow public delete from study-materials" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'study-materials');
