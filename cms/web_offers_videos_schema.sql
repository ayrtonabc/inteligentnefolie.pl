-- Add video columns to web_offers table
-- This allows storing video files (MP4, MOV, AVI, WEBM, MP3) for web offers

-- Add video columns
ALTER TABLE web_offers 
ADD COLUMN IF NOT EXISTS main_video TEXT,
ADD COLUMN IF NOT EXISTS secondary_video_1 TEXT,
ADD COLUMN IF NOT EXISTS secondary_video_2 TEXT;

-- Add comments for documentation
COMMENT ON COLUMN web_offers.main_video IS 'URL del video principal (MP4, MOV, AVI, WEBM, MP3)';
COMMENT ON COLUMN web_offers.secondary_video_1 IS 'URL del primer video secundario';
COMMENT ON COLUMN web_offers.secondary_video_2 IS 'URL del segundo video secundario';
