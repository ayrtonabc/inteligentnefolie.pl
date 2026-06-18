// ============================================================================
// SEO AUTO-FIX FUNCTIONS - FIXED VERSION
// Naprawy SEO w 1 kliknięciu - bezpośrednio z CMS
// ============================================================================

import { pb } from '@/lib/pocketbase'
import { getWebsiteId } from '@/features/seo/api'
import { triggerRevalidation } from '@/lib/revalidate'

async function getTenantId(): Promise<string> {
  const wid = await getWebsiteId()
  return wid || 'dktsle4yev6syo4'
}

function readTextValue(value: unknown): string {
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

function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function normalizePagePath(path: string): string {
  const rawPath = (path || '').trim() || '/'
  if (rawPath === '/') return '/'
  if (rawPath.startsWith('/')) return rawPath.replace(/\/+$/, '')
  return `/${rawPath.replace(/\/+$/, '')}`
}

async function getPageLanguage(path: string): Promise<string> {
  const tid = await getTenantId()
  const normalizedPath = normalizePagePath(path)
  try {
    const filter = `website_id = "${tid}" && page_path = "${normalizedPath}" && is_active = true`;
    const record = await pb.collection('site_content').getFirstListItem(filter);
    return record.language_code || 'pl';
  } catch {
    return 'pl';
  }
}

async function ensureUniqueSeoValue(
  path: string,
  sectionKey: string,
  contentValue: unknown,
  contentType = 'text',
  languageCode?: string,
): Promise<{ success: boolean; message?: string }> {
  const lang = languageCode || (await getPageLanguage(path));
  const tid = await getTenantId()
  const normalizedPath = normalizePagePath(path)

  const section = escapePbFilterValue(sectionKey)
  const langEscaped = escapePbFilterValue(lang)
  const pathEscaped = escapePbFilterValue(normalizedPath)
  
  const filter = `website_id = "${escapePbFilterValue(tid)}" && page_path = "${pathEscaped}" && section_key = "${section}" && language_code = "${langEscaped}"`

  try {
    const existing = await pb.collection('site_content').getFullList({
      filter,
      requestKey: null,
    })

    if (existing.length === 1) {
      await pb.collection('site_content').update(existing[0].id, {
        content_value: contentValue,
        content_type: contentType,
        is_active: true,
      }, { requestKey: null })
      return { success: true }
    }

    if (existing.length > 1) {
      console.warn(`[SeoFix] Found ${existing.length} duplicate records for ${sectionKey} at ${path}, keeping first, deleting others`)
      await pb.collection('site_content').update(existing[0].id, {
        content_value: contentValue,
        content_type: contentType,
        is_active: true,
      }, { requestKey: null })
      
      for (let i = 1; i < existing.length; i++) {
        try {
          await pb.collection('site_content').delete(existing[i].id, { requestKey: null })
        } catch (e) {
          console.warn(`[SeoFix] Could not delete duplicate ${existing[i].id}:`, e)
        }
      }
      return { success: true }
    }

    await pb.collection('site_content').create({
      page_path: normalizedPath,
      section_key: sectionKey,
      content_value: contentValue,
      language_code: lang,
      content_type: contentType,
      is_active: true,
      order_index: 0,
      website_id: tid,
    }, { requestKey: null })
    
    return { success: true }
  } catch (err) {
    console.error(`[SeoFix] Error upserting ${sectionKey} at ${path}:`, err)
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

async function finalizeSeoChange(path: string) {
  try {
    await triggerRevalidation([path]);
  } catch (err) {
    console.warn(`[SeoFix] Revalidation failed for ${path}, but change was saved:`, err);
  }
}

// ============================================================================
// 1. GENERATE META TITLE AUTOMATICALLY
// ============================================================================

export async function autoGenerateMetaTitle(
  path: string,
  fallback?: string
): Promise<{ success: boolean; title: string; message?: string }> {
  try {
    const tid = await getTenantId()
    const slug = path === '/' ? 'home' : path.replace(/^\//, '')
    
    let title = fallback || ''

    if (!title) {
      try {
        const heroData = await pb.collection('site_content').getFirstListItem(
          `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="hero_title" && language_code="pl" && is_active=true`,
          { requestKey: null }
        );
        if (heroData?.content_value) {
          title = readTextValue(heroData.content_value)
        }
      } catch {}
    }

    if (!title) {
      try {
        const pageTitleData = await pb.collection('site_content').getFirstListItem(
          `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="page_title" && language_code="pl" && is_active=true`,
          { requestKey: null }
        );
        if (pageTitleData?.content_value) {
          title = readTextValue(pageTitleData.content_value)
        }
      } catch {}
    }

    if (!title) {
      const slugLabel = slug === 'home' ? 'Strona główna' : slug.replace(/-/g, ' ')
      title = slugLabel.charAt(0).toUpperCase() + slugLabel.slice(1)
    }

    if (title.length < 40) {
      title = `${title} | Inteligentne Folie - Technologia Przyszłości dla Twojego Domu`
    }

    if (title.length > 60) {
      title = title.substring(0, 57) + '...'
    }

    const result = await ensureUniqueSeoValue(path, 'meta_title', title)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, title, message: result.message }
  } catch (err) {
    console.error('Error generating meta title:', err)
    return { success: false, title: '', message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================================
// 2. OPTIMIZE EXISTING META TITLE
// ============================================================================

export async function autoOptimizeMetaTitle(
  currentTitle: string,
  path: string
): Promise<{ success: boolean; title: string; message?: string }> {
  try {
    const slug = path === '/' ? 'home' : path.replace(/^\//, '')
    
    let optimized = currentTitle.trim()

    if (optimized.length < 40) {
      const suffix = slug === 'home' 
        ? '| Inteligentne Folie PDLC i LCD - Profesjonalne rozwiązania'
        : `| Inteligentne Folie ${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
      optimized = `${optimized} ${suffix}`
    }

    if (optimized.length > 60) {
      optimized = optimized.substring(0, 57) + '...'
    }

    const result = await ensureUniqueSeoValue(path, 'meta_title', optimized)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, title: optimized, message: result.message }
  } catch (err) {
    console.error('Error optimizing meta title:', err)
    return { success: false, title: currentTitle, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================================
// 3. GENERATE META DESCRIPTION
// ============================================================================

export async function autoGenerateMetaDescription(
  path: string
): Promise<{ success: boolean; description: string; message?: string }> {
  try {
    const tid = await getTenantId()
    const slug = path === '/' ? 'home' : path.replace(/^\//, '')

    let description = ''

    try {
      const heroData = await pb.collection('site_content').getFirstListItem(
        `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="hero_subtitle" && language_code="pl" && is_active=true`,
        { requestKey: null }
      );
      if (heroData?.content_value) {
        description = readTextValue(heroData.content_value)
      }
    } catch {}

    if (!description) {
      try {
        const pageTitle = await pb.collection('site_content').getFirstListItem(
          `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="page_title" && language_code="pl" && is_active=true`,
          { requestKey: null }
        );
        if (pageTitle?.content_value) {
          description = readTextValue(pageTitle.content_value)
        }
      } catch {}
    }

    if (!description) {
      description = slug === 'home' 
        ? 'Profesjonalne inteligentne folie PDLC i LCD dla domu i biura. Oszczędzaj energię, kontroluj prywatność jednym dotknięciem. Bezpłatna wycena!'
        : `Inteligentne folie do ${slug.replace(/-/g, ' ')}. Technologia przyszłości dla Twojego ${slug.includes('biuro') ? 'biura' : slug.includes('dom') ? 'domu' : 'przestrzeni'}. Skontaktuj się z nami!`
    }

    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }

    if (description.length < 120) {
      description += ' Profesjonalny montaż, gwarancja jakości, szybka realizacja.'
    }

    const finalDescription = description.substring(0, 160)
    const result = await ensureUniqueSeoValue(path, 'meta_description', finalDescription)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, description: finalDescription, message: result.message }
  } catch (err) {
    console.error('Error generating meta description:', err)
    return { success: false, description: '', message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================================
// 4. OPTIMIZE EXISTING META DESCRIPTION
// ============================================================================

export async function autoOptimizeMetaDescription(
  currentDescription: string,
  path: string
): Promise<{ success: boolean; description: string; message?: string }> {
  try {
    let optimized = currentDescription.trim()

    if (optimized.length < 120) {
      const additions = [
        'Sprawdź nasze realizacje i skontaktuj się z nami.',
        'Bezpłatna wycena, profesjonalny montaż.',
        'Technologia przyszłości dla Twojego domu i biura.',
        'Oszczędzaj energię i kontroluj prywatność.',
      ]
      for (const add of additions) {
        if ((optimized + ' ' + add).length <= 160) {
          optimized += ' ' + add
          break
        }
      }
    }

    if (optimized.length > 160) {
      optimized = optimized.substring(0, 157) + '...'
    }

    const result = await ensureUniqueSeoValue(path, 'meta_description', optimized)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, description: optimized, message: result.message }
  } catch (err) {
    console.error('Error optimizing meta description:', err)
    return { success: false, description: currentDescription, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================================
// 5. ADD H1 TAG
// ============================================================================

export async function autoAddH1Tag(path: string): Promise<{ success: boolean; h1: string }> {
  try {
    const slug = path === '/' ? 'home' : path.replace(/-/g, ' ')
    const h1 = slug.charAt(0).toUpperCase() + slug.slice(1)

    const result = await ensureUniqueSeoValue(path, 'hero_title', h1)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, h1 }
  } catch (err) {
    console.error('Error adding H1 tag:', err)
    return { success: false, h1: '' }
  }
}

// ============================================================================
// 6. IMPROVE EXISTING H1 TAG
// ============================================================================

export async function autoImproveH1Tag(path: string): Promise<{ success: boolean; h1: string }> {
  try {
    const tid = await getTenantId()
    const slug = path === '/' ? 'home' : path.replace(/-/g, ' ')

    let current = ''
    try {
      const hero = await pb.collection('site_content').getFirstListItem(
        `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="hero_title" && is_active=true`,
        { requestKey: null }
      )
      current = readTextValue(hero?.content_value) || ''
    } catch {}

    let h1 = current.trim()

    if (!h1 || h1.length < 10) {
      h1 = slug.charAt(0).toUpperCase() + slug.slice(1)
    }

    const result = await ensureUniqueSeoValue(path, 'hero_title', h1)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, h1 }
  } catch (err) {
    console.error('Error improving H1 tag:', err)
    return { success: false, h1: '' }
  }
}

// ============================================================================
// 7. ADD CANONICAL URL
// ============================================================================

export async function autoAddCanonicalUrl(path: string, websiteId: string): Promise<{ success: boolean; canonical: string }> {
  try {
    const tid = websiteId || await getTenantId()
    
    let baseUrl = ''
    try {
      const settings = await pb.collection('site_settings').getFullList({
        filter: `website_id="${tid}" && setting_key="main_config"`,
        requestKey: null,
      })
      if (settings[0]?.setting_value?.website_url) {
        baseUrl = settings[0].setting_value.website_url
      }
    } catch {}

    if (!baseUrl) {
      baseUrl = 'https://inteligentnefolie.pl'
    }

    const canonical = `${baseUrl.replace(/\/+$/, '')}${normalizePagePath(path)}`

    const result = await ensureUniqueSeoValue(path, '_seo_canonical', canonical)
    if (result.success) {
      await finalizeSeoChange(path)
    }

    return { success: result.success, canonical }
  } catch (err) {
    console.error('Error adding canonical URL:', err)
    return { success: false, canonical: '' }
  }
}

// ============================================================================
// 8. ADD OPEN GRAPH TAGS
// ============================================================================

export async function autoAddOpenGraphTags(path: string): Promise<{ success: boolean; message: string }> {
  try {
    const tid = await getTenantId()
    
    let ogTitle = ''
    let ogDescription = ''

    try {
      const metaTitle = await pb.collection('site_content').getFirstListItem(
        `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="meta_title" && is_active=true`,
        { requestKey: null }
      )
      ogTitle = readTextValue(metaTitle?.content_value) || ''
    } catch {}

    try {
      const metaDesc = await pb.collection('site_content').getFirstListItem(
        `website_id="${tid}" && page_path="${normalizePagePath(path)}" && section_key="meta_description" && is_active=true`,
        { requestKey: null }
      )
      ogDescription = readTextValue(metaDesc?.content_value) || ''
    } catch {}

    await ensureUniqueSeoValue(path, '_og_title', ogTitle || 'Inteligentne Folie')
    await ensureUniqueSeoValue(path, '_og_description', ogDescription || 'Profesjonalne inteligentne folie dla domu i biura')

    await finalizeSeoChange(path)
    return { success: true, message: 'Open Graph tags added' }
  } catch (err) {
    console.error('Error adding Open Graph tags:', err)
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ============================================================================
// 9. ADD IMAGE ALT TAGS
// ============================================================================

export async function autoAddImageAltTags(path: string): Promise<{ success: boolean; count: number }> {
  try {
    const tid = await getTenantId()
    const normalizedPath = normalizePagePath(path)

    const images = await pb.collection('site_content').getFullList({
      filter: `website_id="${tid}" && page_path="${normalizedPath}" && content_type = "image" && is_active = true`,
      requestKey: null,
    });

    if (!images || images.length === 0) {
      return { success: true, count: 0 }
    }

    let altCount = 0
    for (const image of images) {
      const src = readTextValue(image.content_value)
      const filename = src.split('/').pop()?.split('.')[0] || image.section_key
      const alt = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
      if (!alt) continue

      await ensureUniqueSeoValue(
        normalizedPath,
        `${image.section_key}_alt`,
        alt,
        'text',
        image.language_code || undefined,
      )
      altCount++
    }

    await finalizeSeoChange(normalizedPath)
    return { success: true, count: altCount }
  } catch (err) {
    console.error('Error adding image alt tags:', err)
    return { success: false, count: 0 }
  }
}

// ============================================================================
// 10. FIX DUPLICATE TITLES
// ============================================================================

export async function autoFixDuplicateTitles(websiteId: string): Promise<{ success: boolean; message: string }> {
  try {
    const tid = websiteId || await getTenantId()
    const seen = new Map<string, { path: string; title: string }>()
    const duplicates: string[] = []

    const allMetaTitles = await pb.collection('site_content').getFullList({
      filter: `website_id="${tid}" && section_key="meta_title" && is_active=true`,
      fields: 'id,page_path,content_value,language_code',
      requestKey: null,
    })

    for (const item of allMetaTitles) {
      const title = readTextValue(item.content_value)
      const normalizedTitle = title.toLowerCase().trim()

      if (seen.has(normalizedTitle)) {
        duplicates.push(item.page_path)
      } else {
        seen.set(normalizedTitle, { path: item.page_path, title })
      }
    }

    for (const path of duplicates) {
      await autoGenerateMetaTitle(path)
    }

    await finalizeSeoChange('/')
    return { success: true, message: `Fixed ${duplicates.length} duplicate titles` }
  } catch (err) {
    console.error('Error fixing duplicate titles:', err)
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}
