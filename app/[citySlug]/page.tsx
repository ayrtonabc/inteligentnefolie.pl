import { getCityContent, seoCities } from '@/lib/seoLocalData';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, CheckCircle2, PhoneCall, Zap, Shield, SunMedium, MonitorPlay, Link as LinkIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PriceCalculator from '@/components/PriceCalculator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import AnimatedSlider from '@/components/AnimatedSlider';
import CityPopups from '@/app/src/components/CityPopups';
import GDPRBanner from '@/components/GDPRBanner';
import AboutSection from '@/components/home/AboutSection';
import { fetchPageData, getPageContentValue } from '@/lib/pageData';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return seoCities.map((city) => ({
    citySlug: `folia-inteligentna-${city.slug}`,
  }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ citySlug: string }>; searchParams?: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { citySlug: rawCitySlug } = await params;
  const langParams = await searchParams;
  const lang = langParams?.lang || 'pl';
  const cityPrefix = "folia-inteligentna-";
  if (!rawCitySlug.startsWith(cityPrefix)) {
    return { title: 'Not Found' };
  }
  
  const citySlug = rawCitySlug.replace(cityPrefix, "");
  const cityObj = seoCities.find(c => c.slug === citySlug);
  if (!cityObj) return { title: 'Not Found' };
  
  const content = getCityContent(cityObj);
  const dbPath = `/${rawCitySlug}`;
  const pageData = await fetchPageData(dbPath, lang);

  const title = getPageContentValue(pageData, 'meta_title', content.metaTitle) || content.metaTitle;
  const description = getPageContentValue(pageData, 'meta_description', content.metaDescription) || content.metaDescription;
  
  let ogImage = '';
  try {
    const homeData = await fetchPageData('/', 'pl');
    const cmsOgImage = getPageContentValue(homeData, '_og_image', '');
    if (cmsOgImage) ogImage = cmsOgImage;
  } catch (e) {}
  
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://inteligentnefolie.pl/${rawCitySlug}`,
      siteName: 'Inteligentne Folie',
      locale: 'pl_PL',
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function CityLandingPage({ params, searchParams }: { params: Promise<{ citySlug: string }>; searchParams?: Promise<{ lang?: string }> }) {
  const { citySlug: rawCitySlug } = await params;
  const langParams = await searchParams;
  const lang = langParams?.lang || 'pl';
  const cityPrefix = "folia-inteligentna-";
  if (!rawCitySlug.startsWith(cityPrefix)) {
    notFound();
  }

  const citySlug = rawCitySlug.replace(cityPrefix, "");
  const cityObj = seoCities.find(c => c.slug === citySlug);
  if (!cityObj) notFound();

  const content = getCityContent(cityObj);
  const dbPath = `/${rawCitySlug}`;
  const pageData = await fetchPageData(dbPath, lang);
  const homePageData = await fetchPageData('/', lang);
  const combinedPageData = {
    ...pageData,
    content: [...homePageData.content, ...pageData.content]
  };

  // Helper to get from DB or fallback to local content
  const getVal = (key: string, fallback: string) => {
    const val = pageData.content.find(c => c.section_key === key);
    if (!val) return fallback;
    // Basic string extraction (simplified for here)
    if (typeof val.content_value === 'string') {
      try { return JSON.parse(val.content_value); } catch { return val.content_value; }
    }
    return val.content_value || fallback;
  };

  const heroTitle = getVal('hero_title', content.heroTitle);
  const heroSubtitle = getVal('hero_subtitle', content.heroSubtitle);
  const article1Title = getVal('article_1_title', content.seoArticleBlocks[0].title);
  const article1Content = getVal('article_1_content', content.seoArticleBlocks[0].content);
  const article2Title = getVal('article_2_title', content.seoArticleBlocks[1].title);
  const article2Content = getVal('article_2_content', content.seoArticleBlocks[1].content);

  return (
    <main className="min-h-screen bg-white">
      <Header pageData={pageData} />
      
      {/* 1. ARCHITECTURAL HERO SECTION */}
      <section className="relative min-h-[100vh] sm:min-h-[100vh] flex items-center pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 z-0" />
        <Image 
          src="/images/biuro-on.webp" 
          alt={`Folia inteligentna w nowoczesnym biurze w ${cityObj.name}`}
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-0" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="max-w-2xl text-center lg:text-left order-2 lg:order-1" data-section="city-hero">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 sm:mb-6 leading-tight tracking-tight" data-cms-role="title" data-cms-id={rawCitySlug}>
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed font-light" data-cms-role="subtitle" data-cms-id={rawCitySlug}>
                {heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link 
                  href="/kontakt" 
                  className="w-full sm:w-auto bg-cyan text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white transition-colors text-center shadow-lg shadow-cyan/20 text-sm sm:text-base"
                  data-cms-role="button-primary"
                  data-cms-id={rawCitySlug}
                >
                  Darmowa wycena w 24h
                </Link>
                <a 
                  href="tel:+48790555900" 
                  className="w-full sm:w-auto bg-white/10 text-white border border-white/20 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm text-sm sm:text-base"
                  data-cms-role="button-secondary"
                  data-cms-id={rawCitySlug}
                >
                  <PhoneCall size={18} /> Skonsultuj projekt
                </a>
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[400px] xl:h-[450px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] order-1 lg:order-2">
              <AnimatedSlider 
                beforeImage="/images/biuro-on.webp" 
                afterImage="/images/biuro-off.webp" 
                beforeAlt={`Folia przezroczysta ${cityObj.name}`} 
                afterAlt={`Folia matowa ${cityObj.name}`}
              />
            </div>
          </div>
        </div>
      </section>

      <AboutSection pageData={combinedPageData} lang={lang} />

      {/* 2. SEO RICH TEXT + IMAGE (Article Block 1 & 2) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <video 
                  src="/videos/2.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <p className="text-white font-medium text-lg">Innowacyjna struktura PDLC</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8 leading-tight">
                {article1Title}
              </h2>
              <div className="prose prose-lg prose-gray">
                <p className="text-gray-600 leading-relaxed mb-8">
                  {article1Content}
                </p>
                <h3 className="text-2xl font-medium text-gray-900 mt-12 mb-6">
                  {article2Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {article2Content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CALCULATOR INTEGRATION */}
      <PriceCalculator pageData={pageData} />

      {/* 4. VISUAL BENTO GRID: APPLICATIONS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:flex justify-between items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">Gdzie sprawdzi się inteligentne szkło?</h2>
              <p className="text-gray-600 text-lg">Od prestiżowych biur po prywatne rezydencje. Poznaj najpopularniejsze zastosowania folii PDLC.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Large item */}
            <div className="md:col-span-2 relative rounded-3xl overflow-hidden group h-[300px] md:h-auto">
              <Image src="/images/conferencia-off.webp" alt="Sale konferencyjne folia matowa" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="bg-cyan text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Biznes</span>
                <h3 className="text-2xl font-medium text-white mb-2">Sale konferencyjne</h3>
                <p className="text-gray-300">Natychmiastowa prywatność podczas poufnych spotkań.</p>
              </div>
            </div>
            
            {/* Stacked items */}
            <div className="flex flex-col gap-6 h-[600px] md:h-auto">
              <div className="flex-1 relative rounded-3xl overflow-hidden group">
                <Image src="/images/hotel-on.webp" alt="Hotele i apartamenty" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">HoReCa</span>
                  <h3 className="text-xl font-medium text-white mb-2">Hotele i SPA</h3>
                  <p className="text-gray-300 text-sm">Nowoczesny podział stref.</p>
                </div>
              </div>
              <div className="flex-1 relative rounded-3xl overflow-hidden group">
                <Image src="/images/bano-on.webp" alt="Łazienki i domy" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Prywatne</span>
                  <h3 className="text-xl font-medium text-white mb-2">Przeszklenia w domu</h3>
                  <p className="text-gray-300 text-sm">Zastąpienie tradycyjnych rolet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECHNICAL BENEFITS */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                <Shield className="text-cyan" size={28} />
              </div>
              <h3 className="text-xl font-medium mb-4">Pełna prywatność</h3>
              <p className="text-gray-400 leading-relaxed">Matowa struktura folii całkowicie blokuje widoczność, zachowując przy tym doskonałą przepuszczalność naturalnego światła.</p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                <SunMedium className="text-cyan" size={28} />
              </div>
              <h3 className="text-xl font-medium mb-4">Blokada UV (99%)</h3>
              <p className="text-gray-400 leading-relaxed">Folia chroni wnętrze przed szkodliwym promieniowaniem słonecznym, zapobiegając blaknięciu mebli i podłóg.</p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                <Zap className="text-cyan" size={28} />
              </div>
              <h3 className="text-xl font-medium mb-4">Niski pobór prądu</h3>
              <p className="text-gray-400 leading-relaxed">Technologia PDLC jest energooszczędna. Pobór mocy wynosi zaledwie 4-5W na metr kwadratowy (tylko w trybie przezroczystym).</p>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                <MonitorPlay className="text-cyan" size={28} />
              </div>
              <h3 className="text-xl font-medium mb-4">Ekran projekcyjny</h3>
              <p className="text-gray-400 leading-relaxed">W trybie OFF (matowym) folia stanowi doskonały ekran do tylnej projekcji w jakości HD – idealne do witryn sklepowych.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOCAL SEO TEXT + DISTRICTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="prose prose-lg prose-gray">
              {content.seoArticleBlocks[2] && (
                <>
                  <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8 leading-tight">
                    {content.seoArticleBlocks[2].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-12">
                    {content.seoArticleBlocks[2].content}
                  </p>
                </>
              )}
              
              {content.seoArticleBlocks[3] && (
                <>
                  <h2 className="text-3xl font-light text-gray-900 mb-8 leading-tight">
                    {content.seoArticleBlocks[3].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {content.seoArticleBlocks[3].content}
                  </p>
                </>
              )}

              {!content.seoArticleBlocks[2] && (
                <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl mt-4">
                  <video 
                    src="/videos/1.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="bg-cyan text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Realizacje</span>
                    <h3 className="text-2xl font-medium text-white mb-2">Profesjonalny montaż</h3>
                    <p className="text-gray-300">Nasi eksperci dbają o każdy detal podczas instalacji systemu Smart Glass.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
              <h3 className="text-2xl font-medium text-gray-900 mb-8 flex items-center gap-3">
                <MapPin className="text-cyan" /> Dzielnice i obszar obsługi
              </h3>
              {content.districts.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {content.districts.map((district, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm shadow-sm">
                      {district}
                    </span>
                  ))}
                  <span className="bg-cyan/10 border border-cyan/20 text-cyan font-medium px-4 py-2 rounded-full text-sm">
                    + Całe miasto {cityObj.name} i obrzeża
                  </span>
                </div>
              ) : (
                <p className="text-gray-600">Obsługujemy całe miasto {cityObj.name} oraz przyległe miejscowości w promieniu 50 km. Dojeżdżamy na bezpłatny pomiar bezpośrednio do klienta.</p>
              )}

              <div className="mt-12 pt-12 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Parametry techniczne folii</h3>
                <ul className="space-y-4">
                  {content.technicalSpecs.map((spec, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="font-medium text-gray-900">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STRONG CTA */}
      <section className="py-24 bg-cyan text-black text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Zaprojektujmy Twoją przestrzeń w mieście {cityObj.name}</h2>
          <p className="text-xl mb-10 opacity-80 max-w-2xl mx-auto">Prześlij nam wymiary swoich szyb, a we przygotujemy niezobowiązującą wycenę montażu folii inteligentnej.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/kontakt" className="bg-black text-white font-semibold px-8 py-4 rounded-xl hover:bg-gray-900 transition-colors shadow-xl">
              Przejdź do formularza kontaktowego
            </Link>
            <a href="tel:+48790555900" className="bg-white/20 border border-black/10 font-medium px-8 py-4 rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
              <PhoneCall size={20} /> Zadzwoń: +48 790 555 900
            </a>
          </div>
          
          <div className="mt-24 pt-8 border-t border-black/10 text-xs font-medium tracking-wider opacity-60 uppercase leading-relaxed max-w-3xl mx-auto">
            {content.seoKeywords}
          </div>
        </div>
      </section>

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <CityPopups />
      <GDPRBanner />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </main>
  );
}
