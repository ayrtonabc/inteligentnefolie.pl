'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Facebook, Instagram, Youtube, Music2, ChevronDown, Linkedin, Phone, Mail } from 'lucide-react';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData, getPageContentValue } from '@/lib/pageData';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import mapa from '../mapa.png';

function useLocalizedPath() {
  const { getLocalizedPath } = useLanguage();
  return getLocalizedPath;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const FLAG_SRCS = {
  pl: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="1" y="0" fill="#ffffff"/><rect width="3" height="1" y="1" fill="#dc143c"/></svg>`),
  en: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30"><rect width="50" height="30" fill="#012169"/><path d="M0,0 L50,30 M50,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L50,30 M50,0 L0,30" stroke="#C8102E" stroke-width="4"/><path d="M25,0 v30 M0,15 h50" stroke="#fff" stroke-width="10"/><path d="M25,0 v30 M0,15 h50" stroke="#C8102E" stroke-width="6"/></svg>`),
  es: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#ffc400"/></svg>`),
  de: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3"><rect width="5" height="3" y="0" fill="#000000"/><rect width="5" height="2" y="1" fill="#dd0000"/><rect width="5" height="1" y="2" fill="#ffce00"/></svg>`),
  ua: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#0057b7"/><rect width="3" height="1" y="1" fill="#ffd700"/></svg>`),
  cz: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#ffffff"/><rect width="3" height="1" y="1" fill="#d7141a"/><path d="M0,0 L1.5,1 L0,2 Z" fill="#11457e"/></svg>`),
} as const;

const LANGUAGES = [
  { code: 'pl' as const, label: 'Polski', flag: FLAG_SRCS.pl },
  { code: 'en' as const, label: 'English', flag: FLAG_SRCS.en },
  { code: 'es' as const, label: 'Español', flag: FLAG_SRCS.es },
  { code: 'de' as const, label: 'Deutsch', flag: FLAG_SRCS.de },
  { code: 'ua' as const, label: 'Українська', flag: FLAG_SRCS.ua },
  { code: 'cz' as const, label: 'Čeština', flag: FLAG_SRCS.cz },
];

type LanguageCode = keyof typeof FLAG_SRCS;

