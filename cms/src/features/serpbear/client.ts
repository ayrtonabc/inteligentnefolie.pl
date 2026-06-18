// ============================================
// SERPBEAR SELF-HOSTED API CLIENT
// Conexión con instancia propia de SerpBear
// ============================================

import type { SerpBearKeyword, SerpBearPosition } from './types'

export interface SerpBearConfig {
  baseUrl: string
  apiKey: string
}

export interface SerpBearApiKeyword {
  ID: number
  keyword: string
  device: 'desktop' | 'mobile'
  country: string
  domain: string
  lastUpdated: string
  added: string
  position: number
  history: Record<string, number>
  url: string
  tags: string[]
  lastResult: unknown[]
  sticky: boolean
  updating: boolean
  lastUpdateError: string
}

export interface SerpBearApiDomain {
  ID: number
  domain: string
  slug: string
  keywordCount: number
  lastUpdated: string
  added: string
  tags: string
  notification: boolean
  notification_interval: string
  notification_emails: string
}

class SerpBearClient {
  private config: SerpBearConfig | null = null

  setConfig(config: SerpBearConfig) {
    this.config = config
  }

  getConfig(): SerpBearConfig | null {
    return this.config
  }

  isConfigured(): boolean {
    return !!this.config?.baseUrl && !!this.config?.apiKey
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config) {
      throw new Error('SerpBear nie jest skonfigurowany')
    }

    const url = `${this.config.baseUrl.replace(/\/$/, '')}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SerpBear API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // ============================================
  // DOMAINS
  // ============================================

  async getDomains(): Promise<SerpBearApiDomain[]> {
    const data = await this.request<{ domains: SerpBearApiDomain[] }>('/api/domains')
    return data.domains
  }

  // ============================================
  // KEYWORDS
  // ============================================

  async getKeywords(domain: string): Promise<SerpBearApiKeyword[]> {
    const data = await this.request<{ keywords: SerpBearApiKeyword[] }>(`/api/keywords?domain=${encodeURIComponent(domain)}`)
    return data.keywords
  }

  async getKeyword(keywordId: number): Promise<SerpBearApiKeyword> {
    const data = await this.request<{ keyword: SerpBearApiKeyword }>(`/api/keyword?id=${keywordId}`)
    return data.keyword
  }

  // ============================================
  // ACTIONS
  // ============================================

  async refreshKeywords(keywordIds: number[]): Promise<void> {
    await this.request('/api/refresh', {
      method: 'POST',
      body: JSON.stringify({ ids: keywordIds }),
    })
  }

  async runCron(): Promise<void> {
    await this.request('/api/cron', {
      method: 'POST',
    })
  }

  async sendNotification(): Promise<void> {
    await this.request('/api/notify', {
      method: 'POST',
    })
  }

  // ============================================
  // HELPERS
  // ============================================

  convertApiKeywordToLocal(apiKeyword: SerpBearApiKeyword): SerpBearKeyword {
    // Convertir history de objeto a array
    const history: SerpBearPosition[] = Object.entries(apiKeyword.history || {})
      .map(([date, position]) => ({
        id: `${apiKeyword.ID}-${date}`,
        keyword_id: String(apiKeyword.ID),
        position,
        url: apiKeyword.url,
        date,
        created_at: date,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      id: String(apiKeyword.ID),
      keyword: apiKeyword.keyword,
      domain: apiKeyword.domain,
      device: apiKeyword.device,
      location: apiKeyword.country?.toLowerCase() || 'pl',
      lastPosition: apiKeyword.position,
      lastCheck: apiKeyword.lastUpdated,
      created_at: apiKeyword.added,
    }
  }
}

export const serpBearClient = new SerpBearClient()

