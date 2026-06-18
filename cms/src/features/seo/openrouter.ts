const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openrouter/auto'

export type AuditIssue = {
  level: 'error' | 'warning' | 'good'
  code: string
  title: string
  action: string
}

export type AuditResult = {
  score: number
  summary: string
  generalStatus: string
  improvements: string[]
  goodPoints: string[]
  suggestions: string[]
  keywords: Array<{ term: string; priority: 'high' | 'medium' | 'low' }>
  issues: {
    errors: AuditIssue[]
    warnings: AuditIssue[]
    good: AuditIssue[]
  }
}

export type PageAnalysisResult = {
  slug: string
  language_code: string
  score: number
  issues: AuditResult['issues']
  recommendations: string[]
}

function asString(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  if (v === null || v === undefined) return fallback
  return String(v)
}

function truncate(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).trimEnd() + '…'
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)))
}

async function scrapeWebsite(url: string): Promise<{
  title: string
  metaDescription: string
  metaKeywords: string
  canonical: string
  h1Tags: string[]
  h2Tags: string[]
  imagesWithoutAlt: number
  totalImages: number
  linksCount: number
  externalLinks: number
  contentText: string
  hasOpenGraph: boolean
  hasTwitterCard: boolean
  hasStructuredData: boolean
  loadSpeed: number
  mobileFriendly: boolean
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    const getMetaContent = (name: string): string => {
      const patterns = [
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
      ]
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return match[1].trim()
      }
      return ''
    }
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    
    const metaDescription = getMetaContent('description')
    const metaKeywords = getMetaContent('keywords')
    
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : ''
    
    const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || []
    const h1Tags = h1Matches.map((m) => m.replace(/<[^>]*>/g, '').trim()).filter(Boolean)
    
    const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || []
    const h2Tags = h2Matches.map((m) => m.replace(/<[^>]*>/g, '').trim()).filter(Boolean)
    
    const imgMatches = html.match(/<img[^>]*>/gi) || []
    const totalImages = imgMatches.length
    const imagesWithoutAlt = imgMatches.filter((img) => !img.includes('alt=')).length
    
    const linkMatches = html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []
    const linksCount = linkMatches.length
    const externalLinks = linkMatches.filter((link) => 
      link.includes('href="http') && !link.includes(url.replace('https://', '').replace('http://', '').split('/')[0])
    ).length
    
    const contentMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    let contentText = ''
    if (contentMatch) {
      contentText = contentMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    const hasOpenGraph = /property=["']og:/i.test(html)
    const hasTwitterCard = /name=["']twitter:/i.test(html)
    const hasStructuredData = /type=["']application\/ld\+json["']/i.test(html) || /<script[^>]*json-ld/i.test(html)
    
    return {
      title,
      metaDescription,
      metaKeywords,
      canonical,
      h1Tags,
      h2Tags,
      imagesWithoutAlt,
      totalImages,
      linksCount,
      externalLinks,
      contentText,
      hasOpenGraph,
      hasTwitterCard,
      hasStructuredData,
      loadSpeed: Math.floor(Math.random() * 3) + 1,
      mobileFriendly: true,
    }
  } catch (error) {
    console.error('Error scraping website:', error)
    throw new Error(`Nie można pobrać strony ${url}. Sprawdź czy adres URL jest poprawny.`)
  }
}

export async function runAiSeoAudit(options: {
  websiteUrl: string
}): Promise<AuditResult> {
  const siteUrl = options.websiteUrl.replace(/\/$/, '')
  
  const scrapedData = await scrapeWebsite(siteUrl)
  const contentLength = scrapedData.contentText.length

  const systemPrompt = `Jesteś przyjaznym doradcą SEO dla właścicieli stron internetowych. Twoja rola to pomagać osobom nietechnicznym zrozumieć stan ich strony i dawać praktyczne rady.

KONTEKST: Analizujesz stronę zarządzaną przez CMS. Użytkownik może łatwo zmienić w CMS:
- Tytuł strony i opis (meta title, meta description)
- Treść stron
- Nagłówki (H1, H2, H3)
- Obrazy i ich atrybuty ALT
- Adresy URL (slug)

WAŻNE: NIE proponuj zmian wymagających programowania lub modyfikacji kodu strony. Koncentruj się na rzeczach, które użytkownik może zrobić samodzielnie w panelu CMS.

OCENA (skala 0-100):
- 90-100: Świetnie! Twoja strona jest bardzo dobrze przygotowana
- 75-89: Dobrze - drobne elementy do lekkiego poprawienia  
- 55-74: Przeciętnie - kilka rzeczy do naprawienia dla lepszych wyników
- 40-54: Słabo - warto poświęcić czas na poprawki
- 0-39: Potrzebuje pracy - zacznij od najważniejszych elementów

ZASADY:
- Pisz PROSTYM, zrozumiałym językiem
- Każda rada ma być krótka i konkretna
- Dawaj pozytywne wskazówki, nie strasz
- Rady mają być WYKONALNE w ciągu kilku minut w panelu CMS
- Jeśli coś jest dobre - powiedz to z entuzjazmem!`

  const userPrompt = `Cześć! Sprawdźmy jak wygląda strona: ${siteUrl}

CO MAMY:
- TYTUŁ STRONY: ${truncate(scrapedData.title, 70) || '(brak - to ważne!)'}
- OPIS STRONY (meta): ${truncate(scrapedData.metaDescription, 160) || '(brak - dodaj bo Google tego szuka!)'}
- NAGŁÓWEK GŁÓWNY (H1): ${scrapedData.h1Tags.length > 0 ? scrapedData.h1Tags.join(', ') : '(brak - ważne dla Google!)'}
- NAGŁÓWKI POMOCNICZE (H2): ${scrapedData.h2Tags.slice(0, 5).join(', ') || '(brak)'}
- OBRAZY: ${scrapedData.totalImages} zdjęć, ${scrapedData.imagesWithoutAlt} bez opisu ALT
- TREŚĆ: około ${contentLength} znaków tekstu
- LINK KANONICZNY: ${scrapedData.canonical ? '✅ ustawiony' : '❌ brak'}
- SOCIAL MEDIA (Open Graph): ${scrapedData.hasOpenGraph ? '✅ gotowe' : '❌ do dodania'}
- SCHEMA (dane strukturalne): ${scrapedData.hasStructuredData ? '✅ są' : '❌ brak'}

ZWRÓĆ TYLKO JSON:
{
  "score": LICZBA_0_DO_100,
  "summary": "Krótki opis wyniku w 1-2 zdaniach dla osoby nietechnicznej. Np: 'Twoja strona jest w dobrym stanie! Tytuł i opis są OK, ale warto dodać opisy do zdjęć.'",
  "generalStatus": "Jeden lub dwa zdania wyjaśniające ogólny stan strony w sposób uspokajający i pozytywny. Np: 'Twoja strona dobrze rokuje! Podstawowe elementy są na miejscu, a kilka drobnych poprawek może znacznie poprawić widoczność w Google.'",
  "improvements": [
    "Co poprawić w max 80 znaków, bez rozwiązań technicznych. Np: 'Brakujące opisy ALT w obrazach'"
  ],
  "goodPoints": [
    "Co jest OK w max 80 znaków. Np: 'Tytuł strony jest zoptymalizowany!'"
  ],
  "suggestions": [
    "Konkretna akcja w CMS którą użytkownik może wykonać SAMODZIELNIE w panelu admina. MAX 120 znaków. Np: 'Przejdź do zakładki Strony, wybierz stronę główną i w sekcji SEO dodaj unikalny opis meta o długości 150-160 znaków'"
  ],
  "keywords": [
    { "term": "fraza kluczowa 1", "priority": "high" },
    { "term": "fraza kluczowa 2", "priority": "medium" }
  ]
}`

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error || response.statusText || 'Unknown error';
    throw new Error(`Błąd AI (${response.status}): ${errorMsg}`);
  }
  
  const data = await response.json()
  const content = data?.response

  if (!content) {
    throw new Error('Brak odpowiedzi od AI')
  }

  let jsonStr = content.trim()
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }

  try {
    const parsed = JSON.parse(jsonStr) as {
      score: number
      summary: string
      generalStatus: string
      improvements: string[]
      goodPoints: string[]
      suggestions: string[]
      keywords: Array<{ term: string; priority: 'high' | 'medium' | 'low' }>
      issues: AuditResult['issues']
    }

    return {
      score: clamp(parsed.score),
      summary: asString(parsed.summary, 'Audyt SEO zakończony.'),
      generalStatus: asString(parsed.generalStatus, 'Analiza strony zakończona pomyślnie.'),
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
      goodPoints: Array.isArray(parsed.goodPoints) ? parsed.goodPoints.slice(0, 5) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
      issues: {
        errors: (parsed.issues?.errors || []).map((i) => ({
          level: 'error' as const,
          code: asString(i.code, 'unknown'),
          title: asString(i.title, 'Problem SEO'),
          action: asString(i.action, 'Skontaktuj się z developerem'),
        })),
        warnings: (parsed.issues?.warnings || []).map((i) => ({
          level: 'warning' as const,
          code: asString(i.code, 'unknown'),
          title: asString(i.title, 'Ostrzeżenie SEO'),
          action: asString(i.action, 'Rozważ poprawę'),
        })),
        good: (parsed.issues?.good || []).map((i) => ({
          level: 'good' as const,
          code: asString(i.code, 'ok'),
          title: asString(i.title, 'OK'),
          action: 'OK',
        })),
      },
    }
  } catch (parseError) {
    console.error('Błąd parsowania JSON od AI:', parseError, content)
    throw new Error('Nie udało się przetworzyć odpowiedzi AI. Spróbuj ponownie.')
  }
}

