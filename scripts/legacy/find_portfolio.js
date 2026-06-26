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

  console.log('📦 Buscando colección de portfolio...\n');

  const names = ['portfolio_projects', 'projects', 'portfolio', 'realizations', 'realizacje'];

  for (const name of names) {
    const res = await fetch(`${PB_URL}/api/collections/${name}`, {
      headers: { Authorization: token }
    });
    if (res.ok) {
      const schema = await res.json();
      console.log(`✅ ${name} (ID: ${schema.id}):`);
      schema.fields?.forEach(f => console.log(`  ${f.name} (${f.type})`));

      const records = await fetch(`${PB_URL}/api/collections/${name}/records?perPage=1`, {
        headers: { Authorization: token }
      }).then(r => r.json());

      console.log(`  Registros: ${records.totalItems || 0}`);
      if (records.items?.[0]) {
        console.log(`  Muestra:`, JSON.stringify(records.items[0], null, 2).substring(0, 800));
      }
      console.log('');
    }
  }
}

main().catch(console.error);