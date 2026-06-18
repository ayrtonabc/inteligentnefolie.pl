import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SettingsAPI } from './api'
import { TENANT_ID } from '@/lib/pocketbase'
import type { WebsiteSettings, WebsiteSettingsFormData } from './types'
import { pb } from '@/lib/pocketbase'
import { triggerRevalidation } from '@/lib/revalidate'

const SETTINGS_KEY = 'settings'

// Hook para obtener website_id
export function useWebsiteId() {
  return useQuery({
    queryKey: ['website-id'],
    queryFn: async () => pb.authStore.model?.website_id || TENANT_ID,
  })
}

// Hook para obtener settings
export function useSettings(websiteId: string) {
  return useQuery({
    queryKey: [SETTINGS_KEY, websiteId],
    queryFn: async () => {
      const data = await SettingsAPI.getOrCreate(websiteId)
      console.log('Settings loaded from API:', data)
      return data
    },
    enabled: !!websiteId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para actualizar settings - POCKETBASE ONLY
export function useUpdateSettings(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    // NOTE: Uses SettingsAPI which calls PocketBase ONLY
    // No Supabase integration - matches rest of CMS architecture
    mutationFn: (settings: Partial<WebsiteSettingsFormData>) => 
      SettingsAPI.update(websiteId, settings),
    onSuccess: async (data) => {
      console.log('Settings updated successfully:', data)
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, websiteId] })
      queryClient.refetchQueries({ queryKey: [SETTINGS_KEY, websiteId] })
      await triggerRevalidation(['/', '/inteligentne-folie', '/montaz-folii-inteligentnej', '/realizacje', '/blog', '/kontakt'])
    },
    onError: (error: any) => {
      console.error('Settings update error details:', error.data || error.message || error)
    }
  })
}

// Hook para toggle mantenimiento
export function useToggleMaintenance(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (enabled: boolean) => SettingsAPI.toggleMaintenance(websiteId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, websiteId] })
    },
  })
}

// Hook para upload de logo
export function useUploadLogo(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => SettingsAPI.uploadLogo(file, websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, websiteId] })
    },
  })
}

// Hook para upload de favicon
export function useUploadFavicon(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => SettingsAPI.uploadFavicon(file, websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, websiteId] })
    },
  })
}

// Hook para upload de imagen SEO
export function useUploadSEOImage(websiteId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => SettingsAPI.uploadSEOImage(file, websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, websiteId] })
    },
  })
}

// Helper para convertir WebsiteSettings a FormData
export function settingsToFormData(settings: WebsiteSettings | null): WebsiteSettingsFormData {
  if (!settings) {
    return {
      website_url: '',
      logo_url: '',
      favicon_url: '',
      maintenance_mode: false,
      maintenance_message: 'Jesteśmy w trakcie aktualizacji. Wracamy wkrótce.',
      maintenance_allow_admin: true,
      analytics_id: '',
      search_console_code: '',
      pixel_id: '',
      custom_scripts: '',
      seo_title: 'Moja Strona',
      seo_description: '',
      seo_image_url: '',
      language: 'pl',
      timezone: 'Europe/Warsaw',
      date_format: 'DD/MM/YYYY',
      serpbear_enabled: false,
      serpbear_url: '',
      serpbear_api_key: '',
      gdpr_settings: null,
    }
  }
  
  return {
    website_url: settings.website_url || '',
    logo_url: settings.logo_url || '',
    favicon_url: settings.favicon_url || '',
    maintenance_mode: settings.maintenance_mode,
    maintenance_message: settings.maintenance_message || 'Jesteśmy w trakcie aktualizacji. Wracamy wkrótce.',
    maintenance_allow_admin: settings.maintenance_allow_admin,
    analytics_id: settings.analytics_id || '',
    search_console_code: settings.search_console_code || '',
    pixel_id: settings.pixel_id || '',
    custom_scripts: settings.custom_scripts || '',
    seo_title: settings.seo_title || 'Moja Strona',
    seo_description: settings.seo_description || '',
    seo_image_url: settings.seo_image_url || '',
    language: settings.language || 'pl',
    timezone: settings.timezone || 'Europe/Warsaw',
    date_format: settings.date_format || 'DD/MM/YYYY',
    serpbear_enabled: settings.serpbear_enabled || false,
    serpbear_url: settings.serpbear_url || '',
    serpbear_api_key: settings.serpbear_api_key || '',
    gdpr_settings: settings.gdpr_settings || null,
  }
}
