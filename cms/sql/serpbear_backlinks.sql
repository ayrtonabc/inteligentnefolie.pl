-- =============================================================================
-- BACKLINKS DETECTION AND MANAGEMENT
-- =============================================================================

-- Tabla para almacenar backlinks detectados
CREATE TABLE IF NOT EXISTS serpbear_backlinks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    target_url TEXT,
    domain_authority INTEGER DEFAULT 0,
    domain_rating INTEGER DEFAULT 0,
    anchor_text TEXT,
    link_type TEXT DEFAULT 'dofollow',
    is_nofollow BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_ugc BOOLEAN DEFAULT FALSE,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backlinks_website ON serpbear_backlinks(website_id);
CREATE INDEX idx_backlinks_domain ON serpbear_backlinks(source_url);
CREATE INDEX idx_backlinks_active ON serpbear_backlinks(website_id, is_active);

-- Tabla para paquetes de backlinks disponibles
CREATE TABLE IF NOT EXISTS serpbear_backlink_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    basic_price_usd DECIMAL(10,2) NOT NULL,
    standard_price_usd DECIMAL(10,2),
    premium_price_usd DECIMAL(10,2),
    basic_features TEXT[],
    standard_features TEXT[],
    premium_features TEXT[],
    basic_delivery_days INTEGER DEFAULT 2,
    standard_delivery_days INTEGER DEFAULT 4,
    premium_delivery_days INTEGER DEFAULT 6,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para pedidos de backlinks
CREATE TABLE IF NOT EXISTS serpbear_backlink_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    package_id UUID REFERENCES serpbear_backlink_packages(id),
    package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
    target_url TEXT,
    keywords TEXT[],
    total_price_pln DECIMAL(10,2) NOT NULL,
    delivery_days INTEGER NOT NULL,
    rush_delivery BOOLEAN DEFAULT FALSE,
    rush_fee_pln DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'delivered')),
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    estimated_delivery TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backlink_orders_website ON serpbear_backlink_orders(website_id);
CREATE INDEX idx_backlink_orders_status ON serpbear_backlink_orders(status);

-- =============================================================================
-- FUNCIONES RPC PARA BACKLINKS
-- =============================================================================

