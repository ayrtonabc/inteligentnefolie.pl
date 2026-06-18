
-- ============================================
-- SUPABASE CMS SCHEMA - Complete Setup
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función helper para ejecutar SQL dinámico desde el script
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- ============================================
-- TABLA: site_content
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path VARCHAR(255) NOT NULL,
    section_key VARCHAR(100) NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'text',
    content_value JSONB NOT NULL DEFAULT '{}',
    language_code VARCHAR(10) NOT NULL DEFAULT 'pl',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    UNIQUE(path, section_key, language_code)
);

-- Índices para site_content
CREATE INDEX IF NOT EXISTS idx_site_content_path ON public.site_content(path);
CREATE INDEX IF NOT EXISTS idx_site_content_section_key ON public.site_content(section_key);
CREATE INDEX IF NOT EXISTS idx_site_content_language ON public.site_content(language_code);
CREATE INDEX IF NOT EXISTS idx_site_content_is_active ON public.site_content(is_active);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: site_settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    setting_type VARCHAR(50) NOT NULL DEFAULT 'string',
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    language_code VARCHAR(10) NOT NULL DEFAULT 'pl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true
);

-- Trigger para site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: site_languages
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(50),
    locale VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    flag_icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar idioma por defecto
INSERT INTO public.site_languages (code, name, native_name, is_active, is_default, sort_order)
VALUES ('pl', 'Polish', 'Polski', true, true, 1)
ON CONFLICT (code) DO UPDATE SET 
    is_default = true,
    native_name = EXCLUDED.native_name;

-- ============================================
-- TABLA: site_custom_content
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_custom_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_key VARCHAR(200) NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'pl',
    path VARCHAR(255) DEFAULT '/',
    content_value TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_key, language_code, path)
);

-- Trigger para site_custom_content
DROP TRIGGER IF EXISTS update_site_custom_content_updated_at ON public.site_custom_content;
CREATE TRIGGER update_site_custom_content_updated_at
    BEFORE UPDATE ON public.site_custom_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_custom_content ENABLE ROW LEVEL SECURITY;

-- Políticas para site_content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
CREATE POLICY "Allow public read access"
ON public.site_content FOR SELECT
TO public
USING (is_active = true);

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

-- ============================================
-- PERMISSIONS
-- ============================================
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
