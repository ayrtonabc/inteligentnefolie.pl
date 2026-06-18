import { pb, TENANT_ID } from '@/lib/pocketbase'
import type {
  MenuCategory,
  MenuCategoryFormData,
  MenuProduct,
  MenuProductFormData,
  MenuProductImage,
  MenuProductImageFormData,
  MenuCategoryFilters,
  MenuProductFilters,
  MenuStats,
} from './types'

export async function getWebsiteId(): Promise<string> {
  return TENANT_ID
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export class MenuCategoriesAPI {
  async getCategories(websiteId: string, filters?: MenuCategoryFilters): Promise<MenuCategory[]> {
    const filterParts: string[] = [`website_id = "${escapePbFilterValue(websiteId)}"`]
    
    if (filters?.is_active !== undefined) {
      filterParts.push(`is_active = ${filters.is_active}`)
    }
    if (filters?.is_featured !== undefined) {
      filterParts.push(`is_featured = ${filters.is_featured}`)
    }
    if (filters?.search) {
      filterParts.push(`name ~ "${filters.search}"`)
    }

    const records = await pb.collection('menu_categories').getFullList({
      filter: filterParts.join(' && '),
      sort: 'sort_order',
      requestKey: null,
    })
    return records as unknown as MenuCategory[]
  }

  async getCategory(id: string): Promise<MenuCategory | null> {
    try {
      const record = await pb.collection('menu_categories').getOne(id)
      return record as unknown as MenuCategory
    } catch {
      return null
    }
  }

  async createCategory(websiteId: string, data: MenuCategoryFormData): Promise<MenuCategory> {
    const slug = data.slug || generateSlug(data.name)
    const record = await pb.collection('menu_categories').create({
      website_id: websiteId,
      name: data.name,
      slug,
      description: data.description || '',
      sort_order: data.sort_order || 0,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
    })
    return record as unknown as MenuCategory
  }

  async updateCategory(id: string, updates: Partial<MenuCategoryFormData>): Promise<MenuCategory> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.slug !== undefined) payload.slug = updates.slug
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
    if (updates.is_active !== undefined) payload.is_active = updates.is_active
    if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured

    const record = await pb.collection('menu_categories').update(id, payload)
    return record as unknown as MenuCategory
  }

  async deleteCategory(id: string): Promise<void> {
    await pb.collection('menu_categories').delete(id)
  }

  async reorderCategories(orderedIds: string[]): Promise<void> {
    for (let index = 0; index < orderedIds.length; index++) {
      await pb.collection('menu_categories').update(orderedIds[index], {
        sort_order: index,
      })
    }
  }
}

export class MenuProductsAPI {
  async getProducts(websiteId: string, filters?: MenuProductFilters): Promise<MenuProduct[]> {
    const filterParts: string[] = [`website_id = "${escapePbFilterValue(websiteId)}"`]
    
    if (filters?.category_id) {
      filterParts.push(`category_id = "${filters.category_id}"`)
    }
    if (filters?.is_available !== undefined) {
      filterParts.push(`is_available = ${filters.is_available}`)
    }
    if (filters?.is_featured !== undefined) {
      filterParts.push(`is_featured = ${filters.is_featured}`)
    }
    if (filters?.min_price !== undefined) {
      filterParts.push(`price >= ${filters.min_price}`)
    }
    if (filters?.max_price !== undefined) {
      filterParts.push(`price <= ${filters.max_price}`)
    }
    if (filters?.is_vegetarian !== undefined) {
      filterParts.push(`is_vegetarian = ${filters.is_vegetarian}`)
    }
    if (filters?.is_vegan !== undefined) {
      filterParts.push(`is_vegan = ${filters.is_vegan}`)
    }
    if (filters?.is_gluten_free !== undefined) {
      filterParts.push(`is_gluten_free = ${filters.is_gluten_free}`)
    }
    if (filters?.search) {
      filterParts.push(`(name ~ "${filters.search}" || description ~ "${filters.search}")`)
    }

    const records = await pb.collection('menu_products').getFullList({
      filter: filterParts.join(' && '),
      sort: 'sort_order',
      requestKey: null,
    })
    return records as unknown as MenuProduct[]
  }

  async getProduct(id: string): Promise<MenuProduct | null> {
    try {
      const record = await pb.collection('menu_products').getOne(id)
      return record as unknown as MenuProduct
    } catch {
      return null
    }
  }

  async createProduct(websiteId: string, data: MenuProductFormData): Promise<MenuProduct> {
    const slug = data.slug || generateSlug(data.name)
    const record = await pb.collection('menu_products').create({
      website_id: websiteId,
      name: data.name,
      slug,
      description: data.description || '',
      price: data.price || 0,
      category_id: data.category_id || null,
      sort_order: data.sort_order || 0,
      is_available: data.is_available ?? true,
      is_featured: data.is_featured ?? false,
      is_vegetarian: data.is_vegetarian ?? false,
      is_vegan: data.is_vegan ?? false,
      is_gluten_free: data.is_gluten_free ?? false,
    })
    return record as unknown as MenuProduct
  }

