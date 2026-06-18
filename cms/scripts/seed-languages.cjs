const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pb.fullwork.pl');

const languages = [
  { code: 'pl', name: 'Polski', name_native: 'Polski', flag_emoji: '🇵🇱', is_active: true, sort_order: 1 },
  { code: 'en', name: 'Angielski', name_native: 'English', flag_emoji: '🇺🇸', is_active: true, sort_order: 2 },
  { code: 'es', name: 'Hiszpański', name_native: 'Español', flag_emoji: '🇪🇸', is_active: true, sort_order: 3 },
  { code: 'de', name: 'Niemiecki', name_native: 'Deutsch', flag_emoji: '🇩🇪', is_active: true, sort_order: 4 },
  { code: 'uk', name: 'Ukraiński', name_native: 'Українська', flag_emoji: '🇺🇦', is_active: true, sort_order: 5 },
  { code: 'cz', name: 'Czeski', name_native: 'Čeština', flag_emoji: '🇨🇿', is_active: true, sort_order: 6 },
  { code: 'fr', name: 'Francuski', name_native: 'Français', flag_emoji: '🇫🇷', is_active: true, sort_order: 7 },
  { code: 'it', name: 'Włoski', name_native: 'Italiano', flag_emoji: '🇮🇹', is_active: true, sort_order: 8 },
];

async function seed() {
  console.log('Seeding languages...');
  for (const lang of languages) {
    try {
      const existing = await pb.collection('languages').getFirstListItem(`code = "${lang.code}"`).catch(() => null);
      if (existing) {
        console.log(`Language ${lang.code} already exists.`);
        continue;
      }
      await pb.collection('languages').create(lang);
      console.log(`Created language: ${lang.name}`);
    } catch (err) {
      console.error(`Error creating ${lang.code}:`, err.message);
    }
  }
  console.log('Done.');
}

seed();
