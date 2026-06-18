import { pb } from '@/lib/pocketbase'
import type { ShopProduct, ShopCategory, ShopOrder, ShopCoupon, ShopFlashSale, ShopBundle } from './types'

export async function createProduct(data: Partial<ShopProduct>): Promise<string | null> {
  try {
    const record = await pb.collection('shop_products').create({
      name: data.name || 'Nowy produkt',
      slug: data.slug || `product-${Date.now()}`,
      short_description: data.short_description || '',
      description: data.description || '',
      price: data.price || 0,
      compare_at_price: data.compare_at_price || null,
      cost_per_item: data.cost_per_item || null,
      sku: data.sku || '',
      stock_quantity: data.stock_quantity ?? null,
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      is_track_inventory: data.is_track_inventory ?? true,
      category: data.category || null,
      tags: data.tags || [],
      images: data.images || [],
      weight: data.weight || null,
      weight_unit: data.weight_unit || 'kg',
      seo_title: (data as any).seo_title || (data as any).SeoTitle || '',
      seo_description: (data as any).seo_description || (data as any).SeoDescription || '',
      discount_type: data.discount_type || 'none',
      discount_value: data.discount_value || null,
      discount_start: data.discount_start || null,
      discount_end: data.discount_end || null,
      buy_x_quantity: data.buy_x_quantity || null,
      get_y_quantity: data.get_y_quantity || null,
      get_y_product_id: data.get_y_product_id || null,
      bulk_tiers: data.bulk_tiers || [],
      free_shipping_on_product: data.free_shipping_on_product ?? false,
    })
    return record.id
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

export async function updateProduct(id: string, data: Partial<ShopProduct>): Promise<boolean> {
  try {
    await pb.collection('shop_products').update(id, {
      name: data.name,
      slug: data.slug,
      short_description: data.short_description,
      description: data.description,
      price: data.price,
      compare_at_price: data.compare_at_price,
      cost_per_item: data.cost_per_item,
      sku: data.sku,
      stock_quantity: data.stock_quantity,
      is_published: data.is_published,
      is_featured: data.is_featured,
      is_track_inventory: data.is_track_inventory,
      category: data.category,
      tags: data.tags,
      images: data.images,
      weight: data.weight,
      weight_unit: data.weight_unit,
      seo_title: (data as any).seo_title,
      seo_description: (data as any).seo_description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      discount_start: data.discount_start,
      discount_end: data.discount_end,
      buy_x_quantity: data.buy_x_quantity,
      get_y_quantity: data.get_y_quantity,
      get_y_product_id: data.get_y_product_id,
      bulk_tiers: data.bulk_tiers,
      free_shipping_on_product: data.free_shipping_on_product,
    })
    return true
  } catch (error) {
    console.error('Error updating product:', error)
    return false
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_products').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

export async function createCoupon(data: Partial<ShopCoupon>): Promise<string | null> {
  try {
    const record = await pb.collection('shop_coupons').create({
      code: data.code || '',
      description: data.description || '',
      discount_type: data.discount_type || 'percentage',
      discount_value: data.discount_value || null,
      min_order_value: data.min_order_value || null,
      max_uses: data.max_uses || null,
      current_uses: data.current_uses || 0,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      is_active: data.is_active ?? true,
      applicable_products: data.applicable_products || [],
      applicable_categories: data.applicable_categories || [],
      first_time_only: data.first_time_only ?? false,
    })
    return record.id
  } catch (error) {
    console.error('Error creating coupon:', error)
    return null
  }
}

export async function updateCoupon(id: string, data: Partial<ShopCoupon>): Promise<boolean> {
  try {
    await pb.collection('shop_coupons').update(id, {
      code: data.code,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_value: data.min_order_value,
      max_uses: data.max_uses,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active,
      applicable_products: data.applicable_products,
      applicable_categories: data.applicable_categories,
      first_time_only: data.first_time_only,
    })
    return true
  } catch (error) {
    console.error('Error updating coupon:', error)
    return false
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_coupons').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return false
  }
}

export async function createFlashSale(data: Partial<ShopFlashSale>): Promise<string | null> {
  try {
    const record = await pb.collection('shop_flash_sales').create({
      name: data.name || '',
      products: data.products || [],
      categories: data.categories || [],
      discount_type: data.discount_type || 'percentage',
      discount_value: data.discount_value || 0,
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      is_active: data.is_active ?? true,
      banner_image: data.banner_image || null,
      message: data.message || '',
    })
    return record.id
  } catch (error) {
    console.error('Error creating flash sale:', error)
    return null
  }
}

export async function updateFlashSale(id: string, data: Partial<ShopFlashSale>): Promise<boolean> {
  try {
    await pb.collection('shop_flash_sales').update(id, {
      name: data.name,
      products: data.products,
      categories: data.categories,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active,
      banner_image: data.banner_image,
      message: data.message,
    })
    return true
  } catch (error) {
    console.error('Error updating flash sale:', error)
    return false
  }
}

export async function deleteFlashSale(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_flash_sales').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting flash sale:', error)
    return false
  }
}

export async function createBundle(data: Partial<ShopBundle>): Promise<string | null> {
  try {
    const record = await pb.collection('shop_bundles').create({
      name: data.name || '',
      description: data.description || '',
      products: data.products || [],
      bundle_price: data.bundle_price || 0,
      original_price: data.original_price || 0,
      stock_quantity: data.stock_quantity || null,
      is_active: data.is_active ?? true,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      image: data.image || null,
    })
    return record.id
  } catch (error) {
    console.error('Error creating bundle:', error)
    return null
  }
}

export async function updateBundle(id: string, data: Partial<ShopBundle>): Promise<boolean> {
  try {
    await pb.collection('shop_bundles').update(id, {
      name: data.name,
      description: data.description,
      products: data.products,
      bundle_price: data.bundle_price,
      original_price: data.original_price,
      stock_quantity: data.stock_quantity,
      is_active: data.is_active,
      start_date: data.start_date,
      end_date: data.end_date,
      image: data.image,
    })
    return true
  } catch (error) {
    console.error('Error updating bundle:', error)
    return false
  }
}

export async function deleteBundle(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_bundles').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting bundle:', error)
    return false
  }
}

export async function createCategory(data: Partial<ShopCategory>): Promise<string | null> {
  try {
    const record = await pb.collection('shop_categories').create({
      name: data.name || 'Nowa kategoria',
      slug: data.slug || `category-${Date.now()}`,
      description: data.description || '',
      icon: data.icon || '',
      order_index: data.order_index || 0,
    })
    return record.id
  } catch (error) {
    console.error('Error creating category:', error)
    return null
  }
}

export async function updateCategory(id: string, data: Partial<ShopCategory>): Promise<boolean> {
  try {
    await pb.collection('shop_categories').update(id, {
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      order_index: data.order_index,
    })
    return true
  } catch (error) {
    console.error('Error updating category:', error)
    return false
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_categories').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting category:', error)
    return false
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  try {
    await pb.collection('shop_orders').update(id, { status })
    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_orders').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}

export async function approveReview(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_reviews').update(id, { is_approved: true })
    return true
  } catch (error) {
    console.error('Error approving review:', error)
    return false
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    await pb.collection('shop_reviews').delete(id)
    return true
  } catch (error) {
    console.error('Error deleting review:', error)
    return false
  }
}
