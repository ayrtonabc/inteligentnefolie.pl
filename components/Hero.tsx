'use client';

import { useState, useEffect, useRef } from 'react';
import { CmsText, CmsButton, CmsImage } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

const SLIDES = [
  {
    id: 0,
    bgKey: 'home_hero_bg_2',
    bgFallback: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=900',
    titleKey: 'home_hero_title_0',
    titleFallback: 'Inteligentne folie PDLC i LCD na okna',
    subtitleKey: 'home_hero_subtitle_1',
    subtitleFallback: 'Prywatność na żądanie bez rolet — do domu, biura i hoteli.'
  },
  {
    id: 1,
    bgKey: 'home_hero_bg_slide2',
    bgFallback: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=900',
    titleKey: 'home_hero_title_slide2',
    titleFallback: 'Nowoczesne biuro z klasą',
    subtitleKey: 'home_hero_subtitle_slide2',
    subtitleFallback: 'Szkło przełączalne dla Twojej przestrzeni biznesowej.'
  },
  {
    id: 2,
    bgKey: 'home_hero_bg_slide3',
    bgFallback: 'https://images.pexels.com/photos/2736834/pexels-photo-2736834.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=900',
    titleKey: 'home_hero_title_slide3',
    titleFallback: 'Elegancja i dyskrecja',
    subtitleKey: 'home_hero_subtitle_slide3',
    subtitleFallback: 'Zmień przezroczystość szkła jednym kliknięciem.'
  }
];

