// ============================================================================
// TIPOS PARA SISTEMA MULTI-IDIOMA
// ============================================================================

// Idiomas disponibles (catálogo global)
export interface Language {
  id: string
  code: string // 'es', 'en', 'de', etc.
  name: string // 'Spanish', 'English'
  name_native: string // 'Español', 'English', 'Deutsch'
  flag_emoji: string // '🇪🇸', '🇬🇧', '🇩🇪'
  flag_svg?: string
  locale: string // 'es-ES', 'en-US', 'de-DE'
  rtl: boolean // Right-to-left
  is_active: boolean
  sort_order: number
  created_at: string
}

// Idioma activado para un website
export interface WebsiteLanguage {
  id: string
  website_id: string
  language_id: string
  language?: Language
  
  // Configuración
  is_default: boolean
  is_active: boolean
  url_prefix?: string // '/en', '/de'
  
  // Estado de traducción
  translation_status: 'pending' | 'translating' | 'translated' | 'edited' | 'published'
  total_strings: number
  translated_strings: number
  
  // SEO específico
  meta_title?: string
  meta_description?: string
  
  // Fechas
  translated_at?: string
  edited_at?: string
  published_at?: string
  created_at: string
  updated_at: string
}

// Progreso de traducción (vista)
export interface TranslationProgress {
  website_id: string
  language_code: string
  language_name: string
  flag_emoji: string
  is_default: boolean
  is_active: boolean
  translation_status: string
  total_strings: number
  translated_strings: number
  total_keys?: number
  translated_keys?: number
  progress_percentage: number
}

// Grupo de traducciones
export interface TranslationGroup {
  id: string
  website_id: string
  group_key: string // 'pages', 'menu', 'components'
  name: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

// Clave de traducción (string original)
export interface TranslationKey {
  id: string
  website_id: string
  group_id?: string
  group?: TranslationGroup
  
  key_name: string // 'homepage.title', 'menu.contact'
  source_text: string
  source_language: string
  
  content_type: 'text' | 'html' | 'markdown' | 'json' | 'attribute'
  context?: string // Descripción para traductor
  max_length?: number
  
  is_active: boolean
  created_at: string
  updated_at: string
}

// Traducción específica
export interface Translation {
  id: string
  key_id: string
  key?: TranslationKey
  language_id: string
  language?: Language
  
  translated_text?: string
  status: 'pending' | 'translating' | 'translated' | 'edited' | 'approved'
  
  // Metadatos IA
  translation_method?: 'ai' | 'manual' | 'imported'
  ai_provider?: string
  ai_model?: string
  confidence_score?: number
  
  // Revisión
  reviewed_by?: string
  reviewed_at?: string
  
  created_at: string
  updated_at: string
}

// Página traducida (para SEO)
export interface TranslatedPage {
  id: string
  website_id: string
  language_id: string
  language?: Language
  
  path: string // '/', '/about', '/services'
  page_type: 'page' | 'post' | 'product' | 'category'
  
  // Contenido
  title?: string
  content?: string
  excerpt?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  hreflang_alternate?: Record<string, string> // { "en": "/en/page" }
  
  // Estado
  status: 'draft' | 'published' | 'archived'
  
  // Traducción
  translation_method?: string
  ai_provider?: string
  confidence_score?: number
  
  // Fechas
  translated_at?: string
  published_at?: string
  created_at: string
  updated_at: string
}

// Log de traducciones
export interface TranslationLog {
  id: string
  website_id: string
  operation: 'auto_translate' | 'manual_edit' | 'bulk_translate' | 'publish'
  language_id?: string
  items_count: number
  success_count: number
  error_count: number
  ai_provider?: string
  ai_model?: string
  duration_ms?: number
  errors?: any
  performed_by?: string
  created_at: string
}

// Formularios
export interface WebsiteLanguageFormData {
  language_id: string
  is_default?: boolean
  is_active?: boolean
  url_prefix?: string
  meta_title?: string
  meta_description?: string
}

export interface TranslationKeyFormData {
  group_id?: string
  key_name: string
  source_text: string
  source_language?: string
  content_type?: 'text' | 'html' | 'markdown' | 'json' | 'attribute'
  context?: string
  max_length?: number
  is_active?: boolean
}

export interface TranslationFormData {
  translated_text: string
  status?: 'pending' | 'translating' | 'translated' | 'edited' | 'approved'
}

export interface TranslatedPageFormData {
  path: string
  page_type?: 'page' | 'post' | 'product' | 'category'
  title?: string
  content?: string
  excerpt?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  status?: 'draft' | 'published' | 'archived'
}

// Request para traducción automática
export interface AutoTranslateRequest {
  target_language_ids: string[]
  group_ids?: string[] // Si vacío, traducir todo
  keys?: string[] // Claves específicas
}

// Response de traducción
export interface TranslationStats {
  total_keys: number
  translated_count: number
  pending_count: number
  editing_count: number
  approved_count: number
  languages_count: number
  total_words: number
}

// Opciones de idiomas soportados por el sistema
export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish', name_native: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', name_native: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', name_native: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polish', name_native: 'Polski', flag: '🇵🇱' },
  { code: 'fr', name: 'French', name_native: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', name_native: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', name_native: 'Português', flag: '🇵🇹' },
  { code: 'uk', name: 'Ukrainian', name_native: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Russian', name_native: 'Русский', flag: '🇷🇺' },
  { code: 'fi', name: 'Finnish', name_native: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Swedish', name_native: 'Svenska', flag: '🇸🇪' },
  { code: 'nl', name: 'Dutch', name_native: 'Nederlands', flag: '🇳🇱' },
  { code: 'cs', name: 'Czech', name_native: 'Čeština', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', name_native: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', name_native: 'Magyar', flag: '🇭🇺' },
  { code: 'tr', name: 'Turkish', name_native: 'Türkçe', flag: '🇹🇷' },
] as const
