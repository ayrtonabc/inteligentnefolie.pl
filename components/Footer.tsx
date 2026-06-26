'use client';

import { Facebook, Instagram, Youtube, Mail, Phone, Linkedin, Music2 } from 'lucide-react';
import Link from 'next/link';
import { PageData, getPageContentValue } from '@/lib/pageData';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function Footer({ pageData }: { pageData?: PageData }) {
  const { language } = useLanguage();
  
  const logo = getPageContentValue(pageData, 'header_logo', '/logofooter.webp');
  const desc = getPageContentValue(pageData, 'footer_description', getTranslation(language, 'common.description') || 'Inteligentne folie PDLC i LCD dla Twojego domu i biura');
  const col1Title = getPageContentValue(pageData, 'footer_col1_title', getTranslation(language, 'nav.products') || 'Produkty');
  const col2Title = getPageContentValue(pageData, 'footer_col2_title', getTranslation(language, 'common.info') || 'Informacje');
  const col3Title = getPageContentValue(pageData, 'footer_col1_title', getTranslation(language, 'nav.contact') || 'Kontakt');
  const phone = '+48 790 555 900';
  const email = 'biuro@inteligentnefolie.pl';
  const copy = '© 2025 Inteligentne Folie. Wszystkie prawa zastrzeżone.';

  // Link lists
  const menuItems = pageData?.settings?.main_menu || [];
  const col1Links = menuItems.slice(1, 4);
  const col2Links = menuItems.slice(4);
  
  return (
    <>
      <footer className="bg-black text-gray-500 font-light border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="mb-6"><img src={logo || '/logo.webp'} alt="Inteligentne Folie" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" width={120} height={40} loading="lazy" decoding="async" /></div>
            {desc && <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-sm">{desc}</p>}
            <div className="flex gap-4">
              <a href="https://x.com/micha435038?s=21" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
                </svg>
              </a>
              <a href="http://www.linkedin.com/in/micha%C5%82-janczak-994690113" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all"><Linkedin size={16} /></a>
              <a href="https://www.tiktok.com/@inteligentne.scianki" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all"><Music2 size={16} /></a>
              <a href="https://www.youtube.com/@inteligentne.scianki-szklane" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all"><Youtube size={16} /></a>
              <a href="https://www.facebook.com/sciankiszkalne" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all"><Facebook size={16} /></a>
              <a href="https://www.instagram.com/inteligentne.folie" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all"><Instagram size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">{col1Title}</h4>
            <ul className="space-y-3 text-sm">
              {col1Links.length > 0 ? col1Links.map((link: any) => (
                <li key={link.id}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
              )) : (
                <>
                  <li><Link href="/sklep" className="hover:text-white transition-colors">Inteligentne Folie</Link></li>
                  <li><Link href="/montaz-folii-inteligentnej" className="hover:text-white transition-colors">Montaż i Serwis</Link></li>
                  <li><Link href="/realizacje" className="hover:text-white transition-colors">Realizacje</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">{col2Title}</h4>
            <ul className="space-y-3 text-sm">
              {col2Links.length > 0 ? col2Links.map((link: any) => (
                <li key={link.id}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
              )) : (
                <>
                  <li><Link href="/blog" className="hover:text-white transition-colors">{getTranslation(language, 'nav.blog') || 'Blog'}</Link></li>
                  <li><Link href="/kontakt" className="hover:text-white transition-colors">{getTranslation(language, 'nav.contact') || 'Kontakt'}</Link></li>
                </>
              )}
              <li><Link href="/polityka-prywatnosci" className="hover:text-white transition-colors">
                    {language === 'en' ? 'Privacy Policy' : language === 'de' ? 'Datenschutz' : language === 'cs' ? 'Ochrana soukromí' : 'Polityka prywatności'}
                  </Link></li>
                  <li><Link href="/regulamin" className="hover:text-white transition-colors">
                    {language === 'en' ? 'Terms of Service' : language === 'de' ? 'AGB' : language === 'cs' ? 'Obchodní podmínky' : 'Regulamin'}
                  </Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">{col3Title}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><Phone size={16} className="text-gray-400" /><a href={`tel:${phone}`} className="hover:text-white transition-colors tracking-wide">{phone}</a></li>
              <li className="flex items-center gap-3"><Mail size={16} className="text-gray-400" /><a href={`mailto:${email}`} className="hover:text-white transition-colors tracking-wide">{email}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 tracking-wide text-center md:text-left">
            {copy} ul. Wspólna 3 | By <a href="https://www.scianki-szklane.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">scianki-szklane.com</a>
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
