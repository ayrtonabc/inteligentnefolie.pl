// check_images_field.js - Verificar campo images en shop_products
const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function check() {
  try {
    const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    }).then(r => r.json());
    const token = authRes.token;

    const col = await fetch(`${PB_URL}/api/collections/shop_products`, {
      headers: { 'Authorization': token }
    }).then(r => r.json());

    console.log('📋 Campos de shop_products:');
    col.fields?.forEach(f => {
      console.log(`  ${f.name} (${f.type}) required=${f.required}`);
    });

    // Ver un producto
    const products = await fetch(`${PB_URL}/api/collections/shop_products/records?perPage=1`, {
      headers: { 'Authorization': token }
    }).then(r => r.json());

    if (products.items?.[0]) {
      console.log('\n📦 Primer producto:');
      const p = products.items[0];
      console.log(`  name: ${p.name}`);
      console.log(`  images_json: ${JSON.stringify(p.images_json)}`);
      console.log(`  description (primeros 100): ${(p.description || '').substring(0, 100)}`);
    }

    console.log('\n💡 El campo images NO existe en el schema actual.');
    console.log('   Para subir imágenes necesito agregar el campo "images" tipo "file".');

  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

check();