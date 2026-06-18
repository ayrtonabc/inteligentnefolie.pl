import { pb, TENANT_ID } from '@/lib/pocketbase'
import { triggerRevalidation } from '@/lib/revalidate'

export type CmsPage = {
  id: string
  title: string
  path: string
  slug?: string
  language_code: string
  content: unknown
  seo: {
    metaTitle?: string
    metaDescription?: string
    canonical?: string
    indexable?: boolean
  }
  created_at: string
  updated_at: string
}

type SiteContentRow = {
  id: string
  page_path: string // PocketBase uses page_path instead of path in some places
  section_key: string
  content_type: string
  content_value: unknown
  language_code: string
  is_active: boolean
  order_index: number
  created?: string
  updated?: string
}

function pageIdFromPath(path: string): string {
  return path === '/' ? 'home' : path.replace(/\//g, '_')
}

function readStringContent(value: unknown): string {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') return parsed
      if (parsed && typeof parsed === 'object') {
        return parsed.text || parsed.value || value
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

function buildPageFromRows(rows: SiteContentRow[], path: string, languageCode = 'pl'): CmsPage {
  const titleRow =
    rows.find((row) => row.section_key === 'page_title') ||
    rows.find((row) => row.section_key === 'hero_title') ||
    rows.find((row) => row.section_key.includes('title'))

  const metaTitle = rows.find((row) => row.section_key === 'meta_title')
  const metaDescription = rows.find((row) => row.section_key === 'meta_description')
  const canonical = rows.find((row) => row.section_key === '_seo_canonical')
  const indexable = rows.find((row) => row.section_key === '_seo_indexable')

  const timestamps = rows
    .flatMap((row) => [row.created, row.updated])
    .filter((value): value is string => Boolean(value))
    .sort()

  const fallbackTitle = path === '/' ? 'Home' : path.split('/').filter(Boolean).pop() || path

  return {
    id: pageIdFromPath(path),
    title: readStringContent(titleRow?.content_value) || fallbackTitle,
    path,
    slug: path === '/' ? 'home' : path.replace(/^\//, ''),
    language_code: languageCode,
    content: rows,
    seo: {
      metaTitle: readStringContent(metaTitle?.content_value),
      metaDescription: readStringContent(metaDescription?.content_value),
      canonical: readStringContent(canonical?.content_value),
      indexable: readStringContent(indexable?.content_value) !== 'false',
    },
    created_at: timestamps[0] || new Date().toISOString(),
    updated_at: timestamps[timestamps.length - 1] || new Date().toISOString(),
  }
}

async function getRowsForPath(pagePath: string, languageCode = 'pl'): Promise<SiteContentRow[]> {
  try {
    const records = await pb.collection('site_content').getFullList<any>({
      filter: `page_path = "${pagePath}" && language_code = "${languageCode}"`,
      sort: 'order_index',
    })

    return records.map(record => ({
      id: record.id,
      page_path: record.page_path,
      section_key: record.section_key,
      content_type: record.content_type,
      content_value: record.content_value,
      language_code: record.language_code,
      is_active: true, // PocketBase records are active by default if they exist
      order_index: record.order_index,
      created: record.created,
      updated: record.updated,
    }))
  } catch (error) {
    console.error('Error fetching rows for path:', error)
    return []
  }
}

async function upsertSiteContentRow(input: {
  pagePath: string
  sectionKey: string
  contentValue: unknown
  languageCode?: string
  contentType?: string
}) {
  const languageCode = input.languageCode || 'pl'
  const contentType = input.contentType || 'text'

  try {
    const existing = await pb.collection('site_content').getFirstListItem(
      `page_path = "${input.pagePath}" && section_key = "${input.sectionKey}" && language_code = "${languageCode}"`
    ).catch(() => null)

    if (existing) {
      return await pb.collection('site_content').update(existing.id, {
        content_value: input.contentValue,
        content_type: contentType,
      })
    }

    return await pb.collection('site_content').create({
      page_path: input.pagePath,
      section_key: input.sectionKey,
      content_value: input.contentValue,
      language_code: languageCode,
      content_type: contentType,
      order_index: 0,
    })
  } catch (error) {
    console.error('Error upserting site content row:', error)
    throw error
  }
}

export async function listPages(websiteId?: string) {
  try {
    // Always scope to the active tenant for security
    const tenantId = websiteId || TENANT_ID
    
    // Obtener todas las páginas de cms_pages
    const pages = await pb.collection('cms_pages').getFullList({
      filter: `website_id = "${tenantId}"`,
      sort: 'path',
      fields: 'id,title,path,language_code,created,updated',
    });

    // Obtener fechas de modificación desde site_content
    const siteContentPages = await pb.collection('site_content').getFullList({
      filter: `website_id = "${tenantId}"`,
      sort: '-updated',
      fields: 'page_path,updated',
    });

    // Crear mapa de fechas de modificación por path
    const modificationDates = new Map();
    siteContentPages.forEach((row: any) => {
      const path = row.page_path;
      const updated = row.updated;
      if (path && updated && !modificationDates.has(path)) {
        modificationDates.set(path, updated);
      }
    });

    return pages.map((page: any) => {
      const cmsCreated = page.created;
      const cmsUpdated = page.updated;
      const contentUpdated = modificationDates.get(page.path);
      
      return {
        id: page.id,
        title: page.title,
        path: page.path,
        language_code: page.language_code || 'pl',
        created_at: cmsCreated || contentUpdated || '',
        updated_at: cmsUpdated || contentUpdated || '',
      };
    });
  } catch (error) {
    console.error('Error listing cms_pages:', error);
    return [];
  }
}

export async function createPage(input: { title: string; path: string; language_code: string; website_id?: string }) {
  // Always assign to the active tenant
  const tenantId = input.website_id || TENANT_ID

  // Check if exists for this tenant
  const existing = await pb.collection('cms_pages').getFirstListItem(
    `path = "${input.path}" && website_id = "${tenantId}"`
  ).catch(() => null)

  if (existing) {
    throw new Error('Strona o tej ścieżce już istnieje.')
  }

  const page = await pb.collection('cms_pages').create({
    title: input.title,
    slug: input.path === '/' ? 'home' : input.path.replace(/^\//, ''),
    path: input.path,
    language_code: input.language_code,
    website_id: tenantId,
    is_published: false,
  })

  // Create initial title in site_content for compatibility
  await upsertSiteContentRow({
    pagePath: input.path,
    sectionKey: 'page_title',
    contentValue: input.title,
    languageCode: input.language_code,
  })

  await triggerRevalidation([input.path])
  return page
}

export async function getPage(id: string) {
  const page = await pb.collection('cms_pages').getOne(id)
  const rows = await getRowsForPath(page.path, page.language_code)
  
  return {
    id: page.id,
    title: page.title,
    path: page.path,
    language_code: page.language_code,
    created_at: page.created,
    updated_at: page.updated,
    content: rows,
    seo: page.seo || {
      metaTitle: '',
      metaDescription: '',
      canonical: '',
      indexable: true
    }
  }
}

export async function updatePage(id: string, patch: Partial<Pick<CmsPage, 'title' | 'path' | 'language_code' | 'seo'>>) {
  const current = await getPage(id)
  const nextPath = patch.path || current.path
  const nextLanguage = patch.language_code || current.language_code

  const updatedPage = await pb.collection('cms_pages').update(id, {
    title: patch.title || current.title,
    path: nextPath,
    slug: nextPath === '/' ? 'home' : nextPath.replace(/^\//, ''),
    language_code: nextLanguage,
    seo: patch.seo ? { ...current.seo, ...patch.seo } : current.seo,
  })

  // Update site_content if path changed
  if (patch.path && patch.path !== current.path) {
    const rows = await pb.collection('site_content').getFullList({
      filter: `page_path = "${current.path}"`,
    })
    
    for (const row of rows) {
      await pb.collection('site_content').update(row.id, { page_path: nextPath })
    }
  }

  // Update title in site_content
  if (patch.title) {
    await upsertSiteContentRow({
      pagePath: nextPath,
      sectionKey: 'page_title',
      contentValue: patch.title,
      languageCode: nextLanguage,
    })
  }

  await triggerRevalidation([current.path, nextPath])
  return {
    id: updatedPage.id,
    title: updatedPage.title,
    path: updatedPage.path,
    language_code: updatedPage.language_code,
    created_at: updatedPage.created,
    updated_at: updatedPage.updated,
  }
}

export async function updateSiteContent(pagePath: string, sectionKey: string, contentValue: string, languageCode: string = 'pl') {
  const data = await upsertSiteContentRow({
    pagePath,
    sectionKey,
    contentValue,
    languageCode,
  })

  await triggerRevalidation([pagePath])
  return data
}

export async function getPageWithContent(id: string) {
  const page = await getPage(id)
  const siteContent = await getRowsForPath(page.path, page.language_code)
  return { ...page, siteContent }
}
