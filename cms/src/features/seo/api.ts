import { pb, TENANT_ID } from '@/lib/pocketbase'
import { triggerRevalidation } from '@/lib/revalidate'
import type { CmsPageRow, SeoAiSuggestion, SeoAudit, SeoAuditKeyword, SeoIssues, SeoPageAnalysis } from './types'

export type WebsiteRow = { id: string; name: string }

type SiteContentRow = CmsPageRow['content'][number]

function pageIdFromPath(path: string): string {
  return path === '/' ? 'home' : path.replace(/\//g, '_')
}

function readStringContent(value: unknown): string {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') return parsed
      if (parsed && typeof parsed === 'object') {
        return (parsed as Record<string, string>).text || (parsed as Record<string, string>).value || value
      }
    } catch {
      return value
    }
    return value
  }

  if (value && typeof value === 'object') {
    return (value as Record<string, string>).text || (value as Record<string, string>).value || ''
  }

  return ''
}

function buildCmsPageRow(path: string, rows: SiteContentRow[]): CmsPageRow {
  const titleRow =
    rows.find((row) => row.section_key === 'page_title') ||
    rows.find((row) => row.section_key === 'hero_title') ||
    rows.find((row) => row.section_key.includes('title'))

  const metaTitle = rows.find((row) => row.section_key === 'meta_title')
  const metaDescription = rows.find((row) => row.section_key === 'meta_description')
  const canonical = rows.find((row) => row.section_key === '_seo_canonical')
  const indexable = rows.find((row) => row.section_key === '_seo_indexable')
  const ogTitle = rows.find((row) => row.section_key === '_og_title')
  const ogDescription = rows.find((row) => row.section_key === '_og_description')
  const ogImage = rows.find((row) => row.section_key === '_og_image')

  const timestamps = rows
    .flatMap((row) => [row.created_at, row.updated_at])
    .filter((value): value is string => Boolean(value))
    .sort()

  const fallbackTitle = path === '/' ? 'Home' : path.split('/').filter(Boolean).pop() || path

  return {
    id: pageIdFromPath(path),
    title: readStringContent(titleRow?.content_value) || fallbackTitle,
    path,
    language_code: rows[0]?.language_code || 'pl',
    is_published: true,
    content: rows,
    seo: {
      metaTitle: readStringContent(metaTitle?.content_value),
      metaDescription: readStringContent(metaDescription?.content_value),
      canonical: readStringContent(canonical?.content_value),
      indexable: readStringContent(indexable?.content_value) !== 'false',
      ogTitle: readStringContent(ogTitle?.content_value),
      ogDescription: readStringContent(ogDescription?.content_value),
      ogImage: readStringContent(ogImage?.content_value),
      hasOpenGraph: Boolean(ogTitle || ogDescription || ogImage),
    },
    updated_at: timestamps[timestamps.length - 1] || new Date().toISOString(),
  }
}

async function listActivePageContent(): Promise<SiteContentRow[]> {
  try {
    const tenantId = await getWebsiteId();
    const records = await pb.collection('site_content').getFullList({
      filter: `website_id = "${tenantId}" && is_active = true && page_path != "common"`,
      sort: 'page_path,order_index',
      requestKey: null,
    });
    return records as unknown as SiteContentRow[];
  } catch (err) {
    console.error('Error listing active page content:', err);
    return [];
  }
}

export async function upsertSiteValue(pagePath: string, sectionKey: string, value: unknown, languageCode = 'pl', contentType = 'text') {
  try {
    const tenantId = await getWebsiteId();
    const filter = `website_id = "${tenantId}" && page_path = "${pagePath}" && section_key = "${sectionKey}" && language_code = "${languageCode}"`;
    const existing = await pb.collection('site_content').getFirstListItem(filter, { requestKey: null }).catch(() => null);

    if (existing) {
      await pb.collection('site_content').update(existing.id, {
        content_value: value,
        content_type: contentType,
        is_active: true,
      }, { requestKey: null });
    } else {
      await pb.collection('site_content').create({
        page_path: pagePath,
        section_key: sectionKey,
        content_value: value,
        language_code: languageCode,
        content_type: contentType,
        is_active: true,
        order_index: 0,
        website_id: tenantId,
      }, { requestKey: null });
    }
  } catch (err) {
    console.error('Error upserting site value:', err);
    throw err;
  }
}

