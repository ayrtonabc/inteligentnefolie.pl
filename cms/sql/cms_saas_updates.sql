-- ============================================
-- CMS SaaS - Schema Updates for Multi-tenant
-- ============================================

-- 1. AI Usage Logs Collection
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    request_type TEXT DEFAULT 'chat',
    tokens_used INTEGER,
    cost REAL,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_website ON ai_usage_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created);
CREATE INDEX IF NOT EXISTS idx_ai_usage_website_month ON ai_usage_logs(website_id, substr(created, 1, 7));

-- 2. Revalidation Logs Collection
CREATE TABLE IF NOT EXISTS revalidation_logs (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    path TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reval_website ON revalidation_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_reval_created ON revalidation_logs(created);

-- 3. Add role field to users (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'editor';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- 4. Add user role to collection options (for PocketBase auth rules)
-- This is handled via PocketBase admin, but here's the reference

-- 5. Suggested site_settings structure for main_config
/*
{
  "website_url": "https://clientdomain.com",
  "revalidate_token": "unique_token_per_tenant",
  "ai_monthly_limit": 500,
  "gdpr_settings": {
    "isEnabled": true,
    "bannerText": "...",
    "custom_scripts": []
  },
  "analytics_id": "G-XXXXX",
  "pixel_id": "123456789",
  "search_console_code": "<meta name=\"google-site-verification\" content=\"...\" />"
}
*/

-- 6. Add indexes to site_settings for better performance
CREATE INDEX IF NOT EXISTS idx_settings_website ON site_settings(website_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_website_key ON site_settings(website_id, setting_key);