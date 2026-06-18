-- ============================================
-- SISTEMA ECOMMERCE - TABLAS PARA SUPABASE
-- ============================================

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS shop_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    track_stock BOOLEAN DEFAULT true,
    allow_backorders BOOLEAN DEFAULT false,
    weight DECIMAL(8,2),
    dimensions JSONB,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    featured BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    category_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    attributes JSONB DEFAULT '{}',
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de variantes de productos
CREATE TABLE IF NOT EXISTS shop_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    options JSONB NOT NULL,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS shop_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    accepts_marketing BOOLEAN DEFAULT false,
    addresses JSONB DEFAULT '[]',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES shop_customers(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_first_name TEXT,
    customer_last_name TEXT,
    customer_phone TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed')),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_total DECIMAL(10,2) DEFAULT 0,
    shipping_total DECIMAL(10,2) DEFAULT 0,
    tax_total DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    discount_code TEXT,
    notes TEXT,
    customer_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS shop_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_payment_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    card_last_four TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de configuración de envíos
CREATE TABLE IF NOT EXISTS shop_shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT '{}',
    regions TEXT[] DEFAULT '{}',
    postal_codes TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de tarifas de envío
CREATE TABLE IF NOT EXISTS shop_shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES shop_shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2),
    max_order_value DECIMAL(10,2),
    min_weight DECIMAL(8,2),
    max_weight DECIMAL(8,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de configuración de tienda
CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT DEFAULT 'Mi Tienda',
    store_email TEXT,
    store_phone TEXT,
    store_address TEXT,
    currency TEXT DEFAULT 'EUR',
    weight_unit TEXT DEFAULT 'kg',
    dimension_unit TEXT DEFAULT 'cm',
    stripe_enabled BOOLEAN DEFAULT false,
    stripe_public_key TEXT,
    stripe_secret_key TEXT,
    stripe_webhook_secret TEXT,
    tax_included_in_prices BOOLEAN DEFAULT false,
    tax_rate DECIMAL(5,2) DEFAULT 21.00,
    free_shipping_threshold DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de historial de actividad de pedidos
CREATE TABLE IF NOT EXISTS shop_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de items de pedidos
CREATE TABLE IF NOT EXISTS shop_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agregar columna sales_count si no existe (para migraciones)
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_featured ON shop_products(featured);
CREATE INDEX IF NOT EXISTS idx_shop_products_slug ON shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_created_at ON shop_products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_product_variants_product ON shop_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_product_variants_sku ON shop_product_variants(sku);

CREATE INDEX IF NOT EXISTS idx_shop_orders_customer ON shop_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status ON shop_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_number ON shop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_payments_order ON shop_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_customers_email ON shop_customers(email);

CREATE INDEX IF NOT EXISTS idx_shop_order_history_order ON shop_order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product ON shop_order_items(product_id);

-- ============================================
-- TRIGGERS PARA updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shop_products_updated_at ON shop_products;
CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON shop_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_categories_updated_at ON shop_categories;
CREATE TRIGGER update_shop_categories_updated_at BEFORE UPDATE ON shop_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_customers_updated_at ON shop_customers;
CREATE TRIGGER update_shop_customers_updated_at BEFORE UPDATE ON shop_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_orders_updated_at ON shop_orders;
CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON shop_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_payments_updated_at ON shop_payments;
CREATE TRIGGER update_shop_payments_updated_at BEFORE UPDATE ON shop_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_product_variants_updated_at ON shop_product_variants;
CREATE TRIGGER update_shop_product_variants_updated_at BEFORE UPDATE ON shop_product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_shipping_zones_updated_at ON shop_shipping_zones;
CREATE TRIGGER update_shop_shipping_zones_updated_at BEFORE UPDATE ON shop_shipping_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_shipping_rates_updated_at ON shop_shipping_rates;
CREATE TRIGGER update_shop_shipping_rates_updated_at BEFORE UPDATE ON shop_shipping_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_settings_updated_at ON shop_settings;
CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_order_history_updated_at ON shop_order_history;
CREATE TRIGGER update_shop_order_history_updated_at BEFORE UPDATE ON shop_order_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shop_order_items_updated_at ON shop_order_items;
CREATE TRIGGER update_shop_order_items_updated_at BEFORE UPDATE ON shop_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para todos los usuarios autenticados (simplificado para panel)
DROP POLICY IF EXISTS "Allow all operations" ON shop_products;
CREATE POLICY "Allow all operations" ON shop_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_categories;
CREATE POLICY "Allow all operations" ON shop_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_product_variants;
CREATE POLICY "Allow all operations" ON shop_product_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_customers;
CREATE POLICY "Allow all operations" ON shop_customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_orders;
CREATE POLICY "Allow all operations" ON shop_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_payments;
CREATE POLICY "Allow all operations" ON shop_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_shipping_zones;
CREATE POLICY "Allow all operations" ON shop_shipping_zones FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_shipping_rates;
CREATE POLICY "Allow all operations" ON shop_shipping_rates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_settings;
CREATE POLICY "Allow all operations" ON shop_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_order_history;
CREATE POLICY "Allow all operations" ON shop_order_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON shop_order_items;
CREATE POLICY "Allow all operations" ON shop_order_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO shop_settings (store_name, currency, tax_rate) 
VALUES ('Mi Tienda', 'EUR', 21.00)
ON CONFLICT DO NOTHING;

INSERT INTO shop_shipping_zones (name, countries, is_active)
VALUES 
    ('España Peninsular', ARRAY['ES'], true),
    ('Islas Baleares', ARRAY['ES'], true),
    ('Islas Canarias', ARRAY['ES'], true),
    ('Resto de Europa', ARRAY['PT', 'FR', 'IT', 'DE', 'NL', 'BE'], true)
ON CONFLICT DO NOTHING;
