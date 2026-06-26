// Script para insertar datos de colores en site_content de PocketBase
// Ejecute: node seed_colors.js

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl';
const WEBSITE_ID = 'dktsle4yev6syo4';

const colorsData = {
  pl: {
    colors_subtitle: 'ESTETYKA',
    colors_title: 'Dostępne kolory folii PDLC',
    colors_name_t16: 'Czarny',
    colors_name_t91: 'Biały (wysoka przezroczystość)',
    colors_name_t83: 'Biały (normalna przezroczystość)',
    colors_name_t60: 'Jasnoszary',
    colors_name_t40: 'Ciemnoszary',
  },
  en: {
    colors_subtitle: 'AESTHETICS',
    colors_title: 'Available PDLC film colors',
    colors_name_t16: 'Black',
    colors_name_t91: 'White (high transparency)',
    colors_name_t83: 'White (normal transparency)',
    colors_name_t60: 'Light gray',
    colors_name_t40: 'Dark gray',
  },
  de: {
    colors_subtitle: 'ÄSTHETIK',
    colors_title: 'Verfügbare PDLC-Folienfarben',
    colors_name_t16: 'Schwarz',
    colors_name_t91: 'Weiß (hohe Transparenz)',
    colors_name_t83: 'Weiß (normale Transparenz)',
    colors_name_t60: 'Hellgrau',
    colors_name_t40: 'Dunkelgrau',
  },
  cz: {
    colors_subtitle: 'ESTETIKA',
    colors_title: 'Dostupné barvy PDLC fólie',
    colors_name_t16: 'Černá',
    colors_name_t91: 'Bílá (vysoká průhlednost)',
    colors_name_t83: 'Bílá (normální průhlednost)',
    colors_name_t60: 'Světle šedá',
    colors_name_t40: 'Tmavě šedá',
  },
};

async function upsertSiteContent(pagePath, sectionKey, contentValue, languageCode, contentType = 'text') {
  const filter = `page_path = "${pagePath}" && section_key = "${sectionKey}" && language_code = "${languageCode}"`;
  
  try {
    // Buscar si existe
    const checkResponse = await fetch(`${PB_URL}/api/collections/site_content/records?filter=${encodeURIComponent(filter)}&perPage=1`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const checkData = await checkResponse.json();
    
    if (checkData.items && checkData.items.length > 0) {
      // Actualizar existente
      const recordId = checkData.items[0].id;
      const updateResponse = await fetch(`${PB_URL}/api/collections/site_content/records/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_value: contentValue,
          is_active: true,
        })
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Actualizado: ${sectionKey} (${languageCode})`);
      } else {
        console.log(`❌ Error actualizando: ${sectionKey} (${languageCode})`);
      }
    } else {
      // Crear nuevo
      const createResponse = await fetch(`${PB_URL}/api/collections/site_content/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_id: WEBSITE_ID,
          page_path: pagePath,
          section_key: sectionKey,
          content_value: contentValue,
          content_type: contentType,
          language_code: languageCode,
          is_active: true,
          order_index: 0,
        })
      });
      
      if (createResponse.ok) {
        console.log(`✅ Creado: ${sectionKey} (${languageCode})`);
      } else {
        const error = await createResponse.text();
        console.log(`❌ Error creando: ${sectionKey} (${languageCode}) - ${error}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${sectionKey} (${languageCode}) - ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Insertando datos de colores en PocketBase...\n');
  
  const pagePath = '/';
  
  for (const [lang, translations] of Object.entries(colorsData)) {
    console.log(`\n📝 Idioma: ${lang.toUpperCase()}`);
    console.log('─'.repeat(40));
    
    for (const [sectionKey, contentValue] of Object.entries(translations)) {
      await upsertSiteContent(pagePath, sectionKey, contentValue, lang);
      await new Promise(r => setTimeout(r, 100)); // Pequeña pausa para evitar rate limit
    }
  }
  
  console.log('\n✅ ¡Completado! Los datos de colores ahora son editables desde el CMS.\n');
}

main().catch(console.error);
