-- ============================================
-- DATABASE MIGRATION - SAFE CLEANUP & SETUP
-- ============================================
-- This script safely drops and recreates tables
-- Execute this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (if they exist)
-- ============================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Drop the update function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- STEP 2: CREATE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- STEP 3: CREATE LEADS TABLE
-- ============================================

CREATE TABLE leads (
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

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users" ON leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: CREATE PROJECTS TABLE
-- ============================================

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  client_email TEXT,
  value NUMERIC(12,2) DEFAULT 0,
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

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_value ON projects(value);
CREATE INDEX idx_projects_lead_id ON projects(lead_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: CREATE TASKS TABLE
-- ============================================

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users" ON tasks
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- STEP 6: CREATE TRANSACTIONS TABLE
-- ============================================

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated" ON transactions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- STEP 7: CREATE INVOICES TABLE
-- ============================================

CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can manage invoices" ON invoices 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- STEP 8: CREATE SETTINGS TABLE
-- ============================================

CREATE TABLE settings (
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

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Users can update settings" ON settings 
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO settings (id) VALUES ('00000000-0000-0000-0000-000000000000');

-- ============================================
-- STEP 9: INSERT SAMPLE DATA
-- ============================================

-- Sample Leads
INSERT INTO leads (name, email, phone, message, status, priority) VALUES
  ('John Smith', 'john@example.com', '+1-555-0101', 'Interested in web development services', 'new', 'high'),
  ('Sarah Johnson', 'sarah@company.com', '+1-555-0102', 'Looking for mobile app development', 'contacted', 'medium'),
  ('Mike Wilson', 'mike@business.com', '+1-555-0103', 'Need branding consultation', 'qualified', 'high');

-- Sample Projects
INSERT INTO projects (name, client_name, client_email, value, status, priority, stage, expected_close_date) VALUES
  ('Website Redesign', 'Acme Corp', 'contact@acme.com', 50000, 'open', 'high', 'proposal', '2026-02-15'),
  ('Mobile App Development', 'TechStart Inc', 'info@techstart.com', 120000, 'open', 'urgent', 'negotiation', '2026-03-01'),
  ('Brand Identity', 'Creative Studio', 'hello@creative.com', 25000, 'won', 'medium', 'closed', '2026-01-20'),
  ('E-commerce Platform', 'ShopNow LLC', 'sales@shopnow.com', 80000, 'open', 'high', 'qualified', '2026-02-28'),
  ('Marketing Campaign', 'GrowFast', 'team@growfast.com', 15000, 'abandoned', 'low', 'lead', '2026-01-30');

-- ============================================
-- STEP 10: VERIFICATION
-- ============================================

-- Check tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('leads', 'projects', 'tasks', 'transactions', 'invoices', 'settings')
ORDER BY table_name;

-- Check data
SELECT 
  'leads' as table_name, COUNT(*) as row_count FROM leads
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- Verify projects table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS!
-- ============================================
-- All tables created successfully
-- Next: Go to Settings > API > Reload Schema Cache
-- Then refresh your application
-- ============================================
