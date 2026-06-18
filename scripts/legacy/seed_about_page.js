// seed_about_page.js
// ====================================================================
// SCRIPT PARA POCKETBASE - LLENAR CMS DE LA PÁGINA /O-NAS
// Website ID corregido: dktsle4yev6syo4
// ====================================================================

// Configuración
const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4'; // ✅ ID CORREGIDO del website

// Datos completos a insertar
const contentData = [
  // ========== HERO SECTION ==========
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_hero_image', content_type: 'image', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', order_index: 0 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_hero_image', content_type: 'image', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', order_index: 0 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_hero_image', content_type: 'image', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', order_index: 0 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_hero_image', content_type: 'image', content_value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', order_index: 0 },

  // ========== ABOUT SECTION - POLACO ==========
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_section_about', content_type: 'text', content_value: 'O NASZEJ FIRMIE', order_index: 1 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_welcome_title', content_type: 'text', content_value: 'Jesteśmy HETOR', order_index: 2 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_welcome_text', content_type: 'textarea', content_value: 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą HETOR Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.', order_index: 3 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_company_name', content_type: 'text', content_value: 'HETOR Sp. z o.o.', order_index: 4 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_company_address', content_type: 'text', content_value: 'ul. Starołęcka 45, 61-361 Poznań', order_index: 5 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_company_phone', content_type: 'text', content_value: '+48 790 555 900', order_index: 6 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_email_1', content_type: 'email', content_value: 'biuro@scianki-szklane.com', order_index: 7 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_email_2', content_type: 'email', content_value: 'biuro@inteligentnefolie.pl', order_index: 8 },

  // ========== ABOUT SECTION - INGLÉS ==========
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_section_about', content_type: 'text', content_value: 'ABOUT OUR COMPANY', order_index: 1 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_welcome_title', content_type: 'text', content_value: 'We are HETOR', order_index: 2 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_welcome_text', content_type: 'textarea', content_value: 'We are a leading manufacturer and installer of glass structures in Poland. We operate under HETOR Sp. z o.o. We specialize in the production of glass partitions, balustrades, glass doors, glass stairs, glass floors and innovative solutions using smart films.', order_index: 3 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_company_name', content_type: 'text', content_value: 'HETOR Sp. z o.o.', order_index: 4 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_company_address', content_type: 'text', content_value: 'Starołęcka 45, 61-361 Poznań, Poland', order_index: 5 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_company_phone', content_type: 'text', content_value: '+48 790 555 900', order_index: 6 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_email_1', content_type: 'email', content_value: 'biuro@scianki-szklane.com', order_index: 7 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_email_2', content_type: 'email', content_value: 'biuro@inteligentnefolie.pl', order_index: 8 },

  // ========== ABOUT SECTION - ALEMÁN ==========
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_section_about', content_type: 'text', content_value: 'ÜBER UNS', order_index: 1 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_welcome_title', content_type: 'text', content_value: 'Wir sind HETOR', order_index: 2 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_welcome_text', content_type: 'textarea', content_value: 'Wir sind ein führender Hersteller und Installateur von Glaskonstruktionen in Polen. Wir firmieren unter HETOR Sp. z o.o. Wir spezialisieren uns auf die Herstellung von Glaswänden, Geländern, Glastüren, Glastreppen, Glasböden und innovativen Lösungen mit intelligenten Folien.', order_index: 3 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_company_name', content_type: 'text', content_value: 'HETOR Sp. z o.o.', order_index: 4 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_company_address', content_type: 'text', content_value: 'Starołęcka 45, 61-361 Poznań, Polen', order_index: 5 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_company_phone', content_type: 'text', content_value: '+48 790 555 900', order_index: 6 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_email_1', content_type: 'email', content_value: 'biuro@scianki-szklane.com', order_index: 7 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_email_2', content_type: 'email', content_value: 'biuro@inteligentnefolie.pl', order_index: 8 },

  // ========== ABOUT SECTION - CHECO ==========
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_section_about', content_type: 'text', content_value: 'O NÁS', order_index: 1 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_welcome_title', content_type: 'text', content_value: 'Jsme HETOR', order_index: 2 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_welcome_text', content_type: 'textarea', content_value: 'Jsme předním výrobcem a instalatérem skleněných konstrukcí v Polsku. Působíme pod firmou HETOR Sp. z o.o. Specializujeme se na výrobu skleněných příček, zábradlí, skleněných dveří, skleněných schodišť, skleněných podlah a inovativních řešení s využitím inteligentních fólií.', order_index: 3 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_company_name', content_type: 'text', content_value: 'HETOR Sp. z o.o.', order_index: 4 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_company_address', content_type: 'text', content_value: 'Starołęcka 45, 61-361 Poznaň, Polsko', order_index: 5 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_company_phone', content_type: 'text', content_value: '+48 790 555 900', order_index: 6 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_email_1', content_type: 'email', content_value: 'biuro@scianki-szklane.com', order_index: 7 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_email_2', content_type: 'email', content_value: 'biuro@inteligentnefolie.pl', order_index: 8 },

  // ========== STATS SECTION ==========
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_projects', content_type: 'text', content_value: '500+', order_index: 10 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_projects_label', content_type: 'text', content_value: 'Zrealizowanych projektów', order_index: 11 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_years', content_type: 'text', content_value: '15+', order_index: 12 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_years_label', content_type: 'text', content_value: 'Lat doświadczenia', order_index: 13 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_clients', content_type: 'text', content_value: '300+', order_index: 14 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_clients_label', content_type: 'text', content_value: 'Zadowolonych klientów', order_index: 15 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_cities', content_type: 'text', content_value: '50+', order_index: 16 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'about_stat_cities_label', content_type: 'text', content_value: 'Miast w Polsce', order_index: 17 },
  
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_projects_label', content_type: 'text', content_value: 'Completed projects', order_index: 11 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_years_label', content_type: 'text', content_value: 'Years of experience', order_index: 13 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_clients_label', content_type: 'text', content_value: 'Happy clients', order_index: 15 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_cities_label', content_type: 'text', content_value: 'Cities in Poland', order_index: 17 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_projects', content_type: 'text', content_value: '500+', order_index: 10 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_years', content_type: 'text', content_value: '15+', order_index: 12 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_clients', content_type: 'text', content_value: '300+', order_index: 14 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'about_stat_cities', content_type: 'text', content_value: '50+', order_index: 16 },

  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_projects_label', content_type: 'text', content_value: 'Abgeschlossene Projekte', order_index: 11 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_years_label', content_type: 'text', content_value: 'Jahre Erfahrung', order_index: 13 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_clients_label', content_type: 'text', content_value: 'Zufriedene Kunden', order_index: 15 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_cities_label', content_type: 'text', content_value: 'Städte in Polen', order_index: 17 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_projects', content_type: 'text', content_value: '500+', order_index: 10 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_years', content_type: 'text', content_value: '15+', order_index: 12 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_clients', content_type: 'text', content_value: '300+', order_index: 14 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'about_stat_cities', content_type: 'text', content_value: '50+', order_index: 16 },

  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_projects_label', content_type: 'text', content_value: 'Realizovaných projektů', order_index: 11 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_years_label', content_type: 'text', content_value: 'Let zkušeností', order_index: 13 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_clients_label', content_type: 'text', content_value: 'Spokojených klientů', order_index: 15 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_cities_label', content_type: 'text', content_value: 'Měst v Polsku', order_index: 17 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_projects', content_type: 'text', content_value: '500+', order_index: 10 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_years', content_type: 'text', content_value: '15+', order_index: 12 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_clients', content_type: 'text', content_value: '300+', order_index: 14 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'about_stat_cities', content_type: 'text', content_value: '50+', order_index: 16 },

  // ========== SEO META ==========
  { page_path: '/o-nas', language_code: 'pl', section_key: 'meta_title', content_type: 'text', content_value: 'O nas - HETOR Sp. z o.o. | Inteligentne Folie - Profesjonalne konstrukcje szklane', order_index: 20 },
  { page_path: '/o-nas', language_code: 'pl', section_key: 'meta_description', content_type: 'textarea', content_value: 'Poznaj HETOR Sp. z o.o. - specjalistów w dziedzinie konstrukcji szklanych, ścianek szklanych, balustrad i inteligentnych folii.', order_index: 21 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'meta_title', content_type: 'text', content_value: 'About us - HETOR Sp. z o.o. | Inteligentne Folie - Professional glass constructions', order_index: 20 },
  { page_path: '/o-nas', language_code: 'en', section_key: 'meta_description', content_type: 'textarea', content_value: 'Meet HETOR Sp. z o.o. - specialists in glass constructions, glass partitions, balustrades and smart films.', order_index: 21 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'meta_title', content_type: 'text', content_value: 'Über uns - HETOR Sp. z o.o. | Inteligentne Folie - Professionelle Glaskonstruktionen', order_index: 20 },
  { page_path: '/o-nas', language_code: 'de', section_key: 'meta_description', content_type: 'textarea', content_value: 'Lernen Sie HETOR Sp. z o.o. kennen - Spezialisten für Glaskonstruktionen, Glaswände, Geländer und intelligente Folien.', order_index: 21 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'meta_title', content_type: 'text', content_value: 'O nás - HETOR Sp. z o.o. | Inteligentne Folie - Profesionální skleněné konstrukce', order_index: 20 },
  { page_path: '/o-nas', language_code: 'cz', section_key: 'meta_description', content_type: 'textarea', content_value: 'Poznejte HETOR Sp. z o.o. - specialisty na skleněné konstrukce, skleněné příčky, zábradlí a inteligentní fólie.', order_index: 21 }
];

