import { getAvailableLanguages } from './cms';
import { getWebsiteUrl } from './websiteUrl';
import type { LanguageCode } from './context/LanguageContext';

export type HreflangFormat = 'query' | 'prefix';

const LANGUAGE_NAMES: Record<string, string> = {
  pl: 'Polish',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  ua: 'Ukrainian',
  cz: 'Czech',
};

export interface HreflangEntry {
  hreflang: string;
  href: string;
}

export interface HreflangEntries {
  default: HreflangEntry;
  alternatives: HreflangEntry[];
  all: HreflangEntry[];
}

function buildLanguagePath(basePath: string, lang: string, format: HreflangFormat): string {
  const cleanPath = basePath.replace(/\/$/, '') || '/';
  
  if (format === 'query') {
    return `${cleanPath}?lang=${lang}`;
  }
  
  const prefix = lang === 'pl' ? '' : `/${lang}`;
  return `${prefix}${cleanPath}`;
}

export async function getHreflangEntries(
  basePath: string,
  currentLang: string = 'pl',
  format: HreflangFormat = 'query'
): Promise<HreflangEntries> {
  try {
    const siteUrl = await getWebsiteUrl();
    const languages = await getAvailableLanguages();
    
    if (languages.length <= 1) {
      return {
        default: { hreflang: 'x-default', href: `${siteUrl}${basePath}` },
        alternatives: [],
        all: [{ hreflang: 'x-default', href: `${siteUrl}${basePath}` }],
      };
    }

    const entries: HreflangEntry[] = languages.map(lang => {
      const hreflang = lang === 'pl' ? 'pl' : lang;
      const path = buildLanguagePath(basePath, lang, format);
      return {
        hreflang,
        href: `${siteUrl}${path}`,
      };
    });

    const defaultEntry = entries.find(e => e.hreflang === 'pl') || entries[0];
    
    return {
      default: defaultEntry,
      alternatives: entries.filter(e => e.hreflang !== defaultEntry.hreflang),
      all: entries,
    };
  } catch (error) {
    console.error('Error building hreflang entries:', error);
    const siteUrl = await getWebsiteUrl().catch(() => 'https://example.com');
    return {
      default: { hreflang: 'x-default', href: `${siteUrl}${basePath}` },
      alternatives: [],
      all: [{ hreflang: 'x-default', href: `${siteUrl}${basePath}` }],
    };
  }
}

export function formatMetadataLanguages(
  hreflangEntries: HreflangEntry[]
): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  for (const entry of hreflangEntries) {
    alternates[entry.hreflang] = entry.href;
  }
  
  return alternates;
}

export async function buildAlternatesMetadata(
  basePath: string,
  currentLang: string = 'pl',
  format: HreflangFormat = 'query'
) {
  const entries = await getHreflangEntries(basePath, currentLang, format);
  
  return {
    canonical: entries.default.href,
    languages: formatMetadataLanguages(entries.all),
  };
}

export function isDefaultLanguage(lang: string): boolean {
  return lang === 'pl';
}

export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}

export function isValidLanguageCode(code: string): boolean {
  return code in LANGUAGE_NAMES;
}

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES);
