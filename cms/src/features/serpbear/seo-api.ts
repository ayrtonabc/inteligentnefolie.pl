import { pb } from '@/lib/pocketbase'
import type { SerpBearKeyword, SerpBearKeywordWithHistory, AddKeywordFormData } from './types'

const KEYWORDS_COLLECTION = 'serpbear_keywords'
const POSITIONS_COLLECTION = 'serpbear_positions'
const QUERIES_COLLECTION = 'serpbear_queries'
const PAGES_COLLECTION = 'serpbear_pages'
const CONFIG_COLLECTION = 'serpbear_google_config'

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface GscSearchResult {
  query: string
  page: string
  country: string
  device: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  date: string
}

export type SeoSummary = any;
export type GoogleAppearance = any;
export type DeviceComparison = any;
export type PositionChange = any;
export type LostOpportunity = any;
export type Competitor = any;

export async function getGoogleConfig(websiteId: string) {
  try {
    const record = await pb.collection(CONFIG_COLLECTION).getFirstListItem(`website_id = "${websiteId}" && is_active = true`)
    return record
  } catch {
    return null
  }
}

export async function saveGoogleConfig(
  websiteId: string,
  config: {
    access_token: string
    refresh_token: string
    expires_at: string
    property_url: string
    property_type: string
  }
) {
  let existing;
  try {
    existing = await pb.collection(CONFIG_COLLECTION).getFirstListItem(`website_id = "${websiteId}"`)
  } catch {}

  const payload = {
    website_id: websiteId,
    ...config,
    is_active: true,
    sync_status: 'pending',
  }

  if (existing) {
    return await pb.collection(CONFIG_COLLECTION).update(existing.id, payload)
  } else {
    return await pb.collection(CONFIG_COLLECTION).create(payload)
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Faltan credenciales de Google OAuth')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Error refreshing Google token')
  }

  const data = await response.json()
  return data.access_token
}

