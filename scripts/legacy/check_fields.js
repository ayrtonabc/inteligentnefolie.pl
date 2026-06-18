const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function login() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  return res.json();
}

async function main() {
  const { token } = await login();

  console.log('📦 shop_products fields:\n');
  const sp = await fetch(`${PB_URL}/api/collections/shop_products`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  if (sp.schema) {
    sp.schema.forEach(f => console.log(`  ${f.name} (${f.type})`));
  } else {
    console.log('No schema found');
    console.log(JSON.stringify(sp, null, 2));
  }

  console.log('\n📦 Verificando un producto:\n');
  const prod = await fetch(`${PB_URL}/api/collections/shop_products/records?perPage=1`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  if (prod.items && prod.items[0]) {
    console.log('Keys:', Object.keys(prod.items[0]).join(', '));
  }
}

main().catch(console.error);