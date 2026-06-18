import { pb, TENANT_ID } from '@/lib/pocketbase'
import type {
  MenuCategory,
  MenuCategoryFormData,
  MenuProduct,
  MenuProductFormData,
  MenuProductFilters,
  RestaurantTable,
  RestaurantTableFormData,
  RestaurantOrder,
  RestaurantOrderFormData,
  RestaurantOrderItem,
  RestaurantOrderItemFormData,
  RestaurantOrderStats,
  RestaurantSettings,
  RestaurantSettingsFormData,
  MenuStats,
  TableStats,
} from './types'

function getWebsiteId(): string {
  return TENANT_ID
}

function escapeFilter(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// ============================================================================
// CATEGORÍAS
// ============================================================================
export class MenuCategoriesAPI {
  async getCategories(websiteId: string, activeOnly = true): Promise<MenuCategory[]> {
    const filter = `website_id = "${escapeFilter(websiteId)}"${activeOnly ? ' && is_active = true' : ''}`
    const records = await pb.collection('menu_categories').getFullList({
      filter,
      sort: 'sort_order',
      requestKey: null,
    })
    return records as unknown as MenuCategory[]
  }

  async getCategory(id: string): Promise<MenuCategory | null> {
    try {
      const record = await pb.collection('menu_categories').getOne(id)
      return record as unknown as MenuCategory
    } catch { return null }
  }

  async createCategory(websiteId: string, data: MenuCategoryFormData): Promise<MenuCategory> {
    const record = await pb.collection('menu_categories').create({
      website_id: websiteId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      image_url: data.image_url || '',
      sort_order: data.sort_order || 0,
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
    })
    return record as unknown as MenuCategory
  }

  async updateCategory(id: string, updates: Partial<MenuCategoryFormData>): Promise<MenuCategory> {
    const record = await pb.collection('menu_categories').update(id, updates)
    return record as unknown as MenuCategory
  }

  async deleteCategory(id: string): Promise<void> {
    await pb.collection('menu_categories').delete(id)
  }

  async reorderCategories(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await pb.collection('menu_categories').update(orderedIds[i], { sort_order: i })
    }
  }
}

// ============================================================================
// PRODUCTOS
// ============================================================================
export class MenuProductsAPI {
  async getProducts(websiteId: string, filters?: MenuProductFilters): Promise<MenuProduct[]> {
    const filterParts: string[] = [`website_id = "${escapeFilter(websiteId)}"`]
    
    if (filters?.category_id) filterParts.push(`category_id = "${filters.category_id}"`)
    if (filters?.is_available !== undefined) filterParts.push(`is_available = ${filters.is_available}`)
    if (filters?.is_featured !== undefined) filterParts.push(`is_featured = ${filters.is_featured}`)
    if (filters?.search) filterParts.push(`(name ~ "${filters.search}" || description ~ "${filters.search}")`)
    if (filters?.is_vegetarian) filterParts.push(`is_vegetarian = true`)
    if (filters?.is_vegan) filterParts.push(`is_vegan = true`)
    if (filters?.is_gluten_free) filterParts.push(`is_gluten_free = true`)

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
    } catch { return null }
  }

  async createProduct(websiteId: string, data: MenuProductFormData): Promise<MenuProduct> {
    const record = await pb.collection('menu_products').create({
      website_id: websiteId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      short_description: data.short_description || '',
      category_id: data.category_id || null,
      price: data.price || 0,
      compare_price: data.compare_price || null,
      currency: data.currency || 'PLN',
      ingredients: data.ingredients || '',
      allergens: data.allergens || '',
      track_inventory: data.track_inventory ?? false,
      inventory_quantity: data.inventory_quantity || 0,
      is_available: data.is_available ?? true,
      is_featured: data.is_featured ?? false,
      is_vegetarian: data.is_vegetarian ?? false,
      is_vegan: data.is_vegan ?? false,
      is_gluten_free: data.is_gluten_free ?? false,
      is_spicy: data.is_spicy ?? false,
      spice_level: data.spice_level || 0,
      prep_time_minutes: data.prep_time_minutes || null,
      sort_order: data.sort_order || 0,
      image_url: data.image_url || '',
    })
    return record as unknown as MenuProduct
  }

  async updateProduct(id: string, updates: Partial<MenuProductFormData>): Promise<MenuProduct> {
    const record = await pb.collection('menu_products').update(id, updates)
    return record as unknown as MenuProduct
  }

  async deleteProduct(id: string): Promise<void> {
    await pb.collection('menu_products').delete(id)
  }
}

