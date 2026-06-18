import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import {
  menuCategoriesAPI,
  menuProductsAPI,
  tablesAPI,
  ordersAPI,
  restaurantSettingsAPI,
  getMenuStats,
  getTableStats,
} from './api'
import type {
  MenuCategoryFormData,
  MenuProductFormData,
  RestaurantTableFormData,
  RestaurantOrderFormData,
  RestaurantOrderItemFormData,
  RestaurantSettingsFormData,
  MenuProductFilters,
} from './types'

// ============================================================================
// WEBSITE ID
// ============================================================================
export function useWebsiteId() {
  return useQuery({
    queryKey: ['websiteId'],
    queryFn: () => TENANT_ID,
    staleTime: 1000 * 60 * 60,
  })
}

// ============================================================================
// CATEGORÍAS
// ============================================================================
export function useMenuCategories(websiteId: string) {
  return useQuery({
    queryKey: ['menuCategories', websiteId],
    queryFn: () => menuCategoriesAPI.getCategories(websiteId),
    enabled: !!websiteId,
  })
}

export function useMenuCategory(id: string) {
  return useQuery({
    queryKey: ['menuCategory', id],
    queryFn: () => menuCategoriesAPI.getCategory(id),
    enabled: !!id,
  })
}

export function useCreateMenuCategory(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MenuCategoryFormData) => menuCategoriesAPI.createCategory(websiteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuCategories', websiteId] }),
  })
}

export function useUpdateMenuCategory(id: string, websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<MenuCategoryFormData>) => menuCategoriesAPI.updateCategory(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menuCategory', id] })
      qc.invalidateQueries({ queryKey: ['menuCategories', websiteId] })
    },
  })
}

export function useDeleteMenuCategory(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuCategoriesAPI.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuCategories', websiteId] }),
  })
}

// ============================================================================
// PRODUCTOS
// ============================================================================
export function useMenuProducts(websiteId: string, filters?: MenuProductFilters) {
  return useQuery({
    queryKey: ['menuProducts', websiteId, filters],
    queryFn: () => menuProductsAPI.getProducts(websiteId, filters),
    enabled: !!websiteId,
  })
}

export function useMenuProduct(id: string) {
  return useQuery({
    queryKey: ['menuProduct', id],
    queryFn: () => menuProductsAPI.getProduct(id),
    enabled: !!id,
  })
}

export function useCreateMenuProduct(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MenuProductFormData) => menuProductsAPI.createProduct(websiteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuProducts', websiteId] }),
  })
}

export function useUpdateMenuProduct(id: string, websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<MenuProductFormData>) => menuProductsAPI.updateProduct(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menuProduct', id] })
      qc.invalidateQueries({ queryKey: ['menuProducts', websiteId] })
    },
  })
}

export function useDeleteMenuProduct(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuProductsAPI.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuProducts', websiteId] }),
  })
}

// ============================================================================
// MESAS
// ============================================================================
export function useTables(websiteId: string) {
  return useQuery({
    queryKey: ['tables', websiteId],
    queryFn: () => tablesAPI.getTables(websiteId),
    enabled: !!websiteId,
  })
}

export function useTable(id: string) {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => tablesAPI.getTable(id),
    enabled: !!id,
  })
}

export function useCreateTable(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RestaurantTableFormData) => tablesAPI.createTable(websiteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables', websiteId] }),
  })
}

export function useUpdateTable(id: string, websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<RestaurantTableFormData>) => tablesAPI.updateTable(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table', id] })
      qc.invalidateQueries({ queryKey: ['tables', websiteId] })
    },
  })
}

export function useDeleteTable(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tablesAPI.deleteTable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables', websiteId] }),
  })
}

// ============================================================================
// PEDIDOS
// ============================================================================
export function useOrders(websiteId: string, status?: string) {
  return useQuery({
    queryKey: ['orders', websiteId, status],
    queryFn: () => ordersAPI.getOrders(websiteId, status),
    enabled: !!websiteId,
  })
}

export function useActiveOrders(websiteId: string) {
  return useQuery({
    queryKey: ['activeOrders', websiteId],
    queryFn: () => ordersAPI.getActiveOrders(websiteId),
    enabled: !!websiteId,
    refetchInterval: 10000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getOrder(id),
    enabled: !!id,
    refetchInterval: 5000,
  })
}

export function useCreateOrder(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ data, items }: { data: RestaurantOrderFormData; items: RestaurantOrderItemFormData[] }) =>
      ordersAPI.createOrder(websiteId, data, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', websiteId] })
      qc.invalidateQueries({ queryKey: ['activeOrders', websiteId] })
    },
  })
}

export function useUpdateOrderStatus(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', websiteId] })
      qc.invalidateQueries({ queryKey: ['activeOrders', websiteId] })
    },
  })
}

export function useUpdateItemStatus(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) =>
      ordersAPI.updateItemStatus(itemId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activeOrders', websiteId] }),
  })
}

export function useDeleteOrder(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordersAPI.deleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', websiteId] })
      qc.invalidateQueries({ queryKey: ['activeOrders', websiteId] })
    },
  })
}

export function useOrderStats(websiteId: string) {
  return useQuery({
    queryKey: ['orderStats', websiteId],
    queryFn: () => ordersAPI.getStats(websiteId),
    enabled: !!websiteId,
    refetchInterval: 30000,
  })
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
export function useRestaurantSettings(websiteId: string) {
  return useQuery({
    queryKey: ['restaurantSettings', websiteId],
    queryFn: () => restaurantSettingsAPI.getSettings(websiteId),
    enabled: !!websiteId,
  })
}

export function useUpdateRestaurantSettings(id: string, websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<RestaurantSettingsFormData>) =>
      restaurantSettingsAPI.updateSettings(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurantSettings', websiteId] })
    },
  })
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================
export function useMenuStats(websiteId: string) {
  return useQuery({
    queryKey: ['menuStats', websiteId],
    queryFn: () => getMenuStats(websiteId),
    enabled: !!websiteId,
  })
}

export function useTableStats(websiteId: string) {
  return useQuery({
    queryKey: ['tableStats', websiteId],
    queryFn: () => getTableStats(websiteId),
    enabled: !!websiteId,
  })
}