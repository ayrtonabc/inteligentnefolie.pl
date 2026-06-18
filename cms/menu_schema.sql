-- ============================================================================
-- SISTEMA DE MENÚ PROFESIONAL
-- ============================================================================
-- Tablas: menu_categories, menu_products, menu_product_images, menu_addons
-- Funcionalidades: categorías, productos, precios, imágenes, ordenamiento
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: CATEGORÍAS DEL MENÚ
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Imagen de la categoría
  image_url TEXT,
  
  -- Orden y visibilidad
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT menu_categories_website_id_slug_key UNIQUE (website_id, slug)
);

-- Índices para categorías
CREATE INDEX IF NOT EXISTS idx_menu_categories_website_id ON menu_categories(website_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON menu_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_menu_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_categories_updated_at ON menu_categories;
CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_categories_updated_at();

-- ============================================================================
-- TABLA: PRODUCTOS DEL MENÚ
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Precios
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(10, 2), -- Precio tachado (ofertas)
  cost_price DECIMAL(10, 2), -- Precio de costo para métricas
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Inventario
  sku VARCHAR(100),
  barcode VARCHAR(100),
  track_inventory BOOLEAN DEFAULT false,
  inventory_quantity INTEGER DEFAULT 0,
  allow_backorders BOOLEAN DEFAULT false,
  
  -- Opciones del producto
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
  
  -- Información nutricional (opcional)
  calories INTEGER,
  protein DECIMAL(5, 2),
  carbs DECIMAL(5, 2),
  fat DECIMAL(5, 2),
  
  -- Tiempo de preparación
  prep_time_minutes INTEGER,
  
  -- Ordenamiento
  sort_order INTEGER DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT menu_products_website_id_slug_key UNIQUE (website_id, slug)
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_menu_products_website_id ON menu_products(website_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_category_id ON menu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_is_available ON menu_products(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_products_is_featured ON menu_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_products_sort_order ON menu_products(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_products_price ON menu_products(price);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_menu_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_products_updated_at ON menu_products;
CREATE TRIGGER trg_menu_products_updated_at
  BEFORE UPDATE ON menu_products
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_products_updated_at();

-- ============================================================================
-- TABLA: IMÁGENES DE PRODUCTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES menu_products(id) ON DELETE CASCADE,
  
  -- Información de la imagen
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  file_path TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Orden y tipo
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para imágenes
CREATE INDEX IF NOT EXISTS idx_menu_product_images_product_id ON menu_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_menu_product_images_is_primary ON menu_product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_menu_product_images_sort_order ON menu_product_images(sort_order);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_menu_product_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_product_images_updated_at ON menu_product_images;
CREATE TRIGGER trg_menu_product_images_updated_at
  BEFORE UPDATE ON menu_product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_product_images_updated_at();

-- ============================================================================
-- TABLA: EXTRAS/ADICIONALES PARA PRODUCTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_product_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  
  -- Información del extra
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Configuración
  is_available BOOLEAN DEFAULT true,
  max_quantity INTEGER DEFAULT 1,
  
  -- Relación con productos (tabla pivote implícita)
  -- Se puede relacionar múltiples extras con múltiples productos
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla pivote: Productos <-> Extras
CREATE TABLE IF NOT EXISTS menu_product_addon_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES menu_products(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES menu_product_addons(id) ON DELETE CASCADE,
  
  -- Precio específico para este producto (opcional, usa el del addon si null)
  custom_price DECIMAL(10, 2),
  
  -- Configuración específica
  is_required BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_product_addon UNIQUE (product_id, addon_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_product_addon_links_product_id ON menu_product_addon_links(product_id);
CREATE INDEX IF NOT EXISTS idx_menu_product_addon_links_addon_id ON menu_product_addon_links(addon_id);

-- ============================================================================
-- TABLA: OPCIONES/VARIANTES DE PRODUCTOS (ej: tamaños, sabores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES menu_products(id) ON DELETE CASCADE,
  
  -- Tipo de opción
  option_name VARCHAR(100) NOT NULL, -- ej: "Tamaño", "Sabor", "Color"
  option_value VARCHAR(100) NOT NULL, -- ej: "Grande", "Chocolate", "Rojo"
  
  -- Precio adicional por esta opción
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  
  -- Orden
  sort_order INTEGER DEFAULT 0,
  
  -- Disponibilidad
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_product_options_product_id ON menu_product_options(product_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trg_menu_product_options_updated_at ON menu_product_options;
CREATE TRIGGER trg_menu_product_options_updated_at
  BEFORE UPDATE ON menu_product_options
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_products_updated_at();

-- ============================================================================
-- VISTA: MENÚ COMPLETO CON PRODUCTOS
-- ============================================================================
CREATE OR REPLACE VIEW menu_full_view AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  c.description as category_description,
  c.image_url as category_image,
  c.sort_order as category_order,
  c.is_active as category_active,
  
  p.id as product_id,
  p.name as product_name,
  p.slug as product_slug,
  p.description as product_description,
  p.short_description,
  p.price,
  p.compare_price,
  p.is_available,
  p.is_featured,
  p.is_vegetarian,
  p.is_vegan,
  p.is_gluten_free,
  p.is_spicy,
  p.spice_level,
  p.calories,
  p.prep_time_minutes,
  p.sort_order as product_order,
  
  -- Imagen principal
  pi.url as primary_image,
  
  -- Conteo de imágenes
  (SELECT COUNT(*) FROM menu_product_images WHERE product_id = p.id) as image_count
  
FROM menu_categories c
LEFT JOIN menu_products p ON p.category_id = c.id AND p.is_available = true
LEFT JOIN menu_product_images pi ON pi.product_id = p.id AND pi.is_primary = true
WHERE c.is_active = true
ORDER BY c.sort_order, c.name, p.sort_order, p.name;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener productos por categoría
CREATE OR REPLACE FUNCTION get_menu_products_by_category(
  p_website_id UUID,
  p_category_slug VARCHAR
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  product_slug VARCHAR,
  description TEXT,
  price DECIMAL,
  compare_price DECIMAL,
  is_featured BOOLEAN,
  primary_image TEXT,
  spice_level INTEGER,
  prep_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.short_description,
    p.price,
    p.compare_price,
    p.is_featured,
    pi.url,
    p.spice_level,
    p.prep_time_minutes
  FROM menu_products p
  JOIN menu_categories c ON c.id = p.category_id
  LEFT JOIN menu_product_images pi ON pi.product_id = p.id AND pi.is_primary = true
  WHERE p.website_id = p_website_id
    AND c.slug = p_category_slug
    AND p.is_available = true
    AND c.is_active = true
  ORDER BY p.sort_order, p.name;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar productos
CREATE OR REPLACE FUNCTION search_menu_products(
  p_website_id UUID,
  p_query VARCHAR
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  category_name VARCHAR,
  price DECIMAL,
  primary_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    c.name,
    p.price,
    pi.url
  FROM menu_products p
  JOIN menu_categories c ON c.id = p.category_id
  LEFT JOIN menu_product_images pi ON pi.product_id = p.id AND pi.is_primary = true
  WHERE p.website_id = p_website_id
    AND p.is_available = true
    AND (
      p.name ILIKE '%' || p_query || '%'
      OR p.description ILIKE '%' || p_query || '%'
      OR p.short_description ILIKE '%' || p_query || '%'
    )
  ORDER BY p.is_featured DESC, p.sort_order, p.name
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_product_addon_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_product_options ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todo (ajustar según necesidades de autenticación)
CREATE POLICY "Allow all" ON menu_categories FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON menu_products FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON menu_product_images FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON menu_product_addons FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON menu_product_addon_links FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON menu_product_options FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - EJECUTAR MANUALMENTE)
-- ============================================================================
/*
DO $$
DECLARE
  v_website_id UUID;
  v_category_id UUID;
  v_product_id UUID;
BEGIN
  -- Obtener website_id
  SELECT id INTO v_website_id FROM websites LIMIT 1;
  
  IF v_website_id IS NULL THEN
    RAISE EXCEPTION 'No website found';
  END IF;
  
  -- Categoría: Entradas
  INSERT INTO menu_categories (website_id, name, slug, description, sort_order, is_active)
  VALUES (v_website_id, 'Entradas', 'entradas', 'Deliciosas entradas para comenzar', 1, true)
  RETURNING id INTO v_category_id;
  
  -- Producto: Ensalada César
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, is_available, is_vegetarian, calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_id, 'Ensalada César', 'ensalada-cesar',
    'Clásica ensalada César con pollo a la parrilla, crutones y aderezo especial',
    'Ensalada clásica con pollo',
    12.99, true, true, 350, 15, 1
  ) RETURNING id INTO v_product_id;
  
  -- Imagen del producto
  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://example.com/cesar.jpg', 'Ensalada César', true, 0);
  
  -- Categoría: Platos Principales
  INSERT INTO menu_categories (website_id, name, slug, description, sort_order, is_active)
  VALUES (v_website_id, 'Platos Principales', 'platos-principales', 'Nuestros mejores platos', 2, true)
  RETURNING id INTO v_category_id;
  
  -- Producto: Pasta Alfredo
  INSERT INTO menu_products (
    website_id, category_id, name, slug, description, short_description,
    price, compare_price, is_available, is_vegetarian, calories, prep_time_minutes, sort_order
  ) VALUES (
    v_website_id, v_category_id, 'Pasta Alfredo', 'pasta-alfredo',
    'Pasta fettuccine en salsa alfredo cremosa con parmesano',
    'Pasta cremosa con parmesano',
    16.99, 19.99, true, true, 650, 25, 1
  ) RETURNING id INTO v_product_id;
  
  -- Imagen del producto
  INSERT INTO menu_product_images (product_id, url, alt_text, is_primary, sort_order)
  VALUES (v_product_id, 'https://example.com/alfredo.jpg', 'Pasta Alfredo', true, 0);
  
END $$;
*/

-- Mensaje de confirmación
SELECT 'Esquema de menú creado correctamente' as status;
