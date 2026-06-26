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

  // Ver la colección cms_pages
  const colRes = await fetch(`${PB_URL}/api/collections/cms_pages`, {
    headers: { 'Authorization': token }
  });
  const colData = await colRes.json();
  console.log('📋 Colección cms_pages:', JSON.stringify(colData, null, 2));
}

debug().catch(console.error);