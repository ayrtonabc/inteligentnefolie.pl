import { pbFetch, getTenantFilter, TENANT_ID } from './pocketbase';
import type { SiteContent } from './pocketbase';
import { PB_URL } from './config';
export type { SiteContent };

// Cache for content to reduce API calls
const contentCache = new Map<string, any>();
const CACHE_TTL = 0; // Instant refresh - no caching on server (client-side handles caching)

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getFromCache<T>(key: string): T | null {
  const entry = contentCache.get(key) as CacheEntry | undefined;
  if (!entry) return null;
  // TTL = 0 means cache is always stale, forcing fresh fetches
  if (CACHE_TTL === 0 || Date.now() - entry.timestamp > CACHE_TTL) {
    contentCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  contentCache.set(key, { data, timestamp: Date.now() });
}

export function clearCaches(pagePath?: string): void {
  if (pagePath) {
    // Clear all keys that match the page path OR start with content-related prefixes
    for (const key of Array.from(contentCache.keys())) {
      if (
        key.includes(pagePath) ||
        key.startsWith('page_') ||
        key.startsWith('section_') ||
        key.startsWith('custom_') ||
        key.includes('site_settings') ||
        key.includes('available_languages')
      ) {
        contentCache.delete(key);
      }
    }
  } else {
    // Clear ALL content caches when no specific page is provided
    contentCache.clear();
  }
}

// Fetch all content for a specific page from PocketBase
export async function getPageContent(
  pagePath: string,
  languageCode: string = 'pl',
  forceRefresh: boolean = false
): Promise<SiteContent[]> {
  // Include languageCode in cache key so each language has its own cache
  const cacheKey = `page_${pagePath}_${languageCode}`;
  if (!forceRefresh) {
    const cached = getFromCache<SiteContent[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    const tenantFilter = getTenantFilter();
    // Proper PocketBase filter with parentheses for correct AND/OR precedence
    const filter = `(${tenantFilter}) && (page_path = "${pagePath}" || page_path = "common" || page_path = "site_settings") && (language_code = "${languageCode}")`;
    const data = await pbFetch(`site_content/records?filter=${encodeURIComponent(filter)}&sort=-updated&perPage=500`);
    
    let allContent: SiteContent[] = data.items.map((record: any) => ({
      id: record.id,
      page_path: record.page_path,
      section_key: record.section_key,
      content_type: record.content_type,
      content_value: record.content_value,
      metadata: record.metadata,
      language_code: record.language_code,
      tenant: record.tenant,
      updated: record.updated,
    }));

    // If no results for this language, try pl
    if (allContent.length === 0 && languageCode !== 'pl') {
      const plFilter = `(${tenantFilter}) && (page_path = "${pagePath}" || page_path = "common" || page_path = "site_settings") && (language_code = "pl")`;
      const plData = await pbFetch(`site_content/records?filter=${encodeURIComponent(plFilter)}&sort=-updated&perPage=500`);
      
      allContent = plData.items.map((record: any) => ({
        id: record.id,
        page_path: record.page_path,
        section_key: record.section_key,
        content_type: record.content_type,
        content_value: record.content_value,
        metadata: record.metadata,
        language_code: record.language_code,
        tenant: record.tenant,
        updated: record.updated,
      }));
    }

    setCache(cacheKey, allContent);
    return allContent;
  } catch (err) {
    console.error('Exception fetching page content from PocketBase:', err);
    return [];
  }
}

// Fetch web offers (portfolio/projects) from PocketBase
export async function getWebOffers(limit: number = 20): Promise<any[]> {
  try {
    const filter = getTenantFilter();
    const data = await pbFetch(`web_offers/records?filter=${encodeURIComponent(filter)}&perPage=1000`);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching web offers from PocketBase:', error);
    return [];
  }
}

// Fetch all blog posts from PocketBase
function getFirstFileName(fileValue: unknown): string {
  if (Array.isArray(fileValue)) return typeof fileValue[0] === 'string' ? fileValue[0] : '';
  return typeof fileValue === 'string' ? fileValue : '';
}

function normalizePbFileUrl(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;
  return `${PB_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function withBlogCoverUrl(post: any): any {
  const coverImageUrl = normalizePbFileUrl(post.cover_image_url);
  if (coverImageUrl) return { ...post, cover_image_url: coverImageUrl };

  const fileName = getFirstFileName(post.cover_image);
  if (!fileName) return post;

  const collection = post.collectionName || post.collectionId || 'blog_posts';
  return {
    ...post,
    cover_image_url: `${PB_URL}/api/files/${collection}/${post.id}/${encodeURIComponent(fileName)}`,
  };
}

export async function getBlogPosts(languageCode: string = 'pl', limit: number = 10): Promise<any[]> {
  try {
    let filter = `${getTenantFilter()} && language_code = "${languageCode}"`;
    let data = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(filter)}&perPage=1000`);
    
    // Fallback to Polish if no results
    if (data.items.length === 0 && languageCode !== 'pl') {
      filter = `${getTenantFilter()} && language_code = "pl"`;
      data = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(filter)}&perPage=1000`);
    }
    
    return (data.items || []).map(withBlogCoverUrl);
  } catch (error) {
    console.error('Error fetching blog posts from PocketBase:', error);
    return [];
  }
}

// Fetch single blog post by slug from PocketBase
export async function getBlogPostBySlug(slug: string, languageCode: string = 'pl'): Promise<any | null> {
  try {
    const tenantFilter = getTenantFilter();
    const filter = `(${tenantFilter} && slug = "${slug}" && language_code = "${languageCode}")`;
    const data = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(filter)}&perPage=1`);
    
    if (data.items[0]) {
      return withBlogCoverUrl(data.items[0]);
    }
    
    // Fallback to Polish if not found in requested language
    if (languageCode !== 'pl') {
      const plFilter = `(${tenantFilter} && slug = "${slug}" && language_code = "pl")`;
      const plData = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(plFilter)}&perPage=1`);
      return plData.items[0] ? withBlogCoverUrl(plData.items[0]) : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching blog post from PocketBase:', error);
    return null;
  }
}

// Fetch a specific section content from PocketBase
export async function getSectionContent(
  pagePath: string,
  sectionKey: string,
  languageCode: string = 'pl',
  forceRefresh: boolean = false
): Promise<SiteContent | null> {
  const cacheKey = `section_${pagePath}_${sectionKey}_${languageCode}`;
  if (!forceRefresh) {
    const cached = getFromCache<SiteContent>(cacheKey);
    if (cached) return cached;
  }

  try {
    const filter = `(${getTenantFilter()} && page_path = "${pagePath}" && section_key = "${sectionKey}" && language_code = "${languageCode}")`;
    const data = await pbFetch(`site_content/records?filter=${encodeURIComponent(filter)}&sort=-updated&perPage=500`);

    if (data.items[0]) {
      const record = data.items[0];
      const result: SiteContent = {
        id: record.id,
        page_path: record.page_path,
        section_key: record.section_key,
        content_type: record.content_type,
        content_value: record.content_value,
        metadata: record.metadata,
        language_code: record.language_code,
        tenant: record.tenant,
      };
      setCache(cacheKey, result);
      return result;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Fetch site settings from PocketBase
export async function getSiteSettings(): Promise<Record<string, any>> {
  const cacheKey = 'site_settings';
  const cached = getFromCache<Record<string, any>>(cacheKey);
  if (cached) return cached;

  try {
    // Primary: PocketBase site_settings collection
    const filter = getTenantFilter();
    const data = await pbFetch(`site_settings/records?filter=${encodeURIComponent(filter)}`);

    const settings: Record<string, any> = {};
    if (data && data.items) {
      // First pass: Individual keys
      data.items.forEach((record: any) => {
        if (record.setting_key !== 'main_config' && record.setting_key !== 'ai_config') {
          settings[record.setting_key] = record.setting_value;
        }
      });

      // Second pass: Centralized config (overrides individual keys if exists)
      const mainConfig = data.items.find((r: any) => r.setting_key === 'main_config');
      if (mainConfig && typeof mainConfig.setting_value === 'object') {
        Object.assign(settings, mainConfig.setting_value);
      }

      // Handle AI config specifically if it's an object
      const aiConfig = data.items.find((r: any) => r.setting_key === 'ai_config');
      if (aiConfig && typeof aiConfig.setting_value === 'object') {
        settings.ai_config = aiConfig.setting_value;
      }
    }

    if (Object.keys(settings).length > 0) {
      setCache(cacheKey, settings);
      return settings;
    }

    return {};
  } catch (err) {
    console.error('Error fetching site settings from PocketBase:', err);
    return {};
  }
}

// Fetch all available languages - combine website_languages AND site_content
export async function getAvailableLanguages(forceRefresh: boolean = false): Promise<string[]> {
  const cacheKey = 'available_languages';
  if (!forceRefresh) {
    const cached = getFromCache<string[]>(cacheKey);
    if (cached) return cached;
  }

  let languages: string[] = [];

  // 1. Get from website_languages
  try {
    const filter = `${getTenantFilter()}`;
    const data = await pbFetch(`website_languages/records?filter=${encodeURIComponent(filter)}&expand=language_id`);
    languages = data.items
      .map((item: any) => item.expand?.language_id?.code)
      .filter(Boolean) as string[];
  } catch (err) {
    console.error('website_languages query failed:', err);
  }

  // 2. ALSO get from site_content (for completed translations not in website_languages)
  try {
    const filter = `${getTenantFilter()} && language_code != "pl" && language_code != ""`;
    const data = await pbFetch(`site_content/records?filter=${encodeURIComponent(filter)}&fields=language_code&perPage=1000`);
    const contentLangs = Array.from(new Set(data.items.map((item: any) => item.language_code).filter(Boolean))) as string[];
    languages = [...new Set([...languages, ...contentLangs])];
  } catch (err) {
    console.error('site_content query failed:', err);
  }

  // Ensure 'pl' is always included as base language
  if (!languages.includes('pl')) {
    languages.unshift('pl');
  }

  // Sort: pl first, then others alphabetically
  languages = [...new Set(languages)].sort((a, b) => {
    if (a === 'pl') return -1;
    if (b === 'pl') return 1;
    return a.localeCompare(b);
  });

  setCache(cacheKey, languages);
  return languages;
}

// Fetch all languages with full details from website_languages
export async function getLanguageDetails(): Promise<{ code: string; name: string; flag: string }[]> {
  try {
    const filter = `(${getTenantFilter()} && (translation_status = "published" || translation_status = "translated"))`;
    const data = await pbFetch(`website_languages/records?filter=${encodeURIComponent(filter)}&expand=language_id`);

    const languages = data.items
      .map((item: any) => {
        const lang = item.expand?.language_id;
        return lang ? {
          code: lang.code,
          name: lang.name,
          flag: lang.flag_emoji || ''
        } : null;
      })
      .filter(Boolean) as { code: string; name: string; flag: string }[];

    // Always include 'pl' as default if not present
    const hasPl = languages.some(l => l.code === 'pl');
    if (!hasPl) {
      languages.unshift({ code: 'pl', name: 'Polski', flag: '🇵🇱' });
    }

    return languages;
  } catch (err) {
    console.error('Error fetching language details from PocketBase:', err);
    return [{ code: 'pl', name: 'Polski', flag: '🇵🇱' }];
  }
}

// Fetch custom content by key from PocketBase
export async function getCustomContent(
  contentKey: string,
  languageCode: string = 'pl',
  pagePath: string = '/'
): Promise<string | null> {
  const cacheKey = `custom_${contentKey}_${languageCode}_${pagePath}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const filter = `(${getTenantFilter()} && content_key = "${contentKey}" && language_code = "${languageCode}" && page_path = "${pagePath}")`;
    const data = await pbFetch(`site_custom_content/records?filter=${encodeURIComponent(filter)}&perPage=1`);

    const value = data.items[0]?.content_value || null;
    setCache(cacheKey, value);
    return value;
  } catch (err) {
    return null;
  }
}

