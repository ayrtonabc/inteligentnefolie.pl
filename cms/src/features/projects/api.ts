import { pb, TENANT_ID } from '@/lib/pocketbase'
import type {
  ProjectCategory,
  ProjectCategoryFormData,
  Project,
  ProjectFormData,
  ProjectImage,
  ProjectImageFormData,
  ProjectTechnology,
  ProjectTechnologyFormData,
  ProjectFilters,
  ProjectStats,
} from './types'

// ============================================================================
// WEBSITE ID — always returns the active tenant
// ============================================================================

export async function getWebsiteId(): Promise<string> {
  if (pb.authStore.model?.website_id && typeof pb.authStore.model.website_id === 'string' && pb.authStore.model.website_id.trim() !== '') {
    console.log('[getWebsiteId] Using from pb.authStore.model:', pb.authStore.model.website_id)
    return pb.authStore.model.website_id;
  }
  console.log('[getWebsiteId] Using TENANT_ID fallback:', TENANT_ID)
  console.log('[getWebsiteId] pb.authStore.model:', JSON.stringify(pb.authStore.model))
  return TENANT_ID
}

// ============================================================================
// API DE PROYECTOS — uses the real 'projects' collection schema
// ============================================================================

async function retry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 700))
      }
    }
  }
  throw lastError
}

