'use client';

import { useState, useEffect } from 'react';
import { CmsText } from '@/components/cms/CmsServerComponents';
import { PageData } from '@/lib/pageData';
import { Star } from 'lucide-react';
import { getTestimonials, Testimonial } from '@/lib/cms';
import { useLanguage } from '@/lib/context/LanguageContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function References({ pageData }: { pageData?: PageData }) {
  const { language } = useLanguage();
  const lang = language || 'pl';
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  useEffect(() => {
    getTestimonials(lang).then(setTestimonials);
  }, [lang]);
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <CmsText pageData={pageData} sectionKey="home_refs_subtitle" fallback="OPINIE KLIENTÓW" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          <CmsText pageData={pageData} sectionKey="home_refs_title" fallback="Co mówią o nas klienci" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.length > 0 ? (
            testimonials.slice(0, 3).map((review: Testimonial) => (
              <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium text-gray-900 text-sm leading-tight">{review.name}</p>
                  <GoogleIcon />
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      fill={s <= review.rating ? "currentColor" : "none"} 
                      className={s <= review.rating ? "text-[#FBBC05]" : "text-gray-300"} 
                      strokeWidth={0} 
                      size={18} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-grow">{review.review_text}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Brak opinii do wyświetlenia. Dodaj opinie w Panelu Admina.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}