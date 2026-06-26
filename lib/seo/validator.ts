export interface SEOValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface SEOValidationResult {
  valid: boolean
  errors: SEOValidationError[]
  warnings: SEOValidationError[]
}

interface ContentImage {
  url?: string
  alt?: string
  width?: number
  height?: number
}

interface SEOContent {
  h1?: string
  metaTitle?: string
  metaDescription?: string
  images?: ContentImage[]
  status?: string
  pageContent?: any
  canonical?: string
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export function validateSEOForPublish(content: SEOContent): SEOValidationResult {
  const errors: SEOValidationError[] = []
  const warnings: SEOValidationError[] = []

  if (!content.h1 || stripHtml(content.h1).length === 0) {
    errors.push({
      field: 'h1',
      message: 'Brak nagłówka H1. Dodaj nagłówek na stronie.',
      severity: 'error',
    })
  }

  const metaTitle = content.metaTitle ? stripHtml(content.metaTitle) : ''
  if (!metaTitle) {
    errors.push({
      field: 'metaTitle',
      message: 'Brak tytułu meta. Dodaj tytuł strony w SEO.',
      severity: 'error',
    })
  } else if (metaTitle.length > 60) {
    errors.push({
      field: 'metaTitle',
      message: `Tytuł meta jest za długi (${metaTitle.length}/60 znaków). Skróć go.`,
      severity: 'error',
    })
  }

  const metaDesc = content.metaDescription ? stripHtml(content.metaDescription) : ''
  if (!metaDesc) {
    errors.push({
      field: 'metaDescription',
      message: 'Brak opisu meta. Dodaj opis strony w SEO.',
      severity: 'error',
    })
  } else if (metaDesc.length > 155) {
    errors.push({
      field: 'metaDescription',
      message: `Opis meta jest za długi (${metaDesc.length}/155 znaków). Skróć go.`,
      severity: 'error',
    })
  }

  if (content.images && content.images.length > 0) {
    content.images.forEach((img, index) => {
      if (!img.alt) {
        warnings.push({
          field: `images[${index}].alt`,
          message: `Obraz ${index + 1} nie ma tekstu alternatywnego (alt). Dodaj opis dla SEO.`,
          severity: 'warning',
        })
      }
      if (!img.width || !img.height) {
        warnings.push({
          field: `images[${index}].dimensions`,
          message: `Obraz ${index + 1} nie ma określonych wymiarów. Dodaj width/height.`,
          severity: 'warning',
        })
      }
    })
  }

  if (content.pageContent) {
    const contentStr = typeof content.pageContent === 'string' 
      ? content.pageContent 
      : JSON.stringify(content.pageContent)
    if (contentStr.length < 300) {
      warnings.push({
        field: 'pageContent',
        message: `Strona ma mało treści (${contentStr.length} znaków). Rozważ dodanie więcej tekstu.`,
        severity: 'warning',
      })
    }
  }

  if (!content.canonical) {
    warnings.push({
      field: 'canonical',
      message: 'Brak adresu canonical. Zalecane dla uniknięcia duplikacji treści.',
      severity: 'warning',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

export function formatSEOErrors(result: SEOValidationResult): string {
  const lines: string[] = []
  
  if (result.errors.length > 0) {
    lines.push('❌ Błędy krytyczne:')
    result.errors.forEach(err => {
      lines.push(`   • ${err.message}`)
    })
  }
  
  if (result.warnings.length > 0) {
    lines.push('⚠️ Ostrzeżenia:')
    result.warnings.forEach(warn => {
      lines.push(`   • ${warn.message}`)
    })
  }
  
  return lines.join('\n')
}
