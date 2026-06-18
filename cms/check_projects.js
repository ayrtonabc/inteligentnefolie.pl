const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/ad/Desktop/nuevo/cms/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    console.log('Data:', data);
    console.log('Error:', error);
}

run();
