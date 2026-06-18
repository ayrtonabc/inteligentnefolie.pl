-- Fix RLS policies for edit_sessions to allow public token verification
-- Run this in Supabase SQL Editor if tokens are not working

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can manage their edit sessions" ON edit_sessions;

-- Create new policies
-- Allow public read access to verify tokens (for the landing site)
CREATE POLICY "Anyone can read edit sessions to verify tokens" ON edit_sessions
  FOR SELECT USING (true);

-- Only authenticated users can create/update/delete edit sessions
CREATE POLICY "Authenticated users can create edit sessions" ON edit_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their edit sessions" ON edit_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their edit sessions" ON edit_sessions
  FOR DELETE USING (auth.role() = 'authenticated');