export function clearContentCache(): void {
  contentCache.clear();
}

export function getContentValue(content: SiteContent | null | undefined, fallback: string = ''): string {
  if (!content) return fallback;
  if (typeof content.content_value === 'string') return content.content_value;
  if (content.content_value && typeof content.content_value === 'object') {
    return content.content_value.text || content.content_value.value || fallback;
  }
  return fallback;
}

export function parseContentJson<T>(content: SiteContent | null | undefined, fallback: T): T {
  if (!content) return fallback;
  try {
    if (typeof content.content_value === 'string') return JSON.parse(content.content_value) as T;
    return content.content_value as T;
  } catch {
    return fallback;
  }
}
export function cleanQuillContent(content: string | any): string {
  if (!content) return '';

  // If it's already an object, check for html property
  if (typeof content === 'object') {
    return content.html || '';
  }

  // If it's a string, check if it's a JSON string
  if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
    try {
      const parsed = JSON.parse(content);
      return parsed.html || parsed.text || content;
    } catch {
      return content;
    }
  }

  return content;
}

// ============================================
// TESTIMONIALS
// ============================================

export interface Testimonial {
  id: string;
  website_id: string;
  name: string;
  review_text: string;
  rating: number;
  avatar_url: string;
  is_active: boolean;
  created: string;
}

