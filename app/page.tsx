import { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import References from '@/components/home/References';
import BusinessCollaborations from '@/components/home/BusinessCollaborations';
import Features from '@/components/Features';
import AboutSection from '@/components/home/AboutSection';
import Services from '@/components/home/Services';
import Colors from '@/components/home/Colors';
import ServiceAreas from '@/components/home/ServiceAreas';
import HowItWorks from '@/components/HowItWorks';
import ComparisonTable from '@/components/ComparisonTable';
import PriceCalculator from '@/components/PriceCalculator';
import ProductsCarousel from '@/components/ProductsCarousel';
import Portfolio from '@/components/Portfolio';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import SeoKeywords from '@/components/home/SeoKeywords';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { fetchPageData, generateSEOMetadata } from '@/lib/pageData';
import { getShopProducts } from '@/lib/shop';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/', lang);
  return generateSEOMetadata(pageData, '/', {
    title: 'Inteligentne Folie PDLC i LCD - Producent i Instalator w Polsce',
    description: 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Specjalizujemy się w foliach inteligentnych PDLC i LCD. Profesjonalny montaż, gwarancja jakości.',
  });
}

export default async function Home({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/', lang);

  let products = await getShopProducts({ featured: true });
  if (products.length === 0) {
    products = (await getShopProducts()).slice(0, 6);
  } else {
    products = products.slice(0, 6);
  }

  return (
    <main className="w-full min-h-screen bg-white">
      <Header pageData={pageData} />
      <Hero pageData={pageData} />
      <ServiceAreas />
      <AboutSection pageData={pageData} lang={lang} />
      <References pageData={pageData} />
      <BusinessCollaborations pageData={pageData} />
      <Features pageData={pageData} />
      <Services />
      <Colors pageData={pageData} />
      <HowItWorks pageData={pageData} />
      <ComparisonTable pageData={pageData} />
      <PriceCalculator pageData={pageData} />
      <ProductsCarousel products={pageData?.products || []} />
      <Portfolio pageData={pageData} />
      <FAQ pageData={pageData} />
      <CTA pageData={pageData} />
      <SeoKeywords />
      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </main>
  );
}