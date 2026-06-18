import { PB_URL } from '@/lib/config'

const SITE_NAME = process.env.SITE_NAME || 'Inteligentne Folie'
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://folieinteligentne.pl'
const DEFAULT_OG_IMAGE = process.env.DEFAULT_OG_IMAGE || `${NEXT_PUBLIC_URL}/og-image.jpg`

interface BlogPost {
  id: string
  slug: string
  title: string
  meta_title?: string
  content?: string
  excerpt?: string
  meta_description?: string
  cover_image?: string
  cover_image_url?: string
  og_image?: string
  og_image_url?: string
  publishedAt?: string
  updatedAt?: string
  published_at?: string
  updated?: string
  created_at?: string
  created?: string
  author?: string
  author_name?: string
  collectionName?: string
}

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

function extractFirstParagraph(content: string | null | undefined): string {
  if (!content) return ''
  const cleaned = stripHtml(content)
  if (cleaned.length === 0) return ''
  const firstSentence = cleaned.substring(0, 200)
  const lastSpace = firstSentence.lastIndexOf(' ')
  return lastSpace > 50 ? firstSentence.substring(0, lastSpace) + '...' : firstSentence
}

function normalizeImageUrl(value: unknown, collectionId?: string, recordId?: string): string {
  if (typeof value !== 'string' || !value) return ''
  
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) {
    return value
  }
  
  if (collectionId && recordId) {
    return `${PB_URL}/api/files/${collectionId}/${recordId}/${encodeURIComponent(value)}`
  }
  
  return `${PB_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

function getPostImageUrl(post: BlogPost): string {
  const collectionId = post.collectionName || 'blog_posts'
  const recordId = post.id

  if (post.og_image_url) {
    return normalizeImageUrl(post.og_image_url, collectionId, recordId)
  }
  if (post.og_image) {
    return normalizeImageUrl(post.og_image, collectionId, recordId)
  }
  if (post.cover_image_url) {
    return normalizeImageUrl(post.cover_image_url, collectionId, recordId)
  }
  if (post.cover_image) {
    const coverFile = Array.isArray(post.cover_image) 
      ? post.cover_image[0] 
      : post.cover_image
    if (coverFile) {
      return normalizeImageUrl(coverFile, collectionId, recordId)
    }
  }

  if (post.content) {
    const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch?.[1]) {
      return normalizeImageUrl(imgMatch[1], collectionId, recordId)
    }
  }

  return DEFAULT_OG_IMAGE
}

interface ArticleSchemaProps {
  post: BlogPost
}

export function ArticleSchema({ post }: ArticleSchemaProps) {
  const headline = post.meta_title || post.title
  
  if (!headline) {
    console.warn('[ArticleSchema] Missing headline, skipping schema injection')
    return null
  }

  const description = post.meta_description || post.excerpt || extractFirstParagraph(post.content)
  
  if (!description) {
    console.warn('[ArticleSchema] Missing description, skipping schema injection')
    return null
  }

  const datePublished = post.publishedAt || post.published_at || post.created_at || post.created
  
  if (!datePublished) {
    console.warn('[ArticleSchema] Missing datePublished, skipping schema injection')
    return null
  }

  const dateModified = post.updatedAt || post.updated || datePublished
  const imageUrl = getPostImageUrl(post)
  const authorName = post.author || post.author_name || SITE_NAME
  const canonicalUrl = `${NEXT_PUBLIC_URL}/blog/${post.slug}`
  const logoUrl = `${NEXT_PUBLIC_URL}/logo.webp`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: new Date(datePublished).toISOString(),
    dateModified: new Date(dateModified).toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    wordCount: post.content ? stripHtml(post.content).split(/\s+/).length : 0,
  }

  return (
    <>
      {/* Article Schema for SEO - Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}

export default ArticleSchema