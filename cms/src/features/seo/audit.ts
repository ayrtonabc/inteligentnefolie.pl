import { z } from 'zod'
import type { CmsPageRow, SeoIssues } from './types'

const seoSchema = z.object({
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
  canonical: z.string().optional().default(''),
  indexable: z.boolean().optional().default(true),
}).passthrough()

function asString(v: unknown) {
  return typeof v === 'string' ? v : ''
}

function readTextValue(value: unknown) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') return parsed
      if (parsed && typeof parsed === 'object') {
        return asString((parsed as Record<string, unknown>).text) || asString((parsed as Record<string, unknown>).value)
      }
    } catch {
      return value
    }
    return value
  }

  if (value && typeof value === 'object') {
    return asString((value as Record<string, unknown>).text) || asString((value as Record<string, unknown>).value)
  }

  return ''
}

function normalizeSlug(path: string) {
  return path.trim() || '/'
}

function clampScore(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function buildIssues(parts: Array<{ level: 'error' | 'warning' | 'good' | 'suggestion'; code: string; title: string; action: string; pageId?: string; path?: string }>) {
  const issues: SeoIssues & { suggestions: any[] } = { errors: [], warnings: [], good: [], suggestions: [] }
  for (const p of parts) {
    if (p.level === 'error') issues.errors.push(p as any)
    else if (p.level === 'warning') issues.warnings.push(p as any)
    else if (p.level === 'suggestion') issues.suggestions.push(p as any)
    else issues.good.push(p as any)
  }
  return issues
}

export function analyzePage(page: CmsPageRow) {
  const slug = normalizeSlug(page.path)
  const seoParsed = seoSchema.safeParse(page.seo ?? {})
  const seo = seoParsed.success ? seoParsed.data : seoSchema.parse({})
  const contentRows = Array.isArray(page.content) ? page.content : []

  const issuesParts: Array<{ level: 'error' | 'warning' | 'good' | 'suggestion'; code: string; title: string; action: string }> = []

  const title = (seo.metaTitle || '').trim()
  const desc = (seo.metaDescription || '').trim()
  const canonical = (seo.canonical || '').trim()

  const titleLen = title.length
  const descLen = desc.length

  const heroTitle = readTextValue(
    contentRows.find((row) => row.section_key === 'hero_title' || row.section_key.endsWith('_hero_title'))?.content_value,
  )

  const imageRows = contentRows.filter((row) => row.content_type === 'image')
  const altByKey = new Map<string, string>()
  for (const row of contentRows) {
    if (!row?.section_key || typeof row.section_key !== 'string') continue
    if (!row.section_key.endsWith('_alt')) continue
    const baseKey = row.section_key.slice(0, -'_alt'.length)
    const value = readTextValue((row as any).content_value)
    if (value && value.trim()) {
      altByKey.set(baseKey, value.trim())
    }
  }

  const imagesWithoutAlt = imageRows.filter((row) => {
    const metadata = row && typeof row === 'object' ? (row as Record<string, unknown>).metadata : null
    const alt = metadata && typeof metadata === 'object' ? asString((metadata as Record<string, unknown>).alt) : ''
    const fallbackAlt = altByKey.get(String((row as any).section_key || '')) || ''
    return !alt.trim() && !fallbackAlt.trim()
  }).length

  let score = 0

  // 1. Indexable (waga: 5/100)
  if (!seo.indexable) {
    issuesParts.push({
      level: 'warning',
      code: 'indexable_off',
      title: 'Strona wyłączona z indeksacji',
      action: 'Zmień w ustawieniach SEO strony.',
    })
    score -= 5
  } else {
    issuesParts.push({ level: 'good', code: 'indexable_on', title: 'Indeksacja włączona', action: 'OK' })
    score += 5
  }

  // 2. Meta Title (waga: 20/100) - CRÍTICO
  if (!title) {
    issuesParts.push({
      level: 'error',
      code: 'meta_title_missing',
      title: 'Brak Meta title',
      action: 'Kliknij "Generuj tytuł", aby utworzyć go automatycznie.',
    })
    score -= 20
  } else if (titleLen < 30) {
    issuesParts.push({
      level: 'warning',
      code: 'meta_title_length',
      title: 'Meta title jest za krótki',
      action: 'Rozszerz tytuł do ok. 50-60 znaków.',
    })
    score += 12
  } else if (titleLen > 70) {
    issuesParts.push({
      level: 'warning',
      code: 'meta_title_length',
      title: 'Meta title jest za długi',
      action: 'Skróć tytuł do max 60 znaków.',
    })
    score += 15
  } else {
    issuesParts.push({ level: 'good', code: 'meta_title_ok', title: 'Meta title poprawny', action: 'OK' })
    score += 20
  }

  // 3. Meta Description (waga: 15/100) - IMPORTANTE
  if (!desc) {
    issuesParts.push({
      level: 'error',
      code: 'meta_description_missing',
      title: 'Brak Meta description',
      action: 'Kliknij "Generuj opis AI", aby stworzyć go za pomocą AI.',
    })
    score -= 15
  } else if (descLen < 80) {
    issuesParts.push({
      level: 'warning',
      code: 'meta_description_length',
      title: 'Meta description za krótki',
      action: 'Rozszerz opis do 120-160 znaków.',
    })
    score += 8
  } else if (descLen > 200) {
    issuesParts.push({
      level: 'warning',
      code: 'meta_description_length',
      title: 'Meta description za długi',
      action: 'Skróć opis do max 160 znaków.',
    })
    score += 12
  } else {
    issuesParts.push({ level: 'good', code: 'meta_description_ok', title: 'Meta description poprawny', action: 'OK' })
    score += 15
  }

  // 4. H1 Header (waga: 20/100) - CRÍTICO
  if (!heroTitle.trim()) {
    issuesParts.push({
      level: 'error',
      code: 'h1_missing',
      title: 'Brak nagłówka H1',
      action: 'Dodaj blok Hero lub ustaw główny tytuł strony.',
    })
    score -= 20
  } else if (heroTitle.trim().length < 10) {
    issuesParts.push({
      level: 'warning',
      code: 'h1_too_short',
      title: 'Nagłówek H1 jest za krótki',
      action: 'Ustaw bardziej opisowy nagłówek.',
    })
    score += 12
  } else {
    issuesParts.push({ level: 'good', code: 'h1_ok', title: 'Nagłówek H1 obecny', action: 'OK' })
    score += 20
  }

  // 5. Canonical (waga: 10/100) - menos crítico
  if (!canonical) {
    issuesParts.push({
      level: 'suggestion',
      code: 'canonical_missing',
      title: 'Brak tagu Canonical',
      action: 'Dodaj canonical URL, aby uniknąć duplikatów.',
    })
    score += 5
  } else {
    issuesParts.push({ level: 'good', code: 'canonical_ok', title: 'Tag Canonical ustawiony', action: 'OK' })
    score += 10
  }

  // 6. Open Graph (waga: 15/100)
  const hasOG = !!(seo as any).ogTitle || !!(seo as any).hasOpenGraph
  if (!hasOG) {
    issuesParts.push({
      level: 'warning',
      code: 'no_og',
      title: 'Brak tagów Open Graph',
      action: 'Dodaj tagi social media (OG), aby strona lepiej wyglądała na Facebooku.',
    })
    score += 5
  } else {
    issuesParts.push({ level: 'good', code: 'no_og_ok', title: 'Tagi Open Graph obecne', action: 'OK' })
    score += 15
  }

  // 7. Alt Attributes (waga: 15/100)
  if (imageRows.length === 0) {
    issuesParts.push({ level: 'good', code: 'no_images', title: 'Brak obrazów do sprawdzenia', action: 'OK' })
    score += 15
  } else if (imagesWithoutAlt > 0) {
    const pct = Math.round(((imageRows.length - imagesWithoutAlt) / imageRows.length) * 100)
    issuesParts.push({
      level: 'warning',
      code: 'images_no_alt',
      title: `${imagesWithoutAlt}/${imageRows.length} obrazy bez ALT (${pct}% OK)`,
      action: 'Dodaj opisy ALT do obrazów dla lepszej dostępności.',
    })
    score += pct >= 80 ? 13 : pct >= 50 ? 8 : 3
  } else {
    issuesParts.push({ level: 'good', code: 'alt_ok', title: `Wszystkie obrazy mają ALT (${imageRows.length})`, action: 'OK' })
    score += 15
  }

  // Bonus para páginas con todo bien
  if (score >= 95) {
    issuesParts.push({
      level: 'good',
      code: 'fully_optimized',
      title: 'Strona w pełni zoptymalizowana',
      action: 'Świetnie! Ta strona spełnia wszystkie wytyczne SEO.',
    })
  }

  const issues = buildIssues(issuesParts)
  const finalScore = clampScore(score)

  return { slug, language_code: page.language_code, score: finalScore, issues, summary: '' }
}

export function analyzeAll(pages: CmsPageRow[]) {
  const pageResults = pages.map(analyzePage)
  
  const scores = pageResults.map(p => p.score)
  const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1)
  
  const goodCount = scores.filter(s => s >= 75).length
  const decentCount = scores.filter(s => s >= 50 && s < 75).length
  const poorCount = scores.filter(s => s < 50).length

  let overallScore = clampScore(avgScore)
  
  if (pages.length > 0) {
    const pctGood = (goodCount / pages.length) * 100
    const pctDecent = (decentCount / pages.length) * 100
    const pctPoor = (poorCount / pages.length) * 100
    
    if (pctGood >= 60) overallScore = clampScore(overallScore + 8)
    else if (pctGood >= 40) overallScore = clampScore(overallScore + 4)
    
    if (pctGood + pctDecent >= 80) overallScore = clampScore(overallScore + 5)
    
    if (pctPoor >= 20) overallScore = clampScore(overallScore - 10)
    if (pctPoor >= 40) overallScore = clampScore(overallScore - 10)
    
    const totalErrors = pageResults.reduce((sum, p) => sum + p.issues.errors.length, 0)
    if (totalErrors >= 5) overallScore = clampScore(overallScore - 15)
    else if (totalErrors >= 3) overallScore = clampScore(overallScore - 10)
    else if (totalErrors >= 1) overallScore = clampScore(overallScore - 5)
  }

  const allIssues = {
    errors: pageResults.flatMap((p, idx) => p.issues.errors.map(i => ({ ...i, path: pages[idx].path }))),
    warnings: pageResults.flatMap((p, idx) => p.issues.warnings.map(i => ({ ...i, path: pages[idx].path }))),
    good: pageResults.flatMap((p, idx) => p.issues.good.map(i => ({ ...i, path: pages[idx].path }))),
    suggestions: pageResults.flatMap((p, idx) => (p.issues as any).suggestions.map((i: any) => ({ ...i, path: pages[idx].path }))),
  }

  const titles = new Map<string, string[]>()
  pages.forEach(p => {
    const t = ((p.seo as any)?.metaTitle || '').trim()
    if (t) {
      if (!titles.has(t)) titles.set(t, [])
      titles.get(t)!.push(p.path)
    }
  })

  for (const [title, paths] of titles.entries()) {
    if (paths.length > 1) {
      allIssues.errors.push({
        level: 'error',
        code: 'duplicate_titles',
        title: `Zduplikowany Meta Title: "${title}"`,
        action: 'Ustaw unikalne tytuły dla: ' + paths.join(', '),
      } as any)
    }
  }

  const summary = `Analiza ${pages.length} podstron: ${goodCount} dobrych, ${decentCount} średnich, ${poorCount} słabych. Błędy krytyczne: ${allIssues.errors.length}, ostrzeżenia: ${allIssues.warnings.length}.`

  return { overallScore, issues: allIssues, pages: pageResults, summary }
}
