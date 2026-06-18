import { Metadata } from 'next';
import { ChevronDown, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import FloatingCart from '@/components/FloatingCart';
import PriceCalculator from '@/components/PriceCalculator';
import { fetchPageData, generateSEOMetadata, getPageContentValue } from '@/lib/pageData';
import { CmsText, CmsButton, CmsImage } from '@/components/cms/CmsComponents';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

import { getShopProducts } from '@/lib/shop';
import ProductListClient from '@/components/shop/ProductListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/inteligentne-folie', lang);
  return generateSEOMetadata(pageData, '/inteligentne-folie', {
    title: 'Inteligentne Folie PDLC i LCD - Sklep Producenta',
    description: 'Jesteśmy wiodącym producentem i instalatorem folii inteligentnych w Polsce. Kupuj bezpośrednio od producenta - ceny od 950 zł/m². Gwarancja jakości, profesjonalny montaż.',
  });
}

export default async function InteligentneFolie({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const pagePath = '/inteligentne-folie';
  const params = await searchParams;
  const pageData = await fetchPageData(pagePath, params?.lang || 'pl');
   const products = await getShopProducts();

  const calculatorTitle = getPageContentValue(pageData, 'calculator_title', 'Oblicz orientacyjną cenę swojej folii');
  const calculatorSubtitle = getPageContentValue(pageData, 'calculator_subtitle', 'Nasz kalkulator pomoże Ci oszacować koszt materiału dla Twojego projektu.');
  const helpTitle = getPageContentValue(pageData, 'help_title', 'Nie wiesz, którą folię wybrać?');
  const helpSubtitle = getPageContentValue(pageData, 'help_subtitle', 'Nasi eksperci pomogą Ci dobrać najlepsze rozwiązanie dla Twojego projektu.');

  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans">
      <Header pageData={pageData} />

      <section className="bg-[#0A0A0A] text-white pt-48 pb-20" data-section="folie-hero">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <CmsText 
            pagePath={pagePath} 
            sectionKey="hero_title" 
            fallback="Inteligentne Folie PDLC i LCD" 
            as="h1" 
            className="text-4xl md:text-5xl font-bold mb-4" 
            data-cms-role="title"
          />
          <CmsText pagePath={pagePath} sectionKey="hero_subtitle" fallback="Folia elektryczna na okna i szyby" as="p" className="text-gray-400 max-w-2xl mx-auto text-sm" />
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-gray-50 -mt-10">
        <div className="max-w-6xl mx-auto px-6">
          <ProductListClient initialProducts={products} />
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <PriceCalculator pageData={pageData} />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <CmsText pagePath={pagePath} sectionKey="comparison_title" fallback="Porównanie folii inteligentnych" as="h2" className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 border-b border-gray-200 w-1/4"><CmsText pagePath={pagePath} sectionKey="comparison_col_0" fallback="Cecha" /></th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 border-b border-gray-200 w-1/3"><CmsText pagePath={pagePath} sectionKey="comparison_col_1" fallback="Folia samoprzylepna" /></th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 border-b border-gray-200 w-1/3"><CmsText pagePath={pagePath} sectionKey="comparison_col_2" fallback="Folia do laminacji" /></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_0_feature" fallback="Przeźroczystość" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_0_selfAdhesive" fallback="80%" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_0_laminated" fallback="90%" /></td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_1_feature" fallback="Blokada UV" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_1_selfAdhesive" fallback="99%" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_1_laminated" fallback="99%" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_2_feature" fallback="Gwarancja" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_2_selfAdhesive" fallback="5 lat" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_2_laminated" fallback="10 lat" /></td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_3_feature" fallback="Montaż" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_3_selfAdhesive" fallback="DIY (samodzielny)" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_3_laminated" fallback="Profesjonalny" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_4_feature" fallback="Zastosowanie" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_4_selfAdhesive" fallback="Istniejące szyby" /></td>
                  <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-200"><CmsText pagePath={pagePath} sectionKey="comparison_row_4_laminated" fallback="Nowe szyby / okna" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Help Section */}
      <section className="py-16 bg-cyan">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{helpTitle || 'Nie wiesz, którą folię wybrać?'}</h2>
          <p className="text-gray-800 mb-8 text-sm">{helpSubtitle || 'Nasi eksperci pomogą Ci dobrać najlepsze rozwiązanie dla Twojego projektu.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CmsButton pagePath={pagePath} sectionKey="help_cta" fallbackText="Bezpłatna wycena" fallbackHref="/kontakt" className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm" />
            <a href="tel:+48790555900" className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center text-sm">Zadzwoń: +48 790 555 900</a>
          </div>
        </div>
      </section>

      <Footer pageData={pageData} />
      <FloatingCart />
      <FloatingChat pageData={pageData} />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </div>
  );
}
