const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';

async function debug() {
  console.log('🔍 Verificando páginas de ciudades...\n');
  
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');
  
  // Buscar todas las páginas
  const pages = await fetch(`${PB_URL}/api/collections/cms_pages/records?perPage=100`, {
    headers: { 'Authorization': token }
  });
  const pagesData = await pages.json();
  
  const cities = pagesData.items.filter(p => p.path.startsWith('/folia-inteligentna-'));
  console.log(`📊 Total páginas de ciudades en cms_pages: ${cities.length}`);
  
  if (cities.length === 0) {
    console.log('\n❌ No hay páginas de ciudades en cms_pages');
    console.log('💡 Ejecutando seed_onas_page.js para crear páginas de ciudades...\n');
    
    // Crear páginas de ciudades
    const cityNames = [
      { name: 'Wałbrzych', slug: 'walbrzych' },
      { name: 'Legnica', slug: 'legnica' },
      { name: 'Jelenia Góra', slug: 'jelenia-gora' },
      { name: 'Lubin', slug: 'lubin' },
      { name: 'Głogów', slug: 'glogow' },
      { name: 'Świdnica', slug: 'swidnica' },
      { name: 'Bolesławiec', slug: 'boleslawiec' },
      { name: 'Oleśnica', slug: 'olesnica' },
      { name: 'Włocławek', slug: 'wloclawek' },
      { name: 'Grudziądz', slug: 'grudziadz' },
      { name: 'Inowrocław', slug: 'inowroclaw' },
      { name: 'Brodnica', slug: 'brodnica' },
      { name: 'Świecie', slug: 'swiecie' },
      { name: 'Chełmno', slug: 'chelmno' },
      { name: 'Nakło nad Notecią', slug: 'naklo-nad-notencia' },
      { name: 'Chełm', slug: 'chelm' },
      { name: 'Zamość', slug: 'zamosc' },
      { name: 'Biała Podlaska', slug: 'biala-podlaska' },
      { name: 'Puławy', slug: 'pulawy' },
      { name: 'Świdnik', slug: 'swidnik' },
      { name: 'Kraśnik', slug: 'krasnik' },
      { name: 'Biłgoraj', slug: 'bilgoraj' },
      { name: 'Nowa Sól', slug: 'nowa-sol' },
      { name: 'Żary', slug: 'zary' },
      { name: 'Żagań', slug: 'zagan' },
      { name: 'Świebodzin', slug: 'swiebodzin' },
      { name: 'Międzyrzecz', slug: 'medzyrzecz' },
      { name: 'Pabianice', slug: 'pabianice' },
      { name: 'Tomaszów Mazowiecki', slug: 'tomaszow-mazowiecki' },
      { name: 'Bełchatów', slug: 'belchatow' },
      { name: 'Zgierz', slug: 'zgierz' },
      { name: 'Skierniewice', slug: 'skierniewice' },
      { name: 'Radomsko', slug: 'radomsko' },
      { name: 'Kutno', slug: 'kutno' },
      { name: 'Sieradz', slug: 'sieradz' },
      { name: 'Tarnów', slug: 'tarnow' },
      { name: 'Nowy Sącz', slug: 'nowy-sacz' },
      { name: 'Oświęcim', slug: 'oswiecim' },
      { name: 'Chrzanów', slug: 'chrzanow' },
      { name: 'Olkusz', slug: 'olkusz' },
      { name: 'Nowy Targ', slug: 'nowy-targ' },
      { name: 'Bochnia', slug: 'bochnia' },
      { name: 'Gorlice', slug: 'gorlice' },
      { name: 'Radom', slug: 'radom' },
      { name: 'Płock', slug: 'plock' },
      { name: 'Siedlce', slug: 'siedlce' },
      { name: 'Pruszków', slug: 'pruszkow' },
      { name: 'Legionowo', slug: 'legionowo' },
      { name: 'Ostrołęka', slug: 'ostroleka' },
      { name: 'Piaseczno', slug: 'piaseczno' },
      { name: 'Otwock', slug: 'otwock' },
      { name: 'Ciechanów', slug: 'ciechanow' },
      { name: 'Żyrardów', slug: 'zyrardow' },
      { name: 'Mińsk Mazowiecki', slug: 'minsk-mazowiecki' },
      { name: 'Kędzierzyn-Koźle', slug: 'kedzierzyn-kozle' },
      { name: 'Nysa', slug: 'nysa' },
      { name: 'Brzeg', slug: 'brzeg' },
      { name: 'Kluczbork', slug: 'kluczbork' },
      { name: 'Mielec', slug: 'mielec' },
      { name: 'Stalowa Wola', slug: 'stalowa-wola' },
      { name: 'Przemyśl', slug: 'przemysl' },
      { name: 'Krosno', slug: 'krosno' },
      { name: 'Dębica', slug: 'debica' },
      { name: 'Jarosław', slug: 'jaroslaw' },
      { name: 'Sanok', slug: 'sanok' },
      { name: 'Tarnobrzeg', slug: 'tarnobrzeg' },
      { name: 'Łomża', slug: 'lomza' },
      { name: 'Suwałki', slug: 'suwalki' },
      { name: 'Augustów', slug: 'augustow' },
      { name: 'Tczew', slug: 'tczew' },
      { name: 'Starogard Gdański', slug: 'starogard-gdanski' },
      { name: 'Wejherowo', slug: 'wejherowo' },
      { name: 'Rumia', slug: 'rumia' },
      { name: 'Chojnice', slug: 'chojnice' },
      { name: 'Kwidzyn', slug: 'kwidzyn' },
      { name: 'Słupsk', slug: 'slupsk' },
      { name: 'Sosnowiec', slug: 'sosnowiec' },
      { name: 'Gliwice', slug: 'gliwice' },
      { name: 'Zabrze', slug: 'zabrze' },
      { name: 'Bytom', slug: 'bytom' },
      { name: 'Ruda Śląska', slug: 'ruda-slaska' },
      { name: 'Tychy', slug: 'tychy' },
      { name: 'Dąbrowa Górnicza', slug: 'dabrowa-gornicza' },
      { name: 'Chorzów', slug: 'chorzow' },
      { name: 'Jaworzno', slug: 'jaworzno' },
      { name: 'Jastrzębie-Zdrój', slug: 'jastrzebie-zdroj' },
      { name: 'Mysłowice', slug: 'myslowice' },
      { name: 'Siemianowice Śląskie', slug: 'siemianowice-slaskie' },
      { name: 'Ostrowiec Świętokrzyski', slug: 'ostrowiec-swietokrzyski' },
      { name: 'Starachowice', slug: 'starachowice' },
      { name: 'Skarżysko-Kamienna', slug: 'skarzysko-kamienna' },
      { name: 'Elbląg', slug: 'elblag' },
      { name: 'Ełk', slug: 'elk' },
      { name: 'Ostróda', slug: 'ostroda' },
      { name: 'Iława', slug: 'ilawa' },
      { name: 'Olsztyn', slug: 'olsztyn' },
      { name: 'Kalisz', slug: 'kalisz' },
      { name: 'Konin', slug: 'konin' },
      { name: 'Piła', slug: 'pila' },
      { name: 'Ostrów Wielkopolski', slug: 'ostrow-wielkopolski' },
      { name: 'Gniezno', slug: 'gniezno' },
    ];
    
    let created = 0;
    for (const city of cityNames) {
      const path = `/folia-inteligentna-${city.slug}`;
      const createRes = await fetch(`${PB_URL}/api/collections/cms_pages/records`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Folia Inteligentna ${city.name}`,
          path: path,
          slug: `folia-inteligentna-${city.slug}`,
          language_code: 'pl',
          website_id: 'dktsle4yev6syo4',
          is_published: true
        })
      });
      
      if (createRes.ok) {
        created++;
        console.log(`✅ ${city.name}`);
      } else {
        const err = await createRes.json();
        if (err.message?.includes('already exists')) {
          console.log(`⏭️ ${city.name} (ya existe)`);
        } else {
          console.log(`❌ ${city.name}: ${err.message || createRes.status}`);
        }
      }
    }
    console.log(`\n✅ Creadas ${created} ciudades`);
  } else {
    console.log('\n✅ Las ciudades ya están en cms_pages');
    cities.forEach(c => console.log(`  - ${c.title} | ${c.path}`));
  }
}

debug().catch(console.error);