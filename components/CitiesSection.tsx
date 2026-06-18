'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { seoCities } from '@/lib/seoLocalData';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTranslation } from '@/lib/translations';

export default function CitiesSection() {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <section data-section="cities" className="bg-gray-50 py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-cyan mb-2">
            <MapPin size={18} />
            <h2 data-cms-role="title" className="text-sm font-medium uppercase tracking-widest">{t.common.service_area}</h2>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {seoCities.map((city) => (
            <Link 
              key={city.slug} 
              href={`/folia-inteligentna-${city.slug}`}
              className="text-gray-400 hover:text-cyan text-xs font-medium transition-colors"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
