-- Add project_id column to web_offers table
ALTER TABLE web_offers 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
