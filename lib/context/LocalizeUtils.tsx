'use client';

import { useLanguage } from './LanguageContext';
import Link, { LinkProps } from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  preserveLang?: boolean;
}

export function LocalizedLink({ href, preserveLang = true, ...props }: LocalizedLinkProps) {
  const { language } = useLanguage();
  
  const finalHref = useMemo(() => {
    if (!preserveLang || !href) return href;
    
    const url = new URL(href, 'http://localhost');
    const pathname = url.pathname;
    
    if (pathname === '/' || pathname.startsWith('/panel') || pathname.startsWith('/preview')) {
      return href;
    }
    
    const hasLang = url.searchParams.has('lang');
    
    if (!hasLang && language && language !== 'pl') {
      const separator = href.includes('?') ? '&' : '?';
      return `${href}${separator}lang=${language}`;
    }
    
    return href;
  }, [href, preserveLang, language]);

  return <Link href={finalHref} {...props} />;
}

export function useLocalizedPath() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const getLocalizedPath = (path: string = pathname) => {
    if (!path || path.startsWith('/panel') || path.startsWith('/preview')) {
      return path;
    }
    
    const currentLang = searchParams.get('lang');
    
    if (currentLang) {
      return path;
    }
    
    if (language && language !== 'pl') {
      const separator = path.includes('?') ? '&' : '?';
      return `${path}${separator}lang=${language}`;
    }
    
    return path;
  };
  
  return { pathname, language, getLocalizedPath };
}