import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  CheckCircle2, AlertCircle, TrendingUp, Sparkles, Shield, Zap,
  Smartphone, Lightbulb, Search, Target, RefreshCw, Key, Link2,
  Wand2, ImagePlus, FileText, FileType, Globe, ArrowRight, Loader2,
  X, Eye, ChevronDown, ChevronRight, Layout
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { useSeoDashboard } from '@/features/seo/hooks'
import { useSettings } from '@/features/settings/hooks'
import { SeoAiSuggestion } from '@/features/seo/types'
import { useSerpBear } from '@/features/serpbear/hooks'
import { insertSeoAudit } from '@/features/seo/api'
import { runAiSeoAudit, generateLocalAudit } from '@/features/seo/openrouter'
import * as autoFix from '@/features/seo/autoFix'
import type { SeoPageAnalysis, SeoIssues, SeoIssue } from '@/features/seo/types'
import MetaSection from '@/features/seo/MetaSection'
import SitemapSection from '@/features/seo/SitemapSection'
import AnalyticsSection from '@/features/seo/AnalyticsSection'
import { SerpBearProvider } from '@/features/serpbear/Context'
import SerpBearSection from '@/features/serpbear/SerpBearSection'
import { Card, StatCard, Badge, ProgressBar, Skeleton } from '@/components/ui/Cards'

// ============================================================================
// TIPOS
// ============================================================================

