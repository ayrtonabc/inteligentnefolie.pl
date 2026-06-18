// ============================================
// WEBSITE SETTINGS TYPES
// ============================================

export interface WebsiteSettings {
  id: string
  website_id: string
  
  // General
  website_url: string | null
  logo_url: string | null
  favicon_url: string | null
  
  // Visibilidad / Mantenimiento
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_allow_admin: boolean
  
  // Integraciones / Analytics
  analytics_id: string | null // Google Analytics G-XXXXXXX
  search_console_code: string | null
  pixel_id: string | null // Facebook Pixel
  custom_scripts: string | null
  
  // SEO Global
  seo_title: string | null
  seo_description: string | null
  seo_image_url: string | null
  
  // Avanzado / Regional
  language: string
  timezone: string
  date_format: string
  
  // SerpBear Self-Hosted
  serpbear_enabled: boolean
  serpbear_url: string | null
  serpbear_api_key: string | null

  // GDPR / Cookies
  gdpr_settings: any | null

  // Metadatos
  created_at: string
  updated_at: string
}

// Formulario de settings (para inputs)
export interface WebsiteSettingsFormData {
  website_url: string
  logo_url: string
  favicon_url: string
  
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_allow_admin: boolean
  
  analytics_id: string
  search_console_code: string
  pixel_id: string
  custom_scripts: string
  
  seo_title: string
  seo_description: string
  seo_image_url: string
  
  language: string
  timezone: string
  date_format: string
  
  // SerpBear Self-Hosted
  serpbear_enabled: boolean
  serpbear_url: string
  serpbear_api_key: string
  
  // GDPR
  gdpr_settings: any
}

// Secciones del formulario
export type SettingsSection = 'general' | 'visibility' | 'integrations' | 'seo' | 'privacy' | 'advanced'

// Opciones predefinidas
export const LANGUAGE_OPTIONS = [
  { value: 'pl', label: 'Polski', flag: '🇵🇱' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Warsaw', label: 'Warszawa (CET/CEST)' },
  { value: 'Europe/London', label: 'Londyn (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paryż (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'Nowy Jork (ET)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Asia/Tokyo', label: 'Tokio (JST)' },
  { value: 'Asia/Dubai', label: 'Dubaj (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (25/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/25/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-25)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (25.12.2024)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (25-12-2024)' },
]

// Valores por defecto
export const DEFAULT_SETTINGS: Partial<WebsiteSettingsFormData> = {
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
