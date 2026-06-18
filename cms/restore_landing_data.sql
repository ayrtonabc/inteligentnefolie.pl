-- 1. Ensure all columns exist in web_offers (safe even if table already exists)
DO $$ 
BEGIN
    -- Base columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'main_image') THEN
        ALTER TABLE public.web_offers ADD COLUMN main_image TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'secondary_image_1') THEN
        ALTER TABLE public.web_offers ADD COLUMN secondary_image_1 TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'secondary_image_2') THEN
        ALTER TABLE public.web_offers ADD COLUMN secondary_image_2 TEXT;
    END IF;
    
    -- Video columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'main_video') THEN
        ALTER TABLE public.web_offers ADD COLUMN main_video TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'secondary_video_1') THEN
        ALTER TABLE public.web_offers ADD COLUMN secondary_video_1 TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'secondary_video_2') THEN
        ALTER TABLE public.web_offers ADD COLUMN secondary_video_2 TEXT;
    END IF;

    -- Money columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'cost') THEN
        ALTER TABLE public.web_offers ADD COLUMN cost NUMERIC(15, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'currency') THEN
        ALTER TABLE public.web_offers ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;

    -- Translation columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'title_pl') THEN
        ALTER TABLE public.web_offers ADD COLUMN title_pl TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'title_en') THEN
        ALTER TABLE public.web_offers ADD COLUMN title_en TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'title_es') THEN
        ALTER TABLE public.web_offers ADD COLUMN title_es TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'title_ru') THEN
        ALTER TABLE public.web_offers ADD COLUMN title_ru TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'description_pl') THEN
        ALTER TABLE public.web_offers ADD COLUMN description_pl TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'description_en') THEN
        ALTER TABLE public.web_offers ADD COLUMN description_en TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'description_es') THEN
        ALTER TABLE public.web_offers ADD COLUMN description_es TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'description_ru') THEN
        ALTER TABLE public.web_offers ADD COLUMN description_ru TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'category_pl') THEN
        ALTER TABLE public.web_offers ADD COLUMN category_pl TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'category_en') THEN
        ALTER TABLE public.web_offers ADD COLUMN category_en TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'category_es') THEN
        ALTER TABLE public.web_offers ADD COLUMN category_es TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'category_ru') THEN
        ALTER TABLE public.web_offers ADD COLUMN category_ru TEXT;
    END IF;

    -- Add category column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_offers' AND column_name = 'category') THEN
        ALTER TABLE public.web_offers ADD COLUMN category TEXT;
    END IF;

    -- Add UNIQUE constraint to title for ON CONFLICT to work
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'web_offers_title_key') THEN
        ALTER TABLE public.web_offers ADD CONSTRAINT web_offers_title_key UNIQUE (title);
    END IF;
END $$;

-- 2. Migrate data from projects to web_offers
-- We use the columns identified in the user's DB structure: title, description, image, status, budget
INSERT INTO public.web_offers (
    title, 
    description, 
    main_image, 
    cost, 
    status,
    title_pl,
    description_pl,
    is_active,
    created_at
)
SELECT 
    title, 
    description, 
    image, 
    budget, 
    (CASE WHEN status = 'active' THEN 'open' ELSE status END),
    title, -- Default to Polish
    description, -- Default to Polish
    true,
    COALESCE(created_at, NOW())
FROM public.projects
ON CONFLICT (title) DO UPDATE 
SET 
    description = EXCLUDED.description,
    main_image = EXCLUDED.main_image,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    title_pl = EXCLUDED.title_pl,
    description_pl = EXCLUDED.description_pl;

-- 3. Update title/description if they are null in original but present in projects
-- This is a fallback if needed.

-- 4. Enable RLS
ALTER TABLE public.web_offers ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Anyone can read active web offers" ON web_offers;
CREATE POLICY "Anyone can read active web offers" ON web_offers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage web offers" ON web_offers;
CREATE POLICY "Authenticated users can manage web offers" ON web_offers
  FOR ALL USING (auth.role() = 'authenticated');
