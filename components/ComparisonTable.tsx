import { CmsText } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';

export default function ComparisonTable({ pageData }: { pageData?: PageData }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <CMSEditable cmsKey="home_comparison_title_25">
            <CmsText pageData={pageData} sectionKey="home_comparison_title_25" fallback="Folia samoprzylepna vs do laminacji" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
          </CMSEditable>
        </div>
        <div className="overflow-hidden border-t border-gray-900">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-6 px-4 md:px-8 text-xs font-semibold text-gray-900 uppercase tracking-widest border-b border-gray-200 w-1/3">
                  <CMSEditable cmsKey="home_comparison_col_0">
                    <CmsText pageData={pageData} sectionKey="home_comparison_col_0" fallback="Cecha" />
                  </CMSEditable>
                </th>
                <th className="py-6 px-4 md:px-8 text-xs font-semibold text-gray-900 uppercase tracking-widest border-b border-gray-200 w-1/3">
                  <CMSEditable cmsKey="home_comparison_col_1">
                    <CmsText pageData={pageData} sectionKey="home_comparison_col_1" fallback="Samoprzylepna PDLC" />
                  </CMSEditable>
                </th>
                <th className="py-6 px-4 md:px-8 text-xs font-semibold text-gray-900 uppercase tracking-widest border-b border-gray-200 w-1/3">
                  <CMSEditable cmsKey="home_comparison_col_2">
                    <CmsText pageData={pageData} sectionKey="home_comparison_col_2" fallback="Do laminacji LCD/PDLC" />
                  </CMSEditable>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Montaż', self: 'Na istniejącej szybie (szybko)', lam: 'W procesie laminacji (efekt premium)' },
                { feature: 'Przezroczystość ON', self: '~80-85%', lam: '~90-92%' },
                { feature: 'Najlepsze dla', self: 'Domy, biura, łazienki', lam: 'Hotele, inwestycje premium' }
              ].map((row, idx) => (
                <tr key={idx} className="group hover:bg-white transition-colors duration-200">
                  <td className="py-5 px-4 md:px-8 text-sm font-medium text-gray-900 border-b border-gray-200">
                    <CMSEditable cmsKey={`home_comparison_row_${idx}_feature`}>
                      <CmsText pageData={pageData} sectionKey={`home_comparison_row_${idx}_feature`} fallback={row.feature} />
                    </CMSEditable>
                  </td>
                  <td className="py-5 px-4 md:px-8 text-sm text-gray-500 font-light leading-relaxed border-b border-gray-200">
                    <CMSEditable cmsKey={`home_comparison_row_${idx}_selfAdhesive`}>
                      <CmsText pageData={pageData} sectionKey={`home_comparison_row_${idx}_selfAdhesive`} fallback={row.self} />
                    </CMSEditable>
                  </td>
                  <td className="py-5 px-4 md:px-8 text-sm text-gray-500 font-light leading-relaxed border-b border-gray-200">
                    <CMSEditable cmsKey={`home_comparison_row_${idx}_laminated`}>
                      <CmsText pageData={pageData} sectionKey={`home_comparison_row_${idx}_laminated`} fallback={row.lam} />
                    </CMSEditable>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
