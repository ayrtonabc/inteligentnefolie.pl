'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CmsText } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

export default function FAQ({ pageData }: { pageData?: PageData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const indices = [0, 1, 2, 3, 4].filter(i => pageData?.content?.some(c => c.section_key === `faqs.${i}.question`));
  if (indices.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <CMSEditable cmsKey="faq_title_24">
          <CmsText pageData={pageData} sectionKey="faq_title_24" fallback="Często zadawane pytania" as="h2" className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12" />
        </CMSEditable>
        <div className="space-y-3">
          {indices.map((idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100 transition">
                <CMSEditable cmsKey={`faqs.${idx}.question`} className="flex-grow">
                  <CmsText pageData={pageData} sectionKey={`faqs.${idx}.question`} fallback="" className="font-medium text-gray-900 text-left text-base" />
                </CMSEditable>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition ${openIdx === idx ? 'bg-cyan' : 'bg-gray-200'}`}>
                  <Plus size={16} className={`transition ${openIdx === idx ? 'text-gray-900 rotate-45' : 'text-gray-600'}`} />
                </div>
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-5">
                  <CMSEditable cmsKey={`faqs.${idx}.answer`}>
                    <CmsText pageData={pageData} sectionKey={`faqs.${idx}.answer`} fallback="" as="p" className="text-gray-600 leading-relaxed" />
                  </CMSEditable>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
