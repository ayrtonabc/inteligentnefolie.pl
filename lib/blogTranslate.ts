import { pb, pbFetch } from './pocketbase';
import { getTenantFilter } from './pocketbase';

export interface TranslateableLanguages {
  'en': string;
  'es': string;
  'de': string;
  'cz': string;
  'ua': string;
  'pl': string;
}

export const LANGUAGE_NAMES: TranslateableLanguages = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  cz: 'Čeština',
  ua: 'Українська',
  pl: 'Polski',
};

export const LANGUAGE_PROMPT_NAMES: Record<string, string> = {
  en: 'angielskim',
  es: 'hiszpańskim',
  de: 'niemieckim',
  cz: 'czeskim',
  ua: 'ukraińskim',
  pl: 'polskim',
};

interface TranslatedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

export async function translateBlogPost(
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
  },
  targetLang: string
): Promise<TranslatedPost> {
  const targetLangName = LANGUAGE_PROMPT_NAMES[targetLang] || targetLang;
  
  const systemPrompt = `Jesteś profesjonalnym tłumaczem treści blogowych. Tłumacz artykuły z języka polskiego na ${targetLangName}. Zachowuj semantykę, formatowanie HTML i strukturę tekstu.`;

  const userPrompt = `Tłumacz następujący artykuł na ${targetLangName}:

Tytuł: ${post.title}
Slug: ${post.slug}
Opis: ${post.excerpt}
Meta Title: ${post.meta_title || post.title}
Meta Description: ${post.meta_description || post.excerpt}
Treść: ${post.content}

ZWRÓĆ TYLKO W FORMACIE JSON (bez markdown):
{
  "title": "przetłumaczony tytuł",
  "slug": "przetlumaczony-slug",
  "excerpt": "przetłumaczony krótki opis",
  "content": "przetłumaczona treść HTML zachowując formatowanie",
  "meta_title": "przetłumaczony meta title (max 60 znaków)",
  "meta_description": "przetłumaczona meta description (max 160 znaków)"
}`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.response?.trim();

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON from response
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    const jsonStr = content.slice(firstBrace, lastBrace + 1);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
    throw error;
  }
}

export async function getActivatedLanguages(): Promise<string[]> {
  try {
    const filter = getTenantFilter();
    const data = await pbFetch(`website_languages/records?filter=${encodeURIComponent(filter)}&perPage=100`);
    
    const langCodes = data.items
      .filter((item: any) => !item.is_default && item.is_active)
      .map((item: any) => item.language_code);
    
    return langCodes;
  } catch (error) {
    console.error('Error fetching activated languages:', error);
    return [];
  }
}

export async function createOrUpdateBlogTranslation(
  originalPostId: string,
  languageCode: string,
  translatedData: TranslatedPost
): Promise<string> {
  try {
    const tenantFilter = getTenantFilter();
    
    // Check if translation already exists by original_id or by slug matching
    let existingFilter = `${tenantFilter} && original_id = "${originalPostId}" && language_code = "${languageCode}"`;
    let existing = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(existingFilter)}&perPage=1`);
    
    // If no translation found by original_id, check by matching slug (for existing posts)
    if ((!existing.items || existing.items.length === 0) && originalPostId) {
      // Try to find by comparing slugs with language code
      const slugLower = translatedData.slug.toLowerCase();
      existingFilter = `${tenantFilter} && language_code = "${languageCode}" && slug ~ "${slugLower}"`;
      existing = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(existingFilter)}&perPage=1`);
    }
    
    // Determine website_id
    let websiteId = 'dktsle4yev6syo4';
    try {
      const authModel = pb.authStore.model as any;
      websiteId = authModel?.website_id || websiteId;
    } catch {}

    const postData = {
      original_id: originalPostId,
      website_id: websiteId,
      language_code: languageCode,
      title: translatedData.title,
      slug: translatedData.slug,
      excerpt: translatedData.excerpt,
      content: translatedData.content,
      meta_title: translatedData.meta_title,
      meta_description: translatedData.meta_description,
      status: 'published',
      published_at: new Date().toISOString(),
    };

    if (existing.items && existing.items.length > 0) {
      // Update existing translation
      const existingId = existing.items[0].id;
      console.log(`[blogTranslate] Updating existing translation ${existingId} for lang ${languageCode}`);
      const updated = await pb.collection('blog_posts').update(existingId, postData);
      return updated.id;
    } else {
      // Create new translation
      console.log(`[blogTranslate] Creating new translation for lang ${languageCode}`);
      const created = await pb.collection('blog_posts').create(postData);
      return created.id;
    }
  } catch (error) {
    console.error('Error creating/updating blog translation:', error);
    throw error;
  }
}

// Function to set original_id for existing posts (run once for posts without it)
export async function fixOriginalIdForExistingPosts(): Promise<{ updated: number; errors: string[] }> {
  const results = { updated: 0, errors: [] as string[] };
  
  try {
    const tenantFilter = getTenantFilter();
    
    // Get all Polish posts without original_id
    const filter = `${tenantFilter} && language_code = "pl" && (original_id = "" || original_id = null)`;
    const data = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(filter)}&perPage=500`);
    
    console.log(`[blogTranslate] Found ${data.items?.length || 0} posts needing original_id fix`);
    
    for (const post of (data.items || [])) {
      try {
        await pb.collection('blog_posts').update(post.id, {
          original_id: post.id // Self-reference for Polish posts
        });
        results.updated++;
        console.log(`✓ Updated post ${post.id}: original_id = ${post.id}`);
      } catch (err: any) {
        results.errors.push(`${post.id}: ${err.message}`);
        console.error(`✗ Failed to update ${post.id}:`, err.message);
      }
    }
    
    return results;
  } catch (error: any) {
    console.error('[blogTranslate] Error fixing original_ids:', error);
    throw error;
  }
}

export async function translateBlogPostToAllLanguages(
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
  }
): Promise<{ success: string[]; failed: string[] }> {
  const results = { success: [] as string[], failed: [] as string[] };
  
  try {
    const activatedLanguages = await getActivatedLanguages();
    
    if (activatedLanguages.length === 0) {
      throw new Error('Brak aktywnych języków do tłumaczenia');
    }

    for (const lang of activatedLanguages) {
      try {
        console.log(`Translating to ${lang}...`);
        
        const translated = await translateBlogPost(post, lang);
        await createOrUpdateBlogTranslation(post.id, lang, translated);
        
        results.success.push(lang);
        console.log(`✓ Translated to ${lang}`);
      } catch (error) {
        console.error(`✗ Failed to translate to ${lang}:`, error);
        results.failed.push(lang);
      }
    }

    return results;
  } catch (error) {
    console.error('Error in translateBlogPostToAllLanguages:', error);
    throw error;
  }
}
