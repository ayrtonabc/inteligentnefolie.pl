import { Shield, Zap, Sparkles, Smartphone, Clock, LucideIcon } from 'lucide-react';
import { CmsText } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

const iconMap: Record<string, LucideIcon> = { Shield, Zap, Sparkles, Smartphone, Clock };
const featureIcons = ['Shield', 'Zap', 'Sparkles', 'Smartphone', 'Clock'];

export default function Features({ pageData }: { pageData?: PageData }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-left max-w-3xl">
          <CMSEditable cmsKey="home_features_subtitle_5">
            <CmsText pageData={pageData} sectionKey="home_features_subtitle_5" fallback="INNOWACYJNE ROZWIĄZANIA" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          </CMSEditable>
          <CMSEditable cmsKey="home_features_title_4">
            <CmsText pageData={pageData} sectionKey="home_features_title_4" fallback="Dlaczego warto wybrać nasze folie?" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
          </CMSEditable>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-x-8 gap-y-16">
          {[0, 1, 2, 3, 4].map((idx) => {
            const Icon = iconMap[featureIcons[idx]] || Shield;
            const title = pageData?.content?.find(c => c.section_key === `feature_${idx}_title`);
            const desc = pageData?.content?.find(c => c.section_key === `feature_${idx}_description`);
            if (!title && !desc) return null;
            return (
              <div key={idx} className="group cursor-default">
                <div className="mb-6 w-12 h-12 flex items-center justify-start"><Icon className="text-gray-900 group-hover:text-cyan transition-colors duration-300" strokeWidth={1.5} size={32} /></div>
                <CMSEditable cmsKey={`feature_${idx}_title`}>
                  <CmsText pageData={pageData} sectionKey={`feature_${idx}_title`} fallback="" as="h3" className="font-medium text-gray-900 text-xl mb-4" />
                </CMSEditable>
                <CMSEditable cmsKey={`feature_${idx}_description`}>
                  <CmsText pageData={pageData} sectionKey={`feature_${idx}_description`} fallback="" as="p" className="text-gray-500 text-base leading-relaxed font-light" />
                </CMSEditable>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
