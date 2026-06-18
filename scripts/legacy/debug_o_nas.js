const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4';

async function debugPages() {
  console.log('🔍 Buscando páginas en cms_pages...\n');
  
  // Auth
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');
  
  // Buscar TODAS las páginas
  console.log('📋 Todas las páginas en cms_pages:');
  const pages = await fetch(`${PB_URL}/api/collections/cms_pages/records?perPage=50`, {
    headers: { 'Authorization': token }
  });
  const pagesData = await pages.json();
  
  if (pagesData.items && pagesData.items.length > 0) {
    pagesData.items.forEach(p => {
      console.log(`  - "${p.title}" | path: ${p.path} | website_id: ${p.website_id} | id: ${p.id}`);
    });
  } else {
    console.log('  ❌ No hay páginas en cms_pages');
  }
  
  console.log('\n📋 Buscando en site_content para /o-nas:');
  const content = await fetch(
    `${PB_URL}/api/collections/site_content/records?filter=page_path="/o-nas"&perPage=1`,
    { headers: { 'Authorization': token } }
  );
  const contentData = await content.json();
  console.log('  Resultados:', contentData.items?.length || 0);
  
  // Crear página /o-nas si no existe
  console.log('\n📝 Creando página /o-nas...');
  const createRes = await fetch(`${PB_URL}/api/collections/cms_pages/records`, {
    method: 'POST',
    headers: { 
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'O nas',
      path: '/o-nas',
      slug: 'o-nas',
      language_code: 'pl',
      website_id: WEBSITE_ID,
      is_published: true
    })
  });
  const createData = await createRes.json();
  
  if (createRes.ok) {
    console.log('✅ Página /o-nas creada:', createData.id);
  } else {
    console.log('ℹ️ Error o ya existe:', createData.message || createRes.status);
  }
}

debugPages().catch(console.error);