export async function generateLocalAudit(websiteUrl: string): Promise<AuditResult> {
  const errors: AuditIssue[] = []
  const warnings: AuditIssue[] = []
  const good: AuditIssue[] = []
  let score = 0

  let scrapedData
  try {
    scrapedData = await scrapeWebsite(websiteUrl)
  } catch (error) {
    return {
      score: 0,
      summary: 'Nie można pobrać strony. Sprawdź adres URL.',
      generalStatus: 'Nie można przeanalizować strony. Sprawdź czy adres URL jest poprawny.',
      improvements: ['Sprawdź adres URL strony w Ustawieniach'],
      goodPoints: [],
      suggestions: ['Przejdź do Ustawień i popraw adres URL strony internetowej'],
      keywords: [],
      issues: { 
        errors: [{ level: 'error', code: 'scrape_failed', title: 'Błąd pobierania strony', action: 'Sprawdź czy strona istnieje i jest dostępna' }], 
        warnings: [], 
        good: [] 
      },
    }
  }

  const titleLen = scrapedData.title.length
  if (titleLen === 0) {
    errors.push({ level: 'error', code: 'no_title', title: 'Brak tytułu strony!', action: 'Dodaj <title> w sekcji <head>' })
  } else if (titleLen < 30 || titleLen > 60) {
    warnings.push({ level: 'warning', code: 'title_length', title: `Tytuł ma ${titleLen} znaków`, action: 'Zalecana długość: 30-60 znaków' })
    score += 20
  } else {
    score += 30
    good.push({ level: 'good', code: 'title_ok', title: 'Tytuł strony jest poprawny', action: 'OK' })
  }

  const metaDescLen = scrapedData.metaDescription.length
  if (metaDescLen === 0) {
    errors.push({ level: 'error', code: 'no_meta_desc', title: 'Brak meta description!', action: 'Dodaj <meta name="description"> w sekcji <head>' })
  } else if (metaDescLen < 120 || metaDescLen > 160) {
    warnings.push({ level: 'warning', code: 'meta_desc_length', title: `Meta description ma ${metaDescLen} znaków`, action: 'Zalecana długość: 120-160 znaków' })
    score += 15
  } else {
    score += 25
    good.push({ level: 'good', code: 'meta_desc_ok', title: 'Meta description jest poprawna', action: 'OK' })
  }

  if (scrapedData.h1Tags.length === 0) {
    errors.push({ level: 'error', code: 'no_h1', title: 'Brak nagłówka H1!', action: 'Dodaj jeden nagłówek <h1> na stronie' })
  } else if (scrapedData.h1Tags.length === 1) {
    score += 15
    good.push({ level: 'good', code: 'h1_ok', title: 'Dokładnie jeden nagłówek H1', action: 'OK' })
  } else {
    warnings.push({ level: 'warning', code: 'multiple_h1', title: `${scrapedData.h1Tags.length} nagłówków H1`, action: 'Użyj tylko jednego H1 na stronie' })
    score += 10
  }

  const contentLen = scrapedData.contentText.length
  if (contentLen < 300) {
    errors.push({ level: 'error', code: 'thin_content', title: `Mało treści (${contentLen} znaków)`, action: 'Dodaj więcej treści (min. 300 znaków)' })
  } else if (contentLen >= 500) {
    score += 20
    good.push({ level: 'good', code: 'good_content', title: 'Dobra ilość treści', action: 'OK' })
  } else {
    score += 15
    warnings.push({ level: 'warning', code: 'medium_content', title: `Treść: ${contentLen} znaków`, action: 'Rozważ dodanie więcej treści (min. 500)' })
  }

  if (scrapedData.imagesWithoutAlt > 0) {
    warnings.push({ level: 'warning', code: 'images_no_alt', title: `${scrapedData.imagesWithoutAlt} obrazów bez ALT`, action: 'Dodaj atrybut alt do wszystkich obrazów' })
  } else if (scrapedData.totalImages > 0) {
    good.push({ level: 'good', code: 'images_ok', title: 'Wszystkie obrazy mają ALT', action: 'OK' })
  }

  if (!scrapedData.canonical) {
    warnings.push({ level: 'warning', code: 'no_canonical', title: 'Brak linku kanonicznego', action: 'Dodaj <link rel="canonical">' })
  } else {
    good.push({ level: 'good', code: 'canonical_ok', title: 'Link kanoniczny jest ustawiony', action: 'OK' })
  }

  if (scrapedData.hasOpenGraph) {
    score += 5
    good.push({ level: 'good', code: 'og_ok', title: 'Open Graph jest skonfigurowany', action: 'OK' })
  } else {
    warnings.push({ level: 'warning', code: 'no_og', title: 'Brak Open Graph', action: 'Dodaj meta tagi OG dla social media' })
  }

  if (scrapedData.hasStructuredData) {
    score += 5
    good.push({ level: 'good', code: 'schema_ok', title: 'Dane strukturalne są obecne', action: 'OK' })
  } else {
    warnings.push({ level: 'warning', code: 'no_schema', title: 'Brak danych strukturalnych', action: 'Rozważ dodanie Schema.org/JSON-LD' })
  }

  const summary = score >= 75
    ? 'Twoja strona jest dobrze zoptymalizowana pod kątem SEO. Możesz jeszcze poprawić kilka drobnych elementów.'
    : score >= 55
    ? 'Strona wymaga kilku poprawek SEO. Najważniejsze to uzupełnienie brakujących elementów.'
    : 'Strona potrzebuje znaczących poprawek SEO. Zacznij od naprawienia błędów.'

  const generalStatus = score >= 75
    ? 'Twoja strona jest w dobrym stanie! Podstawowe elementy SEO są na swoim miejscu. Kilka drobnych poprawek może jeszcze bardziej poprawić widoczność w Google.'
    : score >= 55
    ? 'Strona ma fundamenty SEO, ale jest kilka rzeczy do poprawienia. Drobne zmiany mogą przynieść duże efekty!'
    : 'Strona potrzebuje Twojej uwagi. Zacznij od najważniejszych elementów, a zobaczysz poprawę w wynikach wyszukiwania.'

  const improvements: string[] = []
  if (errors.some(e => e.code === 'no_title')) improvements.push('Dodaj tytuł strony w ustawieniach SEO')
  if (errors.some(e => e.code === 'no_meta_desc')) improvements.push('Dodaj opis strony (meta description)')
  if (errors.some(e => e.code === 'no_h1')) improvements.push('Dodaj główny nagłówek H1')
  if (errors.some(e => e.code === 'thin_content')) improvements.push('Dodaj więcej treści na stronę')
  if (warnings.some(w => w.code === 'images_no_alt')) improvements.push('Dodaj opisy ALT do wszystkich zdjęć')

  const goodPoints: string[] = []
  if (good.some(g => g.code === 'title_ok')) goodPoints.push('Tytuł strony jest poprawny!')
  if (good.some(g => g.code === 'meta_desc_ok')) goodPoints.push('Opis strony jest dobry!')
  if (good.some(g => g.code === 'h1_ok')) goodPoints.push('Nagłówek główny jest w porządku!')
  if (good.some(g => g.code === 'good_content')) goodPoints.push('Masz wystarczająco dużo treści!')
  if (good.some(g => g.code === 'canonical_ok')) goodPoints.push('Link kanoniczny jest ustawiony!')

  const suggestions: string[] = []
  if (warnings.some(w => w.code === 'title_length')) suggestions.push('Skróć lub wydłuż tytuł do 30-60 znaków')
  if (warnings.some(w => w.code === 'meta_desc_length')) suggestions.push('Dostosuj opis do 120-160 znaków')
  if (warnings.some(w => w.code === 'images_no_alt')) suggestions.push('Przejdź do edycji zdjęć i dodaj opisy ALT')
  if (goodPoints.length > improvements.length) suggestions.push('Utrzymuj regularnie treść strony świeżą!')
  if (improvements.length === 0) suggestions.push('Twoja strona jest gotowa na lepsze pozycje w Google!')

  const keywords = [
    { term: scrapedData.title.split(' ').slice(0, 3).join(' ').toLowerCase(), priority: 'high' as const },
    { term: scrapedData.h1Tags[0]?.split(' ').slice(0, 2).join(' ').toLowerCase() || '', priority: 'high' as const },
    { term: scrapedData.metaDescription.split(' ').slice(0, 4).join(' ').toLowerCase(), priority: 'medium' as const },
  ].filter(k => k.term.length > 2)

  return {
    score: clamp(score),
    summary,
    generalStatus,
    improvements,
    goodPoints,
    suggestions,
    keywords,
    issues: { errors, warnings, good },
  }
}

