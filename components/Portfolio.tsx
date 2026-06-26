'use client';

import { CmsText, CmsButton } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';
import Image from 'next/image';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getStaticTranslation } from '@/features/languages/staticTranslations';

function translate(key: string, category: string, lang: string, fallback: string): string {
  if (lang === 'pl') return fallback;
  const translated = getStaticTranslation(key, category, lang);
  return translated || fallback;
}

function MediaContent({ src, alt, isVideo }: { src: string; alt: string; isVideo: boolean }) {
  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    );
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
    />
  );
}

export default function Portfolio({ pageData }: { pageData?: PageData }) {
  const { language } = useLanguage();
  
  const getProjects = () => {
    const lang = language || 'pl';
    
    return [
      {
        id: 1,
        image: '/images/biuro-on.webp',
        title: translate('Przestrzeń biurowa', 'portfolio', lang, 'Przestrzeń biurowa'),
        category: translate('Biura', 'portfolio', lang, 'Biura'),
        className: 'md:col-span-2 md:row-span-2'
      },
      {
        id: 2,
        image: '/images/conferencia-on.webp',
        title: translate('Sala konferencyjna', 'portfolio', lang, 'Sala konferencyjna'),
        category: translate('Biznes', 'portfolio', lang, 'Biznes'),
        className: 'md:col-span-1 md:row-span-1'
      },
      {
        id: 3,
        image: '/images/hotel-on.webp',
        title: translate('Apartament hotelowy', 'portfolio', lang, 'Apartament hotelowy'),
        category: translate('Hotele', 'portfolio', lang, 'Hotele'),
        className: 'md:col-span-1 md:row-span-1'
      },
      {
        id: 4,
        image: '/images/bano-on.webp',
        title: translate('Łazienka premium', 'portfolio', lang, 'Łazienka premium'),
        category: translate('Prywatne', 'portfolio', lang, 'Prywatne'),
        className: 'md:col-span-1 md:row-span-2'
      },
      {
        id: 5,
        image: '/images/oficina-on.webp',
        title: translate('Open space', 'portfolio', lang, 'Open space'),
        category: translate('Biura', 'portfolio', lang, 'Biura'),
        className: 'md:col-span-1 md:row-span-1'
      },
      {
        id: 6,
        image: '/images/biuro-off.webp',
        title: translate('Prywatny gabinet', 'portfolio', lang, 'Prywatny gabinet'),
        category: translate('Biura', 'portfolio', lang, 'Biura'),
        className: 'md:col-span-2 md:row-span-1'
      },
      {
        id: 7,
        image: '/images/hotel-off.webp',
        title: translate('Strefa relaksu', 'portfolio', lang, 'Strefa relaksu'),
        category: translate('Hotele', 'portfolio', lang, 'Hotele'),
        className: 'md:col-span-1 md:row-span-1'
      }
    ];
  };

  const isVideo = (url: string): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('video');
  };

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <CMSEditable cmsKey="realizacje_subtitle">
            <CmsText pageData={pageData} sectionKey="realizacje_subtitle" fallback="NASZE REALIZACJE" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          </CMSEditable>
          <CMSEditable cmsKey="realizacje_title_19">
            <CmsText pageData={pageData} sectionKey="realizacje_title_19" fallback="Nasze realizacje" as="h2" className="text-3xl md:text-5xl font-light text-gray-900 mb-6" />
          </CMSEditable>
          <CMSEditable cmsKey="realizacje_subtitle_20">
            <CmsText pageData={pageData} sectionKey="realizacje_subtitle_20" fallback="Zobacz jak folia PDLC transformuje wnętrza w całej Polsce. Od małych biur po luksusowe rezydencje." as="p" className="text-gray-500 max-w-2xl mx-auto leading-relaxed" />
          </CMSEditable>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[300px]">
          {pageData?.projects && pageData.projects.length > 0 ? (
            pageData.projects.map((project: any, index: number) => {
              const mainMedia = project.video_url || project.image_url || project.image || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600';
              const hasVideo = isVideo(mainMedia);
              
              return (
                <div 
                  key={project.id} 
                  className={`group relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm min-h-[300px] cursor-pointer ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : 
                    index === 3 ? 'md:col-span-1 md:row-span-2' : 
                    index === 5 ? 'md:col-span-2 md:row-span-1' : ''
                  }`}
                >
                  <a href={`/realizacje/${project.id}`} className="block w-full h-full">
                    {hasVideo ? (
                      <video
                        src={mainMedia}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <img 
                        src={mainMedia} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    )}
                  </a>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-cyan text-xs font-medium tracking-widest uppercase mb-2">{project.category || 'Realizacja'}</p>
                      <h3 className="text-white font-light text-2xl">{project.title}</h3>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            getProjects().map((project) => (
              <div 
                key={project.id} 
                className={`group relative overflow-hidden rounded-2xl bg-gray-100 min-h-[300px] ${project.className}`}
              >
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-cyan text-xs font-medium tracking-widest uppercase mb-2">{project.category}</p>
                    <h3 className="text-white font-light text-2xl">{project.title}</h3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <CMSEditable cmsKey="portfolio_button">
            <CmsButton 
              pageData={pageData} 
              sectionKey="portfolio_button" 
              fallbackText="Zobacz wszystkie realizacje" 
              fallbackHref="/realizacje" 
              className="inline-flex items-center justify-center bg-gray-900 text-white font-medium px-8 py-4 rounded-xl hover:bg-cyan hover:text-black transition-all duration-300" 
            />
          </CMSEditable>
        </div>
      </div>
    </section>
  );
}