export class ProjectsAPI {
  async getProjects(passedWebsiteId: string, filters?: ProjectFilters): Promise<Project[]> {
    const websiteId = passedWebsiteId || await getWebsiteId()
    console.log('[ProjectsAPI] websiteId being used:', websiteId)
    console.log('[ProjectsAPI] passedWebsiteId:', passedWebsiteId)
    try {
      const allRecords = await pb.collection('projects').getFullList({
        $autoCancel: false,
      })
      console.log('[ProjectsAPI] Total records in projects collection:', allRecords.length)
      console.log('[ProjectsAPI] Website IDs in records:', [...new Set(allRecords.map(r => r.website_id || 'EMPTY'))])
      
      let records = allRecords
      
      if (websiteId && websiteId.trim() !== '') {
        records = allRecords.filter(r => r.website_id === websiteId)
      }

      records = records.filter(r => {
        const code = typeof r.language_code === 'string' ? r.language_code.trim().toLowerCase() : ''
        return code === 'pl'
      })
      
      if (filters?.status && filters.status.length > 0) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
        records = records.filter(r => statuses.includes(r.status))
      }

      if (filters?.is_featured !== undefined) {
        records = records.filter(r => r.is_featured === filters.is_featured)
      }

      if (filters?.category_id) {
        records = records.filter(r => r.category_id === filters.category_id)
      }

      console.log('[ProjectsAPI] Final records count:', records.length)
      
      return records
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .map(r => this.mapRecordToProject(r))
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  private mapRecordToProject(r: any): Project {
    const getFileUrl = (field: string, fileName: string) => {
      if (!fileName) return ''
      if (fileName.startsWith('http')) return fileName
      return pb.files.getURL(r, fileName)
    }

    const hasAfterField = r.image_after && r.image_after !== ''
    const hasBeforeField = r.image_before && r.image_before !== ''
    
    const afterImg = hasAfterField ? getFileUrl('image_after', r.image_after) : ''
    const beforeImg = hasBeforeField ? getFileUrl('image_before', r.image_before) : ''
    
    const coverUrl = afterImg || beforeImg || (r.image ? pb.files.getURL(r, r.image) : '') || r.image_url || ''
    
    const primaryImage = coverUrl
      ? {
          id: r.id,
          project_id: r.id,
          url: coverUrl,
          is_primary: true,
          is_featured: false,
          sort_order: 0,
          created_at: r.created,
        }
      : null

    const statusValue = typeof r.status === 'string' ? r.status.trim().toLowerCase() : 'draft'

    return {
      id: r.id,
      website_id: r.website_id,
      language_code: r.language_code,
      category_id: r.category_id || null,
      title: r.title,
      slug: r.slug || r.id,
      short_description: r.short_description || r.description,
      description: r.description,
      content: r.content || '',
      client_name: r.client_name || '',
      completion_date: r.completion_date || '',
      project_url: r.project_url || '',
      repository_url: r.repository_url || '',
      status: (statusValue === 'published' || statusValue === 'draft' || statusValue === 'archived') ? statusValue : 'draft',
      is_featured: r.is_featured || false,
      layout: r.layout || 'standard',
      sort_order: r.sort_order || 0,
      meta_title: r.meta_title || '',
      meta_description: r.meta_description || '',
      view_count: r.view_count || 0,
      image_before: beforeImg,
      image_after: afterImg,
      image_url: coverUrl,
      video_url: r.video_url || '',
      primary_image: primaryImage,
      images: primaryImage ? [primaryImage] : [],
      created_at: r.created,
      updated_at: r.updated,
      published_at: r.published_at || r.created
    } as Project
  }

  async getProject(id: string): Promise<Project | null> {
    if (!id) return null
    try {
      const r = await pb.collection('projects').getOne(id)
      return this.mapRecordToProject(r)
    } catch (error) {
      console.error(`Error getting project ${id}:`, error)
      return null
    }
  }

  async getProjectBySlug(websiteId: string, slug: string): Promise<Project | null> {
    try {
      const r = await pb.collection('projects').getFirstListItem(
        `website_id = "${websiteId}" && (slug = "${slug}" || id = "${slug}")`
      )
      return this.mapRecordToProject(r)
    } catch (error) {
      return null
    }
  }

  async createProject(passedWebsiteId: string, data: ProjectFormData): Promise<Project> {
    const websiteId = passedWebsiteId || await getWebsiteId()
    
    console.log('[ProjectsAPI] Creating project for website:', websiteId)
    
    return retry(async () => {
      const formData = new FormData()
      formData.append('website_id', websiteId)
      formData.append('title', data.title)
      formData.append('language_code', 'pl')
      if (data.slug) formData.append('slug', data.slug)
      formData.append('description', data.description || '')
      formData.append('short_description', data.short_description || '')
      formData.append('content', data.content || '')
      if (data.category_id) formData.append('category_id', data.category_id)
      formData.append('client_name', data.client_name || '')
      formData.append('project_url', data.project_url || '')
      formData.append('repository_url', data.repository_url || '')
      formData.append('status', data.status || 'draft')
      formData.append('is_featured', String(data.is_featured || false))
      formData.append('layout', data.layout || 'standard')
      formData.append('meta_title', data.meta_title || '')
      formData.append('meta_description', data.meta_description || '')
      formData.append('sort_order', String(data.sort_order || 0))

      if (data.completion_date && data.completion_date.trim() !== '') {
        formData.append('completion_date', data.completion_date)
      }

      // Handle file upload to media collection and return URL
      const uploadToMedia = async (file: File): Promise<string> => {
        const mediaForm = new FormData()
        mediaForm.append('file', file)
        mediaForm.append('name', file.name)
        mediaForm.append('original_filename', file.name)
        mediaForm.append('mime_type', file.type)
        mediaForm.append('size', String(file.size))
        mediaForm.append('website_id', websiteId)
        
        try {
          const mediaRecord = await pb.collection('media').create(mediaForm)
          // Return the URL of the uploaded file
          if (mediaRecord && mediaRecord.id && mediaRecord.file) {
            return `${process.env.NEXT_PUBLIC_PB_URL || 'https://pb.fullwork.pl'}/api/files/${mediaRecord.collectionId}/${mediaRecord.id}/${mediaRecord.file}`
          }
        } catch (err) {
          console.error('[ProjectsAPI] Media upload error:', err)
        }
        return ''
      }

      // Handle file or string for multimedia fields
      const handleMultimedia = async (field: string, value: string | File | undefined): Promise<string> => {
        if (value instanceof File) {
          const url = await uploadToMedia(value)
          return url
        } else if (value) {
          return value
        }
        return ''
      }

      const imageBeforeUrl = await handleMultimedia('image_before', data.image_before)
      const imageAfterUrl = await handleMultimedia('image_after', data.image_after)
      const videoUrl = await handleMultimedia('video_url', data.video_url)
      const imageUrlVal = await handleMultimedia('image_url', data.image_single)

      if (imageBeforeUrl) formData.append('image_before', imageBeforeUrl)
      if (imageAfterUrl) formData.append('image_after', imageAfterUrl)
      if (videoUrl) formData.append('video_url', videoUrl)
      if (imageUrlVal) formData.append('image_url', imageUrlVal)

      try {
        const r = await pb.collection('projects').create(formData)
        console.log('[ProjectsAPI] Project created successfully:', r.id)
        const result = await this.getProject(r.id)
        if (!result) throw new Error('Nie udało się pobrać utworzonego projektu')
        return result
      } catch (err: any) {
        console.error('[ProjectsAPI] Create Error:', err.data || err)
        throw err
      }
    })
  }

  async updateProject(id: string, updates: Partial<ProjectFormData>): Promise<Project> {
    const websiteId = await getWebsiteId()
    return retry(async () => {
      const formData = new FormData()
      
      const appendIfDefined = (key: string, value: any) => {
        if (value !== undefined) {
          if (value === null) {
            // PocketBase handles nulls via special syntax or empty strings in FormData
            // but for simplicity we skip or send empty string
            formData.append(key, '')
          } else if (typeof value === 'boolean') {
            formData.append(key, String(value))
          } else {
            formData.append(key, value)
          }
        }
      }

      appendIfDefined('title', updates.title)
      appendIfDefined('slug', updates.slug)
      appendIfDefined('description', updates.description)
      appendIfDefined('short_description', updates.short_description)
      appendIfDefined('content', updates.content)
      appendIfDefined('category_id', updates.category_id)
      appendIfDefined('client_name', updates.client_name)
      appendIfDefined('completion_date', updates.completion_date)
      appendIfDefined('project_url', updates.project_url)
      appendIfDefined('repository_url', updates.repository_url)
      appendIfDefined('status', updates.status)
      appendIfDefined('is_featured', updates.is_featured)
      appendIfDefined('layout', updates.layout)
      appendIfDefined('meta_title', updates.meta_title)
      appendIfDefined('meta_description', updates.meta_description)
      appendIfDefined('sort_order', updates.sort_order)

      // Handle file upload to media collection and return URL
      const uploadToMedia = async (file: File): Promise<string> => {
        const mediaForm = new FormData()
        mediaForm.append('file', file)
        mediaForm.append('name', file.name)
        mediaForm.append('original_filename', file.name)
        mediaForm.append('mime_type', file.type)
        mediaForm.append('size', String(file.size))
        mediaForm.append('website_id', websiteId)
        
        try {
          const mediaRecord = await pb.collection('media').create(mediaForm)
          if (mediaRecord && mediaRecord.id && mediaRecord.file) {
            return `${process.env.NEXT_PUBLIC_PB_URL || 'https://pb.fullwork.pl'}/api/files/${mediaRecord.collectionId}/${mediaRecord.id}/${mediaRecord.file}`
          }
        } catch (err) {
          console.error('[ProjectsAPI] Media upload error:', err)
        }
        return ''
      }

      // Handle file or string for multimedia fields
      const handleMultimedia = async (field: string, value: string | File | undefined): Promise<string> => {
        if (value instanceof File) {
          return await uploadToMedia(value)
        } else if (value) {
          return value
        }
        return ''
      }

      const imageBeforeUrl = await handleMultimedia('image_before', updates.image_before)
      const imageAfterUrl = await handleMultimedia('image_after', updates.image_after)
      const videoUrlVal = await handleMultimedia('video_url', updates.video_url)
      const imageUrlVal = await handleMultimedia('image_url', updates.image_single)

      if (imageBeforeUrl) formData.append('image_before', imageBeforeUrl)
      if (imageAfterUrl) formData.append('image_after', imageAfterUrl)
      if (videoUrlVal) formData.append('video_url', videoUrlVal)
      if (imageUrlVal) formData.append('image_url', imageUrlVal)

      await pb.collection('projects').update(id, formData)
      const result = await this.getProject(id)
      if (!result) throw new Error('Nie udało się pobrać zaktualizowanego projektu')
      return result
    })
  }

  async deleteProject(id: string): Promise<void> {
    await pb.collection('projects').delete(id)
  }

  async incrementViews(id: string): Promise<void> {
    try {
      const record = await pb.collection('projects').getOne(id)
      await pb.collection('projects').update(id, {
        view_count: (record.view_count || 0) + 1,
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }
}

// ============================================================================
// API DE IMÁGENES — uploads go through 'media' collection with tenant tag
// ============================================================================

export class ProjectImagesAPI {
  async getImages(projectId: string): Promise<ProjectImage[]> {
    try {
      const project = await pb.collection('projects').getOne(projectId)
      if (!project.image) return []
      return [{
        id: project.id,
        project_id: projectId,
        url: pb.files.getURL(project, project.image),
        is_primary: true,
        alt_text: project.title,
        sort_order: 0,
        created_at: project.created,
        updated_at: project.updated,
      }] as any
    } catch (error) {
      return []
    }
  }

  async createImage(projectId: string, data: ProjectImageFormData): Promise<ProjectImage> {
    // Upload image directly to the project record
    const formData = new FormData()
    if (data.file) formData.append('image', data.file)
    if (data.url) formData.append('image_url', data.url)
    if (data.alt_text) formData.append('alt_text', data.alt_text)

    // Also save to media collection for the library
    if (data.file) {
      const mediaForm = new FormData()
      mediaForm.append('file', data.file)
      mediaForm.append('name', data.file.name)
      mediaForm.append('website_id', TENANT_ID)
      mediaForm.append('bucket_name', 'web-offers')
      await pb.collection('media').create(mediaForm).catch(() => null)
    }

    const record = await pb.collection('projects').update(projectId, formData)
    return {
      id: record.id,
      project_id: projectId,
      url: pb.files.getURL(record, record.image),
      is_primary: true,
      sort_order: 0,
      created_at: record.created,
      updated_at: record.updated,
    } as any
  }

  async updateImage(id: string, updates: Partial<ProjectImageFormData>): Promise<ProjectImage> {
    const record = await pb.collection('projects').getOne(id)
    return {
      id: record.id,
      project_id: id,
      url: record.image ? pb.files.getURL(record, record.image) : '',
      is_primary: true,
      sort_order: 0,
      created_at: record.created,
      updated_at: record.updated,
    } as any
  }

  async deleteImage(id: string): Promise<void> {
    // Clear the image from the project
    await pb.collection('projects').update(id, { 'image': null })
  }

  async setPrimaryImage(projectId: string, imageId: string): Promise<void> {
    // In simplified schema, the project only has one image — nothing to do
  }
}

// ============================================================================
// API DE CATEGORÍAS — stub (no project_categories collection in PocketBase)
// ============================================================================

export class ProjectCategoriesAPI {
  async getCategories(websiteId: string): Promise<ProjectCategory[]> {
    try {
      const records = await pb.collection('project_categories').getList(1, 100, {
        filter: `website_id = "${websiteId}"`,
        sort: 'name',
      })
      return records.items.map(r => ({
        id: r.id,
        website_id: r.website_id,
        name: r.name,
        slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
        color: r.color || '#3B82F6',
        is_active: true,
        is_featured: false,
        sort_order: 0,
        created_at: r.created,
        updated_at: r.updated,
      }))
    } catch (e) { console.error(e); return [] }
  }

  async getCategory(id: string): Promise<ProjectCategory | null> {
    try {
      const r = await pb.collection('project_categories').getOne(id)
      return {
        id: r.id,
        website_id: r.website_id,
        name: r.name,
        slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
        color: r.color || '#3B82F6',
        is_active: true,
        is_featured: false,
        sort_order: 0,
        created_at: r.created,
        updated_at: r.updated,
      }
    } catch (e) { return null }
  }

  async createCategory(websiteId: string, data: ProjectCategoryFormData): Promise<ProjectCategory> {
    const r = await pb.collection('project_categories').create({
      website_id: websiteId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      color: data.color || '#3B82F6',
    })
    return {
      id: r.id,
      website_id: r.website_id,
      name: r.name,
      slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
      color: r.color || '#3B82F6',
      is_active: true,
      is_featured: false,
      sort_order: 0,
      created_at: r.created,
      updated_at: r.updated,
    }
  }

  async updateCategory(id: string, updates: Partial<ProjectCategoryFormData>): Promise<ProjectCategory> {
    const r = await pb.collection('project_categories').update(id, updates)
    return {
      id: r.id,
      website_id: r.website_id,
      name: r.name,
      slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
      color: r.color || '#3B82F6',
      is_active: true,
      is_featured: false,
      sort_order: 0,
      created_at: r.created,
      updated_at: r.updated,
    }
  }

  async deleteCategory(id: string): Promise<void> {
    await pb.collection('project_categories').delete(id)
  }
}

// ============================================================================
// API DE TECNOLOGÍAS — stub (no project_technologies collection in PocketBase)
// ============================================================================

export class ProjectTechnologiesAPI {
  async getTechnologies(websiteId: string): Promise<ProjectTechnology[]> {
    return []
  }

  async createTechnology(websiteId: string, data: ProjectTechnologyFormData): Promise<ProjectTechnology> {
    throw new Error('Project technologies not supported in current schema')
  }

  async deleteTechnology(id: string): Promise<void> {
    // no-op
  }

  async linkTechnology(projectId: string, technologyId: string): Promise<void> {
    // no-op
  }

  async unlinkTechnology(projectId: string, technologyId: string): Promise<void> {
    // no-op
  }
}

// ============================================================================
// STATS
// ============================================================================

export async function getProjectStats(websiteId: string): Promise<ProjectStats> {
  try {
    const allRecords = await pb.collection('projects').getFullList({
      $autoCancel: false,
    })
    
    const filtered = websiteId && websiteId.trim() !== ''
      ? allRecords.filter(r => r.website_id === websiteId)
      : allRecords

    const filteredPl = filtered.filter(r => {
      const code = typeof r.language_code === 'string' ? r.language_code.trim().toLowerCase() : ''
      return code === 'pl'
    })

    const total = filteredPl.length
    const published = filteredPl.filter(r => r.status === 'published').length
    const draft = filteredPl.filter(r => r.status === 'draft').length
    const featured = filteredPl.filter(r => r.is_featured === true).length
    const totalViews = filteredPl.reduce((sum, r) => sum + (r.view_count || 0), 0)

    return {
      total_projects: total,
      published_projects: published,
      draft_projects: draft,
      featured_projects: featured,
      total_views: totalViews,
      categories_count: 0,
    }
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return {
      total_projects: 0,
      published_projects: 0,
      draft_projects: 0,
      featured_projects: 0,
      total_views: 0,
      categories_count: 0,
    }
  }
}

// ============================================================================
// INSTANCIAS
// ============================================================================

export const projectCategoriesAPI = new ProjectCategoriesAPI()
export const projectsAPI = new ProjectsAPI()
export const projectImagesAPI = new ProjectImagesAPI()
export const projectTechnologiesAPI = new ProjectTechnologiesAPI()

export const projectsApi = {
  categories: projectCategoriesAPI,
  projects: projectsAPI,
  images: projectImagesAPI,
  technologies: projectTechnologiesAPI,
  getWebsiteId,
  getProjectStats,
}
