-- Website Content Management Schema
-- This schema allows storing all website content for visual editing

-- Main site content table
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL, -- e.g., '/', '/projects', '/contact'
  section_key TEXT NOT NULL, -- e.g., 'hero_title', 'about_text', 'logo_text'
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'html', 'image', 'link', 'video', 'json')),
  content_value JSONB NOT NULL, -- Stores the actual content (can be text, image URL, etc.)
  language_code TEXT DEFAULT 'pl', -- Language code (pl, en, es, etc.)
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB, -- Additional metadata (styles, classes, position, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_path, section_key, language_code)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
  category TEXT DEFAULT 'general', -- general, seo, social, analytics, etc.
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available languages for the site
CREATE TABLE IF NOT EXISTS site_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g., 'pl', 'en', 'es'
  name TEXT NOT NULL, -- e.g., 'Polski', 'English', 'Español'
  native_name TEXT NOT NULL, -- Native name of the language
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  flag_emoji TEXT, -- Flag emoji for the language
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Edit sessions for tracking who is editing
CREATE TABLE IF NOT EXISTS edit_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL, -- Secret token for edit mode
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for site_content (public read and write for editing)
CREATE POLICY "Anyone can read site content" ON site_content
  FOR SELECT USING (true);

-- Allow anyone to insert/update site content (for visual editor)
-- This is safe because it's only website content, not sensitive data
CREATE POLICY "Anyone can insert site content" ON site_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update site content" ON site_content
  FOR UPDATE USING (true);

CREATE POLICY "Only authenticated users can delete site content" ON site_content
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for site_settings
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for site_languages
CREATE POLICY "Anyone can read site languages" ON site_languages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage site languages" ON site_languages
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for edit_sessions
-- Allow public read access to verify tokens (for the landing site)
CREATE POLICY "Anyone can read edit sessions to verify tokens" ON edit_sessions
  FOR SELECT USING (true);

-- Only authenticated users can create/update/delete edit sessions
CREATE POLICY "Authenticated users can manage their edit sessions" ON edit_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their edit sessions" ON edit_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their edit sessions" ON edit_sessions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page_path);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section_key);
CREATE INDEX IF NOT EXISTS idx_site_content_language ON site_content(language_code);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_token ON edit_sessions(token);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_user ON edit_sessions(user_id);

-- Insert default languages
INSERT INTO site_languages (code, name, native_name, is_active, is_default, flag_emoji) VALUES
  ('pl', 'Polish', 'Polski', true, true, '🇵🇱'),
  ('en', 'English', 'English', true, false, '🇬🇧'),
  ('es', 'Spanish', 'Español', true, false, '🇪🇸')
ON CONFLICT (code) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('site_name', '"Apartamentos en Tailandia"', 'string', 'general', 'Site name'),
  ('site_description', '"Luxury apartments in Thailand"', 'string', 'seo', 'Site meta description'),
  ('whatsapp_number', '"+44 7841 934986"', 'string', 'contact', 'WhatsApp contact number'),
  ('edit_mode_enabled', 'true', 'boolean', 'general', 'Enable visual edit mode'),
  ('default_language', '"pl"', 'string', 'general', 'Default language code')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
