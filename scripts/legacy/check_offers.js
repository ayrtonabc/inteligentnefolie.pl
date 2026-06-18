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
  const WEBSITE_ID = 'dktsle4yev6syo4';

  const collections = ['shop_coupons', 'shop_flash_sales', 'shop_bundles'];

  for (const name of collections) {
    console.log(`\n📦 ${name}:`);
    const schema = await fetch(`${PB_URL}/api/collections/${name}`, {
      headers: { Authorization: token }
    }).then(r => r.json());

    if (schema.schema && schema.schema.length > 0) {
      schema.schema.forEach(f => console.log(`  ${f.name} (${f.type})`));
    } else {
      console.log('  ❌ Schema vacío o sin campos definidos');
    }
  }
}

main().catch(console.error);