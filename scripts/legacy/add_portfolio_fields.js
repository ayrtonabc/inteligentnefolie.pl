const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const COLLECTION_ID = 'pbc_2839487264';

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

  console.log('📦 Agregando campos a portfolio_projects...\n');

  const fields = [
    { name: 'website_id', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'slug', type: 'text' },
    { name: 'short_description', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'content', type: 'json' },
    { name: 'category_id', type: 'text' },
    { name: 'client_name', type: 'text' },
    { name: 'completion_date', type: 'date' },
    { name: 'project_url', type: 'url' },
    { name: 'repository_url', type: 'url' },
    { name: 'status', type: 'select', options: { values: ['draft', 'published', 'archived'] } },
    { name: 'is_featured', type: 'bool' },
    { name: 'layout', type: 'text' },
    { name: 'image_before', type: 'file' },
    { name: 'image_after', type: 'file' },
    { name: 'video_url', type: 'url' },
    { name: 'image_url', type: 'url' },
    { name: 'thumbnail_url', type: 'url' },
  ];

  for (const field of fields) {
    try {
      const res = await fetch(`${PB_URL}/api/collections/${COLLECTION_ID}`, {
        method: 'PATCH',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: [field] })
      });
      const data = await res.json();
      if (data.fields) {
        console.log(`  ✅ ${field.name}`);
      } else {
        console.log(`  ⚠️ ${field.name}: ${data.message || 'ya existe'}`);
      }
    } catch (e) {
      console.log(`  ❌ ${field.name}: ${e.message}`);
    }
  }

  console.log('\n✅ Listo!');
}

main().catch(console.error);