  async updateProduct(id: string, updates: Partial<MenuProductFormData>): Promise<MenuProduct> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.slug !== undefined) payload.slug = updates.slug
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.price !== undefined) payload.price = updates.price
    if (updates.category_id !== undefined) payload.category_id = updates.category_id
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
    if (updates.is_available !== undefined) payload.is_available = updates.is_available
    if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured
    if (updates.is_vegetarian !== undefined) payload.is_vegetarian = updates.is_vegetarian
    if (updates.is_vegan !== undefined) payload.is_vegan = updates.is_vegan
    if (updates.is_gluten_free !== undefined) payload.is_gluten_free = updates.is_gluten_free

    const record = await pb.collection('menu_products').update(id, payload)
    return record as unknown as MenuProduct
  }

  async deleteProduct(id: string): Promise<void> {
    await pb.collection('menu_products').delete(id)
  }

  async reorderProducts(orderedIds: string[]): Promise<void> {
    for (let index = 0; index < orderedIds.length; index++) {
      await pb.collection('menu_products').update(orderedIds[index], {
        sort_order: index,
      })
    }
  }
}

export class MenuProductImagesAPI {
  async getImages(productId: string): Promise<MenuProductImage[]> {
    const records = await pb.collection('menu_product_images').getFullList({
      filter: `product_id = "${productId}"`,
      sort: 'sort_order',
      requestKey: null,
    })
    return records as unknown as MenuProductImage[]
  }

  async uploadImage(productId: string, file: File): Promise<{ url: string; path: string }> {
    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('file', file)

    const record = await pb.collection('menu_product_images').create(formData)
    const fileUrl = pb.files.getURL(record, record.file as string)
    
    return { 
      url: fileUrl, 
      path: record.file as string 
    }
  }

  async createImage(productId: string, data: MenuProductImageFormData): Promise<MenuProductImage> {
    if (data.is_primary) {
      const existing = await pb.collection('menu_product_images').getFullList({
        filter: `product_id = "${productId}" && is_primary = true`,
        requestKey: null,
      })
      for (const img of existing) {
        await pb.collection('menu_product_images').update(img.id, { is_primary: false })
      }
    }

    const record = await pb.collection('menu_product_images').create({
      product_id: productId,
      url: data.url || '',
      sort_order: data.sort_order || 0,
      is_primary: data.is_primary ?? false,
    })
    return record as unknown as MenuProductImage
  }

  async updateImage(id: string, updates: Partial<MenuProductImageFormData>): Promise<MenuProductImage> {
    if (updates.is_primary) {
      const existing = await pb.collection('menu_product_images').getOne(id)
      const allPrimary = await pb.collection('menu_product_images').getFullList({
        filter: `product_id = "${existing.product_id}" && is_primary = true && id != "${id}"`,
        requestKey: null,
      })
      for (const img of allPrimary) {
        await pb.collection('menu_product_images').update(img.id, { is_primary: false })
      }
    }

    const payload: Record<string, unknown> = {}
    if (updates.url !== undefined) payload.url = updates.url
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
    if (updates.is_primary !== undefined) payload.is_primary = updates.is_primary

    const record = await pb.collection('menu_product_images').update(id, payload)
    return record as unknown as MenuProductImage
  }

  async deleteImage(id: string): Promise<void> {
    await pb.collection('menu_product_images').delete(id)
  }

  async reorderImages(orderedIds: string[]): Promise<void> {
    for (let index = 0; index < orderedIds.length; index++) {
      await pb.collection('menu_product_images').update(orderedIds[index], {
        sort_order: index,
      })
    }
  }
}

export async function getMenuStats(websiteId: string): Promise<MenuStats> {
  const categories = await pb.collection('menu_categories').getFullList({
    filter: `website_id = "${websiteId}"`,
    fields: 'id',
    requestKey: null,
  })

  const products = await pb.collection('menu_products').getFullList({
    filter: `website_id = "${websiteId}"`,
    fields: 'id, price, is_available, is_featured',
    requestKey: null,
  }) as unknown as Array<{ price: number; is_available: boolean; is_featured: boolean }>

  const images = await pb.collection('menu_product_images').getFullList({
    fields: 'id',
    requestKey: null,
  })

  const availableProducts = products.filter(p => p.is_available).length
  const featuredProducts = products.filter(p => p.is_featured).length
  const averagePrice = products.length
    ? products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length
    : 0

  return {
    total_categories: categories.length,
    total_products: products.length,
    available_products: availableProducts,
    featured_products: featuredProducts,
    average_price: Math.round(averagePrice * 100) / 100,
    total_images: images.length,
  }
}

export const menuCategoriesAPI = new MenuCategoriesAPI()
export const menuProductsAPI = new MenuProductsAPI()
export const menuProductImagesAPI = new MenuProductImagesAPI()

export const menuApi = {
  categories: menuCategoriesAPI,
  products: menuProductsAPI,
  images: menuProductImagesAPI,
  getWebsiteId,
  getMenuStats,
}