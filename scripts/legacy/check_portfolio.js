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

  console.log('📦 Schema de portfolio_projects:\n');
  const schema = await fetch(`${PB_URL}/api/collections/portfolio_projects`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  schema.fields?.forEach(f => console.log(`  ${f.name} (${f.type})`));

  console.log('\n📦 Proyectos:\n');
  const projects = await fetch(`${PB_URL}/api/collections/portfolio_projects/records?perPage=1`, {
    headers: { Authorization: token }
  }).then(r => r.json());

  if (projects.items?.[0]) {
    console.log(JSON.stringify(projects.items[0], null, 2));
  }
}

main().catch(console.error);