const PB_URL = 'https://pb.fullwork.pl';
const WEBSITE_ID = 'dktsle4yev6syo4';

const updates = [
  { 
    section_key: '_og_description', 
    content_value: 'Jesteśmy wiodącym producentem i instalatorem folii inteligentnych PDLC i LCD w Polsce. Kupuj bezpośrednio od producenta z gwarancją jakości i profesjonalnym montażem.' 
  },
  { 
    section_key: '_og_title', 
    content_value: 'Inteligentne Folie PDLC i LCD - Producent i Instalator w Polsce' 
  },
  { 
    section_key: '_og_image', 
    content_value: 'https://inteligentnefolie.pl/og-image.jpg' 
  },
  { 
    section_key: '_twitter_card', 
    content_value: 'summary_large_image' 
  },
];

async function upsertRecord(sectionKey, contentValue) {
  const filter = `page_path="/" AND section_key="${sectionKey}" AND language_code="pl"`;
  
  try {
    const check = await fetch(`${PB_URL}/api/collections/site_content/records?filter=${encodeURIComponent(filter)}&perPage=1`);
    const data = await check.json();
    
    if (data.items && data.items.length > 0) {
      const id = data.items[0].id;
      await fetch(`${PB_URL}/api/collections/site_content/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_value: contentValue })
      });
      console.log(`✅ Actualizado: ${sectionKey}`);
    } else {
      await fetch(`${PB_URL}/api/collections/site_content/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: WEBSITE_ID,
          page_path: '/',
          section_key: sectionKey,
          content_value: contentValue,
          content_type: 'text',
          language_code: 'pl',
          is_active: true,
          order_index: 0
        })
      });
      console.log(`✅ Creado: ${sectionKey}`);
    }
  } catch (err) {
    console.log(`❌ Error: ${sectionKey} - ${err.message}`);
  }
}

async function main() {
  console.log('🔧 Creando/actualizando meta tags OG en PocketBase...\n');
  
  for (const update of updates) {
    await upsertRecord(update.section_key, update.content_value);
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n✅ Completado! Los meta tags OG ahora mostrarán información de la empresa.\n');
}

main().catch(console.error);