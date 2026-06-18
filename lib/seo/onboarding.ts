import { getWebsiteUrl } from '../websiteUrl'
import { getSiteSettings } from '../cms'
import { fetchPageMeta } from './audit'

export interface OnboardingCheckItem {
  id: string
  label: string
  description: string
  status: 'pending' | 'checking' | 'completed' | 'failed'
  error?: string
  checkedAt?: string
}

export interface OnboardingStatus {
  websiteUrl: string | null
  domainConfigured: boolean
  sslActive: boolean
  searchConsoleVerified: boolean
  sitemapAccessible: boolean
  sitemapSubmitted: boolean
  robotsCorrect: boolean
  pagesNoIndex: boolean
  items: OnboardingCheckItem[]
  completedCount: number
  totalCount: number
  percentage: number
}

async function checkSSL(url: string): Promise<{ active: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })
    return { active: true }
  } catch (error) {
    const err = error as Error
    if (err.message.includes('SSL') || err.message.includes('certificate')) {
      return { active: false, error: 'Certyfikat SSL jest nieprawidłowy lub wygasły' }
    }
    return { active: false, error: err.message }
  }
}

async function checkSitemap(url: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const sitemapUrl = url.endsWith('/') ? `${url}sitemap.xml` : `${url}/sitemap.xml`
    const response = await fetch(sitemapUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'CMS Onboarding Check/1.0' },
    })
    
    if (!response.ok) {
      return { accessible: false, error: `Sitemap zwraca HTTP ${response.status}` }
    }
    
    const content = await response.text()
    if (!content.includes('<urlset') && !content.includes('<sitemapindex')) {
      return { accessible: false, error: 'Sitemap ma nieprawidłowy format' }
    }
    
    return { accessible: true }
  } catch (error) {
    return { accessible: false, error: 'Nie można pobrać sitemap' }
  }
}

async function checkRobots(url: string): Promise<{ correct: boolean; error?: string; content?: string }> {
  try {
    const robotsUrl = url.endsWith('/') ? `${url}robots.txt` : `${url}/robots.txt`
    const response = await fetch(robotsUrl, {
      method: 'GET',
    })
    
    if (!response.ok) {
      return { correct: false, error: 'Brak pliku robots.txt' }
    }
    
    const content = await response.text()
    
    const hasSitemap = content.toLowerCase().includes('sitemap:')
    const allowsCrawling = content.toLowerCase().includes('disallow: /') === false ||
                          content.match(/user-agent:\s*\*/i)?.input?.includes('allow: /')
    
    if (!hasSitemap) {
      return { correct: false, error: 'robots.txt nie zawiera dyrektywy Sitemap', content }
    }
    
    return { correct: true, content }
  } catch (error) {
    return { correct: false, error: 'Nie można pobrać robots.txt' }
  }
}

async function checkSearchConsole(settings: Record<string, any>): Promise<{ verified: boolean; error?: string }> {
  const code = settings?.search_console_code || ''
  
  if (!code) {
    return { verified: false, error: 'Kod weryfikacyjny nie został skonfigurowany' }
  }
  
  let verificationCode = code
  if (code.includes('content=')) {
    const match = code.match(/content=["']([^"']+)["']/)
    if (match) verificationCode = match[1]
  }
  
  if (verificationCode.length < 10) {
    return { verified: false, error: 'Kod weryfikacyjny wydaje się nieprawidłowy' }
  }
  
  return { verified: true }
}

async function checkNoIndexIssues(url: string): Promise<{ ok: boolean; error?: string; noindexCount: number }> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CMS Onboarding Check/1.0' },
    })
    
    if (!response.ok) {
      return { ok: false, error: `Strona zwraca HTTP ${response.status}`, noindexCount: 0 }
    }
    
    const html = await response.text()
    const noindexMatches = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/gi) || []
    
    if (noindexMatches.length > 0) {
      return { 
        ok: false, 
        error: `Znaleziono ${noindexMatches.length} instrukcji noindex na stronie głównej`,
        noindexCount: noindexMatches.length 
      }
    }
    
    return { ok: true, noindexCount: 0 }
  } catch (error) {
    return { ok: false, error: 'Nie można sprawdzić strony', noindexCount: 0 }
  }
}

