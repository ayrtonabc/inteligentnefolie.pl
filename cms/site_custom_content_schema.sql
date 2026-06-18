-- Schema for custom site content management
-- Allows editing any text on the site with enable/disable toggle

CREATE TABLE IF NOT EXISTS site_custom_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL, -- e.g., 'heroTitle', 'aboutTitle', etc.
  language_code TEXT NOT NULL, -- 'pl', 'en', 'es', 'ru'
  content_value TEXT NOT NULL, -- The custom text content
  is_active BOOLEAN DEFAULT true, -- Enable/disable this custom content
  page_path TEXT DEFAULT '/', -- Which page this content belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_key, language_code)
);

-- Enable Row Level Security
ALTER TABLE site_custom_content ENABLE ROW LEVEL SECURITY;

-- Policies for site_custom_content
-- Anyone can read (for the landing site)
CREATE POLICY "Anyone can read site custom content" ON site_custom_content
  FOR SELECT USING (true);

-- Only authenticated users can manage
CREATE POLICY "Authenticated users can manage site custom content" ON site_custom_content
  FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_custom_content_key ON site_custom_content(content_key);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_lang ON site_custom_content(language_code);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_active ON site_custom_content(is_active);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_page ON site_custom_content(page_path);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_custom_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_site_custom_content_timestamp
  BEFORE UPDATE ON site_custom_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_custom_content_updated_at();
