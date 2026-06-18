const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function fixPageTitles() {
  console.log('🔐 Autenticando...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');

  // Buscar la página "/"
  console.log('📝 Corrigiendo títulos de páginas...');

  // Obtener todas las páginas
  const pagesRes = await fetch(`${PB_URL}/api/collections/cms_pages/records?perPage=100`, {
    headers: { 'Authorization': token }
  });
  const pagesData = await pagesRes.json();

  for (const page of pagesData.items) {
    let newTitle = null;

    if (page.path === '/') {
      newTitle = 'Strona główna';
    } else if (page.path === '/o-nas') {
      newTitle = 'O nas';
    } else if (page.path === '/inteligentne-folie') {
      newTitle = 'Produkty';
    } else if (page.path === '/montaz-folii-inteligentnej') {
      newTitle = 'Usługi';
    } else if (page.path === '/kontakt') {
      newTitle = 'Kontakt';
    }

    if (newTitle && page.title !== newTitle) {
      console.log(`🔄 ${page.path}: "${page.title}" → "${newTitle}"`);
      await fetch(`${PB_URL}/api/collections/cms_pages/records/${page.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
    }
  }

  console.log('\n✅ Títulos corregidos');
}

fixPageTitles().catch(console.error);