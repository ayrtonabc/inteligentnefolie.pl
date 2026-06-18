-- ============================================
-- COMPLETE DATABASE SETUP FOR CMS DASHBOARD
-- ============================================
-- This script creates all necessary tables for the CMS
-- Execute this in Supabase SQL Editor
-- ============================================

-- Function to update updated_at timestamp (used by multiple tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- ============================================
-- 1. LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'website', 'referral', 'social', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all authenticated users" ON leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Trigger
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  client_email TEXT,
  value DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  pipeline TEXT DEFAULT 'sales',
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all authenticated users" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_value ON projects(value);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);

-- Trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all authenticated users" ON tasks
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- 4. TRANSACTIONS TABLE (Accounting)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all authenticated" ON transactions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 5. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 6. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT 'Tailandia CMS',
  company_logo TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  currency TEXT DEFAULT 'EUR',
  primary_color TEXT DEFAULT '#ff477e',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Users can update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO settings (id) VALUES ('00000000-0000-0000-0000-000000000000') 
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Leads
INSERT INTO leads (name, email, phone, message, status, priority) VALUES
  ('John Smith', 'john@example.com', '+1-555-0101', 'Interested in web development services', 'new', 'high'),
  ('Sarah Johnson', 'sarah@company.com', '+1-555-0102', 'Looking for mobile app development', 'contacted', 'medium'),
  ('Mike Wilson', 'mike@business.com', '+1-555-0103', 'Need branding consultation', 'qualified', 'high')
ON CONFLICT DO NOTHING;

-- Sample Projects
INSERT INTO projects (name, client_name, client_email, value, status, priority, stage, expected_close_date) VALUES
  ('Website Redesign', 'Acme Corp', 'contact@acme.com', 50000, 'open', 'high', 'proposal', '2026-02-15'),
  ('Mobile App Development', 'TechStart Inc', 'info@techstart.com', 120000, 'open', 'urgent', 'negotiation', '2026-03-01'),
  ('Brand Identity', 'Creative Studio', 'hello@creative.com', 25000, 'won', 'medium', 'closed', '2026-01-20'),
  ('E-commerce Platform', 'ShopNow LLC', 'sales@shopnow.com', 80000, 'open', 'high', 'qualified', '2026-02-28'),
  ('Marketing Campaign', 'GrowFast', 'team@growfast.com', 15000, 'abandoned', 'low', 'lead', '2026-01-30')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leads', 'projects', 'tasks', 'transactions', 'invoices', 'settings')
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count sample data
SELECT 
  (SELECT COUNT(*) FROM leads) as leads_count,
  (SELECT COUNT(*) FROM projects) as projects_count,
  (SELECT COUNT(*) FROM tasks) as tasks_count;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Go to Supabase Dashboard > Settings > API
-- 2. Click "Reload Schema Cache"
-- 3. Refresh your application
-- 4. Navigate to /dashboard to see real data
-- ============================================
