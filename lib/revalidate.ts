/**
 * Global revalidation utility — batched & throttled.
 *
 * Collects multiple revalidation requests within a 2-second window
 * and fires them as a single burst, preventing server spam when
 * the user saves multiple fields in quick succession.
 */

const pendingPaths = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let lastFlush = 0;
const MIN_INTERVAL_MS = 2000;

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function scheduleFlush() {
  if (flushTimer) return;

  const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastFlush));

  flushTimer = setTimeout(async () => {
    flushTimer = null;
    lastFlush = Date.now();

    const paths = [...pendingPaths];
    pendingPaths.clear();
    if (paths.length === 0) return;

    const siteUrl = getBaseUrl();
    const token = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN || '';

    console.log(`[Revalidation] Flushing batch (${paths.length} paths): ${paths.join(', ')}`);

    // Fire all in parallel — still one fetch per path to keep API route compat
    await Promise.allSettled(
      paths.map(async (pagePath) => {
        try {
          const response = await fetch(`${siteUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ pagePath }),
          });

          if (!response.ok) {
            console.warn(`[Revalidation] ${pagePath} → ${response.status}`);
          }
        } catch (err) {
          console.warn(`[Revalidation] Failed for ${pagePath}:`, err);
          // Re-enqueue for next flush
          pendingPaths.add(pagePath);
        }
      })
    );

    // If any paths were re-enqueued after failure, schedule another flush
    if (pendingPaths.size > 0) scheduleFlush();
  }, delay);
}

/** Enqueue paths for revalidation. Calls are batched automatically. */
export function requestRevalidation(pagePaths: string[]): void {
  const unique = [...new Set(pagePaths.filter(Boolean))];
  unique.forEach(p => pendingPaths.add(p));
  scheduleFlush();
}

/** Legacy alias — kept for backward compatibility with existing callers. */
export async function triggerRevalidation(pagePaths: string[]): Promise<void> {
  requestRevalidation(pagePaths);
}
