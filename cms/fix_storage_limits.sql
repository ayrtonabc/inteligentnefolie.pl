-- Update Storage Bucket for Web Offers to support Videos
-- Run this in Supabase SQL Editor

-- Update the bucket configuration
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'video/mp4', 
    'video/mpeg', 
    'video/quicktime', 
    'video/x-msvideo', 
    'video/webm', 
    'audio/mpeg', 
    'audio/mp3', 
    'audio/wav'
  ]
WHERE id = 'web-offers';

-- Ensure policies exist (redundant but safe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload web-offers'
    ) THEN
        CREATE POLICY "Authenticated users can upload web-offers"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'web-offers' 
          AND auth.role() = 'authenticated'
        );
    END IF;
END $$;
