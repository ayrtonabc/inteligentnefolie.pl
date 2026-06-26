import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { Metadata } from 'next';
import { fetchPageData, getPageContentValue } from '@/lib/pageData';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let ogTitle = 'Regulamin - Inteligentne Folie HETOR | Wiodący Producent Foli PDLC';
  let ogDescription = 'Regulamin serwisu inteligentnefolie.pl. Wiodący producent i instalator folii inteligentnych PDLC i LCD w Polsce.';
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
      url: 'https://inteligentnefolie.pl/regulamin',
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

export default function Regulamin() {
  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={{}} />

      <section className="bg-dark-bg text-white pt-48 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Regulamin
          </h1>
          <p className="text-gray-400">
            Ostatnia aktualizacja: Styczeń 2025
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            
            <h2>1. Postanowienia ogólne</h2>
            <p>
              Niniejszy Regulamin określa zasady korzystania z serwisu internetowego inteligentnefolie.pl oraz zasady świadczenia usług przez firmę Scianki Szklane.
            </p>
            <p>
              <strong>Sprzedawca:</strong><br />
              Scianki Szklane<br />
              ul. Wspólna 3<br />
              41-200 Sosnowiec<br />
              NIP: PL<br />
              Email: biuro@inteligentnefolie.pl<br />
              Tel: +48 790 555 900
            </p>

            <h2>2. Definicje</h2>
            <ul>
              <li><strong>Klient</strong> – osoba fizyczna, prawna lub jednostka organizacyjna dokonująca zakupu</li>
              <li><strong>Towar</strong> – produkty oferowane przez Sprzedawcę (folie inteligentne PDLC, usługi montażu)</li>
              <li><strong>Cena</strong> – wartość brutto towaru lub usługi</li>
              <li><strong>Zamówienie</strong> – oświadczenie woli Klienta</li>
            </ul>

            <h2>3. Składanie zamówień</h2>
            <p>Zamówienia można składać:</p>
            <ul>
              <li>Przez formularz kontaktowy na stronie</li>
              <li>Telefonicznie pod numerem +48 790 555 900</li>
              <li>Email: biuro@inteligentnefolie.pl</li>
            </ul>
            <p>
              Zamówienie wymaga potwierdzenia przez Sprzedawcę. Do momentu potwierdzenia zamówienia, Sprzedawca może odmówić jego realizacji.
            </p>

            <h2>4. Płatności</h2>
            <p>Akceptujemy następujące formy płatności:</p>
            <ul>
              <li>Przelew bankowy</li>
              <li>Płatność kartą (przy odbiorze lub online)</li>
              <li>Faktura VAT</li>
            </ul>
            <p>Termin płatności wynosi 14 dni od daty wystawienia faktury.</p>

            <h2>5. Dostawa i монтаж</h2>
            <p>
              Termin realizacji zamówienia wynosi od 7 do 30 dni roboczych, w zależności od dostępności towaru.
            </p>
            <p>
              Usługa montażu realizowana jest po uzgodnieniu terminu z Klientem. Montaż wykonywany jest przez wykwalifikowanych specjalistów.
            </p>

            <h2>6. Gwarancja i reklamacje</h2>
            <p>
              Na wszystkie produkty udzielamy gwarancji zgodnej z obowiązującymi przepisami.
            </p>
            <p>Reklamacje można składać:</p>
            <ul>
              <li>Email: <a href="mailto:biuro@inteligentnefolie.pl">biuro@inteligentnefolie.pl</a></li>
              <li>Tel: <a href="tel:+48790555900">+48 790 555 900</a></li>
              <li>Listownie na adres: ul. Wspólna 3, 41-200 Sosnowiec</li>
            </ul>

            <h2>7. Prawo odstąpienia od umowy</h2>
            <p>
              Klient będący konsumentem ma prawo odstąpić od umowy w terminie 14 dni od dnia odebrania towaru (usługi).
            </p>
            <p>
              Prawo odstąpienia nie przysługuje w przypadku usług realizowanych w całości za zgodą Klienta.
            </p>

            <h2>8. Ochrona danych osobowych</h2>
            <p>
              Administratorem danych osobowych jest Sprzedawca. Dane przetwarzane są zgodnie z Polityką Prywatności dostępną <a href="/polityka-prywatnosci">tutaj</a>.
            </p>

            <h2>9. Postanowienia końcowe</h2>
            <p>
              W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy Kodeksu Cywilnego oraz Ustawy o prawach konsumenta.
            </p>
            <p>
              Sprzedawca zastrzega sobie prawo do zmiany Regulaminu. Zmiany obowiązują od dnia publikacji na stronie.
            </p>

            <h2>10. Kontakt</h2>
            <p>Wszelkie pytania prosimy kierować:</p>
            <ul>
              <li>Email: <a href="mailto:biuro@inteligentnefolie.pl">biuro@inteligentnefolie.pl</a></li>
              <li>Tel: <a href="tel:+48790555900">+48 790 555 900</a></li>
              <li>Adres: ul. Wspólna 3, 41-200 Sosnowiec</li>
            </ul>

          </div>
        </div>
      </section>

      <Footer pageData={{}} />
      <FloatingChat pageData={{}} />
    </div>
  );
}
