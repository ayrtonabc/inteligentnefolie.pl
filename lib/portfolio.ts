import { pbFetch, getTenantFilter } from './pocketbase';
import { PB_URL } from './config';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  image_before: string;
  image_after: string;
  video_url: string;
  layout: string;
}

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'dktsle4yev6syo4';

export async function getProjects(languageCode: string = 'pl'): Promise<Project[]> {
  try {
    // Always get Polish projects first (for correct images)
    let polishFilter = `website_id = "${TENANT_ID}" && language_code = "pl"`;
    let polishData = await pbFetch(`projects/records?filter=${encodeURIComponent(polishFilter)}&_cb=${Date.now()}`);

    // If we need a different language, also fetch those translations
    let translatedData: any = { items: [] };
    if (languageCode !== 'pl') {
      const translatedFilter = `website_id = "${TENANT_ID}" && language_code = "${languageCode}"`;
      translatedData = await pbFetch(`projects/records?filter=${encodeURIComponent(translatedFilter)}&_cb=${Date.now()}`);
    }

    const polishProjects = polishData.items || [];
    const translatedProjects = translatedData.items || [];

    // Create a map of translated projects by their "base project" (matching by order or id)
    const translatedMap = new Map<string, any>();
    translatedProjects.forEach((t: any, index: number) => {
      // Map by original record id or by index
      const key = t.original_id || t.related_id || `index_${index}`;
      translatedMap.set(key, t);
    });

    const getFileUrl = (recordId: string, fileName: string) => {
      if (!fileName) return '';
      if (fileName.startsWith('http')) return fileName;
      return `${PB_URL}/api/files/projects/${recordId}/${fileName}`;
    };

    return polishProjects.map((record: any, index: number) => {
      // Find translated version if exists
      const translated = translatedProjects[index] || translatedProjects.find((t: any) => t.original_id === record.id);

      const images = Array.isArray(record.image) ? record.image : (record.image ? [record.image] : []);
      const hasBeforeField = record.image_before && record.image_before !== '';
      const hasAfterField = record.image_after && record.image_after !== '';

      const afterImg = hasAfterField
        ? getFileUrl(record.id, record.image_after)
        : (images[1] ? getFileUrl(record.id, images[1]) : '');
      const beforeImg = hasBeforeField
        ? getFileUrl(record.id, record.image_before)
        : (images[0] ? getFileUrl(record.id, images[0]) : '');
      const singleImg = record.image_url || '';
      const fallbackImage = images[0] ? getFileUrl(record.id, images[0]) : '';

      return {
        id: record.id,
        title: translated?.title || record.title || 'Bez tytułu',
        category: translated?.category_name || translated?.category || record.category_name || record.category || 'Realizacja',
        description: translated?.short_description || translated?.description || record.short_description || record.description || 'Brak opisu',
        image_url: singleImg || afterImg || beforeImg || fallbackImage,
        image_before: beforeImg,
        image_after: afterImg,
        video_url: record.video_url || '',
        layout: record.layout || 'standard'
      };
    });
  } catch (error) {
    console.error('Error fetching projects from PocketBase:', error);
    return [];
  }
}
