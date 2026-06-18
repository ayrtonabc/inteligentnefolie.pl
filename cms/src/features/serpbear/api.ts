import { pb, TENANT_ID } from '@/lib/pocketbase'
import type { 
  SerpBearKeywordRow, 
  SerpBearPositionRow, 
  SerpBearKeyword,
  SerpBearKeywordWithHistory,
  AddKeywordFormData
} from './types'

function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export async function listKeywords(websiteId: string): Promise<SerpBearKeyword[]> {
  const records = await pb.collection('serpbear_keywords').getFullList({
    filter: `website_id = "${escapePbFilterValue(websiteId)}"`,
    sort: '-created',
    requestKey: null,
  })

  return records.map((row: any) => ({
    id: row.id,
    keyword: row.keyword,
    domain: row.domain,
    device: row.device,
    location: row.location,
    created_at: row.created,
  }))
}

export async function getKeywordWithHistory(keywordId: string): Promise<SerpBearKeywordWithHistory | null> {
  try {
    const keyword = await pb.collection('serpbear_keywords').getOne(keywordId)

    const positions = await pb.collection('serpbear_positions').getFullList({
      filter: `keyword_id = "${keywordId}"`,
      sort: 'date',
      requestKey: null,
    })

    const latestRecord = positions.length > 0 
      ? positions[positions.length - 1] 
      : null

    return {
      id: keyword.id,
      keyword: keyword.keyword,
      domain: keyword.domain,
      device: keyword.device,
      location: keyword.location,
      lastPosition: latestRecord?.position || null,
      lastCheck: latestRecord?.date || null,
      created_at: keyword.created,
      history: positions.map((p: any) => ({
        id: p.id,
        keyword_id: p.keyword_id,
        position: p.position,
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
  const record = await pb.collection('serpbear_keywords').create({
    website_id: websiteId,
    keyword: data.keyword,
    domain: data.domain || '',
    device: data.device || 'desktop',
    location: data.location || 'pl',
  })

  return {
    id: record.id,
    keyword: record.keyword,
    domain: record.domain,
    device: record.device,
    location: record.location,
    created_at: record.created,
  }
}

export async function deleteKeyword(keywordId: string): Promise<void> {
  await pb.collection('serpbear_keywords').delete(keywordId)
}

export async function addPosition(
  keywordId: string,
  position: number,
  url?: string,
  date?: string
): Promise<void> {
  await pb.collection('serpbear_positions').create({
    keyword_id: keywordId,
    position,
    url: url || null,
    date: date || new Date().toISOString().split('T')[0],
  })
}

export async function getLatestPositions(keywordIds: string[]): Promise<Map<string, { position: number; date: string; url?: string }>> {
  const result = new Map<string, { position: number; date: string; url?: string }>()

  for (const keywordId of keywordIds) {
    try {
      const records = await pb.collection('serpbear_positions').getFullList({
        filter: `keyword_id = "${keywordId}"`,
        sort: '-date',
        requestKey: null,
      })

      if (records.length > 0) {
        const latest = records[0] as any
        result.set(keywordId, {
          position: latest.position,
          date: latest.date,
          url: latest.url || undefined,
        })
      }
    } catch {
      // Keyword not found, skip
    }
  }

  return result
}