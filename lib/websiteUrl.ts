import { getSiteSettings } from './cms';

const cache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function getWebsiteUrl(): Promise<string> {
  const cacheKey = 'website_url';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  try {
    const settings = await getSiteSettings();
    let url = settings?.website_url || settings?.main_config?.website_url;
    
    if (url) {
      url = url.trim().replace(/\/+$/, '');
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      cache.set(cacheKey, { url, timestamp: Date.now() });
      return url;
    }
  } catch (error) {
    console.error('Error getting website URL:', error);
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) {
    const fallbackUrl = fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
    cache.set(cacheKey, { url: fallbackUrl, timestamp: Date.now() });
    return fallbackUrl;
  }

  return 'https://www.inteligentnefolie.pl';
}

export function clearWebsiteUrlCache(): void {
  cache.delete('website_url');
}
