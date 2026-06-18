-- Schema for menu_customizations table
-- This table stores the menu customization settings for each restaurant

CREATE TABLE IF NOT EXISTS menu_customizations (
    id VARCHAR(32) PRIMARY KEY DEFAULT generate_v4_id(),
    website_id VARCHAR(32) NOT NULL,
    
    -- Order customization
    category_order JSONB DEFAULT '[]'::jsonb,
    product_orders JSONB DEFAULT '{}'::jsonb,
    
    -- Style customization
    styles JSONB DEFAULT '{
        "background_color": "#ffffff",
        "card_bg_color": "#f9fafb",
        "text_color": "#374151",
        "heading_color": "#111827",
        "button_color": "#3b82f6",
        "accent_color": "#10b981"
    }'::jsonb,
    
    -- Font customization
    fonts JSONB DEFAULT '{
        "family": "Inter, sans-serif",
        "heading_size": 16,
        "body_size": 14
    }'::jsonb,
    
    -- Visibility settings
    visibility JSONB DEFAULT '{
        "show_prices": true,
        "show_descriptions": true,
        "show_images": true,
        "show_badges": true
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_website_customization UNIQUE (website_id)
);

-- Index for faster lookups by website_id
CREATE INDEX IF NOT EXISTS idx_menu_customizations_website_id 
ON menu_customizations(website_id);

-- Index for updated_at queries
CREATE INDEX IF NOT EXISTS idx_menu_customizations_updated_at 
ON menu_customizations(updated_at DESC);

-- Comment on table
COMMENT ON TABLE menu_customizations IS 'Stores menu customization settings for restaurants including order, styles, fonts, and visibility options';

-- Comments on columns
COMMENT ON COLUMN menu_customizations.category_order IS 'Array of category IDs in the desired display order';
COMMENT ON COLUMN menu_customizations.product_orders IS 'Object mapping category IDs to arrays of product IDs in desired order';
COMMENT ON COLUMN menu_customizations.styles IS 'JSON object containing color settings for menu display';
COMMENT ON COLUMN menu_customizations.fonts IS 'JSON object containing font family and size settings';
COMMENT ON COLUMN menu_customizations.visibility IS 'JSON object controlling which elements are visible in the menu';

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_customizations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp on row update
DROP TRIGGER IF EXISTS trigger_update_menu_customizations_timestamp ON menu_customizations;
CREATE TRIGGER trigger_update_menu_customizations_timestamp
    BEFORE UPDATE ON menu_customizations
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_customizations_timestamp();

-- Row Level Security (RLS) - Enable if using Supabase
-- ALTER TABLE menu_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (uncomment and adjust for your auth setup)
-- CREATE POLICY "Users can view their website menu customizations"
-- ON menu_customizations FOR SELECT
-- USING (
--     website_id IN (
--         SELECT w.id FROM websites w
--         WHERE w.user_id = auth.uid()
--     )
-- );

-- CREATE POLICY "Users can update their website menu customizations"
-- ON menu_customizations FOR UPDATE
-- USING (
--     website_id IN (
--         SELECT w.id FROM websites w
--         WHERE w.user_id = auth.uid()
--     )
-- );

-- CREATE POLICY "Users can insert menu customizations for their websites"
-- ON menu_customizations FOR INSERT
-- WITH CHECK (
--     website_id IN (
--         SELECT w.id FROM websites w
--         WHERE w.user_id = auth.uid()
--     )
-- );

-- Insert sample data (optional - for testing)
-- INSERT INTO menu_customizations (website_id, category_order, product_orders, styles, fonts, visibility)
-- VALUES (
--     'your-website-id',
--     '["category-id-1", "category-id-2", "category-id-3"]'::jsonb,
--     '{}'::jsonb,
--     '{"background_color": "#ffffff", "card_bg_color": "#f9fafb", "text_color": "#374151", "heading_color": "#111827", "button_color": "#3b82f6", "accent_color": "#10b981"}'::jsonb,
--     '{"family": "Inter, sans-serif", "heading_size": 16, "body_size": 14}'::jsonb,
--     '{"show_prices": true, "show_descriptions": true, "show_images": true, "show_badges": true}'::jsonb
-- )
-- ON CONFLICT (website_id) DO NOTHING;