// ============================================================================
// MESAS
// ============================================================================
export class TablesAPI {
  async getTables(websiteId: string, activeOnly = true): Promise<RestaurantTable[]> {
    const filter = `website_id = "${escapeFilter(websiteId)}"${activeOnly ? ' && is_active = true' : ''}`
    const records = await pb.collection('restaurant_tables').getFullList({
      filter,
      sort: 'number',
      requestKey: null,
    })
    return records as unknown as RestaurantTable[]
  }

  async getTable(id: string): Promise<RestaurantTable | null> {
    try {
      const record = await pb.collection('restaurant_tables').getOne(id)
      return record as unknown as RestaurantTable
    } catch { return null }
  }

  async createTable(websiteId: string, data: RestaurantTableFormData): Promise<RestaurantTable> {
    const record = await pb.collection('restaurant_tables').create({
      website_id: websiteId,
      number: data.number,
      capacity: data.capacity || 4,
      position_x: data.position_x || 0,
      position_y: data.position_y || 0,
      is_active: data.is_active ?? true,
      notes: data.notes || '',
    })
    return record as unknown as RestaurantTable
  }

  async updateTable(id: string, updates: Partial<RestaurantTableFormData>): Promise<RestaurantTable> {
    const record = await pb.collection('restaurant_tables').update(id, updates)
    return record as unknown as RestaurantTable
  }

  async deleteTable(id: string): Promise<void> {
    await pb.collection('restaurant_tables').delete(id)
  }
}

// ============================================================================
// PEDIDOS
// ============================================================================
export class OrdersAPI {
  async getOrders(websiteId: string, status?: string): Promise<RestaurantOrder[]> {
    let filter = `website_id = "${escapeFilter(websiteId)}"`
    if (status) filter += ` && status = "${status}"`
    
    const records = await pb.collection('restaurant_orders').getFullList({
      filter,
      sort: '-created',
      requestKey: null,
    })
    return records as unknown as RestaurantOrder[]
  }

  async getActiveOrders(websiteId: string): Promise<RestaurantOrder[]> {        
    const records = await pb.collection('restaurant_orders').getFullList({      
      filter: `website_id = "${escapeFilter(websiteId)}" && (status = "pending" || status = "confirmed" || status = "preparing" || status = "ready")`,
      sort: '-created',
      requestKey: null,
    })
    return records as unknown as RestaurantOrder[]
  }

  async getOrder(id: string): Promise<RestaurantOrder | null> {
    try {
      const record = await pb.collection('restaurant_orders').getOne(id)
      const items = await pb.collection('restaurant_order_items').getFullList({
        filter: `order_id = "${id}"`,
        sort: 'created',
        requestKey: null,
      })
      return { ...record as any, items: items as unknown as RestaurantOrderItem[] }
    } catch { return null }
  }

  async getOrderItems(orderId: string): Promise<RestaurantOrderItem[]> {
    const records = await pb.collection('restaurant_order_items').getFullList({
      filter: `order_id = "${orderId}"`,
      sort: 'created',
      requestKey: null,
    })
    return records as unknown as RestaurantOrderItem[]
  }

  async createOrder(websiteId: string, data: RestaurantOrderFormData, items: RestaurantOrderItemFormData[]): Promise<RestaurantOrder> {
    const subtotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
    
    const order = await pb.collection('restaurant_orders').create({
      website_id: websiteId,
      table_id: data.table_id || null,
      table_number: data.table_number || '',
      customer_name: data.customer_name || '',
      customer_phone: data.customer_phone || '',
      status: 'pending',
      payment_status: 'pending',
      subtotal,
      tax_amount: 0,
      total_amount: subtotal,
      notes: data.notes || '',
      source: 'menu',
    })

    for (const item of items) {
      await pb.collection('restaurant_order_items').create({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.product_price * item.quantity,
        notes: item.notes || '',
        status: 'pending',
      })
    }

    return this.getOrder(order.id) as Promise<RestaurantOrder>
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await pb.collection('restaurant_orders').update(id, { status })
  }

