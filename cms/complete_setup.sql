-- ============================================================================
-- SUPABASE CMS COMPLETE SETUP
-- Inteligentne Folie - Website Content Management System
-- ============================================================================
-- Ejecutar este archivo completo en: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: site_content (Contenido Principal del Sitio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'html', 'image', 'link', 'video', 'json')),
    content_value JSONB NOT NULL DEFAULT '{}',
    language_code TEXT DEFAULT 'pl',
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

-- Migration: Add missing columns if table already exists without them
DO $$
BEGIN
    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_content' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.site_content ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_content' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.site_content ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Índices para site_content
CREATE INDEX IF NOT EXISTS idx_site_content_page ON public.site_content(page_path);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section_key);
CREATE INDEX IF NOT EXISTS idx_site_content_language ON public.site_content(language_code);
CREATE INDEX IF NOT EXISTS idx_site_content_is_active ON public.site_content(is_active);
CREATE INDEX IF NOT EXISTS idx_site_content_is_published ON public.site_content(is_published);

-- ============================================================================
-- 2. TABLA: site_settings (Configuración del Sitio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}',
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array', 'url')),
    category TEXT DEFAULT 'general',
    description TEXT,
    language_code TEXT DEFAULT 'pl',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Add missing columns to site_settings if table already exists
DO $$
BEGIN
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- ============================================================================
-- 3. TABLA: site_languages (Idiomas Disponibles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    flag_emoji TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Add missing columns to site_languages if table already exists
DO $$
BEGIN
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_languages' 
        AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.site_languages ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    -- Add flag_emoji column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_languages' 
        AND column_name = 'flag_emoji'
    ) THEN
        ALTER TABLE public.site_languages ADD COLUMN flag_emoji TEXT;
    END IF;
    
    -- Add native_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_languages' 
        AND column_name = 'native_name'
    ) THEN
        ALTER TABLE public.site_languages ADD COLUMN native_name TEXT;
        -- Set default value for existing rows
        UPDATE public.site_languages SET native_name = name WHERE native_name IS NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_languages_active ON public.site_languages(is_active);
CREATE INDEX IF NOT EXISTS idx_site_languages_default ON public.site_languages(is_default);

-- ============================================================================
-- 4. TABLA: site_custom_content (Contenido Personalizado)
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

CREATE INDEX IF NOT EXISTS idx_site_custom_content_key ON public.site_custom_content(content_key);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_lang ON public.site_custom_content(language_code);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_page ON public.site_custom_content(page_path);
CREATE INDEX IF NOT EXISTS idx_site_custom_content_active ON public.site_custom_content(is_active);

