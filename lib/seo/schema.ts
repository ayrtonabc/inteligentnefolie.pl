const SITE_NAME = process.env.SITE_NAME || 'Inteligentne Folie'
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://folieinteligentne.pl'
const SITE_PHONE = process.env.SITE_PHONE || '+48 123 456 789'
const SITE_EMAIL = process.env.SITE_EMAIL || 'kontakt@folieinteligentne.pl'

export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  sameAs?: string[]
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone: string
    email: string
    contactType: string
  }
}

export function buildOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: NEXT_PUBLIC_URL,
    logo: `${NEXT_PUBLIC_URL}/logo.webp`,
    sameAs: [
      'https://www.facebook.com/inteligentnefolie',
      'https://www.instagram.com/inteligentnefolie',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      contactType: 'customer service',
    },
  }
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LocalBusiness' | 'HomeAndConstructionBusiness'
  name: string
  image: string
  url: string
  telephone: string
  email: string
  address?: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    postalCode?: string
    addressCountry: string
  }
  priceRange?: string
  openingHours?: string
  areaServed?: string
  geo?: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
}

export function buildLocalBusinessSchema(citySlug?: string): LocalBusinessSchema | null {
  const cityName = citySlug 
    ? citySlug.replace('folia-inteligentna-', '').replace(/-/g, ' ')
    : 'Polska'
  
  const url = `${NEXT_PUBLIC_URL}/${citySlug || ''}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: `${SITE_NAME} - ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}`,
    image: `${NEXT_PUBLIC_URL}/og-image.jpg`,
    url,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    priceRange: '$$',
    openingHours: 'Mo-Fr 08:00-18:00, Sa 09:00-14:00',
    areaServed: cityName,
  }
}

export interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  image: string
  author: {
    '@type': 'Organization'
    name: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo: string
  }
  datePublished?: string
  dateModified?: string
  mainEntityOfPage: string
}

export function buildArticleSchema(article: {
  title: string
  description: string
  image?: string
  publishedAt?: string
  updatedAt?: string
  url: string
}): ArticleSchema | null {
  if (!article.title) return null
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description.substring(0, 200),
    image: article.image || `${NEXT_PUBLIC_URL}/og-image.jpg`,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: `${NEXT_PUBLIC_URL}/logo.webp`,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: article.url,
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): BreadcrumbSchema | null {
  if (breadcrumbs.length === 0) return null
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${NEXT_PUBLIC_URL}${crumb.url}`,
    })),
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export function buildFAQSchema(faqItems: FAQItem[]): FAQSchema | null {
  if (!faqItems || faqItems.length < 2) return null
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function safeJsonStringify(schema: unknown): string {
  try {
    return JSON.stringify(schema)
  } catch {
    return '{}'
  }
}

export function isValidSchema(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object') return false
  if (!('@context' in schema)) return false
  if (!('@type' in schema)) return false
  return true
}