-- ============================================
-- SERPBEAR KEYWORD RANK TRACKING SCHEMA
-- Integración con SerpBear para tracking de keywords
-- ============================================

-- Tabla de keywords a trackear
CREATE TABLE IF NOT EXISTS serpbear_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    
    keyword VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    device VARCHAR(10) DEFAULT 'desktop' CHECK (device IN ('desktop', 'mobile')),
    location VARCHAR(10) DEFAULT 'pl',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(website_id, keyword, domain, device)
);

-- Tabla de posiciones históricas
CREATE TABLE IF NOT EXISTS serpbear_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES serpbear_keywords(id) ON DELETE CASCADE,
    
    position INTEGER NOT NULL CHECK (position > 0),
    url TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(keyword_id, date)
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_serpbear_keywords_website ON serpbear_keywords(website_id);
CREATE INDEX IF NOT EXISTS idx_serpbear_positions_keyword ON serpbear_positions(keyword_id);
CREATE INDEX IF NOT EXISTS idx_serpbear_positions_date ON serpbear_positions(date);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_serpbear_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS serpbear_keywords_updated_at_trigger ON serpbear_keywords;
CREATE TRIGGER serpbear_keywords_updated_at_trigger
    BEFORE UPDATE ON serpbear_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_serpbear_keywords_updated_at();

-- Row Level Security
ALTER TABLE serpbear_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE serpbear_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON serpbear_keywords;
CREATE POLICY "Allow all" ON serpbear_keywords FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON serpbear_positions;
CREATE POLICY "Allow all" ON serpbear_positions FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
