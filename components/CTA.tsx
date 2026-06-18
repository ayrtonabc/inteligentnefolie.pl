import { CmsText, CmsButton } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

export default function CTA({ pageData }: { pageData?: PageData }) {
  return (
    <section className="py-10 md:py-12 bg-cyan">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <CMSEditable cmsKey="cta_title_6">
          <CmsText 
            pageData={pageData} 
            sectionKey="cta_title_6" 
            fallback="Zamów darmową próbkę folii PDLC" 
            as="h2" 
            className="text-[28px] md:text-[36px] font-bold text-black mb-3 leading-tight" 
          />
        </CMSEditable>
        <CMSEditable cmsKey="cta_subtitle_7">
          <CmsText 
            pageData={pageData} 
            sectionKey="cta_subtitle_7" 
            fallback="Przekonaj się na własne oczy, jak działa technologia PDLC. Zamów próbkę demonstracyjną już teraz!" 
            as="p" 
            className="text-black/60 mb-6 text-sm md:text-base max-w-2xl mx-auto" 
          />
        </CMSEditable>
        <CMSEditable cmsKey="cta_button">
          <CmsButton 
            pageData={pageData} 
            sectionKey="cta_button" 
            fallbackText="Zamów teraz bezpłatnie" 
            fallbackHref="/kontakt" 
            className="bg-black text-white font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition inline-flex items-center gap-1.5 text-sm" 
          />
        </CMSEditable>
      </div>
    </section>
  );
}
