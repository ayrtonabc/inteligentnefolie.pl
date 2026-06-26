import { Metadata } from 'next';
import { ArrowRight, Users, Shield, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { fetchPageData, generateSEOMetadata, getPageContentValue } from '@/lib/pageData';
import { CmsText, CmsButton } from '@/components/cms/CmsComponents';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

export const revalidate = 10;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/montaz-folii-inteligentnej', lang);
  return generateSEOMetadata(pageData, '/montaz-folii-inteligentnej', {
    title: 'Montaż Foli Inteligentnych PDLC i LCD - Profesjonalne Usługi Producenta',
    description: 'Profesjonalny montaż folii inteligentnych w całej Polsce. Jako wiodący producent i instalator gwarantujemy najwyższą jakość. Montaż przez doświadczonych specjalistów.',
  });
}

const STEP_COUNT = 5;
const BENEFIT_COUNT = 4;

function hasCmsData(pageData: Awaited<ReturnType<typeof fetchPageData>> | undefined): boolean {
  if (!pageData?.content) return false;
  return pageData.content.some(
    c => c.section_key === 'hero_title' || c.section_key === 'steps_title'
  );
}

export default async function Montaz({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const pagePath = '/montaz-folii-inteligentnej';
  const params = await searchParams;
  const pageData = await fetchPageData(pagePath, params?.lang || 'pl');

  const ctaTitle = getPageContentValue(pageData, 'cta_title', '') || '';
  const ctaSubtitle = getPageContentValue(pageData, 'cta_subtitle', '') || '';

  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={pageData} />

      <section className="bg-[#0A0A0A] text-white pt-48 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <CmsText pagePath={pagePath} sectionKey="hero_title" fallback="Montaż folii krok po kroku" as="h1" className="text-4xl md:text-5xl font-bold mb-4" />
          <CmsText pagePath={pagePath} sectionKey="hero_subtitle" fallback="Profesjonalny montaż folii PDLC i LCD w całej Polsce. Od konsultacji po serwis." as="p" className="text-gray-400 max-w-2xl mx-auto text-sm" />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <CmsText pagePath={pagePath} sectionKey="steps_title" fallback="Proces montażu krok po kroku" as="h2" className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12" />
          <div className="space-y-4">
            {Array.from({ length: STEP_COUNT }).map((_, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-sm">{idx + 1}</span>
                </div>
                <div>
                  <CmsText pagePath={pagePath} sectionKey={`steps_item_${idx}_title`} fallback={`Etap ${idx + 1}`} as="h3" className="font-bold text-gray-900 mb-1" />
                  <CmsText pagePath={pagePath} sectionKey={`steps_item_${idx}_description`} fallback="Opis etapu montażu zostanie uzupełniony w panelu CMS." as="p" className="text-gray-500 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <CmsText pagePath={pagePath} sectionKey="benefits_title" fallback="Dlaczego warto wybrać nasz montaż?" as="h2" className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: BENEFIT_COUNT }).map((_, idx) => {
              const icons = [Users, Shield, Clock, MapPin];
              const Icon = icons[idx] || Shield;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                  <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-cyan" size={24} />
                  </div>
                  <CmsText pagePath={pagePath} sectionKey={`benefits_item_${idx}_title`} fallback="Zaleta montażu" as="h3" className="font-bold text-gray-900 mb-2" />
                  <CmsText pagePath={pagePath} sectionKey={`benefits_item_${idx}_description`} fallback="Krótki opis korzyści płynącej z profesjonalnego montażu." as="p" className="text-gray-500 text-sm" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cyan">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CmsText 
            pagePath={pagePath} 
            sectionKey="cta_title" 
            fallback="Zamów próbkę folii PDLC" 
            as="h2" 
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" 
          />
          <CmsText 
            pagePath={pagePath} 
            sectionKey="cta_subtitle" 
            fallback="Przekonaj się na własne oczy, jak działa technologia PDLC. Zamów próbkę demonstracyjną!" 
            as="p" 
            className="text-gray-800 mb-8 text-sm" 
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CmsButton 
              pagePath={pagePath} 
              sectionKey="cta_form_button" 
              fallbackText="Zamów próbkę demonstracyjną" 
              fallbackHref="/kontakt" 
              className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm" 
            />
            <a href="tel:+48790555900" className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <CmsText pagePath={pagePath} sectionKey="cta_phone_text" fallback="Zadzwoń: +48 790 555 900" />
            </a>
          </div>
        </div>
      </section>

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </div>
  );
}
