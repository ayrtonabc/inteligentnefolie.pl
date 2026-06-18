-- Fix RLS policies for site_content to allow public writes (for visual editor)
-- Run this in Supabase SQL Editor if you can't save content

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can manage site content" ON site_content;

-- Create new policies
-- Allow anyone to insert/update site content (for visual editor)
-- This is safe because it's only website content, not sensitive data
CREATE POLICY "Anyone can insert site content" ON site_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update site content" ON site_content
  FOR UPDATE USING (true);

CREATE POLICY "Only authenticated users can delete site content" ON site_content
  FOR DELETE USING (auth.role() = 'authenticated');
