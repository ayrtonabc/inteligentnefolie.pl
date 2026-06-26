import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { pbFetch } from '@/lib/pocketbase'
import { getTenantFilter } from '@/lib/pocketbase'

const DEFAULT_REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'st_cms_rev_2026'

interface RevalidationLog {
  id?: string
  website_id: string
  path: string
  success: boolean
  error_message?: string
  ip_address?: string
  user_agent?: string
  created: string
}

async function logRevalidation(log: RevalidationLog): Promise<void> {
  try {
    await pbFetch('revalidation_logs/records', {
      method: 'POST',
      body: JSON.stringify({
        website_id: log.website_id,
        path: log.path,
        success: log.success,
        error_message: log.error_message || '',
        ip_address: log.ip_address || '',
        user_agent: log.user_agent || '',
      }),
    })
  } catch (error) {
    console.error('Failed to log revalidation:', error)
  }
}

async function getTenantRevalidateToken(tenantId: string): Promise<string | null> {
  try {
    const filter = `(${getTenantFilter()})`
    const data = await pbFetch(`site_settings/records?filter=${encodeURIComponent(filter)}`)
    const mainConfig = data.items?.find((r: any) => r.setting_key === 'main_config')
    if (mainConfig?.setting_value?.revalidate_token) {
      return mainConfig.setting_value.revalidate_token
    }
    return null
  } catch {
    return null
  }
}

async function getWebsiteIdFromToken(token: string): Promise<string | null> {
  try {
    const data = await pbFetch('site_settings/records?perPage=500')
    for (const record of data.items || []) {
      if (record.setting_key === 'main_config' && 
          record.setting_value?.revalidate_token === token) {
        return record.website_id
      }
    }
    if (token === DEFAULT_REVALIDATE_SECRET) {
      const data = await pbFetch('tenants/records?perPage=1')
      return data.items?.[0]?.id || null
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const secret = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('secret')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent') || ''

    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 401 }
      )
    }

    const tenantId = await getWebsiteIdFromToken(secret)
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { path, tags, ...options } = body

    const revalidated: { paths: string[]; tags: string[] } = { paths: [], tags: [] }
    const errors: string[] = []

    if (path) {
      const paths = Array.isArray(path) ? path : [path]
      for (const p of paths) {
        if (typeof p === 'string' && p.length > 0) {
          try {
            revalidatePath(p)
            revalidated.paths.push(p)
          } catch (err) {
            errors.push(`Path ${p}: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags]
      for (const tag of tagList) {
        if (typeof tag === 'string' && tag.length > 0) {
          try {
            revalidateTag(tag)
            revalidated.tags.push(tag)
          } catch (err) {
            errors.push(`Tag ${tag}: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
    }

    revalidatePath('/', 'layout')

    const allPaths = [...revalidated.paths, '/'].filter(Boolean).join(', ')
    await logRevalidation({
      website_id: tenantId,
      path: allPaths || '/',
      success: errors.length === 0,
      error_message: errors.length > 0 ? errors.join('; ') : undefined,
      ip_address: ipAddress || undefined,
      user_agent: userAgent,
      created: new Date().toISOString(),
    })

    return NextResponse.json({
      success: errors.length === 0,
      revalidated,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { success: false, error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || ''

  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'Missing token' },
      { status: 401 }
    )
  }

  const tenantId = await getWebsiteIdFromToken(secret)
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    )
  }

  revalidatePath('/', 'layout')

  await logRevalidation({
    website_id: tenantId,
    path: '/',
    success: true,
    ip_address: ipAddress || undefined,
    user_agent: userAgent,
    created: new Date().toISOString(),
  })

  return NextResponse.json({
    success: true,
    message: 'Layout revalidated',
    timestamp: new Date().toISOString(),
  })
}
