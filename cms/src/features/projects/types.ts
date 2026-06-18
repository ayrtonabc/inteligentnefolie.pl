// ============================================================================
// TIPOS PARA SISTEMA DE PORTFOLIO/PROYECTOS
// ============================================================================

// Categorías de proyectos
export interface ProjectCategory {
  id: string
  website_id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  image_url?: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface ProjectCategoryFormData {
  name: string
  slug?: string
  description?: string
  color?: string
  icon?: string
  image_url?: string
  is_active?: boolean
  is_featured?: boolean
  sort_order?: number
  meta_title?: string
  meta_description?: string
}

// Tecnologías
export interface ProjectTechnology {
  id: string
  website_id: string
  name: string
  icon?: string
  color: string
  is_active: boolean
  created_at: string
}

export interface ProjectTechnologyFormData {
  name: string
  icon?: string
  color?: string
}

// Imágenes de proyectos
export interface ProjectImage {
  id: string
  project_id: string
  url: string
  storage_path?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  is_primary: boolean
  is_featured: boolean
  caption?: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export interface ProjectImageFormData {
  url: string
  file?: File
  storage_path?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  is_primary?: boolean
  is_featured?: boolean
  caption?: string
  alt_text?: string
  sort_order?: number
}

// Proyectos
export type ProjectStatus = 'draft' | 'published' | 'archived'
export type ProjectLayout = 'standard' | 'fullscreen' | 'minimal' | 'gallery'

export interface Project {
  id: string
  website_id: string
  language_code?: string
  category_id?: string
  title: string
  slug: string
  description?: string
  short_description?: string
  content?: string
  client_name?: string
  completion_date?: string
  project_url?: string
  repository_url?: string
  status: ProjectStatus
  is_featured: boolean
  layout: ProjectLayout
  sort_order: number
  meta_title?: string
  meta_description?: string
  view_count: number
  created_at: string
  updated_at: string
  published_at?: string
  
  // Before/After and Video
  image_url?: string
  image_single?: string
  image_before?: string
  image_after?: string
  video_url?: string
  media_type?: 'single' | 'before_after' | 'video'
  
  // Relaciones
  category?: ProjectCategory
  images?: ProjectImage[]
  technologies?: ProjectTechnology[]
  primary_image?: ProjectImage
}

export interface ProjectFormData {
  title: string
  slug?: string
  description?: string
  short_description?: string
  content?: string
  category_id?: string
  client_name?: string
  completion_date?: string
  project_url?: string
  repository_url?: string
  status?: ProjectStatus
  is_featured?: boolean
  layout?: ProjectLayout
  sort_order?: number
  meta_title?: string
  meta_description?: string
  image?: string | File
  image_single?: string | File
  image_before?: string | File
  image_after?: string | File
  video_url?: string | File
  media_type?: 'single' | 'before_after' | 'video'
}

// Filtros
export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[]
  category_id?: string
  is_featured?: boolean
  date_from?: string
  date_to?: string
}

// Stats
export interface ProjectStats {
  total_projects: number
  published_projects: number
  draft_projects: number
  featured_projects: number
  total_views: number
  categories_count: number
}
