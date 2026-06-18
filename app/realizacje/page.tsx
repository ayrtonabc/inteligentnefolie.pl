import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { fetchPageData, generateSEOMetadata, getPageContentValue } from '@/lib/pageData';
import { getProjects } from '@/lib/portfolio';
import RealizacjeClient from './RealizacjeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData('/realizacje', lang);
  return generateSEOMetadata(pageData, '/realizacje', {
    title: 'Realizacje Foli Inteligentnych PDLC i LCD - Portfolio Producenta HETOR',
    description: 'Zobacz realizacje folii inteligentnych HETOR w całej Polsce. Portfolio innowacyjnych projektów z foliami PDLC i LCD dla domów, biur i hoteli.',
  });
}

export default async function Realizacje({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const pagePath = '/realizacje';
  const params = await searchParams;
  const lang = params?.lang || 'pl';
  const pageData = await fetchPageData(pagePath, lang);
  const projects = await getProjects(lang);

  const heroTitle = getPageContentValue(pageData, 'hero_title', '') || '';
  const heroSubtitle = getPageContentValue(pageData, 'hero_subtitle', '') || '';

  return (
    <RealizacjeClient 
      pageData={pageData} 
      heroTitle={heroTitle} 
      heroSubtitle={heroSubtitle} 
      pagePath={pagePath} 
      initialProjects={projects}
    />
  );
}
