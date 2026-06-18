'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type LanguageCode = 'pl' | 'en' | 'es' | 'de' | 'ua' | 'cz';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  getLocalizedPath: (path?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('pl');
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') as LanguageCode;
    
    if (urlLang && ['pl', 'en', 'es', 'de', 'ua', 'cz'].includes(urlLang)) {
      setLanguageState(urlLang);
      return;
    }

    const stored = window.localStorage.getItem('language') as LanguageCode;
    if (stored && ['pl', 'en', 'es', 'de', 'ua', 'cz'].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname.startsWith('/panel') || pathname.startsWith('/preview') || pathname.startsWith('/_next')) {
      return;
    }
    
    const url = new URL(window.location.href);
    if (!url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, [language, pathname]);

  const getLocalizedPath = useCallback((path?: string): string => {
    const targetPath = path || pathname;
    
    if (targetPath.startsWith('/panel') || targetPath.startsWith('/preview') || targetPath.startsWith('/_next') || targetPath.startsWith('http')) {
      return targetPath;
    }
    
    const hasLang = targetPath.includes('?lang=');
    if (hasLang) {
      return targetPath;
    }
    
    const separator = targetPath.includes('?') ? '&' : '?';
    return `${targetPath}${separator}lang=${language}`;
  }, [language, pathname]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    window.localStorage.setItem('language', lang);
    
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    const newUrl = url.pathname + url.search;
    window.location.href = newUrl;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getLocalizedPath }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useLocalizedRouter() {
  const { getLocalizedPath } = useLanguage();
  return { pushLocalized: (path: string) => window.location.href = getLocalizedPath(path) };
}