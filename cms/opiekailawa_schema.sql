-- Opieka Ilawa 24 - Simplified schema for:
-- - Blog (blog_posts, blog_categories)
-- - Contact form leads (leads)
-- - Website metrics (website_visits)
-- - Website text overrides (site_custom_content)

-- BLOG
-- Use existing cms/blog_schema.sql

-- CONTACT LEADS
-- Use existing cms/leads_table.sql (requires email)

-- SITE CUSTOM CONTENT (single language recommended: pl)
-- Use existing cms/site_custom_content_schema.sql

-- METRICS (client-side pageviews)
CREATE TABLE IF NOT EXISTS public.website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT,
  session_id TEXT,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  is_unique BOOLEAN DEFAULT false,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_visits' AND policyname = 'Enable read access for authenticated'
  ) THEN
    CREATE POLICY "Enable read access for authenticated" ON public.website_visits
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_visits' AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users" ON public.website_visits
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_website_visits_visited_at ON public.website_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_page_path ON public.website_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_id ON public.website_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_website_visits_is_unique ON public.website_visits(is_unique);

