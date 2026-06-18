import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  menuCategoriesAPI, 
  menuProductsAPI, 
  menuProductImagesAPI,
  getWebsiteId,
  getMenuStats
} from './api'
import type {
  MenuCategoryFormData,
  MenuProductFormData,
  MenuProductImageFormData,
  MenuCategoryFilters,
  MenuProductFilters,
} from './types'

// ============================================================================
// WEBSITE ID
// ============================================================================

export function useWebsiteId() {
  return useQuery({
    queryKey: ['websiteId'],
    queryFn: () => getWebsiteId(),
    staleTime: 1000 * 60 * 60,
  })
}

// ============================================================================
// HOOKS DE CATEGORÍAS
// ============================================================================

export function useMenuCategories(websiteId: string, filters?: MenuCategoryFilters) {
  return useQuery({
    queryKey: ['menuCategories', websiteId, filters],
    queryFn: () => menuCategoriesAPI.getCategories(websiteId, filters),
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
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MenuCategoryFormData) => menuCategoriesAPI.createCategory(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuCategories', websiteId] })
    },
  })
}

export function useUpdateMenuCategory(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updates: Partial<MenuCategoryFormData>) => menuCategoriesAPI.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuCategory', id] })
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
    },
  })
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => menuCategoriesAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] })
    },
  })
}

export function useReorderMenuCategories(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderedIds: string[]) => menuCategoriesAPI.reorderCategories(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuCategories', websiteId] })
    },
  })
}

// ============================================================================
// HOOKS DE PRODUCTOS
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
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MenuProductFormData) => menuProductsAPI.createProduct(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProducts', websiteId] })
    },
  })
}

export function useUpdateMenuProduct(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updates: Partial<MenuProductFormData>) => menuProductsAPI.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProduct', id] })
      queryClient.invalidateQueries({ queryKey: ['menuProducts'] })
    },
  })
}

export function useDeleteMenuProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => menuProductsAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProducts'] })
    },
  })
}

export function useReorderMenuProducts(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderedIds: string[]) => menuProductsAPI.reorderProducts(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProducts', websiteId] })
    },
  })
}

// ============================================================================
// HOOKS DE IMÁGENES
// ============================================================================

export function useMenuProductImages(productId: string) {
  return useQuery({
    queryKey: ['menuProductImages', productId],
    queryFn: () => menuProductImagesAPI.getImages(productId),
    enabled: !!productId,
  })
}

export function useUploadMenuImage(productId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ file, data }: { file: File; data?: MenuProductImageFormData }) => {
      const uploadResult = await menuProductImagesAPI.uploadImage(productId, file)
      const imageData = await menuProductImagesAPI.createImage(productId, {
        ...data,
        url: uploadResult.url,
        file_path: uploadResult.path,
        mime_type: file.type,
        file_size: file.size,
      })
      return imageData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProductImages', productId] })
      queryClient.invalidateQueries({ queryKey: ['menuProduct', productId] })
    },
  })
}

export function useDeleteMenuImage(productId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (imageId: string) => menuProductImagesAPI.deleteImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuProductImages', productId] })
      queryClient.invalidateQueries({ queryKey: ['menuProduct', productId] })
    },
  })
}

// ============================================================================
// STATS
// ============================================================================

export function useMenuStats(websiteId: string) {
  return useQuery({
    queryKey: ['menuStats', websiteId],
    queryFn: () => getMenuStats(websiteId),
    enabled: !!websiteId,
  })
}
