export type IssueLevel = 'error' | 'warning' | 'good' | 'suggestion'

export type SeoIssue = {
  level: IssueLevel
  code: string
  title: string
  action: string
  pageId?: string
  path?: string
}

export type SeoIssues = {
  errors: SeoIssue[]
  warnings: SeoIssue[]
  good: SeoIssue[]
  suggestions?: SeoIssue[]
}

export type SeoAuditKeyword = {
  term: string
  priority: 'high' | 'medium' | 'low'
}

export type SeoAudit = {
  id: string
  website_id: string
  score: number
  issues: SeoIssues
  summary: string
  generalStatus: string
  improvements: string[]
  goodPoints: string[]
  suggestions: string[]
  keywords: SeoAuditKeyword[]
  created_at: string
}

export type SeoPageAnalysis = {
  id: string
  website_id: string
  slug: string
  language_code: string
  score: number
  issues: SeoIssues
  created_at: string
}

export type SeoAiSuggestion = {
  id: string
  website_id: string
  page_slug: string
  language_code: string
  suggestions: Array<{
    code: string
    title: string
    before?: string
    after: string
    target: 'metaTitle' | 'metaDescription' | 'imageAlt'
    applyPatch?: Record<string, unknown>
  }>
  applied: boolean
  created_at: string
}

export type CmsPageRow = {
  id: string
  title: string
  path: string
  language_code: string
  is_published: boolean
  content: Array<{
    id: string
    path: string
    section_key: string
    content_type: string
    content_value: unknown
    language_code: string
    is_active: boolean
    order_index: number
    updated_at?: string
    created_at?: string
  }>
  seo: {
    metaTitle?: string
    metaDescription?: string
    canonical?: string
    indexable?: boolean
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    hasOpenGraph?: boolean
  }
  updated_at: string
}