interface FixableIssue extends SeoIssue {
  canAutoFix: boolean
  fixLabel?: string
  fixIcon?: any
  fixAction: () => Promise<{ success: boolean; message?: string }>
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Seo() {
  const toast = useToast()
  const { pages, latestAudit, refresh, runAudit, websiteId, history, running: auditRunning } = useSeoDashboard()
  const { data: settings } = useSettings(websiteId)
  
  const [tab, setTab] = useState<'audyt' | 'poprawki' | 'sugestie' | 'meta' | 'sitemap' | 'analytics' | 'pozycje'>('audyt')
  const [runningFixes, setRunningFixes] = useState<Set<string>>(new Set())
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['critical', 'warnings']))

  const websiteUrl = settings?.website_url || ''

  // ============================================================================
  // AUDIT IA / FULL AUDIT
  // ============================================================================

  const handleRunAudit = async () => {
    if (auditRunning) return
    toast.info('🚀 Uruchamiam pełny audyt SEO...')
    try {
      await runAudit()
      toast.success('✅ Audyt zakończony pomyślnie!')
    } catch (err) {
      toast.error('❌ Błąd audytu: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  // ============================================================================
  // FIXABLE ISSUES - Mapowanie błędów na akcje
  // ============================================================================

  const getFixAction = (issue: SeoIssue): (() => Promise<{ success: boolean; message?: string }>) | null => {
    const path = issue.path || '/'
    const page = pages.find(p => p.path === path)
    const currentMetaTitle = (page?.seo as any)?.metaTitle || ''
    const currentMetaDescription = (page?.seo as any)?.metaDescription || ''
    
    switch (issue.code) {
      case 'meta_title_missing':
        return () => autoFix.autoGenerateMetaTitle(path)
      case 'meta_title_length':
        return currentMetaTitle
          ? () => autoFix.autoOptimizeMetaTitle(String(currentMetaTitle || ''), path)
          : () => autoFix.autoGenerateMetaTitle(path)
      case 'meta_description_missing':
        return () => autoFix.autoGenerateMetaDescription(path)
      case 'meta_description_length':
        return currentMetaDescription
          ? () => autoFix.autoOptimizeMetaDescription(String(currentMetaDescription || ''), path)
          : () => autoFix.autoGenerateMetaDescription(path)
      case 'h1_missing':
        return () => autoFix.autoAddH1Tag(path)
      case 'h1_too_short':
        return () => autoFix.autoImproveH1Tag(path)
      case 'canonical_missing':
        return () => autoFix.autoAddCanonicalUrl(path, websiteId || '')
      case 'no_og':
        return () => autoFix.autoAddOpenGraphTags(path)
      case 'images_no_alt':
        return () => autoFix.autoAddImageAltTags(path)
      case 'duplicate_titles':
        return () => autoFix.autoFixDuplicateTitles(websiteId || '')
      default:
        return null
    }
  }

  const getIssueIcon = (code: string) => {
    if (code.includes('title')) return FileType
    if (code.includes('description')) return FileText
    if (code.includes('h1') || code.includes('header')) return Layout
    if (code.includes('og') || code.includes('social')) return Globe
    if (code.includes('image') || code.includes('alt')) return ImagePlus
    if (code.includes('canonical') || code.includes('link')) return Link2
    return Wand2
  }

  const fixableIssues = useMemo((): FixableIssue[] => {
    if (!latestAudit) return []

    const issues: FixableIssue[] = []
    const auditIssues = latestAudit.issues as SeoIssues

    const processIssue = (issue: SeoIssue) => {
      const fixAction = getFixAction(issue)
      return {
        ...issue,
        canAutoFix: !!fixAction,
        fixLabel: issue.code.includes('ai') ? 'Generuj z AI' : 'Napraw',
        fixIcon: getIssueIcon(issue.code),
        fixAction: fixAction || (async () => ({ success: false, message: 'Naprawa ręczna' }))
      }
    }

    auditIssues?.errors?.forEach(i => issues.push(processIssue(i)))
    auditIssues?.warnings?.forEach(i => issues.push(processIssue(i)))

    return issues
  }, [latestAudit, websiteId])

  const runFix = useCallback(async (issue: FixableIssue) => {
    const fixKey = `${issue.code}-${issue.path}`
    if (runningFixes.has(fixKey)) return

    setRunningFixes(prev => new Set(prev).add(fixKey))
    toast.info(`🔧 ${issue.action}...`)

    try {
      const result = await issue.fixAction()
      if (result.success) {
        setFixedIssues(prev => new Set(prev).add(fixKey))
        toast.success(result.message || '✅ Naprawiono!')
      } else {
        const errorDetail = result.message ? `: ${result.message}` : ''
        toast.error(`❌ Błąd naprawy${errorDetail}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`❌ Błąd: ${errorMsg}`)
    } finally {
      setRunningFixes(prev => {
        const next = new Set(prev)
        next.delete(fixKey)
        return next
      })
    }
  }, [runningFixes])

  // ============================================================================
  // STATS
  // ============================================================================

  const runFixAll = async () => {
    const remaining = fixableIssues.filter(i => !fixedIssues.has(`${i.code}-${i.path}`))
    if (remaining.length === 0) {
      toast.info('✅ Wszystkie elementy są już naprawione!')
      return
    }
    
    let fixed = 0
    let failed = 0
    
    for (const issue of remaining) {
      const fixKey = `${issue.code}-${issue.path}`
      if (!issue.canAutoFix) continue
      
      setRunningFixes(prev => new Set(prev).add(fixKey))
      
      try {
        const result = await issue.fixAction()
        if (result.success) {
          setFixedIssues(prev => new Set(prev).add(fixKey))
          fixed++
        } else {
          failed++
        }
      } catch {
        failed++
      } finally {
        setRunningFixes(prev => {
          const next = new Set(prev)
          next.delete(fixKey)
          return next
        })
      }
      
      await new Promise(r => setTimeout(r, 500))
    }
    
    if (fixed > 0) {
      toast.success(`✅ Naprawiono ${fixed} elementów${failed > 0 ? `, ${failed} niepowiodło się` : ''}`)
    } else if (failed > 0) {
      toast.error(`❌ ${failed} elementów nie udało się naprawić`)
    }
  }

  const realScore = latestAudit?.score ?? 0
  const allFixable = fixableIssues.filter(i => !fixedIssues.has(`${i.code}-${i.path}`))
  const criticalCount = allFixable.filter(i => i.level === 'error').length
  const warningCount = allFixable.filter(i => i.level === 'warning').length
  const goodCount = latestAudit?.issues?.good?.length ?? 0
  const canFixCount = allFixable.filter(i => i.canAutoFix).length

  const [aiSuggestions, setAiSuggestions] = useState<SeoAiSuggestion[]>([])
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false)
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false)
  const [applyingAiSuggestions, setApplyingAiSuggestions] = useState(false)
  const [applyingGroupId, setApplyingGroupId] = useState<string | null>(null)

  useEffect(() => {
    if (tab !== 'sugestie' || !websiteId) return
    let mounted = true
    setLoadingAiSuggestions(true)
    ;(async () => {
      try {
        const { listAiSuggestionGroups } = await import('@/features/seo/api')
        const groups = await listAiSuggestionGroups(websiteId, 100)
        if (mounted) setAiSuggestions(groups)
      } catch {
        if (mounted) setAiSuggestions([])
      } finally {
        if (mounted) setLoadingAiSuggestions(false)
      }
    })()
    return () => { mounted = false }
  }, [tab, websiteId])

  const handleGenerateSuggestions = async () => {
    if (generatingSuggestions || !latestAudit) return
    setGeneratingSuggestions(true)
    toast.info('🧠 Generuję sugestie AI...')
    try {
      const { generateSeoSuggestions } = await import('@/features/seo/ai')
      
      const errorPages = pages.filter(p => {
        const path = p.path
        return latestAudit.issues.errors.some(e => e.path === path) || 
               latestAudit.issues.warnings.some(w => w.path === path)
      }).slice(0, 5)

      const newSuggestions: SeoAiSuggestion[] = []
      
      for (const page of errorPages) {
        try {
          const pageIssues = {
            errors: latestAudit.issues.errors.filter(e => e.path === page.path),
            warnings: latestAudit.issues.warnings.filter(w => w.path === page.path),
            good: [],
          }
          const suggestions = await generateSeoSuggestions({ page, issues: pageIssues })
          newSuggestions.push({
            id: `ai-${page.path}-${Date.now()}`,
            website_id: websiteId || '',
            page_slug: page.path,
            language_code: page.language_code,
            suggestions,
            applied: false,
            created_at: new Date().toISOString(),
          })
        } catch (e) {
          console.warn(`Failed to generate suggestions for ${page.path}:`, e)
        }
      }

      setAiSuggestions(newSuggestions)
      
      if (newSuggestions.length > 0) {
        const { insertAiSuggestions } = await import('@/features/seo/api')
        const saved: SeoAiSuggestion[] = []
        for (const sg of newSuggestions) {
          const record = await insertAiSuggestions({
            website_id: websiteId || '',
            page_slug: sg.page_slug,
            language_code: sg.language_code,
            suggestions: sg.suggestions,
          })
          saved.push({ ...sg, id: (record as any).id })
        }
        setAiSuggestions(saved)
        toast.success(`✅ Wygenerowano ${newSuggestions.length} sugestii AI!`)
      } else {
        toast.info('💡 Brak sugestii do wygenerowania.')
      }
    } catch (err) {
      toast.error('❌ Błąd generowania sugestii: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setGeneratingSuggestions(false)
    }
  }

  const applyAiSuggestion = useCallback(async (group: SeoAiSuggestion, suggestion: SeoAiSuggestion['suggestions'][0]) => {
    if (!websiteId) throw new Error('Brak websiteId')
    const path = group.page_slug || '/'
    const { upsertSiteValue: upsert } = await import('@/features/seo/api')

    const title = (suggestion.title || '').toLowerCase()
    const code = (suggestion.code || '').toLowerCase()
    const target = suggestion.target

    if (target === 'metaTitle') {
      await upsert(path, 'meta_title', suggestion.after, group.language_code || 'pl', 'text')
      return
    }

    if (target === 'metaDescription') {
      await upsert(path, 'meta_description', suggestion.after, group.language_code || 'pl', 'text')
      return
    }

    if (target === 'imageAlt' || title.includes('alt') || code.includes('alt')) {
      const result = await autoFix.autoAddImageAltTags(path)
      if (!result.success) throw new Error('Nie udało się dodać ALT')
      return
    }

    if (title.includes('open graph') || title.includes('og ') || title.includes(' og') || code.includes('og')) {
      const result = await autoFix.autoAddOpenGraphTags(path)
      if (!result.success) throw new Error('Nie udało się dodać Open Graph')
      return
    }

    if (title.includes('canonical') || title.includes('kanonic') || code.includes('canonical')) {
      const result = await autoFix.autoAddCanonicalUrl(path, websiteId)
      if (!result.success) throw new Error('Nie udało się dodać canonical')
      return
    }

    if (title.includes('h1') || title.includes('nagłówek') || code.includes('h1')) {
      const result = await autoFix.autoImproveH1Tag(path)
      if (!result.success) throw new Error('Nie udało się poprawić H1')
      return
    }

    if (suggestion.applyPatch && typeof suggestion.applyPatch === 'object') {
      const patch = suggestion.applyPatch as any
      if (patch.metaTitle !== undefined) await upsert(path, 'meta_title', patch.metaTitle, group.language_code || 'pl', 'text')
      if (patch.metaDescription !== undefined) await upsert(path, 'meta_description', patch.metaDescription, group.language_code || 'pl', 'text')
      if (patch.canonical !== undefined) await upsert(path, '_seo_canonical', patch.canonical, group.language_code || 'pl', 'text')
      if (patch.ogTitle !== undefined) await upsert(path, '_og_title', patch.ogTitle, group.language_code || 'pl', 'text')
      if (patch.ogDescription !== undefined) await upsert(path, '_og_description', patch.ogDescription, group.language_code || 'pl', 'text')
      if (patch.ogImage !== undefined) await upsert(path, '_og_image', patch.ogImage, group.language_code || 'pl', 'image')
      if (patch.indexable !== undefined) await upsert(path, '_seo_indexable', String(patch.indexable), group.language_code || 'pl', 'text')
      return
    }

    throw new Error('Nieobsługiwany typ sugestii')
  }, [websiteId])

  const handleApplyOneSuggestion = useCallback(async (groupId: string, idx: number) => {
    const group = aiSuggestions.find(g => g.id === groupId)
    if (!group) return
    const suggestion = group.suggestions[idx]
    if (!suggestion) return

    setApplyingGroupId(groupId)
    try {
      await applyAiSuggestion(group, suggestion)
      toast.success('✅ Zastosowano sugestię!')
      setAiSuggestions(prev => prev.map(g => {
        if (g.id !== groupId) return g
        const next = { ...g, suggestions: g.suggestions.filter((_, i) => i !== idx) }
        return next
      }).filter(g => g.suggestions.length > 0))
      if (group.suggestions.length === 1) {
        const { markAiSuggestionGroupApplied } = await import('@/features/seo/api')
        await markAiSuggestionGroupApplied(groupId)
      }
    } catch (err) {
      toast.error('❌ Błąd: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setApplyingGroupId(null)
    }
  }, [aiSuggestions, applyAiSuggestion, toast])

  const handleApplyAllInGroup = useCallback(async (groupId: string) => {
    const group = aiSuggestions.find(g => g.id === groupId)
    if (!group || group.suggestions.length === 0) return
    if (!websiteId) return

    setApplyingGroupId(groupId)
    let ok = 0
    let failed = 0
    for (const s of group.suggestions) {
      try {
        await applyAiSuggestion(group, s)
        ok++
      } catch {
        failed++
      }
    }

    try {
      const { markAiSuggestionGroupApplied } = await import('@/features/seo/api')
      await markAiSuggestionGroupApplied(groupId)
    } catch {}

    setAiSuggestions(prev => prev.filter(g => g.id !== groupId))
    setApplyingGroupId(null)

    if (ok > 0) toast.success(`✅ Zastosowano ${ok} sugestii${failed ? `, ${failed} pominięto` : ''}`)
    else toast.error(`❌ Nie udało się zastosować sugestii (${failed})`)
  }, [aiSuggestions, applyAiSuggestion, websiteId, toast])

  const handleApplyAllAiSuggestions = useCallback(async () => {
    if (aiSuggestions.length === 0 || !websiteId) return
    setApplyingAiSuggestions(true)
    let ok = 0
    let failed = 0

    for (const group of aiSuggestions) {
      for (const s of group.suggestions) {
        try {
          await applyAiSuggestion(group, s)
          ok++
        } catch {
          failed++
        }
      }
      try {
        const { markAiSuggestionGroupApplied } = await import('@/features/seo/api')
        await markAiSuggestionGroupApplied(group.id)
      } catch {}
    }

    setAiSuggestions([])
    setApplyingAiSuggestions(false)
    if (ok > 0) toast.success(`✅ Zastosowano ${ok} sugestii${failed ? `, ${failed} pominięto` : ''}`)
    else toast.error(`❌ Nie udało się zastosować sugestii (${failed})`)
  }, [aiSuggestions, applyAiSuggestion, websiteId, toast])

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  return (
    <SerpBearProvider websiteId={websiteId}>
      <div className="min-h-screen bg-gray-50 p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" className={latestAudit && latestAudit.created_at ? '' : 'animate-pulse'}>
                  {latestAudit && latestAudit.created_at ? 'Audyt zapisany' : 'Live Audit'}
                </Badge>
                <span className="text-xs text-gray-400 font-medium font-mono uppercase tracking-wider">
                  {latestAudit && latestAudit.created_at 
                    ? `Ostatni: ${new Date(latestAudit.created_at.replace(' ', 'T')).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}` 
                    : 'Brak zapisu — uruchom audyt, aby zapisać'}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">SEO & Pozycjonowanie</h1>
              <p className="text-gray-500 mt-1 text-lg">Zarządzaj widocznością swojej strony za pomocą inteligentnych narzędzi.</p>
            </div>
            <div className="flex items-center gap-3">
              {latestAudit && latestAudit.created_at ? (
                <button onClick={handleRunAudit} disabled={auditRunning}
                  className="px-6 py-3 flex items-center gap-2 rounded-xl font-bold text-sm shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50">
                  {auditRunning ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  {auditRunning ? 'Analizuję...' : 'Odśwież audyt (zużywa IA)'}
                </button>
              ) : (
                <button onClick={handleRunAudit} disabled={auditRunning}
                  className="px-6 py-3 flex items-center gap-2 rounded-xl font-bold text-sm shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50">
                  {auditRunning ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                  {auditRunning ? 'Analizuję...' : 'Uruchom pełny audyt'}
                </button>
              )}
            </div>
          </div>

          {/* SCORE OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={120} />
              </div>
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${realScore * 2.82} 282`} strokeLinecap="round"
                    className={`${realScore > 80 ? 'text-green-500' : realScore > 60 ? 'text-blue-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-gray-900">{realScore}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Twój wynik SEO</h3>
              <p className="text-sm text-gray-500 mt-1">Na podstawie {pages.length} podstron</p>
            </Card>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard icon={<AlertCircle />} label="Krytyczne błędy" value={criticalCount} 
                className="border-l-4 border-l-red-500" />
              <StatCard icon={<Lightbulb />} label="Ostrzeżenia" value={warningCount}
                className="border-l-4 border-l-amber-500" />
              <StatCard icon={<CheckCircle2 />} label="Zoptymalizowane" value={goodCount}
                className="border-l-4 border-l-green-500" />
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
            {[
              { id: 'audyt', label: 'Lista Poprawek', icon: Search },
              { id: 'sugestie', label: 'Sugestie AI', icon: Sparkles },
              { id: 'meta', label: 'Meta Tagi', icon: Target },
              { id: 'sitemap', label: 'Sitemap', icon: Globe },
              { id: 'analytics', label: 'Analityka', icon: TrendingUp },
              { id: 'pozycje', label: 'Pozycje', icon: Target },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* FIX ALL BUTTON */}
          {canFixCount > 0 && (
            <div className="flex justify-end">
              <button onClick={runFixAll} disabled={auditRunning}
                className="px-6 py-3 flex items-center gap-2 rounded-xl font-bold text-sm shadow-lg bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50">
                <Zap size={18} />
                Napraw Wszystko ({canFixCount})
              </button>
            </div>
          )}

          {/* TAB CONTENT: AUDYT */}
          {tab === 'audyt' && (
            <div className="space-y-6">
              {/* CRITICAL GROUP */}
              {fixableIssues.some(i => i.level === 'error') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" /> Błędy Krytyczne
                    </h2>
                    <Badge variant="danger">{criticalCount}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {fixableIssues.filter(i => i.level === 'error' && !fixedIssues.has(`${i.code}-${i.path}`)).map(issue => (
                      <IssueCard key={`${issue.code}-${issue.path}`} issue={issue} running={runningFixes.has(`${issue.code}-${issue.path}`)} onFix={() => runFix(issue)} />
                    ))}
                  </div>
                </div>
              )}

              {/* WARNINGS GROUP */}
              {fixableIssues.some(i => i.level === 'warning') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" /> Ostrzeżenia
                    </h2>
                    <Badge variant="warning">{warningCount}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {fixableIssues.filter(i => i.level === 'warning' && !fixedIssues.has(`${i.code}-${i.path}`)).map(issue => (
                      <IssueCard key={`${issue.code}-${issue.path}`} issue={issue} running={runningFixes.has(`${issue.code}-${issue.path}`)} onFix={() => runFix(issue)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUGESTIE AI */}
          {tab === 'sugestie' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Inteligentne Sugestie AI</h3>
                      <p className="text-sm text-gray-500">Sugestie oparte na analizie błędów SEO i algorytmach Google</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {aiSuggestions.length > 0 && (
                      <button
                        onClick={handleApplyAllAiSuggestions}
                        disabled={applyingAiSuggestions || generatingSuggestions}
                        className="px-6 py-3 flex items-center gap-2 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50"
                      >
                        {applyingAiSuggestions ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {applyingAiSuggestions ? 'Zastosowuję...' : `Zastosuj wszystko (${aiSuggestions.reduce((a, g) => a + (g.suggestions?.length || 0), 0)})`}
                      </button>
                    )}
                    <button 
                      onClick={handleGenerateSuggestions} 
                      disabled={generatingSuggestions || !latestAudit}
                      className="px-6 py-3 flex items-center gap-2 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-50"
                    >
                      {generatingSuggestions ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
                      {generatingSuggestions ? 'Generuję...' : 'Generuj nowe sugestie'}
                    </button>
                  </div>
                </div>
                
                {loadingAiSuggestions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    {aiSuggestions.map((suggestionGroup) => (
                      <div key={suggestionGroup.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">{suggestionGroup.page_slug}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="info">{suggestionGroup.suggestions.length} sugestii</Badge>
                            <button
                              onClick={() => handleApplyAllInGroup(suggestionGroup.id)}
                              disabled={applyingAiSuggestions || applyingGroupId === suggestionGroup.id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
                            >
                              {applyingGroupId === suggestionGroup.id ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                              Zastosuj wszystko
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {suggestionGroup.suggestions.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Wand2 size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {s.target === 'metaTitle' ? 'Meta Title' : s.target === 'metaDescription' ? 'Meta Description' : 'Inne'}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleApplyOneSuggestion(suggestionGroup.id, idx)}
                                disabled={applyingAiSuggestions || applyingGroupId === suggestionGroup.id}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
                              >
                                {applyingGroupId === suggestionGroup.id ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                Zastosuj
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lightbulb size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700 mb-2">Brak sugestii</h4>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Kliknij "Generuj nowe sugestie" aby AI przeanalizowało błędy SEO i zaproponowało rozwiązania.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* OTHER TABS */}
          {tab === 'meta' && websiteId && <MetaSection websiteId={websiteId} />}
          {tab === 'sitemap' && websiteId && <SitemapSection websiteId={websiteId} />}
          {tab === 'analytics' && <AnalyticsSection />}
          {tab === 'pozycje' && <SerpBearSection websiteId={websiteId} />}
        </div>
      </div>
    </SerpBearProvider>
  )
}

function IssueCard({ issue, running, onFix }: { issue: FixableIssue; running: boolean; onFix: () => void }) {
  const Icon = issue.fixIcon
  const isErr = issue.level === 'error'
  
  return (
    <div className={`p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-blue-100 hover:shadow-sm transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isErr ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{issue.title}</h4>
            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{issue.path}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{issue.action}</p>
        </div>
      </div>
      
      {issue.canAutoFix ? (
        <button onClick={onFix} disabled={running}
          className={`px-4 py-2 font-bold text-sm rounded-xl flex items-center gap-2 transition-all ${
            isErr ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}>
          {running ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
          {issue.fixLabel}
        </button>
      ) : (
        <span className="text-xs font-bold text-gray-400 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Key size={12} /> Napraw Ręcznie
        </span>
      )}
    </div>
  )
}