-- Detectar backlinks usando datos públicos (simulación con datos de ejemplo)
CREATE OR REPLACE FUNCTION detect_backlinks(p_website_id UUID)
RETURNS TABLE (
    source_url TEXT,
    domain_authority INTEGER,
    anchor_text TEXT,
    link_type TEXT,
    is_nofollow BOOLEAN,
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.source_url,
        b.domain_authority,
        b.anchor_text,
        b.link_type,
        b.is_nofollow,
        b.first_seen_at,
        b.last_seen_at
    FROM serpbear_backlinks b
    WHERE b.website_id = p_website_id
      AND b.is_active = TRUE
    ORDER BY b.domain_authority DESC, b.first_seen_at DESC;
END;
$$;

-- Obtener estadísticas de backlinks
CREATE OR REPLACE FUNCTION get_backlink_stats(p_website_id UUID)
RETURNS TABLE (
    total_backlinks INTEGER,
    unique_domains INTEGER,
    dofollow_count INTEGER,
    nofollow_count INTEGER,
    avg_domain_authority NUMERIC,
    high_quality_count INTEGER,
    new_backlinks_30d INTEGER,
    lost_backlinks_30d INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER AS total_backlinks,
        COUNT(DISTINCT split_part(b.source_url, '/', 3))::INTEGER AS unique_domains,
        COUNT(*) FILTER (WHERE b.link_type = 'dofollow')::INTEGER AS dofollow_count,
        COUNT(*) FILTER (WHERE b.is_nofollow = TRUE)::INTEGER AS nofollow_count,
        COALESCE(AVG(b.domain_authority), 0)::NUMERIC AS avg_domain_authority,
        COUNT(*) FILTER (WHERE b.domain_authority >= 30)::INTEGER AS high_quality_count,
        COUNT(*) FILTER (WHERE b.first_seen_at > NOW() - INTERVAL '30 days')::INTEGER AS new_backlinks_30d,
        COUNT(*) FILTER (WHERE b.last_seen_at < NOW() - INTERVAL '30 days' AND b.is_active = FALSE)::INTEGER AS lost_backlinks_30d
    FROM serpbear_backlinks b
    WHERE b.website_id = p_website_id;
END;
$$;

-- Obtener paquetes de backlinks disponibles
CREATE OR REPLACE FUNCTION get_backlink_packages()
RETURNS TABLE (
    id UUID,
    name TEXT,
    code TEXT,
    description TEXT,
    basic_price_pln DECIMAL(10,2),
    standard_price_pln DECIMAL(10,2),
    premium_price_pln DECIMAL(10,2),
    basic_features TEXT[],
    standard_features TEXT[],
    premium_features TEXT[],
    basic_delivery_days INTEGER,
    standard_delivery_days INTEGER,
    premium_delivery_days INTEGER,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.name,
        bp.code,
        bp.description,
        (bp.basic_price_usd * 4.5 + 15)::DECIMAL(10,2) AS basic_price_pln,
        (COALESCE(bp.standard_price_usd, bp.basic_price_usd * 2) * 4.5 + 25)::DECIMAL(10,2) AS standard_price_pln,
        (COALESCE(bp.premium_price_usd, bp.basic_price_usd * 3.5) * 4.5 + 35)::DECIMAL(10,2) AS premium_price_pln,
        bp.basic_features,
        bp.standard_features,
        bp.premium_features,
        bp.basic_delivery_days,
        bp.standard_delivery_days,
        bp.premium_delivery_days,
        bp.is_active
    FROM serpbear_backlink_packages bp
    WHERE bp.is_active = TRUE;
END;
$$;

-- Crear pedido de backlink
CREATE OR REPLACE FUNCTION create_backlink_order(
    p_website_id UUID,
    p_package_id UUID,
    p_package_type TEXT,
    p_target_url TEXT,
    p_keywords TEXT[],
    p_rush_delivery BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_package RECORD;
    v_base_price DECIMAL(10,2);
    v_delivery_days INTEGER;
    v_rush_fee DECIMAL(10,2) := 0;
    v_total_price DECIMAL(10,2);
    v_order_id UUID;
BEGIN
    SELECT * INTO v_package FROM serpbear_backlink_packages WHERE id = p_package_id AND is_active = TRUE;
    
    IF v_package IS NULL THEN
        RAISE EXCEPTION 'Package not found or inactive';
    END IF;
    
    CASE p_package_type
        WHEN 'basic' THEN
            v_base_price := (v_package.basic_price_usd * 4.5 + 15)::DECIMAL(10,2);
            v_delivery_days := v_package.basic_delivery_days;
        WHEN 'standard' THEN
            v_base_price := (COALESCE(v_package.standard_price_usd, v_package.basic_price_usd * 2) * 4.5 + 25)::DECIMAL(10,2);
            v_delivery_days := v_package.standard_delivery_days;
        WHEN 'premium' THEN
            v_base_price := (COALESCE(v_package.premium_price_usd, v_package.basic_price_usd * 3.5) * 4.5 + 35)::DECIMAL(10,2);
            v_delivery_days := v_package.premium_delivery_days;
        ELSE
            RAISE EXCEPTION 'Invalid package type';
    END CASE;
    
    IF p_rush_delivery THEN
        v_rush_fee := CASE p_package_type
            WHEN 'basic' THEN 20.00
            WHEN 'standard' THEN 40.00
            WHEN 'premium' THEN 60.00
        END;
        v_delivery_days := v_delivery_days / 2;
    END IF;
    
    v_total_price := v_base_price + v_rush_fee;
    
    INSERT INTO serpbear_backlink_orders (
        website_id, package_id, package_type, target_url, keywords,
        total_price_pln, delivery_days, rush_delivery, rush_fee_pln,
        estimated_delivery
    ) VALUES (
        p_website_id, p_package_id, p_package_type, p_target_url, p_keywords,
        v_total_price, v_delivery_days, p_rush_delivery, v_rush_fee,
        NOW() + (v_delivery_days || ' days')::INTERVAL
    ) RETURNING id INTO v_order_id;
    
    RETURN v_order_id;
END;
$$;

-- Obtener pedidos de backlinks
CREATE OR REPLACE FUNCTION get_backlink_orders(p_website_id UUID)
RETURNS TABLE (
    id UUID,
    package_name TEXT,
    package_type TEXT,
    target_url TEXT,
    keywords TEXT[],
    total_price_pln DECIMAL(10,2),
    delivery_days INTEGER,
    rush_delivery BOOLEAN,
    status TEXT,
    ordered_at TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bo.id,
        bp.name AS package_name,
        bo.package_type,
        bo.target_url,
        bo.keywords,
        bo.total_price_pln,
        bo.delivery_days,
        bo.rush_delivery,
        bo.status,
        bo.ordered_at,
        bo.estimated_delivery,
        bo.completed_at
    FROM serpbear_backlink_orders bo
    LEFT JOIN serpbear_backlink_packages bp ON bp.id = bo.package_id
    WHERE bo.website_id = p_website_id
    ORDER BY bo.ordered_at DESC;
END;
$$;

-- Insertar paquetes iniciales de backlinks
INSERT INTO serpbear_backlink_packages (name, code, description, basic_price_usd, standard_price_usd, premium_price_usd, basic_features, standard_features, premium_features, basic_delivery_days, standard_delivery_days, premium_delivery_days)
VALUES 
(
    'Poland Backlinks',
    'POLAND_BLK',
    'Pakiet linków zwrotnych z polskich stron o wysokim DA',
    26.97,
    44.95,
    89.95,
    ARRAY['20 High DA Poland Perfect Backlinks', 'Backlink analysis', 'Delivery 2 days'],
    ARRAY['30 Poland Perfect Backlinks', '25 Homepage Post', '25 TOP E/du Links', '25 HIGH DA Links', '70 social media bookmarks', 'Delivery 4 days'],
    ARRAY['45 Poland Perfect Backlinks', '25 Homepage Post', '35 TOP E/du Links', '60 HIGH DA Links', '100 social media bookmarks', 'Delivery 6 days'],
    2,
    4,
    6
)
ON CONFLICT (code) DO NOTHING;