export async function performOnboardingCheck(): Promise<OnboardingStatus> {
  const items: OnboardingCheckItem[] = []
  let completedCount = 0
  
  let websiteUrl: string | null = null
  let domainConfigured = false
  let sslActive = false
  let searchConsoleVerified = false
  let sitemapAccessible = false
  let sitemapSubmitted = false
  let robotsCorrect = false
  let pagesNoIndex = false
  
  try {
    const settings = await getSiteSettings()
    websiteUrl = await getWebsiteUrl()
    
    domainConfigured = Boolean(websiteUrl && 
      websiteUrl !== 'https://www.inteligentnefolie.pl' &&
      !websiteUrl.includes('localhost') &&
      !websiteUrl.includes('127.0.0.1')
    )
    
    items.push({
      id: 'domain',
      label: 'Domena skonfigurowana',
      description: 'Domena musi być prawidłowo skonfigurowana w Ustawieniach Strony (website_url)',
      status: domainConfigured ? 'completed' : 'failed',
      checkedAt: new Date().toISOString(),
      error: domainConfigured ? undefined : 'Domena nie jest skonfigurowana lub używa domyślnej wartości',
    })
    if (domainConfigured) completedCount++
    
  } catch (error) {
    items.push({
      id: 'domain',
      label: 'Domena skonfigurowana',
      description: 'Błąd podczas pobierania ustawień',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Nieznany błąd',
    })
  }
  
  if (websiteUrl) {
    const ssl = await checkSSL(websiteUrl)
    items.push({
      id: 'ssl',
      label: 'SSL aktywny',
      description: 'Certyfikat SSL musi być ważny (strona powinna być dostępna przez HTTPS)',
      status: ssl.active ? 'completed' : 'failed',
      error: ssl.error,
      checkedAt: new Date().toISOString(),
    })
    sslActive = ssl.active
    if (ssl.active) completedCount++
    
    const sitemap = await checkSitemap(websiteUrl)
    items.push({
      id: 'sitemap',
      label: 'Sitemap dostępny',
      description: 'Plik sitemap.xml musi być dostępny pod adresem /sitemap.xml',
      status: sitemap.accessible ? 'completed' : 'failed',
      error: sitemap.error,
      checkedAt: new Date().toISOString(),
    })
    sitemapAccessible = sitemap.accessible
    if (sitemap.accessible) completedCount++
    
    const robots = await checkRobots(websiteUrl)
    items.push({
      id: 'robots',
      label: 'Robots.txt prawidłowy',
      description: 'Plik robots.txt powinien istnieć i zawierać dyrektywę Sitemap',
      status: robots.correct ? 'completed' : 'failed',
      error: robots.error,
      checkedAt: new Date().toISOString(),
    })
    robotsCorrect = robots.correct
    if (robots.correct) completedCount++
    
    const noindex = await checkNoIndexIssues(websiteUrl)
    items.push({
      id: 'noindex',
      label: 'Brak instrukcji noindex',
      description: 'Strona główna nie powinna zawierać instrukcji noindex',
      status: noindex.ok ? 'completed' : 'failed',
      error: noindex.error,
      checkedAt: new Date().toISOString(),
    })
    pagesNoIndex = noindex.ok
    if (noindex.ok) completedCount++
  }
  
  try {
    const settings = await getSiteSettings()
    const sc = await checkSearchConsole(settings)
    items.push({
      id: 'searchconsole',
      label: 'Weryfikacja Search Console',
      description: 'Kod weryfikacyjny Google Search Console musi być skonfigurowany',
      status: sc.verified ? 'completed' : 'failed',
      error: sc.error,
      checkedAt: new Date().toISOString(),
    })
    searchConsoleVerified = sc.verified
    if (sc.verified) completedCount++
  } catch (error) {
    items.push({
      id: 'searchconsole',
      label: 'Weryfikacja Search Console',
      description: 'Błąd podczas sprawdzania',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Nieznany błąd',
    })
  }
  
  items.push({
    id: 'sitemap-submit',
    label: 'Sitemap wysłany do Google',
    description: 'Sitemap powinien być zgłoszony w Google Search Console (krok manualny)',
    status: 'pending',
    error: sitemapSubmitted ? undefined : 'Wymaga ręcznego zgłoszenia w Google Search Console',
    checkedAt: new Date().toISOString(),
  })
  
  const totalCount = items.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  
  return {
    websiteUrl,
    domainConfigured,
    sslActive,
    searchConsoleVerified,
    sitemapAccessible,
    sitemapSubmitted,
    robotsCorrect,
    pagesNoIndex,
    items,
    completedCount,
    totalCount,
    percentage,
  }
}

export function getOnboardingMessage(status: OnboardingStatus): string {
  if (status.percentage === 100) {
    return 'Gratulacje! Twój serwis jest w pełni skonfigurowany pod kątem SEO.'
  }
  
  if (status.percentage >= 75) {
    return 'Prawie gotowe! Dokończ pozostałe kroki, aby w pełni zoptymalizować serwis.'
  }
  
  if (status.percentage >= 50) {
    return 'Połowa drogi za nami. Kontynuuj konfigurację, aby poprawić widoczność w Google.'
  }
  
  if (status.percentage >= 25) {
    return 'Rozpocznij konfigurację. Te podstawowe kroki są kluczowe dla indeksacji.'
  }
  
  return 'Zacznij od podstaw. Upewnij się, że domena i SSL są prawidłowo skonfigurowane.'
}
