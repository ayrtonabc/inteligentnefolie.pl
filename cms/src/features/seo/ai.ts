import type { CmsPageRow, SeoAiSuggestion, SeoIssues } from './types'

type AiProviderRequest = {
  page: {
    title: string
    path: string
    language_code: string
    seo: unknown
    content: unknown
  }
  issues: SeoIssues
}

type AiProviderResponse = {
  suggestions: SeoAiSuggestion['suggestions']
}

function asString(v: unknown) {
  return typeof v === 'string' ? v : ''
}

function truncate(s: string, max: number) {
  const t = s.trim()
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…'
}

export async function generateSeoSuggestions(input: { page: CmsPageRow; issues: SeoIssues }) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Jesteś ekspertem SEO. Analizujesz błędy na stronie i podajesz konkretne sugestie poprawy w formacie JSON.',
          },
          {
            role: 'user',
            content: `Przeanalizuj stronę:
Tytuł: ${input.page.title}
Path: ${input.page.path}
SEO: ${JSON.stringify(input.page.seo)}
Błędy: ${JSON.stringify(input.issues.errors.map(e => e.title))}
Ostrzeżenia: ${JSON.stringify(input.issues.warnings.map(w => w.title))}

Podaj 3-5 sugestii w formacie:
{ "suggestions": [ { "code": "string", "title": "string", "after": "string", "target": "metaTitle|metaDescription" } ] }`,
          },
        ],
      }),
    })
    
    if (res.ok) {
      const data = await res.json()
      const content = data.response
      const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}')
      if (parsed.suggestions) return parsed.suggestions.slice(0, 5)
    }
  } catch (e) {
    console.warn('AI Suggestion failed, falling back to local', e)
  }

  // Fallback local logic...
  const seo = (input.page.seo ?? {}) as Record<string, unknown>
  const metaTitle = asString(seo.metaTitle)
  const metaDescription = asString(seo.metaDescription)

  const suggestions: SeoAiSuggestion['suggestions'] = []

  if (!metaTitle || metaTitle.trim().length < 30 || metaTitle.trim().length > 60) {
    const base = input.page.title || input.page.path
    const after = truncate(`${base} | Profesjonalna Firma`, 60)
    suggestions.push({
      code: 'ai_meta_title',
      title: 'Zoptymalizuj Tytuł Meta',
      before: metaTitle,
      after,
      target: 'metaTitle',
      applyPatch: { metaTitle: after },
    })
  }

  if (!metaDescription || metaDescription.trim().length < 120 || metaDescription.trim().length > 160) {
    const after = truncate(
      `Odkryj naszą ofertę dla ${input.page.title}. Najwyższa jakość, konkurencyjne ceny i wsparcie ekspertów. Sprawdź szczegóły na stronie!`,
      160,
    )
    suggestions.push({
      code: 'ai_meta_description',
      title: 'Ulepsz Opis Meta',
      before: metaDescription,
      after,
      target: 'metaDescription',
      applyPatch: { metaDescription: after },
    })
  }

  return suggestions.slice(0, 5)
}