-- ============================================================================
-- 5. TABLA: edit_sessions (Sesiones de Edición)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edit_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edit_sessions_token ON public.edit_sessions(token);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_user ON public.edit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_sessions_expires ON public.edit_sessions(expires_at);

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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURIDAD
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_custom_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para site_content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
CREATE POLICY "Allow public read access"
ON public.site_content FOR SELECT
TO public
USING (is_published = true AND is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON public.site_content;
CREATE POLICY "Allow authenticated users to manage content"
ON public.site_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para site_settings
DROP POLICY IF EXISTS "Allow public read access to public settings" ON public.site_settings;
CREATE POLICY "Allow public read access to public settings"
ON public.site_settings FOR SELECT
TO public
USING (is_public = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage settings" ON public.site_settings;
CREATE POLICY "Allow authenticated users to manage settings"
ON public.site_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para site_languages
DROP POLICY IF EXISTS "Allow public read access to active languages" ON public.site_languages;
CREATE POLICY "Allow public read access to active languages"
ON public.site_languages FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage languages" ON public.site_languages;
CREATE POLICY "Allow authenticated users to manage languages"
ON public.site_languages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para site_custom_content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_custom_content;
CREATE POLICY "Allow public read access"
ON public.site_custom_content FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage custom content" ON public.site_custom_content;
CREATE POLICY "Allow authenticated users to manage custom content"
ON public.site_custom_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para edit_sessions
DROP POLICY IF EXISTS "Allow public read access to verify tokens" ON public.edit_sessions;
CREATE POLICY "Allow public read access to verify tokens"
ON public.edit_sessions FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage edit sessions" ON public.edit_sessions;
CREATE POLICY "Authenticated users can manage edit sessions"
ON public.edit_sessions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PERMISOS
-- ============================================================================
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.site_languages TO anon;
GRANT SELECT ON public.site_languages TO authenticated;
GRANT ALL ON public.site_languages TO service_role;

GRANT SELECT ON public.site_custom_content TO anon;
GRANT SELECT ON public.site_custom_content TO authenticated;
GRANT ALL ON public.site_custom_content TO service_role;

GRANT SELECT ON public.edit_sessions TO anon;
GRANT SELECT ON public.edit_sessions TO authenticated;
GRANT ALL ON public.edit_sessions TO service_role;

-- ============================================================================
-- DATOS INICIALES - CONFIGURACIÓN POR DEFECTO
-- ============================================================================

-- Idiomas disponibles
INSERT INTO public.site_languages (code, name, native_name, is_active, is_default, flag_emoji, sort_order) VALUES
  ('pl', 'Polish', 'Polski', true, true, '🇵🇱', 1),
  ('en', 'English', 'English', true, false, '🇬🇧', 2),
  ('es', 'Spanish', 'Español', true, false, '🇪🇸', 3)
ON CONFLICT (code) DO UPDATE SET 
  is_active = EXCLUDED.is_active,
  is_default = CASE WHEN public.site_languages.is_default THEN true ELSE EXCLUDED.is_default END;

-- Configuración general del sitio
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('site_name', '"Inteligentne Folie"', 'string', 'general', 'Nazwa strony', true),
  ('site_description', '"Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD"', 'string', 'general', 'Opis strony', true),
  ('contact_email', '"kontakt@inteligentnefolie.pl"', 'string', 'contact', 'Email kontaktowy', true),
  ('contact_phone', '"+48 123 456 789"', 'string', 'contact', 'Telefon kontaktowy', true),
  ('whatsapp_number', '"48123456789"', 'string', 'contact', 'Numer WhatsApp', true),
  ('business_hours', '"Pn-Pt: 9:00 - 18:00"', 'string', 'contact', 'Godziny pracy', true),
  ('address', '"ul. Przykładowa 123, 00-001 Warszawa"', 'string', 'contact', 'Adres', true),
  ('social_facebook', '"https://facebook.com/inteligentnefolie"', 'url', 'social', 'Facebook', true),
  ('social_instagram', '"https://instagram.com/inteligentnefolie"', 'url', 'social', 'Instagram', true),
  ('social_youtube', '"https://youtube.com/inteligentnefolie"', 'url', 'social', 'YouTube', true),
  ('social_tiktok', '"https://tiktok.com/@inteligentnefolie"', 'url', 'social', 'TikTok', true),
  ('seo_default_title', '"Inteligentne Folie PDLC i LCD"', 'string', 'seo', 'Domyślny tytuł SEO', true),
  ('seo_default_description', '"Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD"', 'string', 'seo', 'Domyślny opis SEO', true),
  ('seo_keywords', '"folia PDLC, folia LCD, inteligentna folia, folia elektrochromowa, smart glass, folia na okna"', 'string', 'seo', 'Słowa kluczowe SEO', true),
  ('seo_author', '"Inteligentne Folie"', 'string', 'seo', 'Autor strony', true),
  ('seo_language', '"pl"', 'string', 'seo', 'Język strony', true),
  ('edit_mode_enabled', 'true', 'boolean', 'general', 'Włącz tryb edycji wizualnej', false),
  ('revalidation_enabled', 'true', 'boolean', 'technical', 'Włącz ISR revalidation', false)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  setting_type = EXCLUDED.setting_type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- DATOS INICIALES - CONTENIDO DE PÁGINAS
-- ============================================================================

-- Home Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/', 'hero_title', 'text', '{"text": "Folia PDLC — Technologia, która zmienia przestrzeń"}', 'pl', 1, true, true),
('/', 'hero_subtitle', 'text', '{"text": "Sterowana elektrycznie folia, która zmienia przezroczystość w dotyk. Do biura, domu, łazienki i każdego wnętrza."}', 'pl', 2, true, true),
('/', 'hero_cta_primary', 'json', '{"text": "Zobacz produkty", "href": "/inteligentne-folie"}', 'pl', 3, true, true),
('/', 'hero_cta_secondary', 'json', '{"text": "Zamów próbkę", "href": "/kontakt"}', 'pl', 4, true, true),
('/', 'features_title', 'text', '{"text": "Dlaczego warto wybrać nasze folie?"}', 'pl', 5, true, true),
('/', 'features_subtitle', 'text', '{"text": "Kompleksowe rozwiązania dla każdego wnętrza"}', 'pl', 6, true, true),
('/', 'products_title', 'text', '{"text": "Nasze produkty"}', 'pl', 7, true, true),
('/', 'products_subtitle', 'text', '{"text": "Wybierz idealną folię dla swojego projektu"}', 'pl', 8, true, true),
('/', 'portfolio_title', 'text', '{"text": "Nasze realizacje"}', 'pl', 9, true, true),
('/', 'portfolio_subtitle', 'text', '{"text": "Zobacz jak folia PDLC transformuje wnętrza w całej Polsce"}', 'pl', 10, true, true),
('/', 'cta_title', 'text', '{"text": "Zamów darmową próbkę folii PDLC"}', 'pl', 11, true, true),
('/', 'cta_subtitle', 'text', '{"text": "Przekonaj się na własne oczy, jak działa technologia PDLC. Wysyłamy próbki za darmo w całej Polsce!"}', 'pl', 12, true, true),
('/', 'cta_button', 'json', '{"text": "Zamów teraz bezpłatnie", "href": "/kontakt"}', 'pl', 13, true, true),
('/', 'faq_title', 'text', '{"text": "Najczęściej zadawane pytania"}', 'pl', 14, true, true),
('/', 'meta_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD - Technologia Przyszłości"}', 'pl', 0, true, true),
('/', 'meta_description', 'text', '{"text": "Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD. Technologia przyszłości dla Twojego domu i biura."}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Products Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/inteligentne-folie', 'hero_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD"}', 'pl', 1, true, true),
('/inteligentne-folie', 'hero_subtitle', 'text', '{"text": "Folia elektryczna na okna i szyby — natychmiastowa prywatność, kontrola światła i nowoczesny design dla Twojego domu, biura lub hotelu."}', 'pl', 2, true, true),
('/inteligentne-folie', 'filters_title', 'text', '{"text": "Filtruj produkty"}', 'pl', 3, true, true),
('/inteligentne-folie', 'calculator_title', 'text', '{"text": "Kalkulator ceny — cięcie na wymiar"}', 'pl', 4, true, true),
('/inteligentne-folie', 'calculator_subtitle', 'text', '{"text": "Podaj wymiary, wybierz rodzaj, a my wyślemy darmową wycenę. Możesz zamówić folię PDLC lub LCD, z montażem lub bez."}', 'pl', 5, true, true),
('/inteligentne-folie', 'comparison_title', 'text', '{"text": "Porównanie: Folia samoprzylepna vs Folia do laminacji"}', 'pl', 6, true, true),
('/inteligentne-folie', 'help_title', 'text', '{"text": "Potrzebujesz pomocy w wyborze?"}', 'pl', 7, true, true),
('/inteligentne-folie', 'help_subtitle', 'text', '{"text": "Nasi eksperci pomogą Ci dobrać idealną folię inteligentną do Twoich potrzeb. Skontaktuj się z nami!"}', 'pl', 8, true, true),
('/inteligentne-folie', 'meta_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD - Sklep"}', 'pl', 0, true, true),
('/inteligentne-folie', 'meta_description', 'text', '{"text": "Kup folię PDLC i LCD. Samoprzylepna i do laminacji. Ceny od 950 zł/m². Darmowa wycena i montaż w całej Polsce."}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Installation Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/montaz-folii-inteligentnej', 'hero_title', 'text', '{"text": "Montaż folii krok po kroku"}', 'pl', 1, true, true),
('/montaz-folii-inteligentnej', 'hero_subtitle', 'text', '{"text": "Profesjonalny montaż folii PDLC i LCD w całej Polsce. Od konsultacji po serwis."}', 'pl', 2, true, true),
('/montaz-folii-inteligentnej', 'steps_title', 'text', '{"text": "Proces montażu krok po kroku"}', 'pl', 3, true, true),
('/montaz-folii-inteligentnej', 'benefits_title', 'text', '{"text": "Dlaczego warto wybrać nasz montaż?"}', 'pl', 4, true, true),
('/montaz-folii-inteligentnej', 'cta_title', 'text', '{"text": "Umów bezpłatny pomiar i wycenę"}', 'pl', 5, true, true),
('/montaz-folii-inteligentnej', 'cta_subtitle', 'text', '{"text": "Nasi eksperci przyjadą do Ciebie, wykonają profesjonalny pomiar i przedstawią szczegółową wycenę"}', 'pl', 6, true, true),
('/montaz-folii-inteligentnej', 'meta_title', 'text', '{"text": "Montaż folii PDLC i LCD - Profesjonalna instalacja"}', 'pl', 0, true, true),
('/montaz-folii-inteligentnej', 'meta_description', 'text', '{"text": "Profesjonalny montaż folii inteligentnych w całej Polsce. 10 lat gwarancji. Bezpłatny pomiar i wycena."}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Realizations Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/realizacje', 'hero_title', 'text', '{"text": "Nasze realizacje"}', 'pl', 1, true, true),
('/realizacje', 'hero_subtitle', 'text', '{"text": "Przesuń suwak aby zobaczyć efekt ON/OFF. Zobacz jak folia inteligentna transformuje wnętrza."}', 'pl', 2, true, true),
('/realizacje', 'meta_title', 'text', '{"text": "Realizacje - Folie PDLC i LCD w akcji"}', 'pl', 0, true, true),
('/realizacje', 'meta_description', 'text', '{"text": "Zobacz nasze realizacje folii inteligentnych PDLC i LCD. Apartamenty, biura, hotele. Zobacz efekt ON/OFF."}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Blog Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/blog', 'hero_title', 'text', '{"text": "Blog"}', 'pl', 1, true, true),
('/blog', 'hero_subtitle', 'text', '{"text": "Aktualności, porady i inspiracje ze świata folii inteligentnych"}', 'pl', 2, true, true),
('/blog', 'meta_title', 'text', '{"text": "Blog - Folie PDLC i LCD"}', 'pl', 0, true, true),
('/blog', 'meta_description', 'text', '{"text": "Blog o foliach inteligentnych PDLC i LCD. Porady, inspiracje, aktualności."}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Contact Page Content
INSERT INTO public.site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active, is_published) VALUES
('/kontakt', 'hero_title', 'text', '{"text": "Skontaktuj się z nami"}', 'pl', 1, true, true),
('/kontakt', 'hero_subtitle', 'text', '{"text": "Masz pytania o folie inteligentne? Chcesz umówić pomiar lub otrzymać wycenę?"}', 'pl', 2, true, true),
('/kontakt', 'meta_title', 'text', '{"text": "Kontakt - Inteligentne Folie"}', 'pl', 0, true, true),
('/kontakt', 'meta_description', 'text', '{"text": "Skontaktuj się z nami. Darmowa wycena. Telefon: +48 123 456 789. Email: kontakt@inteligentnefolie.pl"}', 'pl', 0, true, true)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- ============================================================================
-- CONTENIDO PERSONALIZADO INICIAL
-- ============================================================================
INSERT INTO public.site_custom_content (content_key, language_code, page_path, content_value, content_type, is_active) VALUES
('header_slogan', 'pl', '/', 'Cała Polska i Niemcy', 'text', true),
('footer_copyright', 'pl', '/', '© 2024 Inteligentne Folie. Wszelkie prawa zastrzeżone.', 'text', true),
('footer_company_name', 'pl', '/', 'Inteligentne Folie PDLC i LCD', 'text', true),
('footer_address', 'pl', '/', 'ul. Przykładowa 123, 00-001 Warszawa', 'text', true),
('chat_welcome_message', 'pl', '/', 'Masz pytanie? Napisz do nas!', 'text', true)
ON CONFLICT (content_key, language_code, page_path) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  updated_at = NOW();

-- ============================================================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================================================
SELECT '✅ CMS Schema creado exitosamente' as status;
SELECT '✅ Tablas: site_content, site_settings, site_languages, site_custom_content, edit_sessions' as tables;
SELECT '✅ Políticas RLS configuradas' as rls;
SELECT '✅ Datos iniciales insertados' as data;
SELECT '🚀 Tu CMS está listo para usar!' as ready;
