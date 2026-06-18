import type { WebsiteSettings, WebsiteSettingsFormData } from './types'

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl'

export class SettingsAPI {
  private static async pbRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<any> {
    const { pb } = await import('@/lib/pocketbase')
    const url = `${PB_URL}/api/${endpoint}`
    
    // Use user's auth token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (pb.authStore.isValid && pb.authStore.token) {
      headers['Authorization'] = pb.authStore.token
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }
    
    return res.json()
  }

  static async getByWebsiteId(websiteId: string): Promise<WebsiteSettings | null> {
    try {
      const records = await this.pbRequest(
        'GET',
        `collections/site_settings/records?filter=(website_id="${websiteId}")`
      )
      
      if (!records.items || records.items.length === 0) return null
      
      const settings: any = { website_id: websiteId }
      
      const mainConfig = records.items.find((r: any) => r.setting_key === 'main_config')
      if (mainConfig && typeof mainConfig.setting_value === 'object') {
        Object.assign(settings, mainConfig.setting_value)
      }
      
      records.items.forEach((r: any) => {
        if (r.setting_key !== 'main_config' && r.setting_key) {
          settings[r.setting_key] = r.setting_value
        }
      })
      
      return settings as WebsiteSettings
    } catch (error) {
      console.error('Error getting settings:', error)
      return null
    }
  }
  
  static async getOrCreate(websiteId: string): Promise<WebsiteSettings> {
    const existing = await this.getByWebsiteId(websiteId)
    if (existing) return existing
    return { website_id: websiteId } as WebsiteSettings
  }
  
  static async update(
    websiteId: string, 
    settings: Partial<WebsiteSettingsFormData>
  ): Promise<WebsiteSettings> {
    try {
      const existing = await this.getOrCreate(websiteId)
      const { website_id: _existingWebsiteId, id: _existingId, created: _created, updated: _updated, ...existingSettings } = existing as any
      const newSettings = { ...existingSettings, ...settings }
      
      const recordsResponse = await this.pbRequest(
        'GET',
        `collections/site_settings/records?filter=(website_id="${websiteId}"%26%26setting_key="main_config")`
      )
      
      if (recordsResponse.items && recordsResponse.items.length > 0) {
        await this.pbRequest(
          'PATCH',
          `collections/site_settings/records/${recordsResponse.items[0].id}`,
          {
            setting_value: newSettings,
            website_id: websiteId
          }
        )
      } else {
        await this.pbRequest(
          'POST',
          'collections/site_settings/records',
          {
            website_id: websiteId,
            setting_key: 'main_config',
            setting_value: newSettings
          }
        )
      }
      
      return newSettings as WebsiteSettings
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }
  
  static async updatePartial(
    websiteId: string,
    key: keyof WebsiteSettingsFormData,
    value: unknown
  ): Promise<void> {
    await this.update(websiteId, { [key]: value })
  }

  static async uploadLogo(file: File, websiteId: string): Promise<string> {
    return this.uploadFile(file, websiteId, 'logo')
  }
  
  static async uploadFavicon(file: File, websiteId: string): Promise<string> {
    return this.uploadFile(file, websiteId, 'favicon')
  }
  
  static async uploadOgImage(file: File, websiteId: string): Promise<string> {
    return this.uploadFile(file, websiteId, 'og_image')
  }
  
  static async uploadSEOImage(file: File, websiteId: string): Promise<string> {
    return this.uploadFile(file, websiteId, 'og_image')
  }
  
  static async toggleMaintenance(websiteId: string, enabled: boolean): Promise<void> {
    await this.updatePartial(websiteId, 'maintenance_mode', enabled)
  }
  
  protected static async uploadFile(
    file: File, 
    websiteId: string, 
    type: 'logo' | 'favicon' | 'og_image'
  ): Promise<string> {
    try {
      const { pb } = await import('@/lib/pocketbase')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('website_id', websiteId)
      formData.append('name', `${type}_${Date.now()}_${file.name}`)
      formData.append('bucket_name', 'website-assets')
      formData.append('type', 'image')
      formData.append('format', file.name.split('.').pop()?.toUpperCase() || 'PNG')
      formData.append('mime_type', file.type)
      formData.append('size', file.size.toString())
      
      const record = await pb.collection('media').create(formData)
      return pb.files.getURL(record, record.file)
    } catch (error) {
      console.error(`Upload ${type} error:`, error)
      throw error
    }
  }
}