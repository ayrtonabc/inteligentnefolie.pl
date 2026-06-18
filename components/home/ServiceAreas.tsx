'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

const cities = [
  { name: { pl: 'Białystok', en: 'Białystok', de: 'Białystok', cz: 'Białystok' }, slug: 'bialystok' },
  { name: { pl: 'Biłgoraj', en: 'Biłgoraj', de: 'Biłgoraj', cz: 'Biłgoraj' }, slug: 'bilgoraj' },
  { name: { pl: 'Gdańsk', en: 'Gdańsk', de: 'Gdańsk', cz: 'Gdańsk' }, slug: 'gdansk' },
  { name: { pl: 'Kielce', en: 'Kielce', de: 'Kielce', cz: 'Kielce' }, slug: 'kielce' },
  { name: { pl: 'Kraków', en: 'Kraków', de: 'Kraków', cz: 'Kraków' }, slug: 'krakow' },
  { name: { pl: 'Łódź', en: 'Łódź', de: 'Łódź', cz: 'Łódź' }, slug: 'lodz' },
  { name: { pl: 'Mysłowice', en: 'Mysłowice', de: 'Mysłowice', cz: 'Mysłowice' }, slug: 'myslowice' },
  { name: { pl: 'Opole', en: 'Opole', de: 'Opole', cz: 'Opole' }, slug: 'opole' },
  { name: { pl: 'Poznań', en: 'Poznań', de: 'Poznań', cz: 'Poznań' }, slug: 'poznan' },
  { name: { pl: 'Rzeszów', en: 'Rzeszów', de: 'Rzeszów', cz: 'Rzeszów' }, slug: 'rzeszow' },
  { name: { pl: 'Szczecin', en: 'Szczecin', de: 'Szczecin', cz: 'Szczecin' }, slug: 'szczecin' },
  { name: { pl: 'Tarnobrzeg', en: 'Tarnobrzeg', de: 'Tarnobrzeg', cz: 'Tarnobrzeg' }, slug: 'tarnobrzeg' },
  { name: { pl: 'Warszawa', en: 'Warsaw', de: 'Warschau', cz: 'Varšava' }, slug: 'warszawa' },
  { name: { pl: 'Wrocław', en: 'Wrocław', de: 'Breslau', cz: 'Vratislav' }, slug: 'wroclaw' }
];

const titles: Record<string, string> = {
  pl: 'Obszar działania - Cała Polska',
  en: 'Service Area - All of Poland',
  de: 'Servicegebiet - Ganz Polen',
  cz: 'Oblast působnosti - Celé Polsko',
  es: 'Área de servicio - Toda Polonia',
  ua: 'Зона обслуговування - вся Польща'
};

export default function ServiceAreas() {
  const { language } = useLanguage();
  const lang = language || 'pl';
  const title = titles[lang] || titles.pl;
  
  const getCityName = (city: typeof cities[0]) => city.name[lang as keyof typeof city.name] || city.name.pl;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-xl font-light text-gray-900 mb-8 flex items-center justify-center gap-2">
          <MapPin className="text-cyan" size={20} />
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {cities.map((city, idx) => (
            <Link 
              key={idx} 
              href={`/folia-inteligentna-${city.slug}`}
              className="text-gray-500 hover:text-cyan transition-colors text-sm font-medium"
            >
              {getCityName(city)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}