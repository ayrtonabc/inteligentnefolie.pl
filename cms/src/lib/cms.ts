import { pb, TENANT_ID } from './pocketbase';

/**
 * Fetch available languages for the current website
 */
export async function getAvailableLanguages(): Promise<string[]> {
  try {
    const websiteId = pb.authStore.model?.website_id || TENANT_ID;
    
    // Fetch languages from website_languages
    const records = await pb.collection('website_languages').getFullList({
      filter: `website_id = "${websiteId}" && (translation_status = "published" || translation_status = "translated")`,
      expand: 'language_id',
      $autoCancel: false,
    });
    
    const codes = records
      .map((r: any) => r.expand?.language_id?.code)
      .filter(Boolean) as string[];
      
    // Always include Polish if not present
    if (!codes.includes('pl')) {
      codes.unshift('pl');
    }
    
    return codes;
  } catch (error) {
    console.error('Error fetching available languages in CMS:', error);
    return ['pl']; // Fallback to Polish
  }
}
