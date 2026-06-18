import { useCallback, useEffect, useMemo, useState } from 'react'
import { analyzeAll, analyzePage } from './audit'
import {
  getLatestSeoAudit,
  getWebsiteId,
  getSeoMeta,
  getSitemap,
  countVisitsByPage,
  insertAiSuggestions,
  insertSeoAudit,
  insertSeoPageAnalyses,
  listAiSuggestions,
  listCmsPages,
  listLatestPageAnalysis,
  listSeoAudits,
  markSuggestionApplied,
  upsertPageSeo,
  upsertAnalyticsSnapshot,
} from './api'
import { generateSeoSuggestions } from './ai'
import type { CmsPageRow, SeoAiSuggestion, SeoAudit, SeoIssues, SeoPageAnalysis } from './types'

export type SeoStatus = 'malo' | 'regular' | 'bueno' | 'excelente'

export function scoreToStatus(score: number): SeoStatus {
  if (score >= 90) return 'excelente'
  if (score >= 75) return 'bueno'
  if (score >= 55) return 'regular'
  return 'malo'
}

export function scoreLabelPl(status: SeoStatus) {
  if (status === 'excelente') return 'Świetnie'
  if (status === 'bueno') return 'Dobrze'
  if (status === 'regular') return 'Regularnie'
  return 'Słabo'
}

export function scoreTone(score: number) {
  if (score >= 90) return { bg: 'bg-green-50', fg: 'text-green-700', border: 'border-green-100' }
  if (score >= 75) return { bg: 'bg-blue-50', fg: 'text-blue-700', border: 'border-blue-100' }
  if (score >= 55) return { bg: 'bg-amber-50', fg: 'text-amber-700', border: 'border-amber-100' }
  return { bg: 'bg-red-50', fg: 'text-red-700', border: 'border-red-100' }
}

export function useSeoDashboard() {
  const [websiteId, setWebsiteId] = useState<string | null>(null)
  const [pages, setPages] = useState<CmsPageRow[]>([])
  const [latestAudit, setLatestAudit] = useState<SeoAudit | null>(null)
  const [history, setHistory] = useState<SeoAudit[]>([])
  const [perPage, setPerPage] = useState<SeoPageAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    let widForBackground: string | null = null
    try {
      const wid = await getWebsiteId()
      setWebsiteId(wid)
      widForBackground = wid
      const [audit, audits] = await Promise.all([
        getLatestSeoAudit(wid),
        listSeoAudits(wid, 12),
      ])
      setLatestAudit(audit)
      setHistory(audits)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Błąd'
      setError(msg)
    } finally {
      setLoading(false)
    }

    if (!widForBackground) return

    listLatestPageAnalysis(widForBackground)
      .then(setPerPage)
      .catch(() => {})

    listCmsPages()
      .then(setPages)
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  const runAudit = useCallback(async () => {
    if (!websiteId) return
    setRunning(true)
    try {
      const p = await listCmsPages()
      setPages(p)
      const computed = analyzeAll(p)
      let bonus = 0
      const [meta, sitemap, visitsArr] = await Promise.all([
        getSeoMeta(websiteId),
        getSitemap(websiteId),
        countVisitsByPage(30),
      ])
      if (meta && (meta.title || meta.description)) bonus += 5
      if (sitemap && sitemap.status && sitemap.status.toLowerCase() === 'generated') bonus += 5
      const top = visitsArr[0]?.visits || 0
      if (top >= 20) bonus += Math.min(5, Math.round(top / 50) * 2) // leve
      const adjusted = Math.max(0, Math.min(100, Math.round(computed.overallScore + bonus)))
      const audit = await insertSeoAudit({ website_id: websiteId, score: adjusted, issues: computed.issues, summary: computed.summary })
      await insertSeoPageAnalyses(
        computed.pages.map((r) => ({
          website_id: websiteId,
          slug: r.slug,
          language_code: r.language_code,
          score: r.score,
          issues: r.issues,
        })),
      )
      setLatestAudit(audit)
      if (visitsArr.length) {
        await upsertAnalyticsSnapshot(
          websiteId,
          visitsArr.slice(0, 20).map((v) => ({ page_slug: v.page, visits: v.visits })),
        )
      }
      setHistory((prev) => [audit, ...prev].slice(0, 12))
      setPerPage(await listLatestPageAnalysis(websiteId))
    } finally {
      setRunning(false)
    }
  }, [websiteId])

  return {
    websiteId,
    pages,
    latestAudit,
    history,
    perPage,
    loading,
    running,
    error,
    refresh,
    runAudit,
  }
}

export function useSeoPageTools(args: { websiteId: string | null; pages: CmsPageRow[] }) {
  const [suggestions, setSuggestions] = useState<SeoAiSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [runningAi, setRunningAi] = useState(false)

  const getPage = useCallback(
    (slug: string, languageCode: string) => {
      return args.pages.find((p) => p.path === slug && p.language_code === languageCode) || null
    },
    [args.pages],
  )

  const loadSuggestions = useCallback(
    async (slug: string, languageCode: string) => {
      if (!args.websiteId) return
      setLoadingSuggestions(true)
      try {
        const data = await listAiSuggestions(args.websiteId, slug, languageCode)
        setSuggestions(data)
      } finally {
        setLoadingSuggestions(false)
      }
    },
    [args.websiteId],
  )

  const runAi = useCallback(
    async (slug: string, languageCode: string, issues: SeoIssues) => {
      if (!args.websiteId) return null
      const page = getPage(slug, languageCode)
      if (!page) return null
      setRunningAi(true)
      try {
        const generated = await generateSeoSuggestions({ page, issues })
        const saved = await insertAiSuggestions({
          website_id: args.websiteId,
          page_slug: slug,
          language_code: languageCode,
          suggestions: generated,
        })
        await loadSuggestions(slug, languageCode)
        return saved
      } finally {
        setRunningAi(false)
      }
    },
    [args.websiteId, getPage, loadSuggestions],
  )

  const applySuggestion = useCallback(
    async (suggestionId: string, pageId: string, currentSeo: Record<string, unknown>, patch: Record<string, unknown>) => {
      const nextSeo = { ...currentSeo, ...patch }
      await upsertPageSeo(pageId, nextSeo)
      await markSuggestionApplied(suggestionId)
    },
    [],
  )

  const computedBySlug = useMemo(() => {
    const m = new Map<string, ReturnType<typeof analyzePage>>()
    for (const p of args.pages) {
      const r = analyzePage(p)
      m.set(`${r.slug}::${r.language_code}`, r)
    }
    return m
  }, [args.pages])

  return {
    suggestions,
    loadingSuggestions,
    runningAi,
    getPage,
    loadSuggestions,
    runAi,
    applySuggestion,
    computedBySlug,
  }
}
