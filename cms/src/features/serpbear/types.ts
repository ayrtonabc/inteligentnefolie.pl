// ============================================
// SERPBEAR INTEGRATION TYPES
// Keyword Rank Tracking
// ============================================

export interface SerpBearKeyword {
  id: string
  keyword: string
  domain: string
  device: 'desktop' | 'mobile'
  location: string
  lastPosition?: number
  lastImpressions?: number
  lastClicks?: number
  lastCheck?: string
  is_active?: boolean
  created_at: string
}

export interface SerpBearPosition {
  id: string
  keyword_id: string
  position: number
  url?: string
  date: string
  created_at: string
}

export interface SerpBearKeywordWithHistory extends SerpBearKeyword {
  history: SerpBearPosition[]
}

export interface SerpBearApiKeyword {
  id: number
  keyword: string
  device: string
  country?: string
  lastPosition?: number
  lastCheck?: string
}

export interface SerpBearApiPosition {
  position: number
  date: string
  url?: string
}

export interface SerpBearSettings {
  enabled: boolean
  apiUrl?: string
  apiKey?: string
  defaultDomain?: string
  defaultLocation?: string
}

// Database table types
export interface SerpBearKeywordRow {
  id: string
  website_id: string
  keyword: string
  domain: string
  device: 'desktop' | 'mobile'
  location: string
  created_at: string
  updated_at: string
}

export interface SerpBearPositionRow {
  id: string
  keyword_id: string
  position: number
  url: string | null
  date: string
  created_at: string
}

// Form types
export interface AddKeywordFormData {
  keyword: string
  domain: string
  device: 'desktop' | 'mobile'
  location: string
}

// Chart data
export interface PositionChartPoint {
  date: string
  position: number
}
