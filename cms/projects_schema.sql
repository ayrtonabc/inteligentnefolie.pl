-- ============================================================================
-- SISTEMA DE PORTFOLIO / PROYECTOS
-- ============================================================================
-- Tablas: project_categories, projects, project_images
-- Funcionalidades: categorías, proyectos, imágenes, orden visual
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: CATEGORÍAS DE PROYECTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Visual
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(100),
  image_url TEXT,
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_category_slug_per_website UNIQUE (website_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_project_categories_website_id ON project_categories(website_id);
CREATE INDEX IF NOT EXISTS idx_project_categories_is_active ON project_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_project_categories_sort_order ON project_categories(sort_order);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_project_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_project_categories_updated_at ON project_categories;
CREATE TRIGGER trg_project_categories_updated_at
  BEFORE UPDATE ON project_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_project_categories_updated_at();

-- ============================================================================
-- TABLA: PROYECTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,
  
  -- Información básica
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Contenido detallado
  content TEXT, -- Markdown/HTML para descripción completa
  
  -- Metadatos del proyecto
  client_name VARCHAR(255),
  completion_date DATE,
  project_url VARCHAR(500),
  repository_url VARCHAR(500),
  
  -- Estado
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Configuración de visualización
  layout VARCHAR(20) DEFAULT 'standard' CHECK (layout IN ('standard', 'fullscreen', 'minimal', 'gallery')),
  sort_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Estadísticas
  view_count INTEGER DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_project_slug_per_website UNIQUE (website_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_website_id ON projects(website_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_categories_updated_at();

-- Trigger para published_at
CREATE OR REPLACE FUNCTION set_projects_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_published_at ON projects;
CREATE TRIGGER trg_projects_published_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_projects_published_at();

-- ============================================================================
-- TABLA: IMÁGENES DE PROYECTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Información de la imagen
  url TEXT NOT NULL,
  storage_path TEXT, -- Path en Supabase Storage
  
  -- Metadatos
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  
  -- Configuración
  is_primary BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  caption TEXT,
  alt_text VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  -- Constraints
  -- CONSTRAINT unique_primary_image_per_project UNIQUE (project_id, is_primary)
);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_is_primary ON project_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_project_images_sort_order ON project_images(sort_order);

-- ============================================================================
-- TABLA: TECNOLOGÍAS/TAGS DE PROYECTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(7) DEFAULT '#6B7280',
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_tech_name_per_website UNIQUE (website_id, name)
);

CREATE INDEX IF NOT EXISTS idx_project_technologies_website_id ON project_technologies(website_id);

-- ============================================================================
-- TABLA RELACIONAL: PROYECTOS ↔ TECNOLOGÍAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_technology_links (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES project_technologies(id) ON DELETE CASCADE,
  
  PRIMARY KEY (project_id, technology_id)
);

-- ============================================================================
-- VISTA: PROYECTOS COMPLETOS CON IMÁGENES
-- ============================================================================
CREATE OR REPLACE VIEW projects_full_view AS
SELECT 
  p.*,
  pc.name as category_name,
  pc.slug as category_slug,
  pc.color as category_color,
  
  -- Imagen principal
  (SELECT url FROM project_images WHERE project_id = p.id AND is_primary = true LIMIT 1) as primary_image_url,
  
  -- Conteo de imágenes
  (SELECT COUNT(*) FROM project_images WHERE project_id = p.id) as images_count,
  
  -- Tecnologías como array
  (SELECT ARRAY_AGG(pt.name) 
   FROM project_technology_links ptl 
   JOIN project_technologies pt ON pt.id = ptl.technology_id 
   WHERE ptl.project_id = p.id) as technologies

FROM projects p
LEFT JOIN project_categories pc ON pc.id = p.category_id
WHERE p.status = 'published'
ORDER BY p.is_featured DESC, p.sort_order, p.created_at DESC;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para incrementar contador de vistas
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects SET view_count = view_count + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technology_links ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Allow all" ON project_categories;
CREATE POLICY "Allow all" ON project_categories FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON projects;
CREATE POLICY "Allow all" ON projects FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON project_images;
CREATE POLICY "Allow all" ON project_images FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON project_technologies;
CREATE POLICY "Allow all" ON project_technologies FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON project_technology_links;
CREATE POLICY "Allow all" ON project_technology_links FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ============================================================================
-- ACTIVAR ADDON DE PORTFOLIO
-- ============================================================================
INSERT INTO website_addons (website_id, addon_key, is_active)
SELECT id, 'portfolio', true FROM websites
ON CONFLICT (website_id, addon_key) DO UPDATE SET is_active = true;

SELECT 'Esquema de portfolio/proyectos creado correctamente' as status;
