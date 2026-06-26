'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { getPageContentValue } from '@/lib/pageData';

const defaultColors = [
  { code: 'T16', hex: '#1a1a1a', nameKey: 'colors_name_t16', nameFallback: { pl: 'Czarny', en: 'Black', de: 'Schwarz', cz: 'Černá', es: 'Negro', ua: 'Чорний' }},
  { code: 'T91', hex: '#ffffff', border: true, nameKey: 'colors_name_t91', nameFallback: { pl: 'Biały (wysoka przezroczystość)', en: 'White (high transparency)', de: 'Weiß (hohe Transparenz)', cz: 'Bílá (vysoká průhlednost)', es: 'Blanco (alta transparencia)', ua: 'Білий (висока прозорість)' }},
  { code: 'T83', hex: '#f3f4f6', nameKey: 'colors_name_t83', nameFallback: { pl: 'Biały (normalna przezroczystość)', en: 'White (normal transparency)', de: 'Weiß (normale Transparenz)', cz: 'Bílá (normální průhlednost)', es: 'Blanco (transparencia normal)', ua: 'Білий (нормальна прозорість)' }},
  { code: 'T60', hex: '#9ca3af', nameKey: 'colors_name_t60', nameFallback: { pl: 'Jasnoszary', en: 'Light gray', de: 'Hellgrau', cz: 'Světle šedá', es: 'Gris claro', ua: 'Світло-сірий' }},
  { code: 'T40', hex: '#4a4a4a', nameKey: 'colors_name_t40', nameFallback: { pl: 'Ciemnoszary', en: 'Dark gray', de: 'Dunkelgrau', cz: 'Tmavě šedá', es: 'Gris oscuro', ua: 'Темно-сірий' }},
];

const defaultSubtitle: Record<string, string> = {
  pl: 'ESTETYKA',
  en: 'AESTHETICS',
  de: 'ÄSTHETIK',
  cz: 'ESTETIKA',
  es: 'ESTÉTICA',
  ua: 'ЕСТЕТИКА',
};

const defaultTitle: Record<string, string> = {
  pl: 'Dostępne kolory folii PDLC',
  en: 'Available PDLC film colors',
  de: 'Verfügbare PDLC-Folienfarben',
  cz: 'Dostupné barvy PDLC fólie',
  es: 'Colores disponibles de película PDLC',
  ua: 'Доступні кольори плівки PDLC',
};

export default function Colors({ pageData }: { pageData?: any }) {
  const { language } = useLanguage();
  const lang = language || 'pl';

  const subtitle = getPageContentValue(pageData, 'colors_subtitle', '', lang) || defaultSubtitle[lang] || defaultSubtitle.pl;
  const title = getPageContentValue(pageData, 'colors_title', '', lang) || defaultTitle[lang] || defaultTitle.pl;

  const getColorName = (color: typeof defaultColors[0]) => {
    const cmsValue = getPageContentValue(pageData, color.nameKey, '', lang);
    if (cmsValue) return cmsValue;
    return color.nameFallback[lang] || color.nameFallback.pl;
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4">{subtitle}</p>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">{title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {defaultColors.map((color, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
              <div
                className={`w-16 h-16 rounded-full mb-4 shadow-inner ${color.border ? 'border-2 border-gray-200' : ''}`}
                style={{ backgroundColor: color.hex }}
              />
              <h3 className="font-bold text-gray-900 text-xl mb-1">{color.code}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {getColorName(color)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}