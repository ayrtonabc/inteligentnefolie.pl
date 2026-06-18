import { EyeOff, Eye } from 'lucide-react';
import { CmsText, CmsImage } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

export default function HowItWorks({ pageData }: { pageData?: PageData }) {
  return (
    <section data-section="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <CMSEditable cmsKey="home_how_it_works_subtitle_7">
            <CmsText pageData={pageData} sectionKey="home_how_it_works_subtitle_7" fallback="TECHNOLOGIA PDLC" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          </CMSEditable>
          <CMSEditable cmsKey="home_how_it_works_title_6">
            <CmsText pageData={pageData} sectionKey="home_how_it_works_title_6" fallback="Jak to działa?" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
          </CMSEditable>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="group">
            <CMSEditable cmsKey="home_how_it_works_off_image" className="block relative overflow-hidden mb-8 aspect-[4/3] bg-gray-100">
              <CmsImage pageData={pageData} sectionKey="home_how_it_works_off_image" fallback="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800" alt="OFF" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div data-label="off" className="absolute top-4 left-4 bg-black text-white text-xs font-medium px-3 py-1 tracking-widest uppercase">OFF</div>
            </CMSEditable>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <EyeOff className="text-gray-900" strokeWidth={1.5} size={24} />
                <CMSEditable cmsKey="home_how_it_works_off_title_8">
                  <CmsText pageData={pageData} sectionKey="home_how_it_works_off_title_8" fallback="Mat (prywatność)" as="h3" className="font-medium text-gray-900 text-2xl" />
                </CMSEditable>
              </div>
              <CMSEditable cmsKey="home_how_it_works_off_description_9">
                <CmsText pageData={pageData} sectionKey="home_how_it_works_off_description_9" fallback="Bez zasilania kryształy ciekłe rozpraszają światło, tworząc nieprzezroczystą powłokę." as="p" className="text-gray-500 text-base leading-relaxed font-light" />
              </CMSEditable>
            </div>
          </div>
          <div className="group">
            <CMSEditable cmsKey="home_how_it_works_on_image" className="block relative overflow-hidden mb-8 aspect-[4/3] bg-gray-100">
              <CmsImage pageData={pageData} sectionKey="home_how_it_works_on_image" fallback="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800" alt="ON" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div data-label="on" className="absolute top-4 left-4 bg-white text-black text-xs font-medium px-3 py-1 tracking-widest uppercase">ON</div>
            </CMSEditable>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-gray-900" strokeWidth={1.5} size={24} />
                <CMSEditable cmsKey="home_how_it_works_on_title_10">
                  <CmsText pageData={pageData} sectionKey="home_how_it_works_on_title_10" fallback="Przezroczysta (światło)" as="h3" className="font-medium text-gray-900 text-2xl" />
                </CMSEditable>
              </div>
              <CMSEditable cmsKey="home_how_it_works_on_description_11">
                <CmsText pageData={pageData} sectionKey="home_how_it_works_on_description_11" fallback="Po podaniu napięcia kryształy ustawiają się równolegle, przepuszczając światło i zapewniając pełną widoczność." as="p" className="text-gray-500 text-base leading-relaxed font-light" />
              </CMSEditable>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
