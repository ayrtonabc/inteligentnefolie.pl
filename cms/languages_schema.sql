-- ============================================================================
-- SISTEMA MULTI-IDIOMA / TRADUCCIONES
-- ============================================================================
-- Tablas: languages, website_languages, translations, translated_pages
-- Funcionalidades: gestión de idiomas, traducción automática, SEO multi-idioma
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: IDIOMAS DISPONIBLES (Catálogo global)
-- ============================================================================
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Código ISO del idioma
  code VARCHAR(10) NOT NULL UNIQUE, -- ej: 'es', 'en', 'de', 'pl', 'uk', 'ru', 'fr', 'fi'
  
  -- Información del idioma
  name VARCHAR(100) NOT NULL, -- ej: 'Español', 'English'
  name_native VARCHAR(100) NOT NULL, -- ej: 'Español', 'English', 'Deutsch'
  
  -- Configuración regional
  flag_emoji VARCHAR(10), -- ej: '🇪🇸', '🇬🇧', '🇩🇪'
  flag_svg TEXT, -- URL del flag SVG
  locale VARCHAR(20), -- ej: 'es-ES', 'en-US', 'de-DE'
  
  -- Dirección del texto
  rtl BOOLEAN DEFAULT false, -- Right-to-left (árabe, hebreo)
  
  -- Metadatos
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_is_active ON languages(is_active);

