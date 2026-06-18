import { resolveSiteUrlFromDb } from '@/lib/siteUrl'

const pendingPaths = new Set<string>()
let flushTimer: ReturnType<typeof setTimeout> | null = null
let lastFlush = 0
const MIN_INTERVAL_MS = 2000
const MAX_RETRIES = 2
const retryCount = new Map<string, number>()

async function flushPendingPaths() {
  const paths = [...pendingPaths]
  pendingPaths.clear()
  if (paths.length === 0) return

  const siteUrl = await resolveSiteUrlFromDb()
  if (!siteUrl) return

  const token = import.meta.env.VITE_REVALIDATE_TOKEN?.trim()

  console.log(`[CMS Revalidation] Flushing ${paths.length} paths`)

  await Promise.allSettled(
    paths.map(async (pagePath) => {
      const currentRetries = retryCount.get(pagePath) || 0
      if (currentRetries >= MAX_RETRIES) {
        console.warn(`[CMS] Max retries reached for ${pagePath}, skipping`)
        retryCount.delete(pagePath)
        return
      }

      try {
        const response = await fetch(`${siteUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ pagePath }),
        })
        if (!response.ok) {
          console.warn(`[CMS] Revalidation failed for ${pagePath}: ${response.status}`)
        } else {
          retryCount.delete(pagePath)
        }
      } catch (err) {
        retryCount.set(pagePath, currentRetries + 1)
        console.warn(`[CMS] Revalidation error for ${pagePath} (attempt ${currentRetries + 1}/${MAX_RETRIES}):`, err)
      }
    }),
  )
}

function scheduleFlush() {
  if (flushTimer) return
  const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastFlush))
  flushTimer = setTimeout(async () => {
    flushTimer = null
    lastFlush = Date.now()
    await flushPendingPaths()
  }, delay)
}

/** Enqueue paths — calls are automatically batched. */
export function requestRevalidation(pagePaths: string[]): void {
  pagePaths.filter(Boolean).forEach(p => pendingPaths.add(p))
  scheduleFlush()
}

/** Legacy alias for backward compatibility. */
export async function triggerRevalidation(pagePaths: string[]): Promise<void> {
  requestRevalidation(pagePaths)
}
