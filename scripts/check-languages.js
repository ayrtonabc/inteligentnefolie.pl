// Script para verificar idiomas en site_content
const PB_URL = 'https://pb.fullwork.pl';

async function login() {
  const res = await fetch(PB_URL + '/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ identity: 'kontakt@jestemprogramista.pl', password: 'Programista2026' })
  });
  return res.json();
}

async function checkLanguages() {
  const auth = await login();
  if (!auth.token) {
    console.log('Login failed');
    return;
  }
  
  const token = auth.token;
  
  // Get all records and group by language_code
  const res = await fetch(PB_URL + '/api/collections/site_content/records?perPage=1000', {
    headers: {'Authorization': token}
  });
  const data = await res.json();
  
  const byLanguage = {};
  
  for (const item of data.items || []) {
    const lang = item.language_code || '(brak)';
    if (!byLanguage[lang]) byLanguage[lang] = 0;
    byLanguage[lang]++;
  }
  
  console.log('=== ILEŚĆ REKORDÓW WG JĘZYKA ===');
  for (const [lang, count] of Object.entries(byLanguage)) {
    console.log(`${lang}: ${count} rekordów`);
  }
  
  console.log(`\nRAZEM: ${data.items?.length || 0} rekordów`);
}

checkLanguages();
