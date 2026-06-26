import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { Metadata } from 'next';
import { fetchPageData, getPageContentValue } from '@/lib/pageData';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let ogTitle = 'Polityka Prywatności - Inteligentne Folie HETOR | Ochrona Danych';
  let ogDescription = 'Polityka Prywatności serwisu inteligentnefolie.pl. Dowiedz się jak chronimy Twoje dane osobowe.';
  let ogImage = '';
  
  try {
    const pageData = await fetchPageData('/', 'pl');
    const cmsOgTitle = getPageContentValue(pageData, '_og_title', '');
    const cmsOgDesc = getPageContentValue(pageData, '_og_description', '');
    const cmsOgImage = getPageContentValue(pageData, '_og_image', '');
    if (cmsOgTitle) ogTitle = cmsOgTitle;
    if (cmsOgDesc) ogDescription = cmsOgDesc;
    if (cmsOgImage) ogImage = cmsOgImage;
  } catch (e) {}
  
  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: 'https://inteligentnefolie.pl/polityka-prywatnosci',
      siteName: 'Inteligentne Folie',
      locale: 'pl_PL',
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default function PolitykaPrywatnosci() {
  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={{}} />

      <section className="bg-dark-bg text-white pt-48 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Polityka Prywatności
          </h1>
          <p className="text-gray-400">
            Ostatnia aktualizacja: Styczeń 2025
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            
            <h2>1. Informacje ogólne</h2>
            <p>
              Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych użytkowników serwisu inteligentnefolie.pl, należącego do firmy Scianki Szklane.
            </p>
            <p>
              Administratorem danych osobowych jest:<br />
              <strong>Scianki Szklane</strong><br />
              ul. Wspólna 3<br />
              41-200 Sosnowiec<br />
              NIP: PL<br />
              Email: biuro@inteligentnefolie.pl<br />
              Tel: +48 790 555 900
            </p>

            <h2>2. Zakres zbieranych danych</h2>
            <p>Zbieramy następujące dane osobowe:</p>
            <ul>
              <li>Imię i nazwisko</li>
              <li>Adres e-mail</li>
              <li>Numer telefonu</li>
              <li>Adres IP</li>
              <li>Dane z formularza kontaktowego (treść wiadomości)</li>
            </ul>

            <h2>3. Cel przetwarzania danych</h2>
            <p>Państwa dane osobowe przetwarzamy w celu:</p>
            <ul>
              <li>Odpowiadania na zapytania kierowane przez formularz kontaktowy</li>
              <li>Przygotowania wyceny i oferty</li>
              <li>Kontaktu telefonicznego w sprawie zamówienia</li>
              <li>Realizacji zamówień i umów</li>
              <li>Przesyłania informacji marketingowych (za zgodą)</li>
            </ul>

            <h2>4. Podstawa prawna przetwarzania</h2>
            <p>Państwa dane przetwarzamy na podstawie:</p>
            <ul>
              <li>Art. 6 ust. 1 lit. b RODO – wykonanie umowy lub podjęcie działań na żądanie osoby</li>
              <li>Art. 6 ust. 1 lit. a RODO – zgoda osoby</li>
              <li>Art. 6 ust. 1 lit. f RODO – uzasadniony interes administratora</li>
            </ul>

            <h2>5. Prawa osób fizycznych</h2>
            <p>Mają Państwo prawo do:</p>
            <ul>
              <li>Dostępu do swoich danych osobowych</li>
              <li>Sprostowania danych</li>
              <li>Usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Ograniczenia przetwarzania</li>
              <li>Przenoszenia danych</li>
              <li>Sprzeciwu wobec przetwarzania</li>
              <li>Cofnięcia zgody w dowolnym momencie</li>
            </ul>

            <h2>6. Cookies (Pliki cookies)</h2>
            <p>
              Nasza strona używa plików cookies w celu zapewnienia prawidłowego działania serwisu oraz do celów analitycznych i marketingowych.
            </p>
            <p>Używamy:</p>
            <ul>
              <li><strong>Cookies niezbędne</strong> – wymagane do działania strony</li>
              <li><strong>Cookies analityczne</strong> – do analizy ruchu na stronie (np. Google Analytics)</li>
              <li><strong>Cookies marketingowe</strong> – do celów reklamowych</li>
            </ul>

            <h2>7. Przekazywanie danych</h2>
            <p>Państwa dane mogą być przekazywane:</p>
            <ul>
              <li>Dostawcom usług IT (hosting, email)</li>
              <li>Partnerom analitycznym (Google Analytics)</li>
              <li>Organom państwowym na podstawie przepisów prawa</li>
            </ul>

            <h2>8. Okres przechowywania danych</h2>
            <p>
              Dane osobowe przechowujemy przez okres niezbędny do realizacji celu, maksymalnie 5 lat od ostatniego kontaktu, chyba że przepisy nakazują dłuższy okres przechowywania.
            </p>

            <h2>9. Zabezpieczenia</h2>
            <p>
              Stosujemy odpowiednie środki techniczne i organizacyjne w celu zapewnienia bezpieczeństwa Państwa danych osobowych.
            </p>

            <h2>10. Kontakt</h2>
            <p>
              W sprawach związanych z ochroną danych osobowych prosimy o kontakt:
            </p>
            <ul>
              <li>Email: <a href="mailto:biuro@inteligentnefolie.pl">biuro@inteligentnefolie.pl</a></li>
              <li>Tel: <a href="tel:+48790555900">+48 790 555 900</a></li>
            </ul>

          </div>
        </div>
      </section>

      <Footer pageData={{}} />
      <FloatingChat pageData={{}} />
    </div>
  );
}
