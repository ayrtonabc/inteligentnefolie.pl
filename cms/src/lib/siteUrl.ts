import { pb } from '@/lib/pocketbase'

function normalizeUrl(url: string | null | undefined, allowDemo: boolean = false): string | null {
  if (!url) return null
  const trimmed = url.trim().replace(/\/$/, '')
  if (!trimmed) return null
  
  if (!allowDemo && trimmed.includes('example.com')) return null

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

function getBrowserFallback(): string | null {
  if (typeof window === 'undefined') return null

  const { protocol, hostname, origin } = window.location

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
    return origin.replace(/\/$/, '')
  }

  if (hostname.startsWith('panel.')) {
    return `${protocol}//${hostname.replace('panel.', '')}`
  }

  return origin.replace(/\/$/, '')
}

async function getCurrentSiteId(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem('cms_current_site')
    if (fromStorage) return fromStorage
  }

  try {
    const record = await pb.collection('tenants').getFirstListItem('', { sort: 'created' })
    return record.id
  } catch {
    return null
  }
}

export async function resolveSiteUrlFromDb(): Promise<string | null> {
  // 1. PRIORIDAD: Variable de entorno .env (VITE_SITE_URL)
  const envUrl = import.meta.env.VITE_SITE_URL
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('example.com')) {
    const normalizedEnv = normalizeUrl(envUrl, true)
    if (normalizedEnv) {
      console.log('[siteUrl] Usando URL de .env:', normalizedEnv)
      return normalizedEnv
    }
  }

  const browserFallback = getBrowserFallback()
  
  // 2. Prioridad: Localhost detectado en navegador
  if (browserFallback && (browserFallback.includes('localhost') || browserFallback.includes('127.0.0.1'))) {
    console.log('[siteUrl] Localhost detectado, usando:', browserFallback)
    return browserFallback
  }

  const siteId = await getCurrentSiteId()
  if (!siteId) return browserFallback

  // 3. Base de datos: site_settings
  try {
    const record = await pb.collection('site_settings').getFirstListItem(`setting_key = "website_url"`)
    const settingsUrl = normalizeUrl(record?.setting_value)
    if (settingsUrl) return settingsUrl
  } catch {}

  // 4. Base de datos: tenants dominio
  try {
    const website = await pb.collection('tenants').getOne(siteId)
    const domainUrl = normalizeUrl(website?.dominio)
    if (domainUrl) return domainUrl
  } catch {}

  return browserFallback
}

export function getLocalSiteFallback(): string {
  const envUrl = import.meta.env.VITE_SITE_URL
  const normalizedEnv = normalizeUrl(envUrl, true)
  if (normalizedEnv && !normalizedEnv.includes('example.com')) return normalizedEnv

  return getBrowserFallback() || 'http://localhost:3000'
}