  async updateItemStatus(itemId: string, status: string): Promise<void> {
    await pb.collection('restaurant_order_items').update(itemId, { status })
  }

  async deleteOrder(id: string): Promise<void> {
    await pb.collection('restaurant_orders').delete(id)
  }

  async getStats(websiteId: string): Promise<RestaurantOrderStats> {
    const today = new Date().toISOString().split('T')[0]
    
    const orders = await pb.collection('restaurant_orders').getFullList({
      filter: `website_id = "${escapeFilter(websiteId)}"`,
      fields: 'id,status,total_amount,created',
      requestKey: null,
    }) as unknown as Array<{ status: string; total_amount: number; created: string }>

    const todayOrders = orders.filter(o => o.created.startsWith(today))
    const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))

    return {
      total_orders: orders.length,
      pending_orders: pendingOrders.length,
      today_orders: todayOrders.length,
      today_revenue: todayOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_amount, 0),
      average_order_value: orders.length > 0 ? orders.reduce((s, o) => s + o.total_amount, 0) / orders.length : 0,
    }
  }
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
export class RestaurantSettingsAPI {
  async getSettings(websiteId: string): Promise<RestaurantSettings | null> {
    try {
      const records = await pb.collection('restaurant_settings').getFullList({
        filter: `website_id = "${escapeFilter(websiteId)}"`,
        requestKey: null,
      })
      if (records.length > 0) return records[0] as unknown as RestaurantSettings
    } catch {}
    
    const record = await pb.collection('restaurant_settings').create({
      website_id: websiteId,
      currency: 'PLN',
      tax_rate: 0,
      is_active: true,
      settings: {},
    })
    return record as unknown as RestaurantSettings
  }

  async updateSettings(id: string, updates: Partial<RestaurantSettingsFormData>): Promise<RestaurantSettings> {
    const record = await pb.collection('restaurant_settings').update(id, updates)
    return record as unknown as RestaurantSettings
  }
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================
export async function getMenuStats(websiteId: string): Promise<MenuStats> {
  const [categories, products] = await Promise.all([
    pb.collection('menu_categories').getFullList({
      filter: `website_id = "${escapeFilter(websiteId)}" && is_active = true`,
      fields: 'id',
      requestKey: null,
    }),
    pb.collection('menu_products').getFullList({
      filter: `website_id = "${escapeFilter(websiteId)}"`,
      fields: 'id,is_available,is_featured',
      requestKey: null,
    }),
  ])

  const prods = products as unknown as Array<{ is_available: boolean; is_featured: boolean }>

  return {
    total_categories: categories.length,
    total_products: products.length,
    available_products: prods.filter(p => p.is_available).length,
    featured_products: prods.filter(p => p.is_featured).length,
  }
}

export async function getTableStats(websiteId: string): Promise<TableStats> {
  const tables = await pb.collection('restaurant_tables').getFullList({
    filter: `website_id = "${escapeFilter(websiteId)}"`,
    fields: 'id',
    requestKey: null,
  })

  return {
    total_tables: tables.length,
    occupied_tables: 0,
    available_tables: tables.length,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const menuCategoriesAPI = new MenuCategoriesAPI()
export const menuProductsAPI = new MenuProductsAPI()
export const tablesAPI = new TablesAPI()
export const ordersAPI = new OrdersAPI()
export const restaurantSettingsAPI = new RestaurantSettingsAPI()

export const restaurantApi = {
  categories: menuCategoriesAPI,
  products: menuProductsAPI,
  tables: tablesAPI,
  orders: ordersAPI,
  settings: restaurantSettingsAPI,
  getWebsiteId,
  getMenuStats,
  getTableStats,
}
