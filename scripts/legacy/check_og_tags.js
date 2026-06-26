const PB_URL = 'https://pb.fullwork.pl';
const WEBSITE_ID = 'dktsle4yev6syo4';

async function checkAndCreate() {
  console.log('🔍 Verificando meta tags OG en PocketBase...\n');
  
  const checks = [
    { section_key: '_og_title', value: 'Inteligentne Folie PDLC i LCD - Producent i Instalator w Polsce', desc: 'Tytuł OG' },
    { section_key: '_og_description', value: 'Jesteśmy wiodącym producentem i instalatorem folii inteligentnych PDLC i LCD w Polsce. Kupuj bezpośrednio od producenta z gwarancją jakości.', desc: 'Opis OG' },
    { section_key: '_og_image', value: 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', desc: 'Obraz OG' },
  ];
  
  for (const check of checks) {
    const filter = `page_path="/" AND section_key="${check.section_key}" AND language_code="pl"`;
    
    try {
      const resp = await fetch(`${PB_URL}/api/collections/site_content/records?filter=${encodeURIComponent(filter)}&perPage=1`);
      const data = await resp.json();
      
      if (data.items && data.items.length > 0) {
        const record = data.items[0];
        console.log(`✅ ${check.desc}: "${record.content_value}"`);
        
        if (check.section_key === '_og_image' && !record.content_value) {
          console.log(`   ⚠️ Imagen vacía, creando...`);
          await fetch(`${PB_URL}/api/collections/site_content/records/${record.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content_value: check.value })
          });
          console.log(`   ✅ Imagen OG actualizada`);
        }
      } else {
        console.log(`❌ ${check.desc}: NO EXISTE - Creando...`);
        await fetch(`${PB_URL}/api/collections/site_content/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            website_id: WEBSITE_ID,
            page_path: '/',
            section_key: check.section_key,
            content_value: check.value,
            content_type: 'text',
            language_code: 'pl',
            is_active: true,
            order_index: 0
          })
        });
        console.log(`   ✅ ${check.desc} creado`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n✅ Verificación completada!\n');
}

checkAndCreate().catch(console.error);
