const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'pbc_2708086759';

async function authSuperuser() {
  const response = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });
  const data = await response.json();
  return data.token;
}

async function debugCollections() {
  try {
    console.log('🚀 Debugging collections...\n');
    
    const token = await authSuperuser();
    console.log('✅ Token obtenido\n');
    
    const collectionsToCheck = [
      'shop_products',
      'products',
      'projects',
      'blog_posts'
    ];
    
    for (const colName of collectionsToCheck) {
      console.log(`\n🔍 [${colName}]`);
      
      // Buscar con website_id nuevo
      const filter = encodeURIComponent(`website_id = "${WEBSITE_ID}"`);
      const data = await fetch(
        `${PB_URL}/api/collections/${colName}/records?filter=${filter}&perPage=5`,
        { headers: { 'Authorization': token } }
      );
      const result = await data.json();
      
      if (result.items && result.items.length > 0) {
        console.log(`✅ Encontrados ${result.items.length} registros (website_id=${WEBSITE_ID})`);
        console.log('   Website ID del primer registro:', result.items[0].website_id);
      } else {
        console.log(`❌ No hay registros con website_id="${WEBSITE_ID}"`);
      }
      
      // Buscar TODOS
      const allData = await fetch(
        `${PB_URL}/api/collections/${colName}/records?perPage=3`,
        { headers: { 'Authorization': token } }
      );
      const allResult = await allData.json();
      
      if (allResult.items && allResult.items.length > 0) {
        console.log(`📊 Total en colección: ${allResult.totalItems}`);
        console.log('   Website IDs encontrados:', allResult.items.map(i => i.website_id).join(', '));
      } else {
        console.log('   📭 Colección vacía');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📌 RESUMEN');
    console.log('='.repeat(50));
    console.log('Si shop_products/projects/blog_posts están vacíos con', WEBSITE_ID);
    console.log('pero tienen datos con el ID anterior, necesitas migrar los datos.');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

debugCollections();