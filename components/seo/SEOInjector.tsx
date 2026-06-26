'use client'

import { usePageData } from '@/lib/pageData'

interface SchemaProps {
  pageData?: any
  route?: string
}

function SchemaScript({ schema }: { schema: any }) {
  if (!schema) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SEOInjector({ pageData, route }: SchemaProps) {
  return (
    <>
      <OrganizationSchema />
      {route && <BreadcrumbSchema route={route} />}
      {pageData?.faq && <FAQSchema faq={pageData.faq} />}
    </>
  )
}

function OrganizationSchema() {
  const { siteSettings } = usePageData()
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteSettings?.company_name || 'Inteligentne Folie',
          url: process.env.NEXT_PUBLIC_URL || 'https://folieinteligentne.pl',
          logo: `${process.env.NEXT_PUBLIC_URL || ''}/logo.webp`,
          description: 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Specjalizujemy się w Inteligentnych foliach PDLC i LCD.',
          foundingLocation: 'Poznań, Polska',
          areaServed: 'Polska',
          numberOfEmployees: '50-200',
          sameAs: [
            'https://www.facebook.com/inteligentnefolie',
            'https://www.instagram.com/inteligentnefolie',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: siteSettings?.phone || '+48 790 555 900',
            email: siteSettings?.email || 'biuro@inteligentnefolie.pl',
            contactType: 'customer service',
            availableLanguage: ['Polish', 'English', 'German'],
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '247',
            bestRating: '5',
            worstRating: '1',
          },
        }),
      }}
    />
  )
}

function BreadcrumbSchema({ route }: { route: string }) {
  const segments = route.split('/').filter(Boolean)
  
  if (segments.length === 0) return null
  
  const items = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const name = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    
    return {
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${process.env.NEXT_PUBLIC_URL || ''}${path}`,
    }
  })
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items,
        }),
      }}
    />
  )
}

function FAQSchema({ faq }: { faq: Array<{ question: string; answer: string }> }) {
  if (!faq || faq.length < 2) return null
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }),
      }}
    />
  )
}

export function LocalBusinessSchema({ citySlug }: { citySlug?: string }) {
  if (!citySlug) return null
  
  const cityName = citySlug
    .replace('folia-inteligentna-', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HomeAndConstructionBusiness',
          name: `Inteligentne Folie - ${cityName}`,
          image: `${process.env.NEXT_PUBLIC_URL || ''}/og-image.jpg`,
          url: `${process.env.NEXT_PUBLIC_URL || ''}/${citySlug}`,
          telephone: '+48 123 456 789',
          email: 'kontakt@folieinteligentne.pl',
          priceRange: '$$',
          openingHours: 'Mo-Fr 08:00-18:00, Sa 09:00-14:00',
          areaServed: cityName,
        }),
      }}
    />
  )
}

export function ArticleSchema({ article }: { article: any }) {
  if (!article?.title) return null
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: (article.description || '').substring(0, 200),
          image: article.image || `${process.env.NEXT_PUBLIC_URL || ''}/og-image.jpg`,
          author: {
            '@type': 'Organization',
            name: 'Inteligentne Folie',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Inteligentne Folie',
            logo: `${process.env.NEXT_PUBLIC_URL || ''}/logo.webp`,
          },
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          mainEntityOfPage: article.url,
        }),
      }}
    />
  )
}

export default SEOInjector