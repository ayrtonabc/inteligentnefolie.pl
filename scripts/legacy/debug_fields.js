const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function debug() {
  console.log('🔍 Verificando campos de cms_pages...\n');

  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');

  const pagesRes = await fetch(`${PB_URL}/api/collections/cms_pages/records?perPage=1`, {
    headers: { 'Authorization': token }
  });
  const pagesData = await pagesRes.json();

  if (pagesData.items && pagesData.items.length > 0) {
    console.log('📋 Campos del primer registro:');
    const page = pagesData.items[0];
    console.log(page);
  } else {
    console.log('❌ No hay páginas');
  }
}

debug().catch(console.error);