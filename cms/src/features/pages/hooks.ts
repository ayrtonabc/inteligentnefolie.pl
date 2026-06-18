import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { createPage, getPageWithContent, listPages, updatePage, updateSiteContent, type CmsPage } from './api'
import { useSite } from '@/context/SiteContext'

export const pageBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'text', 'cards', 'table']),
  data: z.record(z.string(), z.unknown()),
})

export type PageBlock = z.infer<typeof pageBlockSchema>

export const pageSeoSchema = z.object({
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
  canonical: z.string().optional().default(''),
  indexable: z.boolean().optional().default(true),
})

export type PageSeo = z.infer<typeof pageSeoSchema>

export function usePages() {
  const { currentSite } = useSite()
  const [rows, setRows] = useState<
    Array<Pick<CmsPage, 'id' | 'title' | 'path' | 'language_code' | 'created_at' | 'updated_at'>>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listPages(currentSite?.id)
      setRows(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [currentSite?.id])

  useEffect(() => {
    refetch()
  }, [refetch])

  const create = useCallback(async (input: { title: string; path: string; language_code: string }) => {
    const page = await createPage({ ...input, website_id: currentSite?.id })
    setRows((prev) => [page as any, ...prev])
    return page
  }, [currentSite?.id])

  return { rows, loading, error, refetch, create }
}

export function normalizePath(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return '/'
  if (trimmed === '/') return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withSlash.replace(/\s+/g, '-')
}

// Helper to determine block type from section key
function getBlockTypeFromContent(item: any): PageBlock['type'] {
  const sectionKey = item.section_key || ''
  const contentType = item.content_type || ''
  
  if (sectionKey.includes('hero')) return 'hero'
  if (sectionKey.includes('cta')) return 'text'
  if (sectionKey.includes('list') || sectionKey.includes('items') || contentType === 'json') return 'cards'
  if (sectionKey.includes('table') || sectionKey.includes('comparison')) return 'table'
  return 'text'
}

// Helper to check if content is visual (for end users) vs technical (SEO/meta)
function isVisualContent(item: any): boolean {
  const sectionKey = item.section_key || ''
  const metadata = item.metadata || {}
  
  // Exclude SEO/meta sections
  if (sectionKey.includes('seo_') || sectionKey.includes('meta_')) return false
  if (sectionKey.includes('_seo') || sectionKey.includes('_meta')) return false
  
  // Exclude technical/internal sections
  if (sectionKey.startsWith('_')) return false
  if (metadata.type === 'seo' || metadata.type === 'meta') return false
  
  // Include only visual content sections
  const visualPrefixes = [
    'hero_', 'features_', 'how_it_works_', 'products_', 'portfolio_',
    'faq_', 'cta_', 'contact_', 'blog_', 'projects_', 'steps_', 'benefits_',
    'installation_', 'realizations_', 'filters_', 'comparison_', 'calculator_',
    'button_', 'badges_', 'title', 'subtitle', 'description'
  ]
  
  return visualPrefixes.some(prefix => sectionKey.includes(prefix))
}

export function usePageEditor(pageId: string | null) {
  const [page, setPage] = useState<CmsPage | null>(null)
  const [siteContent, setSiteContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const parsedBlocks = useMemo(() => {
    // Transform site_content into editable blocks, filtering only visual content
    if (!siteContent || siteContent.length === 0) return []
    
    const blocks: PageBlock[] = []
    for (const item of siteContent) {
      // Skip SEO/meta and technical sections
      if (!isVisualContent(item)) continue
      
      const block: PageBlock = {
        id: item.id || crypto.randomUUID(),
        type: getBlockTypeFromContent(item),
        data: {
          sectionKey: item.section_key,
          contentType: item.content_type,
          value: item.content_value,
          metadata: item.metadata,
        },
      }
      blocks.push(block)
    }
    return blocks
  }, [siteContent])

  const parsedSeo = useMemo(() => {
    const parsed = pageSeoSchema.safeParse(page?.seo ?? {})
    return parsed.success ? parsed.data : pageSeoSchema.parse({})
  }, [page?.seo])

  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [seo, setSeo] = useState<PageSeo>(pageSeoSchema.parse({}))

  useEffect(() => {
    setBlocks(parsedBlocks)
  }, [parsedBlocks])

  useEffect(() => {
    setSeo(parsedSeo)
  }, [parsedSeo])

  const refetch = useCallback(async () => {
    if (!pageId) return
    setLoading(true)
    try {
      // Use getPageWithContent to fetch real data from site_content
      const data = await getPageWithContent(pageId)
      setPage(data)
      setSiteContent(data.siteContent || [])
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const save = useCallback(
    async (patch?: Partial<Pick<CmsPage, 'title' | 'path' | 'language_code'>>) => {
      if (!pageId || !page) return null
      setSaving(true)
      try {
        const currentPath = patch?.path || page.path
        const currentLanguage = patch?.language_code || page.language_code

        // Save actual site_content rows
        for (const item of siteContent) {
          await updateSiteContent(
            currentPath,
            item.section_key as string,
            item.content_value as string,
            currentLanguage
          )
        }
        
        // Also update page metadata
        const next = await updatePage(pageId, {
          ...patch,
          seo,
        })
        setPage(next as any)
        return next
      } finally {
        setSaving(false)
      }
    },
    [pageId, page, seo, siteContent],
  )

  return {
    page,
    loading,
    saving,
    blocks,
    setBlocks,
    seo,
    setSeo,
    siteContent,
    setSiteContent,
    save,
    refetch,
  }
}

export function computeSeoScore(seo: PageSeo) {
  let score = 0
  const titleLen = (seo.metaTitle || '').trim().length
  const descLen = (seo.metaDescription || '').trim().length
  const canonicalOk = (seo.canonical || '').trim().length > 0

  if (titleLen >= 30 && titleLen <= 60) score += 35
  else if (titleLen > 0) score += 15

  if (descLen >= 120 && descLen <= 160) score += 35
  else if (descLen > 0) score += 15

  if (canonicalOk) score += 15
  if (seo.indexable) score += 15

  return Math.max(0, Math.min(100, score))
}
