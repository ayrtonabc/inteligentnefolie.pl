import type { Metadata } from "next";
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { VisualEditorProvider } from '@/lib/context/VisualEditorContext';
import { LanguageProvider } from '@/lib/context/LanguageContext';
import { CartProvider } from '@/components/cart/CartContext';
import { CookieConsentProvider } from '@/lib/context/CookieConsentContext';
import CartDrawer from '@/components/cart/CartDrawer';
import PopupWrapper from '@/app/src/components/PopupWrapper';
import VisitTracker from '@/components/analytics/VisitTracker';
import GDPRBanner from '@/components/GDPRBanner';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const currentUrl = `${protocol}://${host}`;
  
  let searchConsoleVerification = '';
  let ogTitle = 'Inteligentne Folie PDLC i LCD - Producent i Instalator w Polsce';
  let ogDescription = 'Jesteśmy wiodącym producentem i instalatorem folii inteligentnych PDLC i LCD w Polsce. Kupuj bezpośrednio od producenta z gwarancją jakości i profesjonalnym montażem.';
  let ogImage = '';
  let twitterCard = 'summary_large_image';
  
  try {
    const { getSiteSettings } = await import('@/lib/cms');
    const settings = await getSiteSettings();
    searchConsoleVerification = settings?.search_console_code || '';
    
    const { fetchPageData, getPageContentValue } = await import('@/lib/pageData');
    const pageData = await fetchPageData('/', 'pl');
    
    const cmsOgTitle = getPageContentValue(pageData, '_og_title', '');
    const cmsOgDesc = getPageContentValue(pageData, '_og_description', '');
    const cmsOgImage = getPageContentValue(pageData, '_og_image', '');
    const cmsTwitterCard = getPageContentValue(pageData, '_twitter_card', '');
    
    if (cmsOgTitle) ogTitle = cmsOgTitle;
    if (cmsOgDesc) ogDescription = cmsOgDesc;
    if (cmsOgImage) ogImage = cmsOgImage;
    if (cmsTwitterCard) twitterCard = cmsTwitterCard;
    
    if (searchConsoleVerification && !searchConsoleVerification.includes('name="')) {
      const match = searchConsoleVerification.match(/content=["']([^"']+)["']/);
      if (match) {
        searchConsoleVerification = match[1];
      }
    }
  } catch (error) {
    console.error('Error fetching site settings for metadata:', error);
  }

  const metadata: Metadata = {
    title: ogTitle,
    description: ogDescription,
    icons: {
      icon: '/favicon.png',
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: currentUrl || "https://inteligentnefolie.pl",
      siteName: "Inteligentne Folie",
      locale: "pl_PL",
      type: "website",
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ] : [],
    },
    twitter: {
      card: twitterCard as any,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },
    other: {
      referrer: 'no-referrer-when-downgrade',
    },
  };

  if (searchConsoleVerification) {
    metadata.other = {
      ...metadata.other,
      'google-site-verification': searchConsoleVerification,
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  
  let searchConsoleTag = '';
  
  try {
    const { getSiteSettings } = await import('@/lib/cms');
    const settings = await getSiteSettings();
    const rawTag = settings?.search_console_code || '';
    
    if (rawTag) {
      if (rawTag.includes('name="google-site-verification"')) {
        const match = rawTag.match(/content=["']([^"']+)["']/);
        searchConsoleTag = match ? match[1] : rawTag;
      } else {
        searchConsoleTag = rawTag;
      }
    }
  } catch (error) {
    console.error('Error fetching Search Console verification:', error);
  }

  return (
    <html lang="pl">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
        {searchConsoleTag && (
          <meta name="google-site-verification" content={searchConsoleTag} />
        )}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-R45Q4CK1E0"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R45Q4CK1E0');
            `
          }}
        />
      </head>
      <body className="antialiased font-sans bg-white text-gray-900">
        <AggregateRatingSchema ratingValue="4.8" reviewCount="247" />
        <Suspense fallback={null}>
          <CookieConsentProvider>
            <LanguageProvider>
              <CartProvider>
                <VisualEditorProvider>
                  <VisitTracker />
                  <PopupWrapper>
                    {children}
                  </PopupWrapper>
                  <CartDrawer />
                  <GDPRBanner />
                </VisualEditorProvider>
              </CartProvider>
            </LanguageProvider>
          </CookieConsentProvider>
        </Suspense>
      </body>
    </html>
  );
}
