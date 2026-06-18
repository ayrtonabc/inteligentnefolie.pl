import { getPageContent, getSiteSettings, clearContentCache, getAvailableLanguages } from '@/lib/cms';
import { getProjects } from './portfolio';
import type { PageData } from '@/lib/cms';

export function clearCaches(pagePath?: string): void {
  clearContentCache(pagePath);
}

// Fetch all page data for static generation
export async function fetchPageData(pagePath: string, languageCode: string = 'pl'): Promise<PageData> {
  try {
    const content = await getPageContent(pagePath, languageCode);
    const settings = await getSiteSettings();
    const available_languages = await getAvailableLanguages();
    const polishContent = await getPageContent(pagePath, 'pl', true);
    const projects = pagePath === '/' ? await getProjects(languageCode) : [];
    
    const polishImages = polishContent.filter(c => c.content_type === 'image');
    const polishImageKeys = new Set(polishImages.map(pi => pi.section_key));
    
    const mergedContent = content.map(item => {
      if (item.content_type === 'image' && item.content_value) {
        const polishImage = polishImages.find(pi => pi.section_key === item.section_key);
        if (polishImage && polishImage.content_value) {
          return polishImage;
        }
      }
      return item;
    });
    
    polishImages.forEach(pi => {
      if (!mergedContent.some(mc => mc.section_key === pi.section_key && mc.content_type === 'image')) {
        mergedContent.push(pi);
      }
    });

    const settingsWithLang = {
      ...settings,
      current_language: languageCode,
    };

    return {
      content: mergedContent,
      settings: settingsWithLang,
      projects,
      available_languages,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      content: [],
      settings: { current_language: languageCode },
      projects: [],
      available_languages: [],
      timestamp: new Date().toISOString(),
    };
  }
}

function parseContentValue(value: any, fallback: string): string {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') return parsed;
      if (parsed && typeof parsed === 'object') {
        return parsed.text || parsed.value || fallback;
      }
    } catch {
      return value;
    }
  }
  if (value && typeof value === 'object') {
    return value.text || value.value || fallback;
  }
  return fallback;
}

export function findAllContentByKey(pageData: PageData | undefined, sectionKey: string) {
  if (!pageData?.content) return [];
  return pageData.content.filter(c => c.section_key === sectionKey);
}

export function getPageContentValue(
  pageData: PageData | null | undefined,
  sectionKey: string,
  fallback: string = '',
  targetLang?: string
): string {
  if (!pageData?.content) return fallback;

  const allMatches = findAllContentByKey(pageData, sectionKey);
  if (allMatches.length === 0) return fallback;

  // Usar el lang pasado como targetLang优先, si no existe usar current_language de settings
  const preferredLang = targetLang || pageData.settings?.current_language || 'pl';
  const langMatch = allMatches.find(c => c.language_code === preferredLang);
  if (langMatch) {
    return parseContentValue(langMatch.content_value, fallback);
  }

  // Si no encuentra el idioma preferido, buscar polaco
  const plMatch = allMatches.find(c => c.language_code === 'pl');
  if (plMatch) {
    return parseContentValue(plMatch.content_value, fallback);
  }

  // Si no hay polaco, tomar el primero disponible
  const firstMatch = allMatches[0];
  return parseContentValue(firstMatch.content_value, fallback);
}

export function getPageContentJson<T>(
  pageData: PageData | null | undefined,
  sectionKey: string,
  fallback: T | null
): T | null {
  if (!pageData?.content) return fallback;

  const allMatches = findAllContentByKey(pageData, sectionKey);
  if (allMatches.length === 0) return fallback;
  
  const preferredLang = pageData.settings?.current_language || 'pl';
  const langMatch = allMatches.find(c => c.language_code === preferredLang);
  const item = langMatch || allMatches[0];
  
  try {
    if (typeof item.content_value === 'string') {
      return JSON.parse(item.content_value) as T;
    }
    if (typeof item.content_value === 'object') {
      return item.content_value as T;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function generateSEOMetadata(
  pageData: PageData,
  pagePath: string,
  defaults: {
    title: string;
    description: string;
    keywords?: string[];
  }
) {
  const siteName = pageData.settings?.site_name || '';
  const title = getPageContentValue(pageData, 'meta_title', defaults.title) || defaults.title;
  const description = getPageContentValue(pageData, 'meta_description', defaults.description) || defaults.description;
  const keywords = getPageContentJson<string[]>(pageData, 'meta_keywords', defaults.keywords || []) || defaults.keywords || [];

  // Don't show placeholder values like [Nazwa Firmy] in title
  const shouldShowSiteName = siteName && siteName !== 'Nazwa Firmy' && siteName !== '[Nazwa Firmy]';

  return {
    title: shouldShowSiteName ? `${title} | ${siteName}` : title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      type: 'website',
      locale: 'pl_PL',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inteligentnefolie.pl'}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://inteligentnefolie.pl'}/og-image.jpg`],
    },
    alternates: {
      canonical: `https://inteligentnefolie.pl${pagePath}`,
    },
  };
}

export async function revalidatePage(pagePath?: string): Promise<boolean> {
  try {
    clearCaches(pagePath);
    return true;
  } catch (error) {
    console.error('Error revalidating page:', error);
    return false;
  }
}

export const SECTION_KEYS = {
  HOME: {
    HERO_TITLE: 'hero_title',
    HERO_SUBTITLE: 'hero_subtitle',
    HERO_BUTTON_PRIMARY: 'hero_button_primary',
    HERO_BUTTON_SECONDARY: 'hero_button_secondary',
    HERO_BENEFIT_1: 'home_hero_benefit_1',
    HERO_BENEFIT_2: 'home_hero_benefit_2',
    HERO_BENEFIT_3: 'home_hero_benefit_3',
  },
  FEATURES: {
    TITLE: 'features_title',
    SUBTITLE: 'features_subtitle',
  },
  SERVICES: {
    TITLE: 'services_title',
    SUBTITLE: 'services_subtitle',
  },
  REFERENCES: {
    TITLE: 'references_title',
    SUBTITLE: 'references_subtitle',
  },
};