-- Insertar idiomas comunes
INSERT INTO languages (code, name, name_native, flag_emoji, locale, sort_order) VALUES
  ('es', 'Spanish', 'Español', '🇪🇸', 'es-ES', 1),
  ('en', 'English', 'English', '🇬🇧', 'en-GB', 2),
  ('de', 'German', 'Deutsch', '🇩🇪', 'de-DE', 3),
  ('pl', 'Polish', 'Polski', '🇵🇱', 'pl-PL', 4),
  ('fr', 'French', 'Français', '🇫🇷', 'fr-FR', 5),
  ('it', 'Italian', 'Italiano', '🇮🇹', 'it-IT', 6),
  ('pt', 'Portuguese', 'Português', '🇵🇹', 'pt-PT', 7),
  ('uk', 'Ukrainian', 'Українська', '🇺🇦', 'uk-UA', 8),
  ('ru', 'Russian', 'Русский', '🇷🇺', 'ru-RU', 9),
  ('fi', 'Finnish', 'Suomi', '🇫🇮', 'fi-FI', 10),
  ('sv', 'Swedish', 'Svenska', '🇸🇪', 'sv-SE', 11),
  ('nl', 'Dutch', 'Nederlands', '🇳🇱', 'nl-NL', 12),
  ('cs', 'Czech', 'Čeština', '🇨🇿', 'cs-CZ', 13),
  ('ro', 'Romanian', 'Română', '🇷🇴', 'ro-RO', 14),
  ('hu', 'Hungarian', 'Magyar', '🇭🇺', 'hu-HU', 15),
  ('tr', 'Turkish', 'Türkçe', '🇹🇷', 'tr-TR', 16)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- TABLA: IDIOMAS ACTIVADOS POR WEBSITE
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  -- Configuración del idioma en esta web
  is_default BOOLEAN DEFAULT false, -- Idioma por defecto
  is_active BOOLEAN DEFAULT true,
  
  -- URLs y rutas
  url_prefix VARCHAR(10), -- ej: '/en', '/de' (null para idioma por defecto)
  
  -- Estado de traducción
  translation_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (translation_status IN ('pending', 'translating', 'translated', 'edited', 'published')),
  
  -- Progreso de traducción
  total_strings INTEGER DEFAULT 0,
  translated_strings INTEGER DEFAULT 0,
  
  -- SEO específico del idioma
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Fechas importantes
  translated_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_website_language UNIQUE (website_id, language_id),
  CONSTRAINT unique_default_language_per_website UNIQUE (website_id, is_default) 
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_website_languages_website_id ON website_languages(website_id);
CREATE INDEX IF NOT EXISTS idx_website_languages_language_id ON website_languages(language_id);
CREATE INDEX IF NOT EXISTS idx_website_languages_is_active ON website_languages(is_active);
CREATE INDEX IF NOT EXISTS idx_website_languages_status ON website_languages(translation_status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_website_languages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_website_languages_updated_at ON website_languages;
CREATE TRIGGER trg_website_languages_updated_at
  BEFORE UPDATE ON website_languages
  FOR EACH ROW
  EXECUTE FUNCTION update_website_languages_updated_at();

-- ============================================================================
-- TABLA: GRUPOS DE TRADUCCIÓN (Organizar traducciones por contexto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translation_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Identificación del grupo
  group_key VARCHAR(100) NOT NULL, -- ej: 'pages', 'menu', 'components', 'emails'
  name VARCHAR(255) NOT NULL, -- ej: 'Páginas del sitio'
  description TEXT,
  
  -- Metadatos
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_group_key_per_website UNIQUE (website_id, group_key)
);

CREATE INDEX IF NOT EXISTS idx_translation_groups_website_id ON translation_groups(website_id);

-- Grupos por defecto
INSERT INTO translation_groups (website_id, group_key, name, description, sort_order)
SELECT id, 'pages', 'Páginas del sitio', 'Traducciones de páginas completas', 1
FROM websites
ON CONFLICT (website_id, group_key) DO NOTHING;

INSERT INTO translation_groups (website_id, group_key, name, description, sort_order)
SELECT id, 'menu', 'Menú y navegación', 'Traducciones del menú y navegación', 2
FROM websites
ON CONFLICT (website_id, group_key) DO NOTHING;

INSERT INTO translation_groups (website_id, group_key, name, description, sort_order)
SELECT id, 'components', 'Componentes', 'Traducciones de componentes reutilizables', 3
FROM websites
ON CONFLICT (website_id, group_key) DO NOTHING;

INSERT INTO translation_groups (website_id, group_key, name, description, sort_order)
SELECT id, 'forms', 'Formularios', 'Traducciones de formularios y validaciones', 4
FROM websites
ON CONFLICT (website_id, group_key) DO NOTHING;

INSERT INTO translation_groups (website_id, group_key, name, description, sort_order)
SELECT id, 'emails', 'Emails', 'Traducciones de emails y notificaciones', 5
FROM websites
ON CONFLICT (website_id, group_key) DO NOTHING;

-- ============================================================================
-- TABLA: CLAVES DE TRADUCCIÓN (Strings originales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  group_id UUID REFERENCES translation_groups(id) ON DELETE SET NULL,
  
  -- Identificación única de la clave
  key_name VARCHAR(255) NOT NULL, -- ej: 'homepage.title', 'menu.contact'
  
  -- Texto original (idioma por defecto)
  source_text TEXT NOT NULL,
  source_language VARCHAR(10) DEFAULT 'es',
  
  -- Tipo de contenido
  content_type VARCHAR(20) DEFAULT 'text' 
    CHECK (content_type IN ('text', 'html', 'markdown', 'json', 'attribute')),
  
  -- Contexto para el traductor
  context TEXT, -- Descripción de dónde se usa
  max_length INTEGER, -- Longitud máxima recomendada
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_key_per_website UNIQUE (website_id, key_name)
);

CREATE INDEX IF NOT EXISTS idx_translation_keys_website_id ON translation_keys(website_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_group_id ON translation_keys(group_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_is_active ON translation_keys(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_translation_keys_updated_at ON translation_keys;
CREATE TRIGGER trg_translation_keys_updated_at
  BEFORE UPDATE ON translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_website_languages_updated_at();

-- ============================================================================
-- TABLA: TRADUCCIONES (Valores traducidos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  -- Texto traducido
  translated_text TEXT,
  
  -- Estado de la traducción
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'translating', 'translated', 'edited', 'approved')),
  
  -- Metadatos de traducción
  translation_method VARCHAR(20), -- 'ai', 'manual', 'imported'
  ai_provider VARCHAR(50), -- 'openai', 'google', 'deepseek'
  ai_model VARCHAR(100), -- 'gpt-4', etc.
  confidence_score DECIMAL(3,2), -- 0.00 - 1.00
  
  -- Revisión humana
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_translation_per_language UNIQUE (key_id, language_id)
);

CREATE INDEX IF NOT EXISTS idx_translations_key_id ON translations(key_id);
CREATE INDEX IF NOT EXISTS idx_translations_language_id ON translations(language_id);
CREATE INDEX IF NOT EXISTS idx_translations_status ON translations(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_translations_updated_at ON translations;
CREATE TRIGGER trg_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_website_languages_updated_at();

-- ============================================================================
-- TABLA: PÁGINAS TRADUCIDAS (Para SEO y contenido completo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translated_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  -- Identificación de la página
  page_path VARCHAR(500) NOT NULL, -- ej: '/', '/about', '/services'
  page_type VARCHAR(50) DEFAULT 'page', -- 'page', 'post', 'product', 'category'
  
  -- Contenido traducido
  title VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Contenido principal
  content TEXT, -- HTML/Markdown completo
  excerpt TEXT, -- Resumen
  
  -- SEO avanzado
  canonical_url TEXT,
  hreflang_alternate JSONB, -- { "en": "/en/page", "de": "/de/seite" }
  
  -- Estado
  status VARCHAR(20) DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Traducción
  translation_method VARCHAR(20),
  ai_provider VARCHAR(50),
  confidence_score DECIMAL(3,2),
  
  -- Fechas
  translated_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_page_language UNIQUE (website_id, page_path, language_id)
);

CREATE INDEX IF NOT EXISTS idx_translated_pages_website_id ON translated_pages(website_id);
CREATE INDEX IF NOT EXISTS idx_translated_pages_language_id ON translated_pages(language_id);
CREATE INDEX IF NOT EXISTS idx_translated_pages_page_path ON translated_pages(page_path);
CREATE INDEX IF NOT EXISTS idx_translated_pages_status ON translated_pages(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_translated_pages_updated_at ON translated_pages;
CREATE TRIGGER trg_translated_pages_updated_at
  BEFORE UPDATE ON translated_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_website_languages_updated_at();

-- ============================================================================
-- TABLA: LOG DE TRADUCCIONES (Para auditoría)
-- ============================================================================
CREATE TABLE IF NOT EXISTS translation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información de la operación
  operation VARCHAR(50) NOT NULL, -- 'auto_translate', 'manual_edit', 'bulk_translate', 'publish'
  language_id UUID REFERENCES languages(id) ON DELETE SET NULL,
  
  -- Detalles
  items_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Metadatos de la operación
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  duration_ms INTEGER,
  
  -- Errores si los hay
  errors JSONB,
  
  -- Usuario que realizó la acción
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_translation_logs_website_id ON translation_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_translation_logs_created_at ON translation_logs(created_at);

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de progreso de traducción por idioma
CREATE OR REPLACE VIEW translation_progress_view AS
SELECT 
  wl.website_id,
  l.code AS language_code,
  l.name AS language_name,
  l.flag_emoji,
  wl.is_default,
  wl.is_active,
  wl.translation_status,
  wl.total_strings,
  wl.translated_strings,
  CASE 
    WHEN wl.total_strings > 0 
    THEN ROUND((wl.translated_strings::DECIMAL / wl.total_strings) * 100, 1)
    ELSE 0 
  END AS progress_percentage
FROM website_languages wl
JOIN languages l ON l.id = wl.language_id;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener traducción
CREATE OR REPLACE FUNCTION get_translation(
  p_website_id UUID,
  p_key_name VARCHAR(255),
  p_language_code VARCHAR(10)
)
RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
  v_default_language VARCHAR(10);
BEGIN
  -- Obtener idioma por defecto de la web
  SELECT l.code INTO v_default_language
  FROM website_languages wl
  JOIN languages l ON l.id = wl.language_id
  WHERE wl.website_id = p_website_id AND wl.is_default = true
  LIMIT 1;

  -- Buscar traducción en el idioma solicitado
  SELECT t.translated_text INTO v_translation
  FROM translations t
  JOIN translation_keys tk ON tk.id = t.key_id
  JOIN languages l ON l.id = t.language_id
  WHERE tk.website_id = p_website_id
    AND tk.key_name = p_key_name
    AND l.code = p_language_code
    AND t.status IN ('translated', 'edited', 'approved')
  LIMIT 1;
  
  -- Si no hay traducción, devolver texto original
  IF v_translation IS NULL THEN
    SELECT tk.source_text INTO v_translation
    FROM translation_keys tk
    WHERE tk.website_id = p_website_id
      AND tk.key_name = p_key_name
    LIMIT 1;
  END IF;
  
  RETURN v_translation;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contador de traducciones
CREATE OR REPLACE FUNCTION update_translation_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contadores en website_languages
  UPDATE website_languages
  SET 
    total_strings = (
      SELECT COUNT(*) FROM translation_keys 
      WHERE website_id = (SELECT website_id FROM translation_keys WHERE id = NEW.key_id)
    ),
    translated_strings = (
      SELECT COUNT(*) FROM translations t
      JOIN translation_keys tk ON tk.id = t.key_id
      WHERE tk.website_id = (SELECT website_id FROM translation_keys WHERE id = NEW.key_id)
        AND t.language_id = NEW.language_id
        AND t.status IN ('translated', 'edited', 'approved')
    ),
    translated_at = CASE 
      WHEN NEW.status IN ('translated', 'edited', 'approved') AND OLD.status = 'pending' 
      THEN NOW() 
      ELSE translated_at 
    END
  WHERE id = (
    SELECT wl.id FROM website_languages wl
    JOIN translation_keys tk ON tk.website_id = wl.website_id
    WHERE tk.id = NEW.key_id AND wl.language_id = NEW.language_id
    LIMIT 1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_translation_counts ON translations;
CREATE TRIGGER trg_update_translation_counts
  AFTER INSERT OR UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_counts();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Allow all" ON languages FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON website_languages FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON translation_groups FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON translation_keys FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON translations FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON translated_pages FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON translation_logs FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ============================================================================
-- ACTIVAR ADDON DE LANGUAGES
-- ============================================================================
INSERT INTO website_addons (website_id, addon_key, is_active)
SELECT id, 'languages', true FROM websites
ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

SELECT 'Esquema multi-idioma creado correctamente' as status;
