'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLanguageDetails } from '@/lib/cms';

interface Language {
  code: string;
  name: string;
  flag: string;
}

export default function Header() {
  const pathname = usePathname();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLang, setCurrentLang] = useState('pl');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get languages from URL or default
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && ['pl', 'en', 'de', 'es', 'fr', 'it'].includes(pathParts[0])) {
      setCurrentLang(pathParts[0]);
    }

    // Fetch available languages
    getLanguageDetails().then((langs) => {
      setLanguages(langs);
    });

    // Close language menu on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  const switchLanguage = (langCode: string) => {
    // Remove current language prefix from path
    const pathParts = pathname.split('/').filter(Boolean);
    
    if (['pl', 'en', 'de', 'es', 'fr', 'it'].includes(pathParts[0])) {
      pathParts.shift();
    }
    
    let newPath: string;
    if (langCode === 'pl') {
      // For Polish, no language prefix
      newPath = '/' + pathParts.join('/');
    } else {
      // For other languages, add language prefix
      newPath = '/' + langCode + '/' + pathParts.join('/');
    }
    
    window.location.href = newPath || '/';
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || { code: 'pl', name: 'Polski', flag: '🇵🇱' };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Logo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`text-gray-700 hover:text-blue-600 ${pathname === '/' ? 'text-blue-600' : ''}`}>
              Home
            </Link>
            <Link href="/realizacje" className={`text-gray-700 hover:text-blue-600 ${pathname === '/realizacje' ? 'text-blue-600' : ''}`}>
              Realizacje
            </Link>
            <Link href="/blog" className={`text-gray-700 hover:text-blue-600 ${pathname === '/blog' ? 'text-blue-600' : ''}`}>
              Blog
            </Link>
            <Link href="/kontakt" className={`text-gray-700 hover:text-blue-600 ${pathname === '/kontakt' ? 'text-blue-600' : ''}`}>
              Kontakt
            </Link>

            {/* Language Selector - Visible when multiple languages available */}
            {languages.length > 0 && (
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors bg-white"
                  aria-label="Select language"
                  aria-expanded={isLangMenuOpen}
                >
                  <span className="text-lg" role="img" aria-label={currentLanguage.name}>
                    {currentLanguage.flag}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{currentLanguage.code.toUpperCase()}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          switchLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 transition-colors ${
                          lang.code === currentLang 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-xl" role="img" aria-label={lang.name}>
                          {lang.flag}
                        </span>
                        <span>{lang.name}</span>
                        {lang.code === currentLang && (
                          <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Mobile Language Selector */}
            {languages.length > 0 && (
              <div className="relative mr-2" ref={langMenuRef}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  aria-label="Select language"
                >
                  <span className="text-lg" role="img">{currentLanguage.flag}</span>
                  <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
                </button>

                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          switchLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                          lang.code === currentLang 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-lg ${pathname === '/' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/realizacje" 
                className={`px-4 py-2 rounded-lg ${pathname === '/realizacje' || pathname.includes('/realizacje') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Realizacje
              </Link>
              <Link 
                href="/blog" 
                className={`px-4 py-2 rounded-lg ${pathname === '/blog' || pathname.includes('/blog') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/kontakt" 
                className={`px-4 py-2 rounded-lg ${pathname === '/kontakt' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