export async function fetchGscData(
  websiteId: string,
  startDate: string,
  endDate: string
): Promise<GscSearchResult[]> {
  const config = await getGoogleConfig(websiteId)
  if (!config) {
    throw new Error('Google Search Console nie jest skonfigurowane')
  }

  let accessToken = config.access_token
  const expiresAt = new Date(config.expires_at)
  if (expiresAt < new Date()) {
    accessToken = await refreshAccessToken(config.refresh_token)
    await pb.collection(CONFIG_COLLECTION).update(config.id, { 
      access_token: accessToken, 
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString() 
    })
  }

  const propertyUrl = config.property_url

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page', 'country', 'device'],
        rowLimit: 10000,
        aggregationType: 'byPage',
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google Search Console API error: ${errorText}`)
  }

  const data = await response.json()

  await updateSyncStatus(websiteId, 'success')

  return (data.rows || []).map((row: any) => ({
    query: row.keys[0],
    page: row.keys[1],
    country: row.keys[2] || 'pol',
    device: row.keys[3] || 'desktop',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
    date: startDate,
  }))
}

export async function syncFromGsc(websiteId: string): Promise<{ keywordsAdded: number; queriesProcessed: number }> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  await updateSyncStatus(websiteId, 'syncing')

  const results = await fetchGscData(websiteId, startStr, endStr)

  let keywordsAdded = 0
  let queriesProcessed = 0

  for (const result of results) {
    const keywordId = await findOrCreateKeyword(websiteId, result.query, result.page)

    if (keywordId) {
      await pb.collection(POSITIONS_COLLECTION).create({
        keyword_id: keywordId,
        position: Math.round(result.position),
        impressions: result.impressions,
        clicks: result.clicks,
        ctr: result.ctr,
        url: result.page,
        device: result.device,
        country: result.country,
        date: result.date,
      })
    }

    // Upsert equivalent for queries
    try {
      const existingQuery = await pb.collection(QUERIES_COLLECTION).getFirstListItem(
        `website_id = "${websiteId}" && query = "${result.query}" && page_url = "${result.page}" && date = "${result.date}"`
      )
      await pb.collection(QUERIES_COLLECTION).update(existingQuery.id, {
        country: result.country,
        device: result.device,
        impressions: result.impressions,
        clicks: result.clicks,
        ctr: result.ctr,
        position: result.position,
      })
    } catch {
      await pb.collection(QUERIES_COLLECTION).create({
        website_id: websiteId,
        query: result.query,
        page_url: result.page,
        country: result.country,
        device: result.device,
        impressions: result.impressions,
        clicks: result.clicks,
        ctr: result.ctr,
        position: result.position,
        date: result.date,
      })
    }

    // Upsert equivalent for pages
    try {
      const existingPage = await pb.collection(PAGES_COLLECTION).getFirstListItem(
        `website_id = "${websiteId}" && url = "${result.page}" && date = "${result.date}"`
      )
      await pb.collection(PAGES_COLLECTION).update(existingPage.id, {
        impressions: result.impressions,
        clicks: result.clicks,
        ctr: result.ctr,
        position: result.position,
      })
    } catch {
      await pb.collection(PAGES_COLLECTION).create({
        website_id: websiteId,
        url: result.page,
        impressions: result.impressions,
        clicks: result.clicks,
        ctr: result.ctr,
        position: result.position,
        date: result.date,
      })
    }

    queriesProcessed++
  }

  await updateSyncStatus(websiteId, 'success')
  return { keywordsAdded, queriesProcessed }
}

async function findOrCreateKeyword(websiteId: string, query: string, pageUrl: string): Promise<string | null> {
  try {
    const existing = await pb.collection(KEYWORDS_COLLECTION).getFirstListItem(`website_id = "${websiteId}" && keyword ~ "${query}"`)
    return existing.id
  } catch {
    const domain = pageUrl ? new URL(pageUrl).hostname : ''
    const record = await pb.collection(KEYWORDS_COLLECTION).create({
      website_id: websiteId,
      keyword: query,
      domain,
      device: 'desktop',
      location: 'Poland',
    })
    return record.id
  }
}

async function updateSyncStatus(websiteId: string, status: string, error?: string) {
  try {
    const config = await pb.collection(CONFIG_COLLECTION).getFirstListItem(`website_id = "${websiteId}"`)
    await pb.collection(CONFIG_COLLECTION).update(config.id, {
      sync_status: status,
      last_sync: new Date().toISOString(),
      last_error: error || null,
    })
  } catch {}
}

export async function checkKeywordPosition(
  websiteId: string,
  keywordId: string,
  data: AddKeywordFormData
): Promise<{ position: number; url: string; impressions: number; clicks: number; ctr: number }> {
  const config = await getGoogleConfig(websiteId)
  if (!config) {
    throw new Error('Google Search Console nie jest skonfigurowane. Połącz konto w Ustawieniach.')
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  const accessToken = config.access_token
  const propertyUrl = config.property_url

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startStr,
        endDate: endStr,
        dimensions: ['query', 'page'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'query',
                expression: data.keyword,
                operator: 'equals',
              },
            ],
          },
        ],
        rowLimit: 10,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Błąd podczas sprawdzania pozycji w Google')
  }

  const gscData = await response.json()
  const rows = gscData.rows || []

  if (rows.length === 0) {
    return {
      position: 0,
      url: `https://${data.domain}/`,
      impressions: 0,
      clicks: 0,
      ctr: 0,
    }
  }

  const row = rows[0]
  const position = Math.round(row.position || 0)
  const pageUrl = row.keys[1] || `https://${data.domain}/`

  await pb.collection(POSITIONS_COLLECTION).create({
    keyword_id: keywordId,
    position,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    url: pageUrl,
    device: data.device,
    country: data.location,
    date: new Date().toISOString(),
  })

  return {
    position,
    url: pageUrl,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
  }
}

export async function listKeywords(websiteId: string): Promise<SerpBearKeyword[]> {
  const records = await pb.collection(KEYWORDS_COLLECTION).getFullList({
    filter: `website_id = "${websiteId}"`,
    
  })

  return records.map((row: any) => ({
    id: row.id,
    keyword: row.keyword,
    domain: row.domain,
    device: row.device,
    location: row.location,
    is_active: row.is_active,
    created_at: row.created,
  }))
}

export async function getKeywordWithHistory(keywordId: string): Promise<SerpBearKeywordWithHistory | null> {
  try {
    const keyword = await pb.collection(KEYWORDS_COLLECTION).getOne(keywordId)
    const positions = await pb.collection(POSITIONS_COLLECTION).getFullList({
      filter: `keyword_id = "${keywordId}"`,
      sort: 'date',
    })
    
    const latest = positions.length > 0 ? positions[positions.length - 1] : null

    return {
      id: keyword.id,
      keyword: keyword.keyword,
      domain: keyword.domain,
      device: keyword.device,
      location: keyword.location,
      is_active: keyword.is_active,
      lastPosition: latest?.position,
      lastImpressions: latest?.impressions,
      lastClicks: latest?.clicks,
      lastCheck: latest?.date,
      created_at: keyword.created,
      history: positions.map((p: any) => ({
        id: p.id,
        keyword_id: p.keyword_id,
        position: p.position,
        impressions: p.impressions,
        clicks: p.clicks,
        ctr: p.ctr,
        url: p.url || undefined,
        date: p.date,
        created_at: p.created,
      })),
    }
  } catch {
    return null
  }
}

