import { Metadata } from 'next';
import { fetchPageData, generateSEOMetadata, getPageContentValue } from '@/lib/pageData';
import KontaktClient from './KontaktClient';

export const revalidate = 10;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/kontakt', lang);
  return generateSEOMetadata(pageData, '/kontakt', {
    title: 'Kontakt - Producent i Instalator Foli Inteligentnych w Polsce',
    description: 'Skontaktuj się z HETOR - wiodącym producentem folii inteligentnych PDLC i LCD. Profesjonalne doradztwo, bezpłatna wycena, montaż w całej Polsce. Zadzwoń: +48 790 555 900.',
  });
}

export default async function Kontakt({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const pagePath = '/kontakt';
  const params = await searchParams;
  const pageData = await fetchPageData(pagePath, params?.lang || 'pl');

  const heroTitle = getPageContentValue(pageData, 'hero_title', '') || '';
  const heroSubtitle = getPageContentValue(pageData, 'hero_subtitle', '') || '';

  return (
    <KontaktClient
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      pageData={pageData}
    />
  );
}