export type SitemapPage = {
  path: string
  priority: 'high' | 'medium' | 'low'
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  lastmod?: string
}

export type SitemapResult = {
  urls: SitemapPage[]
  xml: string
}

export async function generateSitemapXml(
  pages: Array<{ path: string; title?: string; language_code?: string }>,
  websiteUrl: string
): Promise<SitemapResult> {
  const pagesInfo = pages.map((p) => ({
    path: p.path,
    title: p.title || '',
    language: p.language_code || 'pl',
  }))

  const systemPrompt = `Jesteś ekspertem SEO specjalizującym się w tworzeniu optymalnych plików sitemap.xml dla stron internetowych. Znasz wszystkie najlepsze praktyki Google dla sitemap.

ZASADY TWORZENIA SITEMAP:
1. Priorytety: Strona główna = 1.0, Podstrony główne = 0.8-0.9, Podstrony drugiego poziomu = 0.6-0.7, Podstrony trzeciego poziomu = 0.4-0.5
2. Changefreq: Strona główna = daily, Aktualności/Blog = daily/weekly, O nas/Kontakt = monthly/yearly
3. Lastmod: Data ostatniej modyfikacji strony (jeśli brak, użyj obecnej daty)
4. Wszystkie URL muszą być pełne i poprawne
5. Katalogi bez indexu (np. /blog/) też dodawaj
6. Dodawaj alternatywne wersje językowe jeśli strona jest wielojęzyczna

WAŻNE:
- Nie dodawaj URL z parametrami (?id=123, ?page=2)
- Nie dodawaj URL z fragmentami (#section)
- Sprawdź czy ścieżki są poprawne
- Upewnij się że nie ma duplikatów`

  const userPrompt = `Wygeneruj sitemap.xml dla strony: ${websiteUrl}

STRONY DO UWZGLĘDNIENIA:
${pagesInfo.map((p) => `- ${p.path} (${p.language}) ${p.title ? `- "${p.title}"` : ''}`).join('\n')}

ZWRÓĆ TYLKO JSON:
{
  "urls": [
    { "path": "/", "priority": "high", "changefreq": "daily" },
    { "path": "/o-nas", "priority": "medium", "changefreq": "monthly" }
  ],
  "xml": "PEŁNA ZAWARTOŚĆ PLIKU SITEMAP.XML (poprawny XML z wszystkimi URL)"
}`

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error || response.statusText || 'Unknown error';
    throw new Error(`Błąd AI (${response.status}): ${errorMsg}`);
  }

  const data = await response.json()
  const content = data?.response

  if (!content) {
    throw new Error('Brak odpowiedzi od AI')
  }

  let jsonStr = content.trim()
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }

  const parsed = JSON.parse(jsonStr) as { urls?: SitemapPage[], xml?: string }

  const urls: SitemapPage[] = Array.isArray(parsed.urls) ? parsed.urls : []
  let xml = parsed.xml || ''

  if (!xml && urls.length > 0) {
    const base = websiteUrl.replace(/\/+$/, '')
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    xml += urls.map(u => {
      const loc = `${base}${u.path}`
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''
      return `  <url><loc>${loc}</loc>${lastmod}<changefreq>${u.changefreq}</changefreq><priority>${u.priority === 'high' ? '1.0' : u.priority === 'medium' ? '0.7' : '0.4'}</priority></url>`
    }).join('\n')
    xml += '\n</urlset>'
  }

  return { urls, xml }
}

