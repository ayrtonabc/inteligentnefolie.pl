-- ============================================
-- WEBSITE SETTINGS SCHEMA
-- Configuración global del sitio web
-- ============================================

-- Tabla principal de configuraciones
CREATE TABLE IF NOT EXISTS website_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    
    -- General
    website_url VARCHAR(500), -- URL de la web pública
    logo_url TEXT,
    favicon_url TEXT,
    
    -- Visibilidad / Mantenimiento
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT DEFAULT 'Estamos en mantenimiento. Volveremos pronto.',
    maintenance_allow_admin BOOLEAN DEFAULT true,
    
    -- Integraciones / Analytics
    analytics_id VARCHAR(50), -- Google Analytics G-XXXXXXX
    search_console_code VARCHAR(100), -- Código de verificación
    pixel_id VARCHAR(50), -- Facebook Pixel ID
    custom_scripts TEXT, -- Scripts personalizados
    
    -- SEO Global
    seo_title VARCHAR(70) DEFAULT 'Mi Sitio Web',
    seo_description VARCHAR(160),
    seo_image_url TEXT, -- Imagen OG por defecto
    
    -- Avanzado / Regional
    language VARCHAR(10) DEFAULT 'pl', -- Idioma principal
    timezone VARCHAR(50) DEFAULT 'Europe/Warsaw', -- Zona horaria
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY', -- Formato de fecha
    
    -- SerpBear Self-Hosted Configuration
    serpbear_enabled BOOLEAN DEFAULT false,
    serpbear_url VARCHAR(500), -- URL de la instancia SerpBear (ej: https://serp.misitio.com)
    serpbear_api_key VARCHAR(255), -- API key de SerpBear
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(website_id)
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_website_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS website_settings_updated_at_trigger ON website_settings;
CREATE TRIGGER website_settings_updated_at_trigger
    BEFORE UPDATE ON website_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_website_settings_updated_at();

-- Row Level Security
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON website_settings;
CREATE POLICY "Allow all" ON website_settings FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Crear configuración por defecto al crear un nuevo website
CREATE OR REPLACE FUNCTION create_default_website_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO website_settings (website_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS website_created_settings_trigger ON websites;
CREATE TRIGGER website_created_settings_trigger
    AFTER INSERT ON websites
    FOR EACH ROW
    EXECUTE FUNCTION create_default_website_settings();

-- ============================================
-- BUCKET STORAGE PARA LOGOS Y FAVICONS
-- ============================================

-- Nota: Ejecutar esto en Storage de Supabase
-- Crear bucket "website-assets" si no existe
-- Política: permitir uploads autenticados

/*
En Supabase Dashboard > Storage:
1. Crear bucket "website-assets"
2. Configurar políticas:
   - SELECT: public (para que el logo sea accesible)
   - INSERT: authenticated
   - DELETE: authenticated
*/
