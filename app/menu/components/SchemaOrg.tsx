'use client'

import Script from 'next/script'
import type { MenuCategory, MenuProduct } from '@/features/restaurant/types'

interface SchemaOrgProps {
  restaurantName: string
  menuUrl: string
  categories: MenuCategory[]
  products: MenuProduct[]
  cuisine?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  phone?: string
  priceRange?: string
}

export default function SchemaOrg({
  restaurantName,
  menuUrl,
  categories,
  products,
  cuisine,
  address,
  phone,
  priceRange = '$$',
}: SchemaOrgProps) {
  const menuSections = categories.map((category) => {
    const categoryProducts = products
      .filter((p) => p.category_id === category.id)
      .slice(0, 10)

    const menuItems = categoryProducts.map((product) => {
      const item: Record<string, any> = {
        '@type': 'MenuItem',
        name: product.name,
        price: product.price.toFixed(2),
        priceCurrency: product.currency || 'PLN',
      }

      if (product.description) {
        item.description = product.description
      }

      if (product.image_url) {
        item.image = product.image_url
      }

      const badges: string[] = []
      if (product.is_vegetarian) badges.push('Vegetarian')
      if (product.is_vegan) badges.push('Vegan')
      if (product.is_gluten_free) badges.push(' GlutenFree')
      if (badges.length > 0) {
        item.suitableForDiet = badges.map((b) => `https://schema.org/${b}Diet`)
      }

      return item
    })

    const section: Record<string, any> = {
      '@type': 'MenuSection',
      name: category.name,
    }

    if (category.description) {
      section.description = category.description
    }

    if (menuItems.length > 0) {
      section.hasMenuItem = menuItems
    }

    return section
  })

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurantName,
    url: menuUrl,
    ...(cuisine && { servesCuisine: cuisine }),
    ...(priceRange && { priceRange }),
    ...(phone && { telephone: phone }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    hasMenu: {
      '@type': 'Menu',
      name: 'Menu główne',
      url: menuUrl,
      hasMenuSection: menuSections,
    },
  }

  const jsonLd = JSON.stringify(restaurantSchema)

  return (
    <Script
      id="restaurant-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
      strategy="afterInteractive"
    />
  )
}
