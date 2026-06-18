import { MetadataRoute } from 'next';
import { getBlogPosts, getAvailableLanguages } from '@/lib/cms'
import { pbFetch, getTenantFilter } from '@/lib/pocketbase'
import { getWebsiteUrl } from '@/lib/websiteUrl'
import { getHreflangEntries } from '@/lib/hreflang'
import { seoCities } from '@/lib/seoLocalData'
 
function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw || raw === 'home') return '/'
  if (raw === 'common' || raw === 'site_settings') return null
  if (raw.startsWith('/')) return raw === '/' ? '/' : raw.replace(/\/+$/, '')
  return `/${raw.replace(/\/+$/, '')}`
}

async function listAllPagePathsWithLastmod(): Promise<Map<string, string>> {
  const tenantFilter = getTenantFilter()
  const filter = `(${tenantFilter}) && is_active = true && page_path != "common" && page_path != "site_settings"`
  const perPage = 500
  const byPath = new Map<string, string>()

  for (let page = 1; page <= 200; page++) {
    let data: any
    try {
      data = await pbFetch(
        `site_content/records?filter=${encodeURIComponent(filter)}&fields=page_path,updated,created&sort=-updated&perPage=${perPage}&page=${page}`,
      )
    } catch {
      data = await pbFetch(`site_content/records?filter=${encodeURIComponent(filter)}&fields=page_path,updated,created&perPage=${perPage}&page=${page}`)
    }

    const items: any[] = Array.isArray(data?.items) ? data.items : []
    if (items.length === 0) break

    for (const row of items) {
      const path = normalizePath(row?.page_path)
      if (!path) continue
      const ts = String(row?.updated || row?.created || '')
      if (!ts) continue
      const current = byPath.get(path)
      if (!current || new Date(ts).getTime() > new Date(current).getTime()) {
        byPath.set(path, ts)
      }
    }

    const totalPages = Number(data?.totalPages || 0)
    if (totalPages && page >= totalPages) break
    if (items.length < perPage) break
  }

  return byPath
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getWebsiteUrl()
  const languages = await getAvailableLanguages()

  const byPath = await listAllPagePathsWithLastmod()

  const staticPages = [
    { path: '/o-nas', priority: 0.8 },
    { path: '/inteligentne-folie', priority: 0.9 },
    { path: '/montaz-folii-inteligentnej', priority: 0.8 },
    { path: '/realizacje', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
    { path: '/kontakt', priority: 0.8 },
    { path: '/regulamin', priority: 0.4 },
    { path: '/polityka-prywatnosci', priority: 0.4 },
  ]
  
  for (const page of staticPages) {
    if (!byPath.has(page.path)) {
      byPath.set(page.path, new Date().toISOString())
    }
  }

  const polishCities = seoCities.map(city => city.slug)
  
  for (const city of polishCities) {
    const cityPath = `/folia-inteligentna-${city}`
    if (!byPath.has(cityPath)) {
      byPath.set(cityPath, new Date().toISOString())
    }
  }

  try {
    const posts = await getBlogPosts('pl', 1000)
    for (const post of posts) {
      const slug = typeof post?.slug === 'string' ? post.slug.trim() : ''
      if (!slug) continue
      const path = `/blog/${slug}`
      const ts = String(post?.updated || post?.created || '')
      if (!ts) continue
      const current = byPath.get(path)
      if (!current || new Date(ts).getTime() > new Date(current).getTime()) {
        byPath.set(path, ts)
      }
    }
  } catch {}

  const entries: MetadataRoute.Sitemap = []

  for (const [path, ts] of byPath.entries()) {
    const lastModified = ts ? new Date(ts) : new Date()
    const isHome = path === '/'
    const isBlogPost = path.startsWith('/blog/') && path !== '/blog'
    const isStaticPage = !path.includes('/blog/') && !isHome

    if (languages.length > 1) {
      const hreflangEntries = await getHreflangEntries(path, 'pl', 'query')
      entries.push({
        url: hreflangEntries.default.href,
        lastModified,
        changeFrequency: isHome ? 'daily' : isBlogPost ? 'monthly' : isStaticPage ? 'weekly' : 'weekly',
        priority: isHome ? 1 : isBlogPost ? 0.6 : isStaticPage ? 0.7 : 0.8,
        links: hreflangEntries.all.map(entry => ({
          url: entry.href,
          lang: entry.hreflang,
        })),
      })
    } else {
      const baseUrl = path === '/' ? siteUrl : `${siteUrl}${path}`
      entries.push({
        url: baseUrl,
        lastModified,
        changeFrequency: isHome ? 'daily' : isBlogPost ? 'monthly' : isStaticPage ? 'weekly' : 'weekly',
        priority: isHome ? 1 : isBlogPost ? 0.6 : isStaticPage ? 0.7 : 0.8,
      })
    }
  }

  entries.sort((a, b) => a.url.localeCompare(b.url))
  return entries
}
