// ============================================================================
// TIPOS PARA EL SISTEMA RESTAURANTE COMPLETO - SEOgrow
// ============================================================================ 

// Re-exportar tipos de menu para compatibilidad
export * from '../menu/types'

// ---------------------------------------------------------------------------- 
// CATEGORÍAS
// ---------------------------------------------------------------------------- 
export interface MenuCategory {
  id: string
  website_id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  translations?: CategoryTranslation[]
}

export interface CategoryTranslation {
  id: string
  category_id: string
  language: string
  name?: string
  description?: string
}

export interface MenuCategoryFormData {
  name: string
  slug?: string
  description?: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
  is_featured?: boolean
}

// ---------------------------------------------------------------------------- 
// IMÁGENES DE PRODUCTOS
// ---------------------------------------------------------------------------- 
export interface MenuProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  sort_order: number
  is_primary: boolean
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------- 
// PRODUCTOS
// ---------------------------------------------------------------------------- 
export interface MenuProduct {
  id: string
  website_id: string
  category_id?: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_price?: number
  currency: string
  ingredients?: string
  allergens?: string
  track_inventory: boolean
  inventory_quantity: number
  allow_backorders: boolean
  is_available: boolean
  is_featured: boolean
  is_recommended: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_spicy: boolean
  spice_level: number
  prep_time_minutes?: number
  sort_order: number
  image_url?: string
  created_at: string
  updated_at: string
  translations?: ProductTranslation[]
  category?: MenuCategory

  // Nutrientes
  calories?: number
  protein?: number
  carbs?: number
  fat?: number

  // Información detallada (para menú público)
  show_details?: boolean
  details_payload?: ProductDetailsPayload

  // Imágenes
  images?: MenuProductImage[]
  primary_image?: MenuProductImage
}

export interface ProductDetailsPayload {
  extended_description?: string
  ingredients?: string[]
  allergens?: string[]
  spice_level?: number
  prep_time_minutes?: number
  chef_note?: string
  pairing_suggestion?: string
  gallery_images?: string[]
}

export interface ProductTranslation {
  id: string
  product_id: string
  language: string
  name?: string
  description?: string
  short_description?: string
}

export interface MenuProductFormData {
  name: string
  slug?: string
  description?: string
  short_description?: string
  category_id?: string
  price: number
  compare_price?: number
  currency?: string
  ingredients?: string
  allergens?: string
  track_inventory?: boolean
  inventory_quantity?: number
  is_available?: boolean
  is_featured?: boolean
  is_recommended?: boolean
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  is_spicy?: boolean
  spice_level?: number
  prep_time_minutes?: number
  sort_order?: number
  image_url?: string

  // Nutrientes
  calories?: number
  protein?: number
  carbs?: number
  fat?: number

  // Toggle información detallada
  show_details?: boolean
  details_payload?: ProductDetailsPayload
}

// ---------------------------------------------------------------------------- 
// MESAS
// ---------------------------------------------------------------------------- 
export interface RestaurantTable {
  id: string
  website_id: string
  number: string
  qr_code_url?: string
  capacity: number
  position_x: number
  position_y: number
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
  active_order_count?: number
}

export interface RestaurantTableFormData {
  number: string
  capacity?: number
  position_x?: number
  position_y?: number
  is_active?: boolean
  notes?: string
}

// ---------------------------------------------------------------------------- 
// PEDIDOS
// ---------------------------------------------------------------------------- 
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface RestaurantOrder {
  id: string
  website_id: string
  table_id?: string
  table_number?: string
  customer_name?: string
  customer_phone?: string
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  source: string
  created_at: string
  updated_at: string
  items?: RestaurantOrderItem[]
  table?: RestaurantTable
}

export interface RestaurantOrderFormData {
  table_id?: string
  table_number?: string
  customer_name?: string
  customer_phone?: string
  notes?: string
}

export interface RestaurantOrderStats {
  total_orders: number
  pending_orders: number
  today_orders: number
  today_revenue: number
  average_order_value: number
}

// ---------------------------------------------------------------------------- 
// DETALLE DE PEDIDOS
// ---------------------------------------------------------------------------- 
export type ItemStatus = 'pending' | 'preparing' | 'ready' | 'delivered'        

export interface RestaurantOrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  notes?: string
  status: ItemStatus
  created_at: string
  updated_at: string
}

export interface RestaurantOrderItemFormData {
  product_id?: string
  product_name: string
  product_price: number
  quantity: number
  notes?: string
}

// ---------------------------------------------------------------------------- 
// CONFIGURACIÓN
// ---------------------------------------------------------------------------- 
export interface RestaurantSettings {
  id: string
  website_id: string
  restaurant_name?: string
  currency: string
  tax_rate: number
  is_active: boolean
  settings: Record<string, any>
}

export interface RestaurantSettingsFormData {
  restaurant_name?: string
  currency?: string
  tax_rate?: number
  is_active?: boolean
  settings?: Record<string, any>
}

// ---------------------------------------------------------------------------- 
// ESTADÍSTICAS
// ---------------------------------------------------------------------------- 
export interface MenuStats {
  total_categories: number
  total_products: number
  available_products: number
  featured_products: number
  average_price?: number
  total_images?: number
}

export interface TableStats {
  total_tables: number
  occupied_tables: number
  available_tables: number
}

// ---------------------------------------------------------------------------- 
// FILTROS
// ---------------------------------------------------------------------------- 
export interface MenuProductFilters {
  category_id?: string
  is_available?: boolean
  is_featured?: boolean
  search?: string
  min_price?: number
  max_price?: number
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
}

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[]
  table_id?: string
  date_from?: string
  date_to?: string
}

export interface TableFilters {
  is_active?: boolean
}