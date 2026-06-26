// ============================================================================
// TIPOS PARA EL SISTEMA DE MENÚ - SEOgrow
// ============================================================================ 

// Re-exportar tipos de restaurant para compatibilidad
export type { MenuStats } from '../restaurant/types'
export * from '../restaurant/types'

// Alérgenos predefinidos (para UI)
export const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾', color: 'amber' },
  { id: 'dairy', label: 'Nabiał', icon: '🥛', color: 'blue' },
  { id: 'eggs', label: 'Jajka', icon: '🥚', color: 'yellow' },
  { id: 'nuts', label: 'Orzechy', icon: '🌰', color: 'orange' },
  { id: 'peanuts', label: 'Orzeszki ziemne', icon: '🥜', color: 'orange' },     
  { id: 'soy', label: 'Soja', icon: '🫘', color: 'green' },
  { id: 'fish', label: 'Ryby', icon: '🐟', color: 'blue' },
  { id: 'seafood', label: 'Skorupiaki', icon: '🦐', color: 'red' },
  { id: 'shellfish', label: 'Mięczaki', icon: '🦑', color: 'purple' },
  { id: 'celery', label: 'Seler', icon: '🥬', color: 'green' },
  { id: 'mustard', label: 'Gorczyca', icon: '🟡', color: 'yellow' },
  { id: 'sesame', label: 'Sezam', icon: '⚪', color: 'gray' },
  { id: 'lupin', label: 'Lubina', icon: '🟣', color: 'purple' },
  { id: 'molluscs', label: 'Mięczaki', icon: '🐚', color: 'gray' },
] as const

export type AllergenId = typeof ALLERGEN_OPTIONS[number]['id']

// ============================================================================ 
// UTILIDADES DE VALIDACIÓN
// ============================================================================ 

export function hasAnyDetailField(payload: any): boolean {
  if (!payload) return false
  return !!(
    payload.extended_description ||
    (payload.ingredients && payload.ingredients.length > 0) ||
    (payload.allergens && payload.allergens.length > 0) ||
    payload.spice_level ||
    payload.prep_time_minutes ||
    payload.chef_note ||
    payload.pairing_suggestion ||
    (payload.gallery_images && payload.gallery_images.length > 0)
  )
}

export function sanitizeDetailsPayload(payload: any): any {
  if (!payload) return undefined

  return {
    extended_description: payload.extended_description?.trim() || undefined,    
    ingredients: payload.ingredients?.filter((i: string) => i && i.trim()).map((i: string) => i.trim()) || undefined,
    allergens: payload.allergens || undefined,
    spice_level: payload.spice_level || undefined,
    prep_time_minutes: payload.prep_time_minutes || undefined,
    chef_note: payload.chef_note?.trim() || undefined,
    pairing_suggestion: payload.pairing_suggestion?.trim() || undefined,        
    gallery_images: payload.gallery_images?.filter((img: string) => img) || undefined,
  }
}

// ============================================================================ 
// EXPORTACIÓN/IMPORTACIÓN
// ============================================================================ 

export interface MenuExport {
  version: string
  exported_at: string
  categories: any[]
  products: any[]
}

export function exportMenuToJSON(categories: any[], products: any[]): string {  
  const exportData: MenuExport = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    categories,
    products,
  }
  return JSON.stringify(exportData, null, 2)
}

export function parseMenuFromJSON(jsonString: string): MenuExport | null {      
  try {
    const data = JSON.parse(jsonString)
    if (data.version && data.categories && data.products) {
      return data as MenuExport
    }
    return null
  } catch {
    return null
  }
}

// ============================================================================ 
// FILTROS (mantener para compatibilidad)
// ============================================================================ 

export interface MenuCategoryFilters {
  is_active?: boolean
  is_featured?: boolean
  search?: string
}

export interface MenuProductFilters {
  category_id?: string
  is_available?: boolean
  is_featured?: boolean
  min_price?: number
  max_price?: number
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  search?: string
}

// ============================================================================ 
// IMÁGENES DE PRODUCTOS
// ============================================================================ 

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

export interface MenuProductImageFormData {
  url: string
  alt_text?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  sort_order?: number
  is_primary?: boolean
}

// ============================================================================ 
// EXTRAS/ADICIONALES
// ============================================================================ 

export interface MenuProductAddon {
  id: string
  website_id: string
  name: string
  description?: string
  price: number
  is_available: boolean
  max_quantity: number
  created_at: string
  updated_at: string
}

export interface MenuProductAddonFormData {
  name: string
  description?: string
  price: number
  is_available?: boolean
  max_quantity?: number
}

export interface MenuProductAddonLink {
  id: string
  product_id: string
  addon_id: string
  custom_price?: number
  is_required: boolean
  addon?: MenuProductAddon
}

// ============================================================================ 
// OPCIONES/VARIANTES
// ============================================================================ 

export interface MenuProductOption {
  id: string
  product_id: string
  option_name: string
  option_value: string
  price_adjustment: number
  sort_order: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface MenuProductOptionFormData {
  option_name: string
  option_value: string
  price_adjustment?: number
  sort_order?: number
  is_available?: boolean
}

// ============================================================================ 
// VISTA COMPLETA DEL MENÚ
// ============================================================================ 

export interface MenuFullView {
  category_id: string
  category_name: string
  category_description?: string
  products: any[]
}