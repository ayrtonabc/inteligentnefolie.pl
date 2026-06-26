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

  console.log('📦 Schema actual de projects:\n');
  const schema = await fetch(`${PB_URL}/api/collections/projects`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  schema.fields?.forEach(f => console.log(`  ${f.name} (${f.type})`));

  const collectionId = schema.id;
  console.log('\n🔄 Agregando campo thumbnail...\n');

  try {
    const res = await fetch(`${PB_URL}/api/collections/${collectionId}`, {
      method: 'PATCH',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: [{ name: 'thumbnail', type: 'file' }] })
    });
    const data = await res.json();
    if (data.fields) {
      console.log('  ✅ thumbnail agregado');
    } else {
      console.log(`  ⚠️ ${data.message || 'ya existe o error'}`);
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
  }
}

main().catch(console.error);