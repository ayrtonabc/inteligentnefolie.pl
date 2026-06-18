-- Add gallery column to web_offers table
ALTER TABLE web_offers ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
