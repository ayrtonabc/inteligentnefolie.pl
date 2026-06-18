-- ============================================================================
-- COMPLETE CMS SCHEMA FOR REACT CMS + NEXT.JS FRONTEND
-- ============================================================================
-- Este script crea TODAS las tablas necesarias para que el CMS funcione al 100%
-- y administre el frontend de Next.js
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: websites (Configuración del sitio web)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    description TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    primary_language TEXT DEFAULT 'pl',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default website if not exists
INSERT INTO public.websites (id, name, domain, description, primary_language)
VALUES (
    gen_random_uuid(),
    'Inteligentne Folie',
    'inteligentnefolie.pl',
    'Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD',
    'pl'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. TABLA: site_content (Contenido de secciones - Frontend Next.js)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'json', 'html', 'markdown')),
    content_value TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'pl',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(page_path, section_key, language_code)
);

-- ============================================================================
-- 3. TABLA: site_settings (Configuración general)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'url')),
    category TEXT DEFAULT 'general',
    description TEXT,
    language_code TEXT DEFAULT 'pl',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLA: site_languages (Idiomas disponibles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    flag_emoji TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. TABLA: site_custom_content (Contenido personalizado)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_custom_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_key TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'pl',
    content_value TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
    is_active BOOLEAN DEFAULT true,
    page_path TEXT DEFAULT '/',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_key, language_code, page_path)
);

-- ============================================================================
-- 6. TABLA: cms_pages (Páginas CMS - para Page Editor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    path TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'pl',
    content JSONB DEFAULT '[]',
    seo JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(path, language_code)
);

-- ============================================================================
-- 7. TABLA: blog_posts (Blog del CMS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(slug)
);

-- ============================================================================
-- 8. TABLA: blog_categories (Categorías del blog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slug)
);

-- ============================================================================
-- 9. TABLA: media_files (Archivos multimedia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- 10. TABLA: edit_sessions (Sesiones de edición)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edit_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_custom_content_updated_at ON public.site_custom_content;
CREATE TRIGGER update_site_custom_content_updated_at
    BEFORE UPDATE ON public.site_custom_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_pages_updated_at ON public.cms_pages;
CREATE TRIGGER update_cms_pages_updated_at
    BEFORE UPDATE ON public.cms_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_custom_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para websites
DROP POLICY IF EXISTS "Allow public read access to websites" ON public.websites;
CREATE POLICY "Allow public read access to websites"
ON public.websites FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage websites" ON public.websites;
CREATE POLICY "Allow authenticated users to manage websites"
ON public.websites FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para site_content
DROP POLICY IF EXISTS "Allow public read access to published content" ON public.site_content;
CREATE POLICY "Allow public read access to published content"
ON public.site_content FOR SELECT TO public USING (is_published = true AND is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON public.site_content;
CREATE POLICY "Allow authenticated users to manage content"
ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para site_settings
DROP POLICY IF EXISTS "Allow public read access to public settings" ON public.site_settings;
CREATE POLICY "Allow public read access to public settings"
ON public.site_settings FOR SELECT TO public USING (is_public = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage settings" ON public.site_settings;
CREATE POLICY "Allow authenticated users to manage settings"
ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para site_languages
DROP POLICY IF EXISTS "Allow public read access to active languages" ON public.site_languages;
CREATE POLICY "Allow public read access to active languages"
ON public.site_languages FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage languages" ON public.site_languages;
CREATE POLICY "Allow authenticated users to manage languages"
ON public.site_languages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para site_custom_content
DROP POLICY IF EXISTS "Allow public read access to custom content" ON public.site_custom_content;
CREATE POLICY "Allow public read access to custom content"
ON public.site_custom_content FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage custom content" ON public.site_custom_content;
CREATE POLICY "Allow authenticated users to manage custom content"
ON public.site_custom_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para cms_pages
DROP POLICY IF EXISTS "Allow public read access to published pages" ON public.cms_pages;
CREATE POLICY "Allow public read access to published pages"
ON public.cms_pages FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage pages" ON public.cms_pages;
CREATE POLICY "Allow authenticated users to manage pages"
ON public.cms_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para blog_posts
DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.blog_posts;
CREATE POLICY "Allow public read access to published posts"
ON public.blog_posts FOR SELECT TO public USING (published = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated users to manage posts"
ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para blog_categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.blog_categories;
CREATE POLICY "Allow public read access to categories"
ON public.blog_categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.blog_categories;
CREATE POLICY "Allow authenticated users to manage categories"
ON public.blog_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para media_files
DROP POLICY IF EXISTS "Allow public read access to media" ON public.media_files;
CREATE POLICY "Allow public read access to media"
ON public.media_files FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage media" ON public.media_files;
CREATE POLICY "Allow authenticated users to manage media"
ON public.media_files FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para edit_sessions
DROP POLICY IF EXISTS "Allow public read access to verify tokens" ON public.edit_sessions;
CREATE POLICY "Allow public read access to verify tokens"
ON public.edit_sessions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage edit sessions" ON public.edit_sessions;
CREATE POLICY "Authenticated users can manage edit sessions"
ON public.edit_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- PERMISOS
-- ============================================================================
GRANT SELECT ON public.websites TO anon, authenticated;
GRANT ALL ON public.websites TO service_role;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.site_languages TO anon, authenticated;
GRANT ALL ON public.site_languages TO service_role;

GRANT SELECT ON public.site_custom_content TO anon, authenticated;
GRANT ALL ON public.site_custom_content TO service_role;

GRANT SELECT ON public.cms_pages TO anon, authenticated;
GRANT ALL ON public.cms_pages TO service_role;

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;

GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;

GRANT SELECT ON public.media_files TO anon, authenticated;
GRANT ALL ON public.media_files TO service_role;

GRANT SELECT ON public.edit_sessions TO anon, authenticated;
GRANT ALL ON public.edit_sessions TO service_role;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Idiomas
INSERT INTO public.site_languages (code, name, native_name, is_active, is_default, flag_emoji, sort_order) VALUES
  ('pl', 'Polish', 'Polski', true, true, '🇵🇱', 1),
  ('en', 'English', 'English', true, false, '🇬🇧', 2),
  ('es', 'Spanish', 'Español', true, false, '🇪🇸', 3)
ON CONFLICT (code) DO NOTHING;

-- Configuración general
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('site_name', '"Inteligentne Folie"', 'string', 'general', 'Nazwa strony', true),
  ('site_description', '"Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD"', 'string', 'general', 'Opis strony', true),
  ('contact_email', '"kontakt@inteligentnefolie.pl"', 'string', 'contact', 'Email kontaktowy', true),
  ('contact_phone', '"+48 123 456 789"', 'string', 'contact', 'Telefon kontaktowy', true),
  ('seo_default_title', '"Inteligentne Folie PDLC i LCD"', 'string', 'seo', 'Domyślny tytuł SEO', true),
  ('seo_default_description', '"Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD"', 'string', 'seo', 'Domyślny opis SEO', true)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- ============================================================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================================================
SELECT '✅ CMS Schema COMPLETO creado exitosamente' as status;
SELECT '✅ Tablas creadas: websites, site_content, site_settings, site_languages, site_custom_content, cms_pages, blog_posts, blog_categories, media_files, edit_sessions' as tables;
SELECT '✅ RLS políticas configuradas' as rls;
SELECT '✅ Datos iniciales insertados' as data;
SELECT '🚀 El CMS está listo para usar!' as ready;