export async function getWebsiteId(): Promise<string> {
  if (pb.authStore.model && pb.authStore.model.website_id) {
    return pb.authStore.model.website_id;
  }
  return TENANT_ID;
}

export async function listCmsPages(): Promise<CmsPageRow[]> {
  const rows = await listActivePageContent()
  const grouped = new Map<string, any[]>()

  rows.forEach((row: any) => {
    const path = row.page_path || '/'
    const current = grouped.get(path) || []
    current.push(row)
    grouped.set(path, current)
  })

  return Array.from(grouped.entries())
    .map(([path, pageRows]) => buildCmsPageRow(path, pageRows))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export async function insertSeoAudit(input: {
  website_id: string
  score: number
  issues: SeoIssues
  summary: string
  generalStatus?: string
  improvements?: string[]
  goodPoints?: string[]
  suggestions?: string[]
  keywords?: SeoAuditKeyword[]
}) {
  try {
    const now = new Date().toISOString();
    console.log('[insertSeoAudit] Saving audit:', { website_id: input.website_id, score: input.score, summary: input.summary, created: now });
    const record = await pb.collection('seo_audits').create({
      ...input,
      created: now,
    });
    console.log('[insertSeoAudit] Saved successfully:', record);
    return { ...record, created_at: record.created } as unknown as SeoAudit;
  } catch (err) {
    console.error('[insertSeoAudit] Error:', err);
    throw err;
  }
}

function generatePocketBaseId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function insertSeoPageAnalyses(
  rows: Array<{ website_id: string; slug: string; language_code: string; score: number; issues: SeoIssues }>,
) {
  try {
    const promises = rows.map(async row => {
      const generatedId = generatePocketBaseId();
      try {
        const record = await pb.collection('seo_page_analysis').create({
          id: generatedId,
          website_id: row.website_id,
          slug: row.slug,
          language_code: row.language_code,
          score: row.score,
          issues: JSON.stringify(row.issues),
          recommendations: '[]'
        }, { requestKey: null });
        return { id: record.id };
      } catch (err: any) {
        console.error(`Error creating analysis for ${row.slug}:`, JSON.stringify(err?.response?.data || {}));
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.filter(r => r !== null) as Array<{ id: string }>;
  } catch (err) {
    console.error('Error inserting page analyses:', err);
    return [];
  }
}

export async function listSeoAudits(websiteId: string, limit = 12): Promise<SeoAudit[]> {
  try {
    const records = await pb.collection('seo_audits').getList(1, Math.max(limit, 12), {
      filter: `website_id = "${websiteId}"`,
      sort: '-created',
      requestKey: null,
      $autoCancel: false,
    })
    return records.items.map(r => ({ ...r, created_at: r.created })) as unknown as SeoAudit[]
  } catch (err) {
    try {
      const records = await pb.collection('seo_audits').getList(1, Math.max(limit, 50), {
        filter: `website_id = "${websiteId}"`,
        requestKey: null,
        $autoCancel: false,
      })
      const items = (records.items || []) as any[]
      items.sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime())
      return items.slice(0, limit).map(r => ({ ...r, created_at: r.created })) as unknown as SeoAudit[]
    } catch {}
    console.error('Error listing SEO audits:', err);
    return [];
  }
}

export async function getLatestSeoAudit(websiteId: string): Promise<SeoAudit | null> {
  try {
    const list = await pb.collection('seo_audits').getList(1, 1, {
      filter: `website_id = "${websiteId}" && score > 0`,
      sort: '-created',
      requestKey: null,
      $autoCancel: false,
    })

    const items = (list.items || []) as any[]
    if (items.length === 0) return null
    return { ...items[0], created_at: items[0].created } as unknown as SeoAudit
  } catch (err) {
    try {
      const list = await pb.collection('seo_audits').getList(1, 50, {
        filter: `website_id = "${websiteId}" && score > 0`,
        requestKey: null,
        $autoCancel: false,
      })
      const items = (list.items || []) as any[]
      const withCreated = items.filter(i => i?.created)
      if (withCreated.length === 0) return null
      withCreated.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      return { ...withCreated[0], created_at: withCreated[0].created } as unknown as SeoAudit
    } catch {}
    console.error('[getLatestSeoAudit] Error:', err);
    return null;
  }
}

export async function getLatestAuditDate(websiteId: string): Promise<string | null> {
  try {
    const record = await pb.collection('seo_audits').getList(1, 1, {
      filter: `website_id = "${websiteId}"`,
      sort: '-created',
      $autoCancel: false,
    });
    if (record.items.length > 0) {
      return record.items[0].created;
    }
    return null;
  } catch {
    return null;
  }
}

export async function listLatestPageAnalysis(websiteId: string): Promise<SeoPageAnalysis[]> {
  try {
    const pagesRes = await pb.collection('cms_pages').getList(1, 1, {
      filter: `website_id = "${websiteId}"`,
      requestKey: null,
      $autoCancel: false,
    }).catch(() => ({ totalItems: 50 } as any))

    const expectedUnique = Math.max(1, Number(pagesRes?.totalItems || 0)) * 2
    const perPage = 200
    const maxRecords = 2000

    const uniqueMap = new Map<string, any>()
    let processed = 0

    for (let page = 1; page <= 50 && processed < maxRecords && uniqueMap.size < expectedUnique; page++) {
      const list = await pb.collection('seo_page_analysis').getList(page, perPage, {
        filter: `website_id = "${websiteId}"`,
        sort: '-created',
        fields: 'id,created,updated,website_id,page_slug,slug,language_code,score,issues,recommendations',
        requestKey: null,
        $autoCancel: false,
      })

      const items = (list.items || []) as any[]
      if (items.length === 0) break

      processed += items.length

      for (const record of items) {
        const slug = record.page_slug || record.slug || ''
        const lang = record.language_code || 'pl'
        const key = `${slug}_${lang}`
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, record)
        }
      }

      if (items.length < perPage) break
    }

    return Array.from(uniqueMap.values()).map(r => ({ ...r, created_at: r.created })) as unknown as SeoPageAnalysis[]
  } catch (err) {
    console.error('Error listing latest page analysis:', err);
    return [];
  }
}

export async function upsertPageSeo(pageId: string, seoPatch: Record<string, unknown>) {
  const pages = await listCmsPages()
  const page = pages.find((entry) => entry.id === pageId)
  if (!page) throw new Error('Page not found in site_content')

  const nextSeo = { ...page.seo, ...seoPatch }
  await Promise.all([
    nextSeo.metaTitle !== undefined ? upsertSiteValue(page.path, 'meta_title', nextSeo.metaTitle, page.language_code) : Promise.resolve(),
    nextSeo.metaDescription !== undefined ? upsertSiteValue(page.path, 'meta_description', nextSeo.metaDescription, page.language_code) : Promise.resolve(),
    nextSeo.canonical !== undefined ? upsertSiteValue(page.path, '_seo_canonical', nextSeo.canonical, page.language_code) : Promise.resolve(),
    nextSeo.indexable !== undefined ? upsertSiteValue(page.path, '_seo_indexable', String(nextSeo.indexable), page.language_code) : Promise.resolve(),
    nextSeo.ogTitle !== undefined ? upsertSiteValue(page.path, '_og_title', nextSeo.ogTitle, page.language_code) : Promise.resolve(),
    nextSeo.ogDescription !== undefined ? upsertSiteValue(page.path, '_og_description', nextSeo.ogDescription, page.language_code) : Promise.resolve(),
    nextSeo.ogImage !== undefined ? upsertSiteValue(page.path, '_og_image', nextSeo.ogImage, page.language_code, 'image') : Promise.resolve(),
  ])

  await triggerRevalidation([page.path])
  return { id: pageId }
}

export async function insertAiSuggestions(input: {
  website_id: string
  page_slug: string
  language_code: string
  suggestions: SeoAiSuggestion['suggestions']
}) {
  try {
    const record = await pb.collection('seo_ai_suggestions').create({ ...input, applied: false });
    return record as unknown as SeoAiSuggestion;
  } catch (err) {
    console.error('Error inserting AI suggestions:', err);
    throw err;
  }
}

export async function listAiSuggestions(websiteId: string, slug: string, languageCode: string) {
  try {
    const records = await pb.collection('seo_ai_suggestions').getList(1, 5, {
      filter: `website_id = "${websiteId}" && page_slug = "${slug}" && language_code = "${languageCode}"`,
      
    });
    return records.items as unknown as SeoAiSuggestion[];
  } catch (err) {
    return [];
  }
}

export async function listAiSuggestionGroups(websiteId: string, limit = 50): Promise<SeoAiSuggestion[]> {
  try {
    const records = await pb.collection('seo_ai_suggestions').getList(1, limit, {
      filter: `website_id = "${websiteId}" && applied = false`,
      requestKey: null,
      $autoCancel: false,
    })

    const items = (records.items || []) as any[]
    items.sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime())
    return items as unknown as SeoAiSuggestion[]
  } catch (err) {
    console.error('Error listing AI suggestion groups:', err)
    return []
  }
}

