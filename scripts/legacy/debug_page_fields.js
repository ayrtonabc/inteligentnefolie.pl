const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function debug() {
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;

  const pagesRes = await fetch(`${PB_URL}/api/collections/cms_pages/records?perPage=2`, {
    headers: { 'Authorization': token }
  });
  const pagesData = await pagesRes.json();

  console.log('📋 Primeras 2 páginas con TODOS los campos:');
  pagesData.items?.forEach((page, i) => {
    console.log(`\n--- Página ${i + 1} ---`);
    console.log('Campos:', Object.keys(page));
    console.log('Datos:', JSON.stringify(page, null, 2));
  });
}

debug().catch(console.error);