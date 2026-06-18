-- Add currency and language columns to settings table if they don't exist

-- Add currency column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'currency'
    ) THEN
        ALTER TABLE settings ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
END $$;

-- Add language column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'language'
    ) THEN
        ALTER TABLE settings ADD COLUMN language TEXT DEFAULT 'es';
    END IF;
END $$;

-- Add city column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'city'
    ) THEN
        ALTER TABLE settings ADD COLUMN city TEXT;
    END IF;
END $$;

-- Add postal_code column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE settings ADD COLUMN postal_code TEXT;
    END IF;
END $$;

-- Add state column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'state'
    ) THEN
        ALTER TABLE settings ADD COLUMN state TEXT;
    END IF;
END $$;

-- Add country column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'country'
    ) THEN
        ALTER TABLE settings ADD COLUMN country TEXT DEFAULT 'Colombia';
    END IF;
END $$;

-- Update existing row to have default values
UPDATE settings 
SET 
    currency = COALESCE(currency, 'USD'),
    language = COALESCE(language, 'es'),
    country = COALESCE(country, 'Colombia')
WHERE id = '00000000-0000-0000-0000-000000000000';