export default function Hero({ pageData }: { pageData?: PageData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const previousSlideRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previousSlideRef.current !== currentSlide) {
      setPreviousSlide(previousSlideRef.current);
      previousSlideRef.current = currentSlide;
    }
  }, [currentSlide]);

  const active = SLIDES[currentSlide];
  const prev = previousSlide !== null && previousSlide !== currentSlide ? SLIDES[previousSlide] : null;

  return (
    <section className="relative w-full h-screen min-h-[600px] md:min-h-[700px] bg-black overflow-hidden">
      {/* Background Slides (SHARED) */}
      {prev && (
        <div
          key={`bg-prev-${prev.id}`}
          className="absolute inset-0 transition-opacity [transition-duration:1500ms] ease-in-out z-0 opacity-0"
          data-cms-section={prev.bgKey}
          data-cms-type="image"
          data-cms-marked="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10 pointer-events-none" />
          <CmsImage
            pageData={pageData}
            sectionKey={prev.bgKey}
            fallback={prev.bgFallback}
            alt="Hero Slide Previous"
            fill
            sizes="100vw"
            className="opacity-90"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      <div
        key={`bg-active-${active.id}`}
        className="absolute inset-0 transition-opacity [transition-duration:1500ms] ease-in-out z-0 opacity-100"
        data-cms-section={active.bgKey}
        data-cms-type="image"
        data-cms-marked="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10 pointer-events-none" />
        <CmsImage
          pageData={pageData}
          sectionKey={active.bgKey}
          fallback={active.bgFallback}
          alt={`Hero Slide ${currentSlide + 1}`}
          fill
          sizes="100vw"
          className="opacity-90"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Top Gradient for Navbar Contrast (SHARED) */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* ========================================================================
          DESKTOP VERSION (Hidden on Mobile)
          Exact original layout as requested
          ======================================================================== */}
      <div className="hidden md:block absolute bottom-0 left-0 w-full z-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="relative min-h-[220px]">
              <div key={`desktop-text-${active.id}`} className={`absolute bottom-0 left-0 w-full ${currentSlide === 0 ? 'pt-24' : ''}`}>
                <CMSEditable cmsKey={active.titleKey} as="h1" className="text-6xl lg:text-7xl font-light text-white mb-6 leading-tight tracking-tight">
                  <CmsText pageData={pageData} sectionKey={active.titleKey} fallback={active.titleFallback} as="span" />
                </CMSEditable>
                <CMSEditable cmsKey={active.subtitleKey} as="p" className="text-2xl text-gray-300 mb-10 font-light leading-relaxed max-w-2xl">
                  <CmsText pageData={pageData} sectionKey={active.subtitleKey} fallback={active.subtitleFallback} as="span" />
                </CMSEditable>
              </div>
            </div>
            
            <div className="flex gap-5 relative z-30 mt-6">
              <CmsButton pageData={pageData} sectionKey="hero_button_primary" fallbackText="Kontakt" fallbackHref="/kontakt" className="bg-white text-black font-medium px-10 py-4 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" />
              <CmsButton pageData={pageData} sectionKey="hero_button_secondary" fallbackText="Zobacz produkty" fallbackHref="/sklep" className="bg-transparent border border-white/30 text-white font-medium px-10 py-4 text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2" />
            </div>
            
            <div className="flex gap-8 mt-16 border-t border-white/10 pt-8 relative z-30">
              <div className="flex gap-4 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan"></div>
                <CMSEditable cmsKey="home_hero_benefit_1">
                  <CmsText pageData={pageData} sectionKey="home_hero_benefit_1" fallback="Montaż w całej Polsce" className="text-gray-300 font-light text-sm uppercase tracking-wider" />
                </CMSEditable>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan"></div>
                <CMSEditable cmsKey="home_hero_benefit_2">
                  <CmsText pageData={pageData} sectionKey="home_hero_benefit_2" fallback="10 lat gwarancji" className="text-gray-300 font-light text-sm uppercase tracking-wider" />
                </CMSEditable>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan"></div>
                <CMSEditable cmsKey="home_hero_benefit_3">
                  <CmsText pageData={pageData} sectionKey="home_hero_benefit_3" fallback="Szybka wycena" className="text-gray-300 font-light text-sm uppercase tracking-wider" />
                </CMSEditable>
              </div>
            </div>
            
            {/* Slider Controls */}
            <div className="flex gap-3 mt-12 relative z-30 items-center">
              {SLIDES.map((_, index) => (
                <button
                  key={`control-desktop-${index}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-500 ease-in-out ${index === currentSlide ? 'w-16 bg-white' : 'w-6 bg-white/30 hover:bg-white/60'}`}
                  aria-label={`Go to slide ${index + 1}`}
                  data-cms-key={SLIDES[index].bgKey}
                />
              ))}
              <div className="ml-4 text-xs font-light text-white/50 tracking-widest uppercase">
                0{currentSlide + 1} / 0{SLIDES.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          MOBILE VERSION (Hidden on Desktop)
          Optimized for small screens to avoid overlap
          ======================================================================== */}
      <div className="md:hidden absolute inset-0 z-20 flex flex-col justify-end pb-12 pt-28 px-6">
        <div className="w-full">
          <div className="relative min-h-[160px]">
            <div key={`mobile-text-${active.id}`} className="absolute bottom-0 left-0 w-full">
              <CMSEditable cmsKey={active.titleKey} as="h1" className="text-3xl font-light text-white mb-4 leading-[1.1] tracking-tight">
                <CmsText pageData={pageData} sectionKey={active.titleKey} fallback={active.titleFallback} as="span" />
              </CMSEditable>
              <CMSEditable cmsKey={active.subtitleKey} as="p" className="text-base text-gray-300 mb-8 font-light leading-relaxed">
                <CmsText pageData={pageData} sectionKey={active.subtitleKey} fallback={active.subtitleFallback} as="span" />
              </CMSEditable>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 relative z-30 mt-4">
            <CmsButton pageData={pageData} sectionKey="hero_button_primary" fallbackText="Kontakt" fallbackHref="/kontakt" className="bg-white text-black font-medium w-full py-4 text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" />
            <CmsButton pageData={pageData} sectionKey="hero_button_secondary" fallbackText="Zobacz produkty" fallbackHref="/sklep" className="bg-transparent border border-white/30 text-white font-medium w-full py-4 text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2" />
          </div>
          
          <div className="flex flex-col gap-3 mt-10 border-t border-white/10 pt-6 relative z-30">
            <div className="flex gap-4 items-center">
              <div className="w-1 h-1 rounded-full bg-cyan"></div>
              <CmsText pageData={pageData} sectionKey="home_hero_benefit_1" fallback="Montaż w całej Polsce" className="text-gray-300 font-light text-[10px] uppercase tracking-wider" />
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-1 h-1 rounded-full bg-cyan"></div>
              <CmsText pageData={pageData} sectionKey="home_hero_benefit_2" fallback="10 lat gwarancji" className="text-gray-300 font-light text-[10px] uppercase tracking-wider" />
            </div>
          </div>
          
          {/* Slider Controls */}
          <div className="flex gap-2 mt-10 relative z-30 items-center">
            {SLIDES.map((_, index) => (
              <button
                key={`control-mobile-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-0.5 transition-all duration-500 ease-in-out ${index === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/30'}`}
                aria-label={`Go to slide ${index + 1}`}
                data-cms-key={SLIDES[index].bgKey}
              />
            ))}
            <div className="ml-3 text-[10px] font-light text-white/50 tracking-widest uppercase">
              0{currentSlide + 1} / 0{SLIDES.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
