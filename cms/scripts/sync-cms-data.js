import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  console.log('--- Reseeding Production Data ---')

  // 1. Get Website ID
  const { data: website } = await supabase.from('websites').select('id').order('created_at').limit(1).single()
  const websiteId = website?.id

  if (!websiteId) {
    console.error('No website found in DB. Run SQL setup first.')
    return
  }
  console.log('Target Website ID:', websiteId)

  // 2. Main Menu Seeding
  const mainMenu = [
    { id: '1', label: 'Strona główna', href: '/', order: 0 },
    { id: '2', label: 'Inteligentne Folie', href: '/inteligentne-folie', order: 1 },
    { id: '3', label: 'Montaż i Serwis', href: '/montaz-folii-inteligentnej', order: 2 },
    { id: '4', label: 'Realizacje', href: '/realizacje', order: 3 },
    { id: '5', label: 'Blog', href: '/blog', order: 4 },
    { id: '6', label: 'Kontakt', href: '/kontakt', order: 5 }
  ]

  await supabase.from('site_settings').upsert({
    website_id: websiteId,
    setting_key: 'main_menu',
    setting_value: mainMenu,
    updated_at: new Date()
  }, { onConflict: 'website_id,setting_key' })
  console.log('✓ Main Menu seeded.')

  // 3. Home Page Content Seeding
  const homeContent = [
    // Hero
    { key: 'home_hero_title_0', val: 'Inteligentne folie PDLC i LCD na okna' },
    { key: 'home_hero_subtitle_1', val: 'Prywatność na żądanie bez rolet — do domu, biura i hoteli.' },
    { key: 'hero_button_primary', val: { text: 'Kontakt', href: '/kontakt' } },
    { key: 'hero_button_secondary', val: { text: 'Zobacz produkty', href: '/inteligentne-folie' } },
    { key: 'home_hero_benefit_1', val: 'Montaż w całej Polsce' },
    { key: 'home_hero_benefit_2', val: '10 lat gwarancji' },
    { key: 'home_hero_benefit_3', val: 'Darmowa próbka' },
    // Features
    { key: 'home_features_title_4', val: 'Dlaczego warto wybrać nasze folie?' },
    { key: 'home_features_subtitle_5', val: 'Nowoczesna technologia, która zmienia przestrzeń' },
    { key: 'feature_0_title', val: 'Prywatność 1s' },
    { key: 'feature_0_description', val: 'Zmień szkło z przezroczystego w matowe w ułamku sekundy.' },
    { key: 'feature_1_title', val: 'Redukcja UV' },
    { key: 'feature_1_description', val: 'Blokuje do 99% promieniowania UV, chroniąc Twoje meble i zdrowie.' },
    { key: 'feature_2_title', val: 'Energooszczędność' },
    { key: 'feature_2_description', val: 'Ogranicza nagrzewanie się pomieszczeń latem i ucieczkę ciepła zimą.' },
    // How It Works
    { key: 'home_how_it_works_title_6', val: 'Jak to działa?' },
    { key: 'home_how_it_works_off_title_8', val: 'OFF – mat (prywatność)' },
    { key: 'home_how_it_works_on_title_10', val: 'ON – przezroczysta (światło)' },
    // FAQ
    { key: 'faq_title_24', val: 'Często zadawane pytania' },
    { key: 'faqs.0.question', val: 'Czy folia pasuje do każdego typu okna?' },
    { key: 'faqs.0.answer', val: 'Tak, nasza folia samoprzylepna może być docięta na wymiar i zamontowana na większości płaskich powierzchni szklanych.' },
    // Footer
    { key: 'home_footer_copy_35', val: '© 2026 Inteligentne Folie. Wszelkie prawa zastrzeżone.' },
    { key: 'header_phone_1', val: '+48 123 456 789' },
    { key: 'header_email', val: 'kontakt@inteligentnefolie.pl' }
  ]

  const records = homeContent.map(item => ({
    path: '/',
    section_key: item.key,
    content_value: item.val,
    language_code: 'pl',
    is_active: true
  }))

  await supabase.from('site_content').upsert(records, { onConflict: 'path,section_key,language_code' })
  console.log('✓ Home content seeded.')

  // 4. Blog Posts Seeding
  const blogPosts = [
    {
      website_id: websiteId,
      title: 'Zalety folii PDLC w biurach Open Space',
      slug: 'zalety-folii-pdlc-biura',
      is_published: true,
      content: '<h1>Folie PDLC w biurze</h1><p>Odkryj jak nowoczesne technologie transformują przestrzeń pracy...</p>',
      excerpt: 'Dowiedz się jak folia inteligentna poprawia komfort pracy i prywatność w nowoczesnych biurach.',
      created_at: new Date()
    },
    {
      website_id: websiteId,
      title: 'Jak dbać o folię inteligentną?',
      slug: 'jak-dbac-o-folie',
      is_published: true,
      content: '<h1>Pielęgnacja folii</h1><p>Proste zasady, które przedłużą żywotność Twojej folii...</p>',
      excerpt: 'Praktyczny poradnik dotyczący czyszczenia i konserwacji folii PDLC.',
      created_at: new Date()
    }
  ]

  await supabase.from('blog_posts').upsert(blogPosts, { onConflict: 'slug' })
  console.log('✓ Initial blog posts seeded.')

  console.log('--- Seeding Completed Succesfully ---')
}

seed().catch(console.error)