export async function addKeyword(
  websiteId: string,
  data: AddKeywordFormData
): Promise<SerpBearKeyword> {
  const row = await pb.collection(KEYWORDS_COLLECTION).create({
    website_id: websiteId,
    keyword: data.keyword,
    domain: data.domain,
    device: data.device,
    location: data.location,
  })

  return {
    id: row.id,
    keyword: row.keyword,
    domain: row.domain,
    device: row.device,
    location: row.location,
    is_active: row.is_active,
    created_at: row.created,
  }
}

export async function deleteKeyword(keywordId: string): Promise<void> {
  const positions = await pb.collection(POSITIONS_COLLECTION).getFullList({ filter: `keyword_id = "${keywordId}"` })
  for (const p of positions) {
    await pb.collection(POSITIONS_COLLECTION).delete(p.id)
  }
  await pb.collection(KEYWORDS_COLLECTION).delete(keywordId)
}

export async function toggleKeywordActive(keywordId: string, isActive: boolean): Promise<void> {
  await pb.collection(KEYWORDS_COLLECTION).update(keywordId, { is_active: isActive })
}

// MOCKING RPC FUNCTIONS (Not natively supported by PB without complex hooks)
export async function getSeoSummary(websiteId: string, days = 30): Promise<any | null> {
  return null
}

export async function getGoogleAppearances(websiteId: string): Promise<any[]> {
  return []
}

export async function getDeviceComparison(websiteId: string): Promise<any[]> {
  return []
}

export async function getPositionChanges(websiteId: string, days = 7): Promise<any[]> {
  return []
}

export async function getLostOpportunities(websiteId: string, minPosition = 20): Promise<any[]> {
  return []
}

export async function getCompetitors(websiteId: string, minShared = 3): Promise<any[]> {
  return []
}

export async function syncGscData(websiteId: string, data: GscSearchResult[]): Promise<void> {
  // Logic already handled in syncFromGsc
}

export async function isGoogleConnected(websiteId: string): Promise<boolean> {
  const config = await getGoogleConfig(websiteId)
  return config !== null && config.is_active === true
}

export async function getKeywordStats(websiteId: string) {
  const keywords = await pb.collection(KEYWORDS_COLLECTION).getFullList({
    filter: `website_id = "${websiteId}" && is_active = true`
  })

  if (keywords.length === 0) {
    return {
      totalKeywords: 0,
      top10Count: 0,
      top50Count: 0,
      notFoundCount: 0,
      averagePosition: null,
      totalImpressions: 0,
      totalClicks: 0,
    }
  }

  const keywordIds = keywords.map(k => k.id)
  
  // This is inefficient but necessary without RPC
  const positions = await pb.collection(POSITIONS_COLLECTION).getFullList()
  const filteredPositions = positions.filter(p => keywordIds.includes(p.keyword_id))

  const latestPositions = new Map<string, any>()
  const sorted = filteredPositions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (const pos of sorted) {
    if (!latestPositions.has(pos.keyword_id)) {
      latestPositions.set(pos.keyword_id, pos)
    }
  }

  const allPositions = Array.from(latestPositions.values())
  const top10 = allPositions.filter((p) => p.position <= 10).length
  const top50 = allPositions.filter((p) => p.position <= 50).length
  const notFound = allPositions.filter((p) => p.position === 0 || p.impressions === 0).length
  const avg = allPositions.length > 0
    ? Math.round(allPositions.reduce((a, b) => a + b.position, 0) / allPositions.length)
    : null

  const totalImpressions = allPositions.reduce((a, b) => a + (b.impressions || 0), 0)
  const totalClicks = allPositions.reduce((a, b) => a + (b.clicks || 0), 0)

  return {
    totalKeywords: keywordIds.length,
    top10Count: top10,
    top50Count: top50,
    notFoundCount: notFound,
    averagePosition: avg,
    totalImpressions,
    totalClicks,
  }
}

export async function getRelatedQueries(websiteId: string, keyword: string, limit = 20) {
  const records = await pb.collection(QUERIES_COLLECTION).getList(1, limit, {
    filter: `website_id = "${websiteId}" && query ~ "${keyword}"`,
    sort: '-impressions'
  })
  return records.items
}

export async function getTopPages(websiteId: string, limit = 10) {
  const records = await pb.collection(PAGES_COLLECTION).getList(1, limit, {
    filter: `website_id = "${websiteId}"`,
    sort: '-clicks'
  })
  return records.items
}

export async function isGoogleConfigured(websiteId: string): Promise<boolean> {
  const config = await getGoogleConfig(websiteId)
  return !!config
}

