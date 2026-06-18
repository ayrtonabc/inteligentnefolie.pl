import { pb, getTenantFilter } from '@/lib/pocketbase'

export interface ShopProduct {
  id: string
  name: string
  slug: string
  short_description: string | null
  description: string
  price: number
  compare_at_price: number | null
  cost_per_item: number | null
  sku: string
  stock_quantity: number | null
  is_published: boolean
  is_featured: boolean
  is_track_inventory: boolean
  category: string | null
  category_name: string | null
  tags: string[]
  images: string | string[]
  weight: number | null
  weight_unit: string
  SeoTitle: string
  SeoDescription: string
  created: string
  updated: string
  discount_type: 'none' | 'percentage' | 'fixed' | 'buy_x_get_y' | 'bulk'
  discount_value: number | null
  discount_start: string | null
  discount_end: string | null
  buy_x_quantity: number | null
  get_y_quantity: number | null
  get_y_product_id: string | null
  bulk_tiers: BulkTier[]
  free_shipping_on_product: boolean
}

export interface BulkTier {
  min_quantity: number
  discount_percentage: number
}

export interface ShopCoupon {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed' | 'free_shipping'
  discount_value: number | null
  min_order_value: number | null
  max_uses: number | null
  current_uses: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  applicable_products: string[]
  applicable_categories: string[]
  first_time_only: boolean
  created: string
}

export interface ShopFlashSale {
  id: string
  name: string
  products: string[]
  categories: string[]
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  start_date: string
  end_date: string
  is_active: boolean
  banner_image: string | null
  message: string
}

export interface ShopBundle {
  id: string
  name: string
  description: string
  products: { product_id: string; quantity: number }[]
  bundle_price: number
  original_price: number
  stock_quantity: number | null
  is_active: boolean
  start_date: string | null
  end_date: string | null
  image: string | null
}

export interface ShopCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  order_index: number
}

export interface ShopOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  notes: string
  items: ShopOrderItem[]
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  currency: 'PLN' | 'EUR' | 'USD'
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'card' | 'transfer' | 'blik' | 'paypal'
  tpay_transaction_id: string
  created: string
  updated: string
}

export interface ShopOrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  image?: string
}

export interface ShopReview {
  id: string
  product: string
  product_name: string
  author_name: string
  author_email: string
  rating: number
  title: string
  comment: string
  is_approved: boolean
  created: string
}

export interface ShopCartItem {
  id: string
  product: ShopProduct
  quantity: number
}

export interface ShopCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  accepts_marketing: boolean
  addresses: ShopCustomerAddress[]
  total_orders: number
  total_spent: number
  notes: string
  tags: string[]
  created: string
  updated: string
}

export interface ShopCustomerAddress {
  type: 'shipping' | 'billing'
  company: string
  address1: string
  address2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
}

export interface ShopSettings {
  id: string
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
  currency: string
  weight_unit: string
  dimension_unit: string
  stripe_enabled: boolean
  stripe_public_key: string
  stripe_secret_key: string
  stripe_webhook_secret: string
  tpay_enabled: boolean
  tpay_client_id: string
  tpay_secret_key: string
  paypal_enabled: boolean
  paypal_client_id: string
  paypal_secret_key: string
  blik_enabled: boolean
  transfer_enabled: boolean
  tax_included_in_prices: boolean
  tax_rate: number
  free_shipping_threshold: number
  inpost_enabled: boolean
  inpost_api_key: string
  inpost_organization_id: string
  inpost_api_url: string
  inpost_price: number
  courier_enabled: boolean
  courier_price: number
  pickup_enabled: boolean
  pickup_label: string
  created: string
  updated: string
}

export interface ShopStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageRating: number
  pendingOrders: number
  lowStockProducts: number
}

export const DEFAULT_PRODUCT_IMAGE = '/placeholder.png'

export function formatPrice(price: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price / 100)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Oczekuje',
    processing: 'W realizacji',
    shipped: 'Wysłane',
    delivered: 'Dostarczone',
    cancelled: 'Anulowane',
    refunded: 'Zwrócone',
    paid: 'Opłacone',
    failed: 'Niepowodzenie',
  }
  return labels[status] || status
}

export async function getProducts(): Promise<ShopProduct[]> {
  try {
    const records = await pb.collection('shop_products').getList(1, 500, { filter: getTenantFilter() })
    return records.items.map(formatProduct)
  } catch {
    try {
      const records = await pb.collection('shop_products').getList(1, 500, {})
      return records.items.map(formatProduct)
    } catch { return [] }
  }
}

