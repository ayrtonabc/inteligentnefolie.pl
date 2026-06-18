
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://keogtkmrghbvsolxlngi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlb2d0a21yZ2hidnNvbHhsbmdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1MzQwMSwiZXhwIjoyMDkwNDI5NDAxfQ._36xB3v7eqWRuzGhDjnR3ba8v2_Cn3R8igsGl4vPHZ0';
const PB_URL = 'https://pb.fullwork.pl';
const PB_EMAIL = 'kontakt@jestemprogramista.pl';
const PB_PASS = 'Programista2026';
const TENANT_ID = 'dktsle4yev6syo4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('🚀 Migrando productos de la tienda...');
    try {
        const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: PB_EMAIL, password: PB_PASS })
        });
        const authData = await authRes.json();
        const token = authData.token;

        // Crear colección shop_products
        await fetch(`${PB_URL}/api/collections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({
                name: 'shop_products', type: 'base',
                schema: [
                    { name: 'tenant', type: 'relation', required: true, options: { collectionId: 'tenants', maxSelect: 1 } },
                    { name: 'name', type: 'text', required: true },
                    { name: 'slug', type: 'text', required: true },
                    { name: 'description', type: 'editor' },
                    { name: 'price', type: 'number' },
                    { name: 'is_active', type: 'bool' },
                    { name: 'images_json', type: 'json' }
                ],
                listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
            })
        });

        const { data: products, error } = await supabase.from('shop_products').select('*, images:shop_product_images(url)');
        if (error) {
            console.warn('No se encontraron productos en Supabase.');
            return;
        }

        console.log(`📤 Subiendo ${products.length} productos...`);
        for (const p of products) {
            const { id, created_at, updated_at, images, ...clean } = p;
            clean.tenant = TENANT_ID;
            clean.images_json = images || [];

            await fetch(`${PB_URL}/api/collections/shop_products/records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(clean)
            });
        }
        console.log('✨ Tienda migrada!');
    } catch (e) {
        console.error('❌ ERROR:', e);
    }
}
migrate();