export default function Header({ pageData }: { pageData?: PageData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [availableLangs, setAvailableLangs] = useState<string[]>(['pl']);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAvailableLanguages = async () => {
      try {
        const { getAvailableLanguages } = await import('@/lib/cms');
        // Use forceRefresh to get latest languages from DB
        const langs = await getAvailableLanguages(true);
        console.log('[Header] Available languages:', langs);
        setAvailableLangs(langs.length > 0 ? langs : ['pl']);
      } catch (err) {
        console.error('Error fetching available languages:', err);
        setAvailableLangs(['pl']);
      }
    };
    fetchAvailableLanguages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setAndPersistLanguage = useCallback((code: LanguageCode) => {
    setLanguage(code);
    setLangOpen(false);
  }, [setLanguage]);
  
  const linkClass = (path: string) =>
    `relative text-[13px] uppercase tracking-[0.15em] font-light transition-colors duration-500 py-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
      isActive(path) ? 'text-white' : 'text-gray-200 hover:text-white group'
    }`;

  // ... (Contact Info y Menu logic se mantiene igual, cambiamos el JSX)


  // Contact Info
  const phone1 = getPageContentValue(pageData, 'header_phone_1', '+48 123 456 789');
  const phone2 = getPageContentValue(pageData, 'header_phone_2', '+48 600 959 905');
  const email = getPageContentValue(pageData, 'header_email', 'kontakt@inteligentnefolie.pl');
  const logo = getPageContentValue(pageData, 'header_logo', '/logo.webp');

  // Dynamic Menu
  const defaultMenu: MenuItem[] = [
    { id: '1', label: getTranslation(language, 'nav.home') || 'Strona główna', href: '/', order: 0 },
    { id: '2', label: 'O nas', href: '/o-nas', order: 1 },
    { id: '3', label: getTranslation(language, 'nav.products') || 'Produkty', href: '/sklep', order: 2 },
    { id: '4', label: getTranslation(language, 'nav.services') || 'Usługi', href: '/montaz-folii-inteligentnej', order: 3 },
    { id: '5', label: getTranslation(language, 'nav.portfolio') || 'Realizacje', href: '/realizacje', order: 4 },
    { id: '6', label: getTranslation(language, 'nav.blog') || 'Blog', href: '/blog', order: 5 },
    { id: '7', label: getTranslation(language, 'nav.contact') || 'Kontakt', href: '/kontakt', order: 6 }
  ];

  const menuItems: MenuItem[] = pageData?.settings?.main_menu || defaultMenu;
  const sortedMenu = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Filter languages based on what's available in PocketBase
  const activeLanguages = LANGUAGES.filter(lang => availableLangs.includes(lang.code));
  
  const getLocalizedPath = useLocalizedPath();

  const getNavHref = (href: string) => {
    if (href === '/') {
      return getLocalizedPath('/');
    }
    return getLocalizedPath(href);
  };

  return (
    <header className={`w-full text-white fixed top-0 z-50 transition-all duration-500 font-light ${
      isScrolled || pathname !== '/'
        ? 'bg-black/95 backdrop-blur-md py-0 shadow-2xl' 
        : 'bg-transparent py-2'
    }`}>
      <div className={`hidden lg:block transition-all duration-500 overflow-hidden h-[36px] ${
        isScrolled || pathname !== '/' ? 'bg-black/40 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-8">
            <CMSEditable cmsKey="header_phone_1">
              <a href={`tel:${phone1}`} data-contact="phone-1" className="hover:text-white transition-colors duration-300">{phone1}</a>
            </CMSEditable>
            <CMSEditable cmsKey="header_phone_2">
              <a href={`tel:${phone2}`} data-contact="phone-2" className="hover:text-white transition-colors duration-300">{phone2}</a>
            </CMSEditable>
            <CMSEditable cmsKey="header_email">
              <a href={`mailto:${email}`} data-contact="email" className="hover:text-white transition-colors duration-300">{email}</a>
            </CMSEditable>
          </div>
          <a 
            href="https://scianki-szklane.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-300 hover:text-cyan transition-colors duration-300 tracking-wide"
          >
            <b>scianki-szklane</b>
          </a>
          <div className="flex items-center gap-3">
            <a href="https://x.com/micha435038?s=21" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-gray-200 group-hover:fill-black transition-colors duration-300" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
              </svg>
            </a>
            <a href="http://www.linkedin.com/in/micha%C5%82-janczak-994690113" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <Linkedin size={12} className="text-gray-200 group-hover:text-black transition-colors duration-300" />
            </a>
            <a href="https://www.tiktok.com/@inteligentne.scianki" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <Music2 size={12} className="text-gray-200 group-hover:text-black transition-colors duration-300" />
            </a>
            <a href="https://www.facebook.com/sciankiszkalne" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <Facebook size={12} className="text-gray-200 group-hover:text-black transition-colors duration-300" />
            </a>
            <a href="https://www.instagram.com/inteligentne.folie" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <Instagram size={12} className="text-gray-200 group-hover:text-black transition-colors duration-300" />
            </a>
            <a href="https://www.youtube.com/@inteligentne.scianki-szklane" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 group">
              <Youtube size={12} className="text-gray-200 group-hover:text-black transition-colors duration-300" />
            </a>
          </div>
        </div>
      </div>
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-500 ${isScrolled ? 'py-2 md:py-3' : 'py-3 md:py-4'}`}>
        <div className="flex items-center justify-between gap-12 h-full">
          <div className="flex-shrink-0 flex items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-500">
              <CMSEditable cmsKey="header_logo" className="block">
                <Image
                  src={logo || '/logo.webp'}
                  alt="Inteligentne Folie"
                  className="h-8 md:h-11 w-auto opacity-100"
                  width={120}
                  height={40}
                  priority
                />
              </CMSEditable>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-x-10 xl:gap-x-14 h-full relative z-20">
            {sortedMenu.map((item) => (
              <Link key={item.id} href={getNavHref(item.href)} className={`flex items-center h-full ${linkClass(item.href)} relative group`}>
                {item.label}
                {/* Active Underline */}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
                )}
                {/* Hover Underline */}
                {!isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6 justify-end flex-shrink-0 h-full">
            <a
              href={`tel:${(phone1 || phone2 || '').trim()}`}
              data-contact={(phone1 || '').trim() ? 'phone-1' : 'phone-2'}
              className="lg:hidden flex items-center gap-2 text-[10px] font-medium text-white/90 hover:text-white transition-colors"
            >
              <Phone size={12} className="text-white/50" />
              <span>{(phone1 || phone2 || '').trim()}</span>
            </a>
            <div className="relative flex items-center" ref={langRef}>
              <img
                src={mapa.src}
                alt="Mapa"
                className="hidden lg:block absolute right-full mr-8 top-1/2 -translate-y-1/2 h-[100px] w-[100px] max-w-none object-contain opacity-80 mix-blend-screen pointer-events-none -z-10"
              />
              <div 
                className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                onClick={() => setLangOpen(!langOpen)}
              >
                <div className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center bg-gray-900 border border-white/10">
                  <img
                    src={FLAG_SRCS[language]}
                    alt={activeLanguages.find((l) => l.code === language)?.label}
                    className="h-full w-full object-cover scale-110"
                  />
                </div>
                <ChevronDown size={12} className={`text-gray-400 group-hover:text-white transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </div>

              {langOpen && (
                <div className="absolute top-full right-0 mt-3 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  {activeLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setAndPersistLanguage(lang.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all duration-300 ${
                        language === lang.code ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full overflow-hidden shrink-0 border border-white/10">
                        <img src={lang.flag} alt={lang.label} className="h-full w-full object-cover" />
                      </div>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden mt-6 pb-6 pt-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-black px-4 -mx-6">
            {sortedMenu.map((item) => (
              <Link 
                key={item.id} 
                href={getNavHref(item.href)} 
                className={`text-[13px] uppercase tracking-[0.15em] font-light py-2 px-4 rounded-lg transition-colors duration-300 ${isActive(item.href) ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex flex-col gap-4 px-4 pt-6 mt-2 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <a href={`tel:${phone1}`} className="flex items-center gap-4 text-xs text-gray-300 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Phone size={14} className="text-gray-400 group-hover:text-white" />
                  </div>
                  {phone1}
                </a>
                <a href={`tel:${phone2}`} className="flex items-center gap-4 text-xs text-gray-300 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Phone size={14} className="text-gray-400 group-hover:text-white" />
                  </div>
                  {phone2}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-4 text-xs text-gray-300 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Mail size={14} className="text-gray-400 group-hover:text-white" />
                  </div>
                  {email}
                </a>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <a href="https://x.com/micha435038?s=21" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
                  </svg>
                </a>
                <a href="http://www.linkedin.com/in/micha%C5%82-janczak-994690113" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <Linkedin size={16} />
                </a>
                <a href="https://www.tiktok.com/@inteligentne.scianki" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <Music2 size={16} />
                </a>
                <a href="https://www.facebook.com/sciankiszkalne" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="https://www.instagram.com/inteligentne.folie" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="https://www.youtube.com/@inteligentne.scianki-szklane" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/5 transition-colors">
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
