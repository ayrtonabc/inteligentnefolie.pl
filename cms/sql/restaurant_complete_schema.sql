-- ============================================================================
-- SISTEMA RESTAURANTE COMPLETO - SEOgrow
-- ============================================================================
-- Módulos: Categorías, Productos, Mesas, Pedidos, Detalle de Pedidos
-- Características: Multiidioma, Tiempo Real, Estados de pedido
-- ============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: CATEGORÍAS DEL MENÚ (existía, mejorada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA: PRODUCTOS DEL MENÚ (existía, mejorada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'PLN',
  sku VARCHAR(100),
  track_inventory BOOLEAN DEFAULT false,
  inventory_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5) DEFAULT 0,
  prep_time_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLA: TRADUCCIONES DE PRODUCTOS (multiidioma)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_product_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES menu_products(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL DEFAULT 'pl',
  name VARCHAR(255),
  description TEXT,
  short_description VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, language)
);

-- ============================================================================
-- TABLA: TRADUCCIONES DE CATEGORÍAS (multiidioma)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_category_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL DEFAULT 'pl',
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, language)
);

-- ============================================================================
-- TABLA: MESAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL,
  number VARCHAR(20) NOT NULL,
  qr_code_url TEXT,
  capacity INTEGER DEFAULT 4,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(website_id, number)
);

-- ============================================================================
-- TABLA: PEDIDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_number VARCHAR(20),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  source VARCHAR(20) DEFAULT 'menu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estados de pedido: pending, confirmed, preparing, ready, delivered, completed, cancelled

-- ============================================================================
-- TABLA: DETALLE DE PEDIDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES menu_products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estados de item: pending, preparing, ready, delivered

-- ============================================================================
-- TABLA: CONFIGURACIÓN DEL RESTAURANTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL UNIQUE,
  restaurant_name VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'PLN',
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_categories_website ON menu_categories(website_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_active ON menu_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort ON menu_categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_products_website ON menu_products(website_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_category ON menu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_products_active ON menu_products(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_products_sort ON menu_products(sort_order);

CREATE INDEX IF NOT EXISTS idx_product_translations ON menu_product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_lang ON menu_product_translations(language);

CREATE INDEX IF NOT EXISTS idx_tables_website ON restaurant_tables(website_id);
CREATE INDEX IF NOT EXISTS idx_tables_active ON restaurant_tables(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_website ON restaurant_orders(website_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON restaurant_orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON restaurant_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON restaurant_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON restaurant_order_items(product_id);

-- ============================================================================
-- TRIGGERS para updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE OR REPLACE TRIGGER menu_categories_updated
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER menu_products_updated
  BEFORE UPDATE ON menu_products
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER product_translations_updated
  BEFORE UPDATE ON menu_product_translations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER category_translations_updated
  BEFORE UPDATE ON menu_category_translations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER restaurant_tables_updated
  BEFORE UPDATE ON restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER restaurant_orders_updated
  BEFORE UPDATE ON restaurant_orders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER restaurant_order_items_updated
  BEFORE UPDATE ON restaurant_order_items
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER restaurant_settings_updated
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();1