export async function markAiSuggestionGroupApplied(id: string): Promise<void> {
  await pb.collection('seo_ai_suggestions').update(id, { applied: true }, { requestKey: null })
}

export async function markSuggestionApplied(id: string) {
  await pb.collection('seo_ai_suggestions').update(id, { applied: true });
}

export async function getSeoMeta(websiteId: string) {
  try {
    return await pb.collection('seo_meta').getFirstListItem(`website_id = "${websiteId}"`);
  } catch (err) {
    return null;
  }
}

export async function upsertSeoMeta(websiteId: string, patch: Record<string, unknown>) {
  try {
    const existing = await pb.collection('seo_meta').getFirstListItem(`website_id = "${websiteId}"`, { requestKey: null }).catch(() => null);
    if (existing) {
      return await pb.collection('seo_meta').update(existing.id, patch, { requestKey: null });
    } else {
      return await pb.collection('seo_meta').create({ website_id: websiteId, ...patch }, { requestKey: null });
    }
  } catch (err) {
    throw err;
  }
}

export async function getSitemap(websiteId: string) {
  try {
    return await pb.collection('seo_sitemap').getFirstListItem(`website_id = "${websiteId}"`);
  } catch (err) {
    return null;
  }
}

export async function setSitemap(websiteId: string, status: string, xmlContent?: string) {
  try {
    const existing = await pb.collection('seo_sitemap').getFirstListItem(`website_id = "${websiteId}"`, { requestKey: null }).catch(() => null);
    const data = { website_id: websiteId, status, last_generated: new Date().toISOString(), xml_content: xmlContent || null };
    if (existing) {
      return await pb.collection('seo_sitemap').update(existing.id, data, { requestKey: null });
    } else {
      return await pb.collection('seo_sitemap').create(data, { requestKey: null });
    }
  } catch (err) {
    throw err;
  }
}

export async function countVisitsByPage(days = 30) {
  // Stub for visits - website_visits collection would be needed in PB
  return [];
}

export async function upsertAnalyticsSnapshot(websiteId: string, rows: Array<{ page_slug: string; visits: number }>) {
  // Stub for analytics snapshot
}

export type BlogPostRow = { id: string; title: string; slug: string; published_at: string | null }

export async function listBlogPosts(): Promise<BlogPostRow[]> {
  try {
    const tenantId = await getWebsiteId();
    const records = await pb.collection('blog_posts').getFullList({
      filter: `website_id = "${tenantId}" && published_at != null`,
      sort: '-published_at',
    });
    return records as unknown as BlogPostRow[];
  } catch (err) {
    return [];
  }
}

export async function getAnalyticsOverview(days = 30): Promise<{
  pages: PageVisit[]
  posts: PageVisit[]
  totalVisits: number
  uniqueVisitors: number
}> {
  return {
    pages: [],
    posts: [],
    totalVisits: 0,
    uniqueVisitors: 0
  }
}

export type PageVisit = { path: string; visits: number; type: 'page' | 'post' }