export async function getTestimonials(languageCode: string = 'pl'): Promise<Testimonial[]> {
  const cacheKey = `testimonials_${languageCode}`;
  const cached = getFromCache<Testimonial[]>(cacheKey);
  if (cached) return cached;

  try {
    let filter = `${getTenantFilter()} && language_code = "${languageCode}"`;
    let data = await pbFetch(`testimonials/records?filter=${encodeURIComponent(filter)}&sort=created`);
    
    // Fallback to Polish
    if (data.items.length === 0 && languageCode !== 'pl') {
      filter = `${getTenantFilter()} && language_code = "pl"`;
      data = await pbFetch(`testimonials/records?filter=${encodeURIComponent(filter)}&sort=created`);
    }
    
    const testimonials: Testimonial[] = data.items.map((item: any) => ({
      id: item.id,
      website_id: item.website_id,
      name: item.name,
      review_text: item.review_text,
      rating: item.rating || 5,
      avatar_url: item.avatar_url || '',
      is_active: item.is_active,
      created: item.created,
    }));

    setCache(cacheKey, testimonials);
    return testimonials;
  } catch (err) {
    error('Error fetching testimonials:', err);
    return [];
  }
}

// ============================================
// BUSINESS COLLABORATIONS
// ============================================

export interface BusinessCollaboration {
  id: string;
  website_id: string;
  title: string;
  description: string;
  file_url: string;
  logo_url: string;
  is_active: boolean;
  created: string;
}

