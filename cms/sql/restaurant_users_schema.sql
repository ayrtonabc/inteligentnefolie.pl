-- Schema for restaurant users management
-- This table extends the default users table with restaurant-specific roles

-- Add restaurant_id field to users table if not exists
-- Note: This assumes users are already in the auth.users table

-- Restaurant-specific user roles collection
CREATE TABLE IF NOT EXISTS restaurant_staff (
    id VARCHAR(32) PRIMARY KEY DEFAULT generate_v4_id(),
    user_id VARCHAR(32) NOT NULL,
    restaurant_id VARCHAR(32) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'waiter',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_restaurant UNIQUE (user_id, restaurant_id),
    CONSTRAINT valid_role CHECK (role IN ('admin', 'waiter', 'kitchen'))
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_restaurant ON restaurant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_user ON restaurant_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_role ON restaurant_staff(role);

-- Comment on table
COMMENT ON TABLE restaurant_staff IS 'Restaurant-specific staff roles and permissions';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_staff_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp
DROP TRIGGER IF EXISTS trigger_update_restaurant_staff_timestamp ON restaurant_staff;
CREATE TRIGGER trigger_update_restaurant_staff_timestamp
    BEFORE UPDATE ON restaurant_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_staff_timestamp();

-- RLS Policies (uncomment for Supabase)
-- ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Restaurant owners can view their staff"
-- ON restaurant_staff FOR SELECT
-- USING (
--     restaurant_id IN (
--         SELECT website_id FROM websites WHERE user_id = auth.uid()
--     )
-- );

-- CREATE POLICY "Restaurant owners can insert staff"
-- ON restaurant_staff FOR INSERT
-- WITH CHECK (
--     restaurant_id IN (
--         SELECT website_id FROM websites WHERE user_id = auth.uid()
--     )
-- );

-- CREATE POLICY "Restaurant owners can update staff"
-- ON restaurant_staff FOR UPDATE
-- USING (
--     restaurant_id IN (
--         SELECT website_id FROM websites WHERE user_id = auth.uid()
--     )
-- );

-- CREATE POLICY "Restaurant owners can delete staff"
-- ON restaurant_staff FOR DELETE
-- USING (
--     restaurant_id IN (
--         SELECT website_id FROM websites WHERE user_id = auth.uid()
--     )
-- );

-- Add restaurant_role field to existing users table (for PocketBase)
-- This is an alternative approach if you want to store role directly on user record

-- ALTER TABLE users ADD COLUMN IF NOT EXISTS restaurant_id VARCHAR(32);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS restaurant_role VARCHAR(20) DEFAULT 'waiter';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS restaurant_active BOOLEAN DEFAULT true;

-- Create indexes for the new columns
-- CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);
-- CREATE INDEX IF NOT EXISTS idx_users_restaurant_role ON users(restaurant_role);

-- Comments
COMMENT ON COLUMN restaurant_staff.role IS 'Staff role: admin (full access), waiter (orders only), kitchen (kitchen display only)';
COMMENT ON COLUMN restaurant_staff.is_active IS 'Whether the staff member is currently active';

-- Sample data for testing (optional)
-- INSERT INTO restaurant_staff (user_id, restaurant_id, role)
-- VALUES 
--     ('owner-user-id', 'restaurant-id', 'admin'),
--     ('waiter-user-id', 'restaurant-id', 'waiter'),
--     ('kitchen-user-id', 'restaurant-id', 'kitchen')
-- ON CONFLICT (user_id, restaurant_id) DO NOTHING;
