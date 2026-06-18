'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from './LanguageContext';

export function useLangSync() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentLang = searchParams.get('lang');
    
    if (pathname.startsWith('/panel') || pathname.startsWith('/preview') || pathname.startsWith('/_next')) {
      return;
    }
    
    if (!currentLang && language) {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('lang')) {
        url.searchParams.set('lang', language);
        const newUrl = url.pathname + url.search;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [pathname, searchParams, language]);
}

export function useLocalizedRouter() {
  const { language } = useLanguage();
  const pathname = usePathname();

  const getLocalizedUrl = useCallback((path: string) => {
    if (path.startsWith('/panel') || path.startsWith('/preview') || path.startsWith('/_next') || path.startsWith('http')) {
      return path;
    }
    
    const hasLang = path.includes('?lang=');
    if (hasLang) {
      return path;
    }
    
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}lang=${language}`;
  }, [language]);

  return { getLocalizedUrl };
}