export async function getBusinessCollaborations(): Promise<BusinessCollaboration[]> {
  const cacheKey = 'business_collaborations';
  const cached = getFromCache<BusinessCollaboration[]>(cacheKey);
  if (cached) return cached;

  try {
    const filter = `${getTenantFilter()} && is_active = true`;
    const data = await pbFetch(`business_collaborations/records?filter=${encodeURIComponent(filter)}&sort=created`);

    const collection = 'business_collaborations';
    const collaborations: BusinessCollaboration[] = data.items.map((item: any) => {
      const normalizeUrl = (url: string, file: string) => {
        const val = url || file || '';
        if (!val) return '';
        if (val.startsWith('http') || val.startsWith('data:')) return val;
        if (val.startsWith('/api/files')) return `${PB_URL}${val}`;
        return `${PB_URL}/api/files/${collection}/${item.id}/${encodeURIComponent(val)}`;
      };

      return {
        id: item.id,
        website_id: item.website_id,
        title: item.title,
        description: item.description,
        file_url: normalizeUrl(item.file_url, item.file),
        logo_url: normalizeUrl(item.logo_url, item.logo),
        is_active: item.is_active,
        created: item.created,
      };
    });

    setCache(cacheKey, collaborations);
    return collaborations;
  } catch (err) {
    console.error('Error fetching business collaborations:', err);
    return [];
  }
}
