-- Web Offers Schema
-- Ofertas del sitio web (separadas de proyectos del CMS)

CREATE TABLE IF NOT EXISTS web_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  main_image TEXT NOT NULL, -- Imagen principal
  secondary_image_1 TEXT, -- Primera imagen secundaria
  secondary_image_2 TEXT, -- Segunda imagen secundaria
  cost NUMERIC(15, 2), -- Costo
  currency TEXT DEFAULT 'USD', -- Moneda (USD, EUR, PLN, etc.)
  can_fix BOOLEAN DEFAULT false, -- Si se puede fijar
  category TEXT, -- Categoría (Residencial, Comercial, etc.)
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'abandoned')) NOT NULL, -- Estado: Abierto, Ganado, Abandonado
  start_date DATE, -- Fecha de inicio (si aplica)
  end_date DATE, -- Fecha de fin (si aplica)
  location TEXT, -- Ubicación
  features JSONB, -- Características adicionales (JSON)
  is_featured BOOLEAN DEFAULT false, -- Si está destacada
  order_index INTEGER DEFAULT 0, -- Orden de visualización
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE web_offers ENABLE ROW LEVEL SECURITY;

-- Policies for web_offers
-- Public can read active offers
CREATE POLICY "Anyone can read active web offers" ON web_offers
  FOR SELECT USING (is_active = true);

-- Authenticated users can manage all offers
CREATE POLICY "Authenticated users can manage web offers" ON web_offers
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_web_offers_status ON web_offers(status);
CREATE INDEX IF NOT EXISTS idx_web_offers_category ON web_offers(category);
CREATE INDEX IF NOT EXISTS idx_web_offers_is_featured ON web_offers(is_featured);
CREATE INDEX IF NOT EXISTS idx_web_offers_is_active ON web_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_web_offers_created_at ON web_offers(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_web_offers_updated_at BEFORE UPDATE ON web_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
