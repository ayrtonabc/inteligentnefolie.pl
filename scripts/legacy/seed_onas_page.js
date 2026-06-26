// seed_onas_page.js
// ====================================================================
// SCRIPT PARA POCKETBASE - CONFIGURAR PÁGINA /o-nas EN cms_pages
// Website ID: dktsle4yev6syo4
// ====================================================================

const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4';

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

async function seedONasPage() {
  try {
    console.log('🚀 Iniciando seed de página /o-nas...');
    console.log('🌐 Website ID:', WEBSITE_ID);
    
    // 1. Autenticarse como superuser
    console.log('\n🔐 Autenticando como superuser...');
    const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = authData.token;
    console.log('✅ Autenticación exitosa');
    
    // 2. Verificar/crear página en cms_pages
    console.log('\n📋 Verificando página /o-nas en cms_pages...');
    const existingPage = await apiRequest(
      `/api/collections/cms_pages/records?filter=website_id="${WEBSITE_ID}"&&path="/o-nas"&perPage=1`,
      'GET',
      null,
      token
    );
    
    let pageId;
    if (existingPage.items && existingPage.items.length > 0) {
      pageId = existingPage.items[0].id;
      console.log('✅ Página /o-nas ya existe en cms_pages');
      
      // 🔁 Actualizar metadatos si es necesario
      await apiRequest(
        `/api/collections/cms_pages/records/${pageId}`,
        'PATCH',
        {
          title: 'O nas',
          slug: 'o-nas',
          language_code: 'pl',
          is_published: true
        },
        token
      );
      console.log('  🔄 Metadatos de página actualizados');
    } else {
      // ➕ Crear nueva página
      console.log('\n📝 Creando página /o-nas en cms_pages...');
      const newPage = await apiRequest('/api/collections/cms_pages/records', 'POST', {
        title: 'O nas',
        path: '/o-nas',
        slug: 'o-nas',
        language_code: 'pl',
        website_id: WEBSITE_ID,
        is_published: true,
        meta_title: 'O nas - HETOR Sp. z o.o. | Inteligentne Folie',
        meta_description: 'Poznaj HETOR Sp. z o.o. - specjalistów w dziedzinie konstrukcji szklanych'
      }, token);
      
      pageId = newPage.id;
      console.log('✅ Página /o-nas creada en cms_pages');
    }
    
    // 3. Verificar contenido en site_content para /o-nas
    console.log('\n📋 Verificando contenido en site_content para /o-nas...');
    const existingContent = await apiRequest(
      `/api/collections/site_content/records?filter=website_id="${WEBSITE_ID}"&&page_path="/o-nas"&perPage=1`,
      'GET',
      null,
      token
    );
    
    if (existingContent.items && existingContent.items.length > 0) {
      console.log(`✅ Contenido para /o-nas ya existe (${existingContent.totalItems || existingContent.items.length} registros)`);
    } else {
      console.log('⚠️ No hay contenido en site_content para /o-nas');
      console.log('💡 Ejecuta seed_about_page.js primero para poblar el contenido');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡PROCESO COMPLETADO!');
    console.log('='.repeat(50));
    console.log(`📄 Página /o-nas (ID: ${pageId}) lista para editar en el CMS`);
    console.log(`🔗 URL pública: ${PB_URL}/o-nas`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

seedONasPage();