import { Metadata } from 'next';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { fetchPageData, generateSEOMetadata, getPageContentValue } from '@/lib/pageData';
import { CmsText } from '@/components/cms/CmsComponents';
import { getBlogPosts } from '@/lib/cms';
import Link from 'next/link';
import { cleanQuillContent } from '@/lib/cms';
import { PB_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/blog', lang);
  return generateSEOMetadata(pageData, '/blog', {
    title: 'Blog o inteligentnych foliach PDLC i LCD - Poradnik, Aktualności 2025',
    description: 'Blog ekspercki o foliach inteligentnych PDLC i LCD. Poradniki, aktualności, inspiracje. Dowiedz się jak obniżyć koszty energii dzięki foliom elektrochromowym.',
  });
}

const POST_COUNT = 6;

export default async function Blog({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const pagePath = '/blog';
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData(pagePath, lang);
  const posts = await getBlogPosts(lang, 12);

  const heroTitle = getPageContentValue(pageData, 'hero_title', 'Blog o inteligentnych foliach PDLC i LCD - Poradnik, Aktualności, Inspiracje');
  const heroSubtitle = getPageContentValue(pageData, 'hero_subtitle', 'Dowiedz się więcej o technologii inteligentnych folii, trendach w architekturze i naszych nowościach. Fachowe porady ekspertów.');
  const newsletterTitle = getPageContentValue(pageData, 'newsletter_title', 'Bądź na bieżąco');
  const newsletterSubtitle = getPageContentValue(pageData, 'newsletter_subtitle', 'Zapisz się do newslettera, aby otrzymywać informacje o nowych realizacjach i technologiach.');

  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={pageData} />

      <section data-section="blog-header" className="pt-32 pb-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CmsText pagePath={pagePath} sectionKey="hero_title" fallback={heroTitle} as="h1" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-cms-role="title" />
          <CmsText pagePath={pagePath} sectionKey="hero_subtitle" fallback={heroSubtitle} as="p" className="text-gray-500 text-sm max-w-xl mx-auto" data-cms-role="subtitle" />
        </div>
      </section>

      {/* Dynamic Blog Posts from DB */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {post.cover_image_url || post.cover_image ? (
                        <img 
                          src={post.cover_image_url || `${PB_URL}/api/files/blog_posts/${post.id}/${post.cover_image}`} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-sm">Brak okładki</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-cyan transition line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {post.excerpt || cleanQuillContent(post.content).replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> 
                          {new Date(post.created_at || post.created).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="mt-4 w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition inline-flex items-center justify-center gap-2 text-sm">
                      Czytaj więcej <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">Brak postów w tej chwili.</p>
            </div>
          )}
        </div>
      </section>

      {newsletterTitle && (
        <section data-section="blog-newsletter" className="py-16 bg-cyan text-gray-900">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <CmsText pagePath={pagePath} sectionKey="newsletter_title" fallback={newsletterTitle} as="h2" className="text-2xl md:text-3xl font-bold mb-3" data-cms-role="title" />
            <CmsText pagePath={pagePath} sectionKey="newsletter_subtitle" fallback={newsletterSubtitle} as="p" className="text-gray-700 mb-6" data-cms-role="subtitle" />
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Twój adres email" className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-gray-900 outline-none" />
              <button className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition whitespace-nowrap">
                <CmsText pagePath={pagePath} sectionKey="newsletter_button" fallback="" data-cms-role="button" />
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
    </div>
  );
}
