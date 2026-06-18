-- Setup Storage Bucket for Web Offers Images
-- Run this in Supabase SQL Editor

-- Create bucket if it doesn't exist (do this manually in Supabase Dashboard > Storage)
-- Or use this SQL to create it programmatically:

-- Insert bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'web-offers',
  'web-offers',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects (web-offers bucket)
-- Allow public read access
CREATE POLICY "Public can view web-offers images"
ON storage.objects FOR SELECT
USING (bucket_id = 'web-offers');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload web-offers images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update web-offers images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete web-offers images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'web-offers' 
  AND auth.role() = 'authenticated'
);
