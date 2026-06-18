-- Script to normalize language codes in site_custom_content table
-- This ensures all language codes are lowercase for consistency

-- Update all language codes to lowercase
UPDATE site_custom_content
SET language_code = LOWER(TRIM(language_code))
WHERE language_code != LOWER(TRIM(language_code));

-- Verify the update
SELECT DISTINCT language_code 
FROM site_custom_content 
ORDER BY language_code;
