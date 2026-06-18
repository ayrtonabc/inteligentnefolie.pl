import { Metadata } from 'next'
import { PageData } from '@/lib/pageData'

const SITE_NAME = process.env.SITE_NAME || 'Inteligentne Folie'
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://folieinteligentne.pl'
const DEFAULT_OG_IMAGE = process.env.DEFAULT_OG_IMAGE || `${NEXT_PUBLIC_URL}/og-image.jpg`

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3).trim() + '...'
}

function extractFirstParagraph(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') {
    return stripHtml(content).substring(0, 200)
  }
  if (typeof content === 'object') {
    const str = JSON.stringify(content)
    return stripHtml(str).substring(0, 200)
  }
  return ''
}

function shouldNoIndex(pageData: PageData | null, route: string): boolean {
  if (!pageData) return true
  if (pageData.status !== 'published') return true
  if (route.includes('/preview/')) return true
  if (route.includes('?')) return true
  if (route.includes('/page/')) return true
  
  const contentLength = pageData.pageContent?.length || 0
  if (contentLength < 300) return true
  
  return false
}

interface SEOGenerateOptions {
  route: string
  pageData: PageData | null
  params?: Record<string, string | string[]>
}

export async function generateSafeMetadata(options: SEOGenerateOptions): Promise<Metadata> {
  const { route, pageData, params } = options
  
  const cleanRoute = route.split('?')[0]
  const canonical = `${NEXT_PUBLIC_URL}${cleanRoute}`
  
  const isNoIndex = shouldNoIndex(pageData, route)
  
  let title = SITE_NAME
  let description = 'Profesjonalne folie PDLC smart glass. Produkcja i montaż inteligentnych szyb w całej Polsce. Fasady, ścianki, drzwi szklane z folią inteligentną.'
  let h1 = ''
  let ogTitle: string | undefined
  let ogDescription: string | undefined
  let ogImage: string | undefined
  
  if (pageData) {
    if (pageData.h1) {
      h1 = stripHtml(pageData.h1)
      title = `${h1} | ${SITE_NAME}`
    }
    
    if (pageData.metaTitle) {
      title = stripHtml(pageData.metaTitle)
    }
    
    if (pageData.metaDescription) {
      description = stripHtml(pageData.metaDescription)
    } else if (pageData.pageContent) {
      const firstPara = extractFirstParagraph(pageData.pageContent)
      if (firstPara) {
        description = truncate(firstPara, 155)
      }
    }
    
    ogTitle = pageData.ogTitle || undefined
    ogDescription = pageData.ogDescription || undefined
    ogImage = pageData.ogImage || undefined
  }
  
  title = truncate(title, 60)
  description = truncate(description, 155)
  
  const twitterHandle = '@inteligentnefolie'
  
  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      type: route.startsWith('/blog/') ? 'article' : 'website',
      siteName: SITE_NAME,
      title: ogTitle || title,
      description: ogDescription || description,
      url: canonical,
      images: [
        {
          url: ogImage || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title: ogTitle || title,
      description: ogDescription || description,
      images: [ogImage || DEFAULT_OG_IMAGE],
    },
  }
  
  if (isNoIndex) {
    metadata.robots = {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    }
  }
  
  return metadata
}

export function generateBreadcrumbs(route: string): Array<{ name: string; url: string }> {
  const segments = route.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; url: string }> = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const name = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    breadcrumbs.push({ name, url: currentPath })
  }
  
  return breadcrumbs
}