// Función para hacer peticiones HTTP
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

// Función principal
async function seedDatabase() {
  try {
    console.log('🚀 Iniciando seed de la base de datos...');
    console.log('📡 Conectando a:', PB_URL);
    console.log('🌐 Website ID:', WEBSITE_ID);
    
    // 1. Autenticarse como superuser
    console.log('\n🔐 Autenticando como superuser...');
    const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = authData.token;
    console.log('✅ Autenticación exitosa');
    console.log(`👤 User: ${authData.record.email}`);
    
    // 2. Verificar que la colección site_content existe
    console.log('\n📋 Verificando colección site_content...');
    try {
      await apiRequest('/api/collections/site_content/records?perPage=1', 'GET', null, token);
      console.log('✅ Colección site_content existe y es accesible');
    } catch (error) {
      console.error('❌ La colección site_content no existe o no es accesible.');
      console.log('💡 Debes crear la colección "site_content" en PocketBase primero.');
      return;
    }
    
    // 3. Insertar o actualizar datos (UPSERT: update or insert)
    console.log('\n📝 Procesando datos en site_content...');
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < contentData.length; i++) {
      const item = contentData[i];
      try {
        // 🔍 Buscar si ya existe (filtro con website_id + claves únicas)
        const filter = `website_id="${WEBSITE_ID}" && page_path="${item.page_path}" && language_code="${item.language_code}" && section_key="${item.section_key}"`;
        const searchResult = await apiRequest(`/api/collections/site_content/records?filter=${encodeURIComponent(filter)}&perPage=1`, 'GET', null, token);
        
        // 📦 Datos completos para crear/actualizar
        const recordData = {
          website_id: WEBSITE_ID,
          page_path: item.page_path,
          language_code: item.language_code,
          section_key: item.section_key,
          content_type: item.content_type,
          content_value: item.content_value,
          is_active: true,
          order_index: item.order_index || 0
        };
        
        if (searchResult.items && searchResult.items.length > 0) {
          // ✏️ ACTUALIZAR registro existente (sobrescribe valores)
          const existingId = searchResult.items[0].id;
          await apiRequest(`/api/collections/site_content/records/${existingId}`, 'PATCH', recordData, token);
          updated++;
          console.log(`  🔄 Actualizado [${updated}]: ${item.language_code}/${item.section_key}`);
        } else {
          // ➕ CREAR nuevo registro
          await apiRequest('/api/collections/site_content/records', 'POST', recordData, token);
          inserted++;
          console.log(`  ✅ Insertado [${inserted}]: ${item.language_code}/${item.section_key}`);
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error en ${item.language_code}/${item.section_key}:`, error.message);
      }
    }
    
    // 4. Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡PROCESO COMPLETADO!');
    console.log('='.repeat(50));
    console.log(`📊 Insertados: ${inserted} nuevos registros`);
    console.log(`🔄 Actualizados: ${updated} registros existentes (sobrescritos)`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📌 Total procesados: ${contentData.length} registros`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

// Ejecutar
seedDatabase();