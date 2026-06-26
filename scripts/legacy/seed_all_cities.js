const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4';

const ALL_CITIES = [
  // Dolnośląskie
  { name: 'Wałbrzych', slug: 'walbrzych' },
  { name: 'Legnica', slug: 'legnica' },
  { name: 'Jelenia Góra', slug: 'jelenia-gora' },
  { name: 'Lubin', slug: 'lubin' },
  { name: 'Głogów', slug: 'glogow' },
  { name: 'Świdnica', slug: 'swidnica' },
  { name: 'Bolesławiec', slug: 'boleslawiec' },
  { name: 'Oleśnica', slug: 'olesnica' },
  // Kujawsko-Pomorskie
  { name: 'Włocławek', slug: 'wloclawek' },
  { name: 'Grudziądz', slug: 'grudziadz' },
  { name: 'Inowrocław', slug: 'inowroclaw' },
  { name: 'Brodnica', slug: 'brodnica' },
  { name: 'Świecie', slug: 'swiecie' },
  { name: 'Chełmno', slug: 'chelmno' },
  { name: 'Nakło nad Notecią', slug: 'naklo-nad-notencia' },
  // Lubelskie
  { name: 'Chełm', slug: 'chelm' },
  { name: 'Zamość', slug: 'zamosc' },
  { name: 'Biała Podlaska', slug: 'biala-podlaska' },
  { name: 'Puławy', slug: 'pulawy' },
  { name: 'Świdnik', slug: 'swidnik' },
  { name: 'Kraśnik', slug: 'krasnik' },
  { name: 'Biłgoraj', slug: 'bilgoraj' },
  // Lubuskie
  { name: 'Nowa Sól', slug: 'nowa-sol' },
  { name: 'Żary', slug: 'zary' },
  { name: 'Żagań', slug: 'zagan' },
  { name: 'Świebodzin', slug: 'swiebodzin' },
  { name: 'Międzyrzecz', slug: 'medzyrzecz' },
  // Łódzkie
  { name: 'Pabianice', slug: 'pabianice' },
  { name: 'Tomaszów Mazowiecki', slug: 'tomaszow-mazowiecki' },
  { name: 'Bełchatów', slug: 'belchatow' },
  { name: 'Zgierz', slug: 'zgierz' },
  { name: 'Skierniewice', slug: 'skierniewice' },
  { name: 'Radomsko', slug: 'radomsko' },
  { name: 'Kutno', slug: 'kutno' },
  { name: 'Sieradz', slug: 'sieradz' },
  // Małopolskie
  { name: 'Tarnów', slug: 'tarnow' },
  { name: 'Nowy Sącz', slug: 'nowy-sacz' },
  { name: 'Oświęcim', slug: 'oswiecim' },
  { name: 'Chrzanów', slug: 'chrzanow' },
  { name: 'Olkusz', slug: 'olkusz' },
  { name: 'Nowy Targ', slug: 'nowy-targ' },
  { name: 'Bochnia', slug: 'bochnia' },
  { name: 'Gorlice', slug: 'gorlice' },
  // Mazowieckie
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
  // Opolskie
  { name: 'Kędzierzyn-Koźle', slug: 'kedzierzyn-kozle' },
  { name: 'Nysa', slug: 'nysa' },
  { name: 'Brzeg', slug: 'brzeg' },
  { name: 'Kluczbork', slug: 'kluczbork' },
  // Podkarpackie
  { name: 'Mielec', slug: 'mielec' },
  { name: 'Stalowa Wola', slug: 'stalowa-wola' },
  { name: 'Przemyśl', slug: 'przemysl' },
  { name: 'Krosno', slug: 'krosno' },
  { name: 'Dębica', slug: 'debica' },
  { name: 'Jarosław', slug: 'jaroslaw' },
  { name: 'Sanok', slug: 'sanok' },
  { name: 'Tarnobrzeg', slug: 'tarnobrzeg' },
  // Podlaskie
  { name: 'Łomża', slug: 'lomza' },
  { name: 'Suwałki', slug: 'suwalki' },
  { name: 'Augustów', slug: 'augustow' },
  // Pomorskie
  { name: 'Tczew', slug: 'tczew' },
  { name: 'Starogard Gdański', slug: 'starogard-gdanski' },
  { name: 'Wejherowo', slug: 'wejherowo' },
  { name: 'Rumia', slug: 'rumia' },
  { name: 'Chojnice', slug: 'chojnice' },
  { name: 'Kwidzyn', slug: 'kwidzyn' },
  { name: 'Słupsk', slug: 'slupsk' },
  // Śląskie
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
  // Świętokrzyskie
  { name: 'Ostrowiec Świętokrzyski', slug: 'ostrowiec-swietokrzyski' },
  { name: 'Starachowice', slug: 'starachowice' },
  { name: 'Skarżysko-Kamienna', slug: 'skarzysko-kamienna' },
  // Warmińsko-Mazurskie
  { name: 'Elbląg', slug: 'elblag' },
  { name: 'Ełk', slug: 'elk' },
  { name: 'Ostróda', slug: 'ostroda' },
  { name: 'Iława', slug: 'ilawa' },
  { name: 'Olsztyn', slug: 'olsztyn' },
  // Wielkopolskie
  { name: 'Kalisz', slug: 'kalisz' },
  { name: 'Konin', slug: 'konin' },
  { name: 'Piła', slug: 'pila' },
  { name: 'Ostrów Wielkopolski', slug: 'ostrow-wielkopolski' },
  { name: 'Gniezno', slug: 'gniezno' },
  // Główne miasta
  { name: 'Białystok', slug: 'bialystok' },
  { name: 'Gdańsk', slug: 'gdansk' },
  { name: 'Kielce', slug: 'kielce' },
  { name: 'Kraków', slug: 'krakow' },
  { name: 'Łódź', slug: 'lodz' },
  { name: 'Opole', slug: 'opole' },
  { name: 'Poznań', slug: 'poznan' },
  { name: 'Rzeszów', slug: 'rzeszow' },
  { name: 'Szczecin', slug: 'szczecin' },
  { name: 'Warszawa', slug: 'warszawa' },
  { name: 'Wrocław', slug: 'wroclaw' },
];

async function seedAllCities() {
  console.log('🔐 Autenticando...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('✅ Autenticado\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const city of ALL_CITIES) {
    const path = `/folia-inteligentna-${city.slug}`;
    
    try {
      const createRes = await fetch(`${PB_URL}/api/collections/cms_pages/records`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Folia Inteligentna ${city.name}`,
          path: path,
          slug: path,
          language_code: 'pl',
          website_id: WEBSITE_ID,
          is_published: true
        })
      });

      if (createRes.ok) {
        created++;
        process.stdout.write(`✅ ${city.name}\n`);
      } else {
        const err = await createRes.json();
        if (err.message?.includes('already exists') || err.message?.includes('duplicat')) {
          skipped++;
          process.stdout.write(`⏭ ${city.name}\n`);
        } else {
          errors++;
          console.log(`❌ ${city.name}: ${err.message}`);
        }
      }
    } catch (e) {
      errors++;
      console.log(`❌ Error con ${city.name}: ${e.message}`);
    }
  }

  console.log(`\n📊 Resumen: ${created} creadas, ${skipped} ya existían, ${errors} errores`);
}

seedAllCities().catch(console.error);