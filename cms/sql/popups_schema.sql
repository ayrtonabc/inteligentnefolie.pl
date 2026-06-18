-- Popups System Schema for Supabase

-- Create popups table
CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'time',
    trigger_value INTEGER DEFAULT 5,
    popup_type VARCHAR(50) NOT NULL DEFAULT 'newsletter',
    title VARCHAR(255),
    content TEXT,
    button_text VARCHAR(100),
    button_url VARCHAR(500),
    background_color VARCHAR(50) DEFAULT '#ffffff',
    text_color VARCHAR(50) DEFAULT '#1f2937',
    button_color VARCHAR(50) DEFAULT '#0ea5e9',
    target_pages TEXT[],
    target_intentions TEXT[],
    is_active BOOLEAN DEFAULT true,
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_popups_website ON popups(website_id);
CREATE INDEX IF NOT EXISTS idx_popups_active ON popups(is_active);
CREATE INDEX IF NOT EXISTS idx_popups_priority ON popups(priority DESC);

-- Enable RLS
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- Create policy for website owners to manage their popups
CREATE POLICY "Website owners can manage their popups"
ON popups
FOR ALL
USING (
    website_id IN (
        SELECT id FROM websites WHERE user_id = auth.uid()
    )
);

-- Popup views tracking
CREATE TABLE IF NOT EXISTS popup_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    popup_id UUID NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_popup_views_popup ON popup_views(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_views_session ON popup_views(session_id);

-- RPC function to get active popups for frontend
CREATE OR REPLACE FUNCTION get_active_popups(p_website_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    trigger_type VARCHAR(50),
    trigger_value INTEGER,
    popup_type VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    button_text VARCHAR(100),
    button_url VARCHAR(500),
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    button_color VARCHAR(50),
    target_pages TEXT[],
    target_intentions TEXT[],
    priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.trigger_type,
        p.trigger_value,
        p.popup_type,
        p.title,
        p.content,
        p.button_text,
        p.button_url,
        p.background_color,
        p.text_color,
        p.button_color,
        p.target_pages,
        p.target_intentions,
        p.priority
    FROM popups p
    WHERE p.website_id = p_website_id
        AND p.is_active = true
    ORDER BY p.priority DESC
    LIMIT 5;
END;
$$;

-- RPC function to record popup view
CREATE OR REPLACE FUNCTION record_popup_view(
    p_popup_id UUID,
    p_session_id VARCHAR(255)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO popup_views (popup_id, session_id)
    VALUES (p_popup_id, p_session_id);
    
    UPDATE popups 
    SET impressions = impressions + 1,
        conversion_rate = CASE 
            WHEN impressions + 1 > 0 THEN 
                ROUND((conversions::DECIMAL / (impressions + 1)) * 100, 2)
            ELSE 0 
        END
    WHERE id = p_popup_id;
END;
$$;

-- RPC function to record popup conversion
CREATE OR REPLACE FUNCTION record_popup_conversion(
    p_popup_id UUID,
    p_session_id VARCHAR(255)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE popup_views 
    SET converted = true, converted_at = NOW()
    WHERE popup_id = p_popup_id 
    AND session_id = p_session_id 
    AND converted = false
    ORDER BY viewed_at DESC
    LIMIT 1;
    
    UPDATE popups 
    SET conversions = conversions + 1,
        conversion_rate = CASE 
            WHEN impressions > 0 THEN 
                ROUND((conversions + 1)::DECIMAL / impressions * 100, 2)
            ELSE 0 
        END
    WHERE id = p_popup_id;
END;
$$;

-- RPC function to get popup stats
CREATE OR REPLACE FUNCTION get_popup_stats(p_website_id UUID)
RETURNS TABLE (
    total_popups BIGINT,
    active_popups BIGINT,
    total_impressions BIGINT,
    total_conversions BIGINT,
    avg_conversion_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(*) FILTER (WHERE p.is_active = true)::BIGINT,
        COALESCE(SUM(p.impressions), 0)::BIGINT,
        COALESCE(SUM(p.conversions), 0)::BIGINT,
        COALESCE(AVG(p.conversion_rate), 0)::DECIMAL(5,2)
    FROM popups p
    WHERE p.website_id = p_website_id;
END;
$$;