export async function getProduct(id: string): Promise<ShopProduct | null> {
  try {
    const record = await pb.collection('shop_products').getOne(id)
    return formatProduct(record)
  } catch { return null }
}

export async function getCategories(): Promise<ShopCategory[]> {
  try {
    const records = await pb.collection('shop_categories').getList(1, 500, {})
    return records.items as unknown as ShopCategory[]
  } catch { return [] }
}

export async function getOrders(): Promise<ShopOrder[]> {
  try {
    const records = await pb.collection('shop_orders').getList(1, 500, { sort: '-created' })
    return records.items.map((r: any) => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items || '[]') : (r.items || []),
      currency: r.currency || 'PLN',
    })) as unknown as ShopOrder[]
  } catch { return [] }
}

export async function getReviews(productId?: string): Promise<ShopReview[]> {
  try {
    const records = await pb.collection('shop_reviews').getList(1, 500, { sort: '-created' })
    return records.items.map((r: any) => ({
      ...r,
      product_name: r.expand?.product?.name || '',
    })) as ShopReview[]
  } catch { return [] }
}

export async function getCustomers(): Promise<ShopCustomer[]> {
  try {
    const records = await pb.collection('shop_customers').getList(1, 500, { sort: '-created' })
    return records.items.map(formatCustomer)
  } catch { return [] }
}

export async function getCustomer(id: string): Promise<ShopCustomer | null> {
  try {
    const record = await pb.collection('shop_customers').getOne(id)
    return formatCustomer(record)
  } catch { return null }
}

export async function getCustomerOrders(customerEmail: string): Promise<ShopOrder[]> {
  try {
    const records = await pb.collection('shop_orders').getList(1, 500, {
      filter: `customer_email = "${customerEmail}"`,
      sort: '-created',
    })
    return records.items as unknown as ShopOrder[]
  } catch { return [] }
}

export async function getSettings(): Promise<ShopSettings | null> {
  try {
    const records = await pb.collection('shop_settings').getList(1, 500, { sort: '-created' })
    if (records.items.length === 0) return null
    return formatSettings(records.items[0])
  } catch { return null }
}

export async function updateSettings(data: Partial<ShopSettings>): Promise<boolean> {
  try {
    const existing = await pb.collection('shop_settings').getList(1, 500, { sort: '-created' })
    if (existing.items.length > 0) {
      await pb.collection('shop_settings').update(existing.items[0].id, data)
    } else {
      await pb.collection('shop_settings').create(data)
    }
    return true
  } catch (error) {
    console.error('Error updating settings:', error)
    return false
  }
}

export async function getCoupons(): Promise<ShopCoupon[]> {
  try {
    const records = await pb.collection('shop_coupons').getList(1, 500, { sort: '-created' })
    return records.items as unknown as ShopCoupon[]
  } catch { return [] }
}

export async function getFlashSales(): Promise<ShopFlashSale[]> {
  try {
    const records = await pb.collection('shop_flash_sales').getList(1, 500, { sort: '-created' })
    return records.items as unknown as ShopFlashSale[]
  } catch { return [] }
}

export async function getBundles(): Promise<ShopBundle[]> {
  try {
    const records = await pb.collection('shop_bundles').getList(1, 500, { sort: '-created' })
    return records.items as unknown as ShopBundle[]
  } catch { return [] }
}

export async function getStats(): Promise<ShopStats> {
  try {
    const [products, orders, reviews] = await Promise.all([
      getProducts(),
      getOrders(),
      getReviews(),
    ])
    const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + o.total, 0)
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      averageRating: Math.round(avgRating * 10) / 10,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      lowStockProducts: products.filter(p => p.stock_quantity !== null && p.stock_quantity < 10).length,
    }
  } catch {
    return { totalProducts: 0, totalOrders: 0, totalRevenue: 0, averageRating: 0, pendingOrders: 0, lowStockProducts: 0 }
  }
}

function formatCustomer(record: any): ShopCustomer {
  return {
    id: record.id,
    email: record.email || '',
    first_name: record.first_name || '',
    last_name: record.last_name || '',
    phone: record.phone || '',
    accepts_marketing: record.accepts_marketing ?? false,
    addresses: record.addresses || [],
    total_orders: record.total_orders || 0,
    total_spent: record.total_spent || 0,
    notes: record.notes || '',
    tags: record.tags || [],
    created: record.created,
    updated: record.updated,
  }
}

