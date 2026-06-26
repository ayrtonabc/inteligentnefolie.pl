// seed_home_page.js
// ====================================================================
// SCRIPT PARA POCKETBASE - LLENAR CMS DE LA PÁGINA DE INICIO (/)
// Website ID: dktsle4yev6syo4
// ====================================================================

const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4'; // ✅ ID CORREGIDO

async function apiRequest(endpoint, method, body, token = null) {
  const url = `${PB_URL}${endpoint}`;
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (token) options.headers['Authorization'] = token;
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function seedHomePage() {
  try {
    console.log('🚀 Iniciando seed de página de inicio (/)...');
    console.log('🌐 Website ID:', WEBSITE_ID);
    
    // 1. Autenticarse
    console.log('\n🔐 Autenticando como superuser...');
    const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = authData.token;
    console.log('✅ Autenticación exitosa');
    
    // 2. Contenido "O nas" para página de inicio (polaco)
    console.log('\n📝 Procesando contenido "O nas" para página de inicio (/)...');
    
    const aboutContent = [
      { section_key: 'about_section_about', content_value: 'O NASZEJ FIRMIE', content_type: 'text', order_index: 1 },
      { section_key: 'about_welcome_title', content_value: 'Jesteśmy HETOR', content_type: 'text', order_index: 2 },
      { section_key: 'about_welcome_text', content_value: 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą HETOR Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.', content_type: 'textarea', order_index: 3 },
      { section_key: 'about_why_item_5', content_value: 'Realizacje od A do Z - pomiar, produkcja, montaż', content_type: 'text', order_index: 4 },
      { section_key: 'about_company_name', content_value: 'HETOR Sp. z o.o.', content_type: 'text', order_index: 5 },
      { section_key: 'about_company_address', content_value: 'ul. Starołęcka 45, 61-361 Poznań', content_type: 'text', order_index: 6 },
      { section_key: 'about_company_phone', content_value: '+48 790 555 900', content_type: 'text', order_index: 7 },
      { section_key: 'about_email_1', content_value: 'biuro@scianki-szklane.com', content_type: 'email', order_index: 8 },
      { section_key: 'about_email_2', content_value: 'biuro@inteligentnefolie.pl', content_type: 'email', order_index: 9 },
      { section_key: 'about_contact_button', content_value: 'Poznaj nas', content_type: 'text', order_index: 10 },
      { section_key: 'about_gallery_1', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', content_type: 'image', order_index: 11 },
      { section_key: 'about_gallery_2', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/mv7c5owp9qxsur1/2_opt_kz1p4ed3i8.webp', content_type: 'image', order_index: 12 },
      { section_key: 'about_gallery_3', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/dejvpa5dl1zvlou/gal_scianki_27_sb_opt_k6klpvv1zk.webp', content_type: 'image', order_index: 13 },
      { section_key: 'about_gallery_4', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/0ayy95pegxq9fu5/5_opt_6st0pkuwzq.webp', content_type: 'image', order_index: 14 },
      { section_key: 'about_gallery_5', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/zrkb3l9wyl75eol/6_opt_pc8qsk8w68.webp', content_type: 'image', order_index: 15 },
      { section_key: 'about_gallery_6', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/t6mepmv1oj3d57h/4_opt_ioo5yfz3sm.webp', content_type: 'image', order_index: 16 },
    ];
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const item of aboutContent) {
      try {
        // 🔍 Buscar si ya existe
        const filter = `website_id="${WEBSITE_ID}" && page_path="/" && language_code="pl" && section_key="${item.section_key}"`;
        const existing = await apiRequest(
          `/api/collections/site_content/records?filter=${encodeURIComponent(filter)}&perPage=1`,
          'GET',
          null,
          token
        );
        
        const recordData = {
          website_id: WEBSITE_ID,
          page_path: '/',
          language_code: 'pl',
          section_key: item.section_key,
          content_type: item.content_type,
          content_value: item.content_value,
          is_active: true,
          order_index: item.order_index || 0
        };
        
        if (existing.items && existing.items.length > 0) {
          // ✏️ Actualizar (sobrescribir)
          await apiRequest(
            `/api/collections/site_content/records/${existing.items[0].id}`,
            'PATCH',
            recordData,
            token
          );
          updated++;
          console.log(`  🔄 Actualizado: ${item.section_key}`);
        } else {
          // ➕ Crear nuevo
          await apiRequest('/api/collections/site_content/records', 'POST', recordData, token);
          inserted++;
          console.log(`  ✅ Insertado: ${item.section_key}`);
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error en ${item.section_key}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡PROCESO COMPLETADO!');
    console.log('='.repeat(50));
    console.log(`📊 Insertados: ${inserted}`);
    console.log(`🔄 Actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

seedHomePage();