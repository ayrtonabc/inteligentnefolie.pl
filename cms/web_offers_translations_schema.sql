-- Add translation columns to web_offers table
-- This allows storing title, description, and category in multiple languages

-- Add translation columns for title
ALTER TABLE web_offers 
ADD COLUMN IF NOT EXISTS title_pl TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS title_ru TEXT;

-- Add translation columns for description
ALTER TABLE web_offers 
ADD COLUMN IF NOT EXISTS description_pl TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT;

-- Add translation columns for category
ALTER TABLE web_offers 
ADD COLUMN IF NOT EXISTS category_pl TEXT,
ADD COLUMN IF NOT EXISTS category_en TEXT,
ADD COLUMN IF NOT EXISTS category_es TEXT,
ADD COLUMN IF NOT EXISTS category_ru TEXT;

-- Migrate existing data: copy current values to Polish (default language)
UPDATE web_offers 
SET 
  title_pl = COALESCE(title_pl, title),
  description_pl = COALESCE(description_pl, description),
  category_pl = COALESCE(category_pl, category)
WHERE title_pl IS NULL OR description_pl IS NULL OR category_pl IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_offers_category_pl ON web_offers(category_pl);
CREATE INDEX IF NOT EXISTS idx_web_offers_category_en ON web_offers(category_en);
CREATE INDEX IF NOT EXISTS idx_web_offers_category_es ON web_offers(category_es);
CREATE INDEX IF NOT EXISTS idx_web_offers_category_ru ON web_offers(category_ru);

-- Note: The old columns (title, description, category) are kept for backward compatibility
-- but should be populated from the translation columns based on default language