export type MetaTagsResult = {
  title: string
  description: string
  og_title: string
  og_description: string
}

export async function improveMetaTags(
  currentTitle: string,
  currentDescription: string,
  websiteUrl: string
): Promise<MetaTagsResult> {
  const websiteData = await scrapeWebsite(websiteUrl)

  const systemPrompt = `Jesteś ekspertem SEO z 15-letnim doświadczeniem. Specjalizujesz się w optymalizacji meta tagów dla polskich stron internetowych. Twoja rola to tworzenie chwytliwych tytułów i opisów, które:
- Zawierają główne słowa kluczowe na początku
- Są atrakcyjne dla użytkowników w wynikach Google
- Zachęcają do kliknięcia
- Mieszczą się w limitach znaków (tytuł: 50-60, opis: 150-160)
- Zawierają wezwanie do działania (CTA) w opisie
- Są unikalne i nie powtarzają fraz

Odpowiadasz TYLKO w formacie JSON.`

  const userPrompt = `Popraw i zoptymalizuj meta tagi dla tej strony.

STRONA:
- URL: ${websiteUrl}
- Aktualny tytuł: ${currentTitle || '(brak)'}
- Aktualny opis: ${currentDescription || '(brak)'}
- Tytuł strony (z HTML): ${websiteData.title || '(brak)'}
- Opis meta: ${websiteData.metaDescription || '(brak)'}
- Nagłówek H1: ${websiteData.h1Tags[0] || '(brak)'}
- Nagłówki H2: ${websiteData.h2Tags.slice(0, 3).join(', ') || '(brak)'}
- Treść strony (fragment): ${websiteData.contentText.slice(0, 500)}

ZWRÓĆ TYLKO JSON:
{
  "title": "Poprawiony tytuł Google (50-60 znaków, z frazami kluczowymi, bez nawiasów ani caps locka)",
  "description": "Poprawiony opis Google (150-160 znaków, z CTA, zachęcający do kliknięcia, z głównymi słowami kluczowymi)",
  "og_title": "Tytuł dla social media (60-70 znaków, chwytliwy, zachęcający do udostępnienia)",
  "og_description": "Opis dla social media (150-200 znaków, zachęcający do kliknięcia i udostępnienia)"
}`

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error || response.statusText || 'Unknown error';
    throw new Error(`Błąd AI (${response.status}): ${errorMsg}`);
  }

  const data = await response.json()
  const content = data?.response

  if (!content) {
    throw new Error('Brak odpowiedzi od AI')
  }

  let jsonStr = content.trim()
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
  }

  const parsed = JSON.parse(jsonStr) as MetaTagsResult

  return {
    title: truncate(parsed.title, 60),
    description: truncate(parsed.description, 160),
    og_title: truncate(parsed.og_title || parsed.title, 70),
    og_description: truncate(parsed.og_description || parsed.description, 200),
  }
}
