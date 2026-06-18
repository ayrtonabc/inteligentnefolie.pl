import { PB_URL } from '@/lib/config'

const SITE_NAME = 'Inteligentne Folie'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inteligentnefolie.pl'
const LOGO_URL = `${SITE_URL}/logo.webp`

interface AggregateRatingSchemaProps {
  ratingValue?: string;
  reviewCount?: string;
}

export default function AggregateRatingSchema({ 
  ratingValue = '4.8', 
  reviewCount = '135' 
}: AggregateRatingSchemaProps) {
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+48-600-959-905',
      contactType: 'customer service',
      availableLanguage: ['Polish', 'English', 'German', 'Ukrainian'],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://www.facebook.com/sciankiszkalne',
      'https://www.instagram.com/inteligentne.folie',
      'https://www.youtube.com/@inteligentne.scianki-szklane',
      'https://www.linkedin.com/in/micha%C5%82-janczak-994690113',
      'https://x.com/micha435038',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}