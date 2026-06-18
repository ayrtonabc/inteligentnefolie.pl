import { pbFetch } from '@/lib/pocketbase'
import { getTenantFilter } from '@/lib/pocketbase'
import { getWebsiteUrl } from '@/lib/websiteUrl'
import { getSiteSettings } from '@/lib/cms'

export interface FetchedPageData {
  metaTitle: string | null
  metaDescription: string | null
  canonical: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  robots: string | null
  h1: string[]
  lang: string | null
}

export interface SeoAuditResult {
  url: string
  pagePath: string
  databaseMeta: {
    metaTitle: string | null
    metaDescription: string | null
    canonical: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
    indexable: boolean
  }
  renderedMeta: FetchedPageData | null
  fetchError: string | null
  comparison: {
    metaTitleMatch: boolean
    metaDescriptionMatch: boolean
    canonicalMatch: boolean
    hasRenderedOG: boolean
    allMatch: boolean
  }
  issues: string[]
}

function parseMetaContent(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return match[1]
  }
  return null
}

function parsePropertyContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return match[1]
  }
  return null
}

function parseCanonical(html: string): string | null {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  return match ? match[1] : null
}

function parseOgImage(html: string): string | null {
  return parsePropertyContent(html, 'og:image')
}

function parseRobots(html: string): string | null {
  return parseMetaContent(html, 'robots')
}

function parseH1(html: string): string[] {
  const matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
  return matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
}

function parseLang(html: string): string | null {
  const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i)
  return match ? match[1] : null
}

export async function fetchPageMeta(url: string, timeout = 10000): Promise<FetchedPageData | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CMS SEO Auditor/1.0',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    return {
      metaTitle: parseMetaContent(html, 'title'),
      metaDescription: parseMetaContent(html, 'description'),
      canonical: parseCanonical(html),
      ogTitle: parsePropertyContent(html, 'og:title'),
      ogDescription: parsePropertyContent(html, 'og:description'),
      ogImage: parseOgImage(html),
      robots: parseRobots(html),
      h1: parseH1(html),
      lang: parseLang(html),
    }
  } catch (error) {
    console.error('Error fetching page meta:', error)
    return null
  }
}

export async function performSeoAudit(
  pagePath: string,
  dbMeta: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonical?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    indexable?: boolean
  }
): Promise<SeoAuditResult> {
  const websiteUrl = await getWebsiteUrl()
  const pageUrl = pagePath === '/' ? websiteUrl : `${websiteUrl}${pagePath}`
  
  const renderedMeta = await fetchPageMeta(pageUrl)
  
  const issues: string[] = []
  
  if (!renderedMeta) {
    issues.push('Nie można pobrać rzeczywistej strony (strona może być niedostępna)')
  } else {
    if (dbMeta.metaTitle && renderedMeta.metaTitle !== dbMeta.metaTitle) {
      issues.push(`Tytuł meta różni się: DB="${dbMeta.metaTitle}" vs Render="${renderedMeta.metaTitle}"`)
    }
    
    if (dbMeta.metaDescription && renderedMeta.metaDescription !== dbMeta.metaDescription) {
      issues.push(`Opis meta różni się: DB="${dbMeta.metaDescription?.substring(0, 50)}..." vs Render="${renderedMeta.metaDescription?.substring(0, 50)}..."`)
    }
    
    if (dbMeta.canonical && renderedMeta.canonical !== dbMeta.canonical) {
      issues.push(`Canonical różni się: DB="${dbMeta.canonical}" vs Render="${renderedMeta.canonical}"`)
    }
    
    if (!dbMeta.ogTitle && !dbMeta.ogDescription && !dbMeta.ogImage && renderedMeta.ogTitle) {
      issues.push('Strona ma Open Graph w renderze, ale nie w bazie danych')
    }
    
    if (!dbMeta.indexable && !renderedMeta.robots?.includes('noindex')) {
      issues.push('Strona oznaczona jako noindex w DB, ale render nie zawiera noindex')
    }
  }
  
  const comparison = {
    metaTitleMatch: renderedMeta ? dbMeta.metaTitle === renderedMeta.metaTitle : false,
    metaDescriptionMatch: renderedMeta ? dbMeta.metaDescription === renderedMeta.metaDescription : false,
    canonicalMatch: renderedMeta ? dbMeta.canonical === renderedMeta.canonical : false,
    hasRenderedOG: Boolean(renderedMeta?.ogTitle || renderedMeta?.ogDescription),
    allMatch: Boolean(renderedMeta && 
      dbMeta.metaTitle === renderedMeta.metaTitle &&
      dbMeta.metaDescription === renderedMeta.metaDescription &&
      dbMeta.canonical === renderedMeta.canonical
    ),
  }
  
  return {
    url: pageUrl,
    pagePath,
    databaseMeta: {
      metaTitle: dbMeta.metaTitle || null,
      metaDescription: dbMeta.metaDescription || null,
      canonical: dbMeta.canonical || null,
      ogTitle: dbMeta.ogTitle || null,
      ogDescription: dbMeta.ogDescription || null,
      ogImage: dbMeta.ogImage || null,
      indexable: dbMeta.indexable !== false,
    },
    renderedMeta,
    fetchError: renderedMeta ? null : 'Strona niedostępna lub błąd pobierania',
    comparison,
    issues,
  }
}

export async function batchAuditPages(pages: Array<{
  path: string
  metaTitle?: string | null
  metaDescription?: string | null
  canonical?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  indexable?: boolean
}>): Promise<SeoAuditResult[]> {
  const results: SeoAuditResult[] = []
  
  for (const page of pages) {
    const result = await performSeoAudit(page.path, page)
    results.push(result)
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return results
}
