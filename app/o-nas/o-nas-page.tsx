import { Metadata } from 'next';
import Header from '@/components/Header';
import AboutUs from '@/components/AboutUs';
import Footer from '@/components/Footer';
import { fetchPageData, generateSEOMetadata } from '@/lib/pageData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/o-nas', lang);
  return generateSEOMetadata(pageData, '/o-nas', {
    title: 'O nas - Wiodący Producent i Instalator Konstrukcji Szklanych w Polsce',
    description: 'Poznaj Altra - wiodącego producenta i instalatora konstrukcji szklanych w Polsce. Specjalizujemy się w ściankach szklanych, balustradach i foliach inteligentnych PDLC i LCD.',
  });
}

export default async function AboutUsPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/o-nas', lang);

  return (
    <main className="w-full min-h-screen bg-white">
      <Header pageData={pageData} />
      <AboutUs pageData={pageData} lang={lang} />
      <Footer pageData={pageData} />
    </main>
  );
}