function formatSettings(record: any): ShopSettings {
  return {
    id: record.id,
    store_name: record.store_name || 'Sklep',
    store_email: record.store_email || '',
    store_phone: record.store_phone || '',
    store_address: record.store_address || '',
    currency: record.currency || 'PLN',
    weight_unit: record.weight_unit || 'kg',
    dimension_unit: record.dimension_unit || 'cm',
    stripe_enabled: record.stripe_enabled ?? false,
    stripe_public_key: record.stripe_public_key || '',
    stripe_secret_key: record.stripe_secret_key || '',
    stripe_webhook_secret: record.stripe_webhook_secret || '',
    tpay_enabled: record.tpay_enabled ?? false,
    tpay_client_id: record.tpay_client_id || '',
    tpay_secret_key: record.tpay_secret_key || '',
    paypal_enabled: record.paypal_enabled ?? false,
    paypal_client_id: record.paypal_client_id || '',
    paypal_secret_key: record.paypal_secret_key || '',
    blik_enabled: record.blik_enabled ?? false,
    transfer_enabled: record.transfer_enabled ?? true,
    tax_included_in_prices: record.tax_included_in_prices ?? false,
    tax_rate: record.tax_rate || 23,
    free_shipping_threshold: record.free_shipping_threshold || 0,
    inpost_enabled: record.inpost_enabled ?? true,
    inpost_api_key: record.inpost_api_key || '',
    inpost_organization_id: record.inpost_organization_id || '',
    inpost_api_url: record.inpost_api_url || 'https://api-shipx-pl.easypack24.net',
    inpost_price: record.inpost_price || 16.99,
    courier_enabled: record.courier_enabled ?? true,
    courier_price: record.courier_price || 24.99,
    pickup_enabled: record.pickup_enabled ?? false,
    pickup_label: record.pickup_label || 'Odbiór osobisty',
    created: record.created,
    updated: record.updated,
  }
}

function formatProduct(record: any): ShopProduct {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    short_description: record.short_description || '',
    description: record.description || '',
    price: record.price || 0,
    compare_at_price: record.compare_at_price || null,
    cost_per_item: record.cost_per_item || null,
    sku: record.sku || '',
    stock_quantity: record.stock_quantity ?? null,
    is_published: record.is_published ?? true,
    is_featured: record.is_featured ?? false,
    is_track_inventory: record.is_track_inventory ?? true,
    category: record.category || record.category_name || null,
    category_name: record.category_name || record.category || '',
    tags: record.tags || [],
    images: (typeof record.images === 'string' && record.images)
      ? record.images.split(',').filter((u: string) => u)
      : (record.images?.length ? record.images : [DEFAULT_PRODUCT_IMAGE]),
    weight: record.weight || null,
    weight_unit: record.weight_unit || 'kg',
    seo_title: (record as any).SeoTitle || (record as any).seo_title || '',
    seo_description: (record as any).SeoDescription || (record as any).seo_description || '',
    created: record.created,
    updated: record.updated,
    discount_type: record.discount_type || 'none',
    discount_value: record.discount_value || null,
    discount_start: record.discount_start || null,
    discount_end: record.discount_end || null,
    buy_x_quantity: record.buy_x_quantity || null,
    get_y_quantity: record.get_y_quantity || null,
    get_y_product_id: record.get_y_product_id || null,
    bulk_tiers: record.bulk_tiers || [],
    free_shipping_on_product: record.free_shipping_on_product ?? false,
  } as unknown as ShopProduct
}

export function getDiscountBadge(product: ShopProduct): { label: string; color: string; isActive: boolean } | null {
  if (product.discount_type === 'none' || !product.discount_value) return null
  
  const now = new Date()
  if (product.discount_start && new Date(product.discount_start) > now) return null
  if (product.discount_end && new Date(product.discount_end) < now) return null

  const labels: Record<string, string> = {
    percentage: `-${product.discount_value}%`,
    fixed: `-${formatPrice(product.discount_value * 100)}`,
    buy_x_get_y: '2+1',
    bulk: 'Ilość ↓',
  }

  return {
    label: labels[product.discount_type] || `-${product.discount_value}%`,
    color: product.discount_type === 'percentage' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white',
    isActive: true,
  }
}

export function calculateDiscountedPrice(product: ShopProduct): number {
  const discount = getDiscountBadge(product)
  if (!discount || !product.discount_value) return product.price

  switch (product.discount_type) {
    case 'percentage':
      return Math.round(product.price * (1 - product.discount_value / 100))
    case 'fixed':
      return Math.max(0, product.price - (product.discount_value * 100))
    default:
      return product.price
  }
}
