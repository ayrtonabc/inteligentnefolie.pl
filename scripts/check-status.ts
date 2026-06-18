import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual loading of .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta URL o Key en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('\n🔍 VERIFICACIÓN DE DATOS CMS\n');
  
  const tables = [
    'site_content', 
    'site_settings', 
    'site_languages', 
    'site_custom_content',
    'blog_posts',
    'popups',
    'projects',
    'web_offers',
    'leads',
    'website_addons',
    'menus'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ ${table.padEnd(20)}: Error - ${error.message}`);
      } else {
        const status = count && count > 0 ? '✅ OK' : '⚠️ VACÍA';
        console.log(`${status} ${table.padEnd(20)}: ${count} registros`);
      }
    } catch (e: any) {
      console.log(`❌ ${table.padEnd(20)}: Exception - ${e.message}`);
    }
  }
  
  console.log('\n--- Fin de verificación ---\n');
}

verify();
