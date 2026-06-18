import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, BookOpen, Search, Menu, X, FileText, Users, Image, Settings, Mail, ShoppingCart, GraduationCap, Calendar, Utensils, BarChart3, Palette, Globe, TrendingUp, HelpCircle, Zap, Layers, Monitor, Database, Code, Package, BookMarked } from 'lucide-react'

// ==================== USER TAB ====================
interface UserSection {
  id: string
  title: string
  icon: typeof FileText
  category: string
  content: React.ReactNode
}

const userSections: UserSection[] = [
  {
    id: 'u-welcome',
    title: 'Witaj w panelu!',
    icon: BookOpen,
    category: 'Na start',
    content: (
      <>
        <p className="text-base">Ten panel pomaga Ci w pełni zarządzać swoją stroną internetową. Tutaj dodajesz treści, prowadzisz bloga, obsługujesz kontakty i wiele więcej — <strong>bez konieczności znajomości programowania</strong>.</p>
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 my-4">
          <p className="text-sm text-sky-800"><strong>💡 Wskazówka:</strong> Zacznij od Dashboardu — zobaczysz tam podsumowanie tego, co dzieje się na Twojej stronie.</p>
        </div>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Co możesz zrobić w tym panelu?</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Edytować treści na stronie (nagłówki, teksty, zdjęcia)</li>
          <li>Prowadzić bloga — dodawać i edytować wpisy</li>
          <li>Odbierać wiadomości od klientów (leady)</li>
          <li>Zarządzać galerią zdjęć i plików</li>
          <li>Sprawdzać, jak strona wygląda w wyszukiwarkach (SEO)</li>
          <li>Włączać dodatkowe funkcje: sklep, kursy, rezerwacje</li>
        </ul>
      </>
    )
  },
  {
    id: 'u-login',
    title: 'Logowanie i bezpieczeństwo',
    icon: Settings,
    category: 'Na start',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Jak się zalogować</h3>
        <p>Wpisz swój adres e-mail i hasło, a następnie kliknij <strong>„Log In"</strong>.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Zapomniałem hasła</h3>
        <p>Kliknij <strong>„Zapomniałeś hasła?"</strong> pod polem hasła. Wpisz swój adres e-mail — wyślemy Ci link, którym ustawisz nowe hasło.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Wskazówki bezpieczeństwa</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Używaj silnego hasła (minimum 8 znaków, wielkie i małe litery, cyfry)</li>
          <li>Nie udostępniaj swojego hasła innym osobom</li>
          <li>Jeśli podejrzewasz, że ktoś poznał Twoje hasło — zmień je jak najszybciej</li>
          <li>Wyloguj się, gdy kończysz pracę na cudzym komputerze</li>
        </ul>
      </>
    )
  },
  {
    id: 'u-dashboard',
    title: 'Ekran główny (Dashboard)',
    icon: BarChart3,
    category: 'Na start',
    content: (
      <>
        <p>Dashboard to Twój ekran startowy. Pokazuje najważniejsze informacje o stronie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Co widzisz na Dashboardzie?</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Wizyty ogółem</strong> — ile osób odwiedziło Twoją stronę w ostatnich 30 dniach</li>
          <li><strong>Nowe leady</strong> — ile nowych formularzy kontaktowych otrzymałeś</li>
          <li><strong>Zdrowie SEO</strong> — ocena (0-100), jak dobrze Twoja strona jest widoczna w Google</li>
          <li><strong>Szybkość strony</strong> — kliknij przycisk, aby sprawdzić, jak szybko ładuje się strona</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Wykres ruchu</h3>
        <p>Pokazuje, jak zmieniały się odwiedziny w czasie. Słupki niebieskie to ruch z wyszukiwarek (Google), ciemnoniebieskie to odwiedziny bezpośrednie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Najczęściej odwiedzane</h3>
        <p>Lista Twoich najpopularniejszych podstron z liczbą odwiedzin.</p>
      </>
    )
  },
  {
    id: 'u-pages',
    title: 'Strony',
    icon: FileText,
    category: 'Zarządzanie treścią',
    content: (
      <>
        <p>Tutaj zarządzasz podstronami swojej witryny (strona główna, kontakt, oferta itd.).</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak edytować stronę?</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Znajdź stronę na liście</li>
          <li>Kliknij ikonę <strong>ołówka</strong> przy danej stronie</li>
          <li>Po lewej zobaczysz listę elementów do edycji (nagłówki, teksty, zdjęcia)</li>
          <li>Kliknij element, zmień treść i kliknij <strong>„Zapisz"</strong></li>
        </ol>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Co mogę zmienić na stronie?</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Nagłówki i tytuły sekcji</li>
          <li>Teksty i opisy</li>
          <li>Zdjęcia (przesyłając nowe z biblioteki mediów)</li>
          <li>Przyciski (tekst i link, dokąd prowadzą)</li>
        </ul>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 my-4">
          <p className="text-sm text-amber-800"><strong>⚠️ Pamiętaj:</strong> Po zapisaniu zmian, strona internetowa zaktualizuje się automatycznie. Zmiany są widoczne dla wszystkich odwiedzających.</p>
        </div>
      </>
    )
  },
  {
    id: 'u-blog',
    title: 'Blog',
    icon: BookOpen,
    category: 'Zarządzanie treścią',
    content: (
      <>
        <p>Moduł bloga pozwala publikować artykuły i newsy na Twojej stronie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dodawanie nowego wpisu</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Kliknij <strong>„Utwórz nowy"</strong></li>
          <li>Wpisz tytuł artykułu (adres URL utworzy się automatycznie)</li>
          <li>Wybierz kategorię (np. „Porady", „Nowości")</li>
          <li>Napisz treść w edytorze — możesz formatować tekst, dodawać nagłówki, listy i linki</li>
          <li>Dodaj zdjęcie główne z biblioteki mediów</li>
          <li>Wypełnij pole „Opis SEO" — to, co pojawi się w wynikach Google</li>
          <li>Ustaw status: <strong>Szkic</strong> (tylko Ty widzisz) lub <strong>Opublikowany</strong> (widoczny dla wszystkich)</li>
        </ol>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Filtrowanie wpisów</h3>
        <p>Użyj przycisków na górze listy, aby zobaczyć tylko opublikowane artykuły lub same szkice.</p>
      </>
    )
  },
  {
    id: 'u-media',
    title: 'Biblioteka mediów',
    icon: Image,
    category: 'Zarządzanie treścią',
    content: (
      <>
        <p>Tutaj przesyłasz i zarządzasz wszystkimi zdjęciami i plikami na stronie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak dodać plik?</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Kliknij <strong>„Prześlij"</strong> lub przeciągnij pliki na wyznaczone pole</li>
          <li>Poczekaj, aż pasek postępu się wypełni</li>
          <li>Plik pojawi się w bibliotece — możesz go użyć na stronie lub w blogu</li>
        </ol>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dozwolone formaty</h3>
        <p>Zdjęcia: <strong>JPG, PNG, GIF, WebP, SVG</strong>. Dokumenty: <strong>PDF</strong>. Wideo: <strong>MP4</strong>. Maksymalny rozmiar: <strong>50 MB</strong> na plik.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Usuwanie plików</h3>
        <p>Kliknij ikonę <strong>kosza</strong> przy pliku. <strong>Uwaga:</strong> usunięcie pliku jest trwałe — jeśli jest używany na stronie, zniknie również stamtąd.</p>
      </>
    )
  },
  {
    id: 'u-leads',
    title: 'Leady (kontakty)',
    icon: Users,
    category: 'Zarządzanie treścią',
    content: (
      <>
        <p>Tutaj trafiają wszystkie wiadomości przesłane przez formularz kontaktowy na Twojej stronie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Co widzisz w sekcji Leady?</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Imię i nazwisko osoby kontaktowej</li>
          <li>Adres e-mail i numer telefonu</li>
          <li>Temat wiadomości</li>
          <li>Treść wiadomości</li>
          <li>Data wysłania</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Zmiana statusu</h3>
        <p>Możesz oznaczyć lead jako: <strong>Nowy</strong>, <strong>W trakcie</strong> lub <strong>Zamknięty</strong> — pomaga to śledzić, które wiadomości zostały obsłużone.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Powiadomienia</h3>
        <p>Kliknij ikonę <strong>🔔 dzwonka</strong> w prawym górnym rogu — zobaczysz nowe leady i szkice artykułów.</p>
      </>
    )
  },
  {
    id: 'u-shop',
    title: 'Sklep internetowy',
    icon: ShoppingCart,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Jeśli masz włączony moduł sklepu, tutaj zarządzasz produktami i zamówieniami.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dodawanie produktu</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Wpisz nazwę produktu</li>
          <li>Ustaw cenę i (opcjonalnie) starą cenę (przekreślona)</li>
          <li>Dodaj zdjęcia produktu</li>
          <li>Ustaw stan magazynowy — ile sztuk masz w magazynie</li>
          <li>Opisz produkt w polu opisu</li>
          <li>Ustaw status: <strong>Aktywny</strong> (widoczny w sklepie) lub <strong>Szkic</strong></li>
        </ol>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Zamówienia</h3>
        <p>Lista wszystkich zamówień ze statusem. Kliknij zamówienie, aby zobaczyć szczegóły: produkty, dane klienta, adres dostawy.</p>
      </>
    )
  },
  {
    id: 'u-courses',
    title: 'Kursy online',
    icon: GraduationCap,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Twórz i zarządzaj kursami online z lekcjami i modułami.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Tworzenie kursu</h3>
        <p>Podaj nazwę, opis i dodaj okładkę. Następnie dodaj moduły, a w każdym module — lekcje z treścią.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Studenci</h3>
        <p>Widzisz listę zapisanych osób i ich postęp w kursie. Możesz też ręcznie zapisać nowego studenta.</p>
      </>
    )
  },
  {
    id: 'u-bookings',
    title: 'Rezerwacje',
    icon: Calendar,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>System rezerwacji pozwala klientom umawiać wizyty online.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Kalendarz</h3>
        <p>Widzisz wszystkie zaplanowane wizyty. Kolory oznaczają status: zielony = potwierdzona, żółty = oczekująca, czerwony = anulowana.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Zarządzanie</h3>
        <p>Możesz potwierdzić, anulować lub przełożyć rezerwację. Klienci widzą dostępne terminy na Twojej stronie.</p>
      </>
    )
  },
  {
    id: 'u-restaurant',
    title: 'Menu restauracji',
    icon: Utensils,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Jeśli prowadzisz restaurację, tutaj zarządzasz kartą dań.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dodawanie dań</h3>
        <p>Utwórz kategorie (np. „Przystawki", „Dania główne") i dodawaj pozycje z nazwą, opisem, ceną i zdjęciem.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dostępność</h3>
        <p>Możesz oznaczyć danie jako niedostępne — zniknie ze strony, ale nie zostanie usunięte.</p>
      </>
    )
  },
  {
    id: 'u-popups',
    title: 'Pop-upy',
    icon: Mail,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Pop-upy to okienka wyświetlane odwiedzającym Twoją stronę — np. z promocją, formularzem zapisu na newsletter lub szybkim kontaktem.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Tworzenie pop-upa</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Wybierz szablon: Oferta, Newsletter, Kontakt lub Własny</li>
          <li>Wpisz treść — nagłówek, opis, tekst przycisku</li>
          <li>Ustaw kolory — tło, kolor przycisku, kolor tekstu</li>
          <li>Wybierz, kiedy ma się pojawiać: po czasie, po przewinięciu, przy próbie wyjścia</li>
          <li>Wybierz, na których podstronach ma się wyświetlać</li>
        </ol>
      </>
    )
  },
  {
    id: 'u-seo',
    title: 'SEO (Pozycjonowanie)',
    icon: TrendingUp,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Moduł SEO pomaga sprawdzić, jak dobrze Twoja strona jest widoczna w Google.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Audyt SEO</h3>
        <p>System sprawdza Twoje strony i informuje, co można poprawić — np. brakujące tytuły, opisy czy zdjęcia bez podpisów.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Automatyczne naprawy</h3>
        <p>Kliknij <strong>„Napraw wszystko"</strong> — system automatycznie uzupełni brakujące informacje.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Wskazówka SEO</h3>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 my-2">
          <p className="text-sm text-green-800"><strong>✅ Dobra praktyka:</strong> Każdy artykuł na blogu powinien mieć unikalny tytuł (do 60 znaków) i opis (do 160 znaków). To właśnie te informacje widzą użytkownicy w wynikach Google.</p>
        </div>
      </>
    )
  },
  {
    id: 'u-settings',
    title: 'Ustawienia',
    icon: Settings,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Centralne miejsce konfiguracji Twojej strony.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Ogólne</h3>
        <p>Nazwa strony, opis, logo — te informacje pojawiają się w wielu miejscach na stronie.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Widoczność</h3>
        <p><strong>Tryb konserwacji:</strong> włącz, aby tymczasowo wyłączyć stronę (odwiedzający zobaczą komunikat „wrócimy wkrótce"). Przydatne podczas większych zmian.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Integracje</h3>
        <p>Tutaj podłączasz zewnętrzne narzędzia — Google Analytics, Facebook Pixel i inne. Jeśli nie wiesz, co tu wpisać, zapytaj swojego webmastera.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">GDPR</h3>
        <p>Konfiguracja banera cookies i polityki prywatności — wymagane prawem.</p>
      </>
    )
  },
  {
    id: 'u-multilang',
    title: 'Wersje językowe',
    icon: Globe,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Jeśli Twoja strona ma więcej niż jedną wersję językową, tutaj tym zarządzasz.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak to działa?</h3>
        <p>Każda treść na stronie ma swoją wersję w każdym języku. Gdy edytujesz stronę, wybierz język z listy, aby edytować konkretną wersję.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dodawanie języka</h3>
        <p>W Ustawieniach → Języki możesz dodać nowy język (np. angielski, niemiecki). System doda go do przełącznika na stronie.</p>
      </>
    )
  },
  {
    id: 'u-notifications',
    title: 'Powiadomienia',
    icon: HelpCircle,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Kliknij ikonę <strong>🔔 dzwonka</strong> w prawym górnym rogu, aby sprawdzić powiadomienia.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Co wyświetla się w powiadomieniach?</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Nowe leady</strong> — ktoś wypełnił formularz kontaktowy</li>
          <li><strong>Szkice artykułów</strong> — artykuły, które są w trakcie tworzenia</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak reagować?</h3>
        <p>Kliknij powiadomienie, aby przejść bezpośrednio do odpowiedniej sekcji (np. lista leadów lub edytor artykułu).</p>
      </>
    )
  },
  {
    id: 'u-search',
    title: 'Wyszukiwanie',
    icon: Search,
    category: 'Dodatkowe funkcje',
    content: (
      <>
        <p>Pole wyszukiwania w nagłówku pozwala szybko znaleźć strony, wpisy blogowe lub pliki.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak szukać?</h3>
        <p>Wpisz szukaną frazę i wciśnij <strong>Enter</strong>. System przeniesie Cię do listy stron, gdzie znajdziesz wyniki.</p>
      </>
    )
  },
  {
    id: 'u-faq',
    title: 'Najczęstsze pytania',
    icon: HelpCircle,
    category: 'Pomoc',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Dlaczego zmiany na stronie nie są widoczne od razu?</h3>
        <p>Strona bufuje treści przez ok. 1 minutę, aby szybko się ładować. Poczekaj chwilę lub odśwież stronę w przeglądarce (F5).</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Jak dodać zdjęcie do artykułu?</h3>
        <p>W edytorze artykułu kliknij ikonę obrazka → wybierz z biblioteki mediów lub prześlij nowy plik.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Kto może zobaczyć moją stronę w trybie konserwacji?</h3>
        <p>W trybie konserwacji strona wyświetla komunikat „wrócimy wkrótce" wszystkim odwiedzającym. Ty nadal masz dostęp do panelu CMS.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Czy mogę cofnąć zmiany?</h3>
        <p>Obecnie system nie przechowuje historii zmian. Zalecamy ostrożność przy edycji. W razie problemów skontaktuj się z administratorem.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Gdzie znajdę wiadomości od klientów?</h3>
        <p>W sekcji <strong>Leady</strong> w menu bocznym. Każda wiadomość zawiera imię, e-mail, telefon i treść.</p>
      </>
    )
  },
]

// ==================== DEV TAB ====================
interface DevSection {
  id: string
  title: string
  icon: typeof Code
  category: string
  content: React.ReactNode
}

const devSections: DevSection[] = [
  {
    id: 'd-overview',
    title: 'Stack y arquitectura',
    icon: Code,
    category: 'Infraestructura',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Stack completo</h3>
        <table className="w-full text-sm border-collapse mt-4">
          <thead><tr className="bg-gray-50"><th className="text-left p-2.5 border-b font-semibold">Capa</th><th className="text-left p-2.5 border-b font-semibold">Tecnología</th><th className="text-left p-2.5 border-b font-semibold">Versión</th></tr></thead>
          <tbody>
            {[['CMS Panel','React 18 + Vite 5 + TypeScript','^18.2 / ^5.0 / ^5.3'],['Frontend WWW','Next.js 14 (App Router) + TypeScript','^14.2'],['Backend/DB','Supabase (PostgreSQL 15)','Latest'],['Auth','Supabase Auth (GoTrue)','Latest'],['Storage','Supabase Storage (R2/S3 backend)','Latest'],['State CMS','React Query + Context API','^5.0 / ^18.2'],['State WWW','Server Components + ISR cache','Next.js native'],['Styling','Tailwind CSS v3 + lucide-react','^3.4 / ^0.3'],['Routing CMS','React Router v6 (createBrowserRouter)','^6.22'],['Routing WWW','Next.js App Router (file-based)','^14.2'],['AI/SEO','OpenRouter API (varios LLMs)','REST API']].map(([a,b,c],i) => (
              <tr key={i} className="hover:bg-gray-50"><td className="p-2.5 border-b text-gray-700 font-medium">{a}</td><td className="p-2.5 border-b text-gray-500">{b}</td><td className="p-2.5 border-b font-mono text-xs text-gray-400">{c}</td></tr>
            ))}
          </tbody>
        </table>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Diagrama de arquitectura</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   CMS Panel     │─────▶│   Supabase       │◀────▶│   Frontend WWW  │
│   React+Vite    │ CRUD  │   PostgreSQL     │ Read │   Next.js 14    │
│   :5174         │       │   + Auth         │ ISR  │   :3000         │
└─────────────────┘       │   + Storage      │      └─────────────────┘
                          │                  │              │
                          │  Tables:         │      API Routes:
                          │  - websites      │      /api/popups
                          │  - cms_pages     │      /api/popups/track
                          │  - site_content  │      /api/revalidate
                          │  - blog_posts    │
                          │  - leads         │      ISR Cache (60s)
                          │  - popups        │      ↓
                          │  - shop_*        │      Supabase client
                          └──────────────────┘      (lib/cms.ts)`}</pre>
      </>
    )
  },
  {
    id: 'd-structure',
    title: 'Estructura de archivos',
    icon: Layers,
    category: 'Infraestructura',
    content: (
      <>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`root/
├── .env.local                        # NEXT_PUBLIC_SUPABASE_URL, ANON_KEY
├── next.config.js                    # revalidatePath, images config
├── package.json                      # next, @supabase/supabase-js, lucide-react
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: VisualEditorProvider, PopupWrapper
│   ├── page.tsx                      # Home (/)
│   ├── globals.css                   # Tailwind imports, custom vars
│   │
│   ├── inteligentne-folie/page.tsx   # Página producto (SSR + ISR 60s)
│   ├── realizacje/page.tsx           # Portfolio con sliders
│   ├── realizacje/RealizacjeClient.tsx  # Client component con before/after
│   ├── kontakt/page.tsx              # Server component
│   ├── kontakt/KontaktClient.tsx     # Client: formulario → Supabase leads
│   ├── blog/page.tsx                 # Listado blog
│   ├── blog/[slug]/page.tsx          # Post individual
│   │
│   ├── panel/                        # Proxy al CMS (no usado, CMS en puerto separado)
│   ├── preview/[slug]/page.tsx       # Preview para visual editor
│   ├── debug-cms/page.tsx            # Debug page (desarrollo)
│   │
│   └── api/
│       ├── popups/route.ts           # GET: query popups filtrados por target_pages
│       ├── popups/track/route.ts     # POST: RPC record_popup_view + record_popup_conversion
│       └── revalidate/route.ts       # POST: revalidatePath(), llamado desde CMS al guardar
│
├── lib/
│   ├── supabase.ts                   # createClient(browser) + TS interfaces
│   ├── supabase/server.ts            # createClient(server) con service_role_key
│   ├── cms.ts                        # getPageContent(), getSectionContent(), cache 5min
│   └── pageData.ts                   # fetchPageData(), generateSEOMetadata()
│
├── components/
│   ├── Header.tsx                    # Logo, nav, phone, CMS-editable
│   ├── Footer.tsx                    # CMS-editable columns
│   ├── FloatingChat.tsx              # WhatsApp/phone floating widget
│   ├── PriceCalculatorClient.tsx     # Calculadora m² (client-side interactive)
│   └── cms/
│       ├── CmsComponents.tsx         # CmsText, CmsImage, CmsButton, CmsList (client fetch)
│       └── CmsServerComponents.tsx   # Server-side variants
│
├── cms/                              # Panel CMS (proyecto Vite separado)
│   ├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   ├── vite.config.ts                # alias @, base /panel
│   ├── package.json                  # react, @supabase/supabase-js, react-router-dom
│   │
│   └── src/
│       ├── App.tsx                   # createBrowserRouter, route definitions, lazy loading
│       ├── main.tsx                  # ReactDOM.createRoot, providers wrap
│       │
│       ├── pages/                    # Todas las páginas del panel
│       │   ├── Login.tsx             # Auth + password reset flow
│       │   ├── Website.tsx           # Dashboard con stats reales
│       │   ├── BlogList.tsx          # CRUD posts con filtros
│       │   ├── BlogForm.tsx          # Editor rich text + AI bar
│       │   ├── Pages.tsx             # Gestión de páginas
│       │   ├── PageEditor.tsx        # Editor de contenido
│       │   ├── VisualEditor.tsx      # iframe preview + sidebar editor
│       │   ├── Media.tsx             # Supabase Storage browser
│       │   ├── Leads.tsx             # Lead management + CSV export
│       │   ├── Seo.tsx               # SEO audit + AI fix
│       │   ├── Popups.tsx            # Popup builder con templates
│       │   ├── Settings.tsx          # Config global
│       │   ├── Shop.tsx              # Shop wrapper + sub-routes
│       │   ├── Courses.tsx           # Courses wrapper
│       │   ├── Bookings.tsx          # Bookings wrapper
│       │   ├── Restaurant.tsx        # Menu management
│       │   ├── Portfolio.tsx         # Portfolio wrapper
│       │   ├── DocsPage.tsx          # Documentación interna (user + dev tabs)
│       │   └── shop/                 # Sub-rutas del shop
│       │       ├── ProductsPage.tsx, OrdersPage.tsx, CustomersPage.tsx...
│       │
│       ├── components/
│       │   ├── Header.tsx            # Site switcher, search, notifications, profile
│       │   ├── Sidebar.tsx           # Nav con lead count polling, active modules
│       │   ├── DashboardLayout.tsx   # Shell layout: Sidebar + Header + Outlet
│       │   ├── AuthLayout.tsx        # Login layout
│       │   ├── PrivateRoute.tsx      # Auth guard con redirect
│       │   ├── Toast.tsx             # Toast notification system
│       │   ├── ConfirmDialog.tsx     # Modal de confirmación
│       │   └── ErrorBoundary.tsx     # Error boundary con reset
│       │
│       ├── context/
│       │   ├── AuthContext.tsx       # supabase.auth + session cache + resetPassword
│       │   ├── SiteContext.tsx       # Multi-site: websites[], currentSite, selectSite
│       │   └── LanguageContext.tsx   # i18n (actualmente solo pl)
│       │
│       ├── lib/
│       │   ├── supabaseClient.ts     # createClient + getSessionCached()
│       │   └── supabase.ts           # Re-export + ecommerce type definitions
│       │
│       ├── features/                 # Feature modules (domain-driven)
│       │   ├── blog/
│       │   │   ├── api.ts            # getPosts, createPost, updatePost, deletePost
│       │   │   └── hooks.ts          # usePosts, usePost
│       │   ├── media/
│       │   │   └── api.ts            # getAllFiles, uploadFile, deleteFile, getBuckets
│       │   ├── popups/
│       │   │   └── hooks.ts          # usePopups, usePopupStats
│       │   └── seo/
│       │       ├── api.ts            # getAnalyticsOverview, getSeoAudit, fixAllCritical
│       │       └── AnalyticsSection.tsx
│       │
│       └── hooks/
│           └── useShop.ts            # Shop CRUD hooks (products, orders, customers)
│
└── database-saas-schema/
    ├── COMPLETE_SCHEMA.sql           # Schema completo de todas las tablas
    └── SEED_*.sql                    # Scripts de seed para contenido`}</pre>
      </>
    )
  },
  {
    id: 'd-database',
    title: 'Schema de base de datos',
    icon: Database,
    category: 'Backend',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Tablas core</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`-- websites: Multi-site root
websites (
  id          uuid PK default gen_random_uuid()
  name        text NOT NULL
  slug        text UNIQUE NOT NULL
  domain      text
  status      text DEFAULT 'draft'  -- draft | active | maintenance
  plan        text DEFAULT 'free'   -- free | starter | pro | enterprise
  created_at  timestamptz DEFAULT now()
)

-- cms_pages: Page definitions (new format)
cms_pages (
  id              uuid PK default gen_random_uuid()
  website_id      uuid REFERENCES websites(id)
  title           text NOT NULL
  slug            text NOT NULL          -- e.g. "home", "kontakt"
  path            text                   -- e.g. "/", "/kontakt"
  content         jsonb                  -- { elements: [{ id, type, value, path }] }
  is_published    boolean DEFAULT false
  meta_title      text
  meta_description text
  created_at      timestamptz DEFAULT now()
  UNIQUE(website_id, slug)
)

-- site_content: CMS content (legacy format, still primary)
site_content (
  id            uuid PK default gen_random_uuid()
  website_id    uuid REFERENCES websites(id)
  page_path     text NOT NULL            -- e.g. "/kontakt"
  section_key   text NOT NULL            -- e.g. "hero_title"
  content_type  text DEFAULT 'text'      -- text | image | link | json
  content_value text                     -- value (string or JSON string)
  language_code text DEFAULT 'pl'
  is_active     boolean DEFAULT true
  order_index   int DEFAULT 0
  metadata      jsonb
  created_at    timestamptz DEFAULT now()
  updated_at    timestamptz DEFAULT now()
)
-- INDEX: (website_id, page_path, section_key, language_code)
-- RLS: SELECT anyone, INSERT/UPDATE/DELETE authenticated

-- site_settings: Global settings key-value
site_settings (
  id            uuid PK default gen_random_uuid()
  website_id    uuid REFERENCES websites(id)
  setting_key   text NOT NULL
  setting_value text                     -- JSON string
  setting_type  text DEFAULT 'string'    -- string | number | boolean | json
  category      text
  updated_at    timestamptz DEFAULT now()
)`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Tablas de negocio</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`-- blog_posts
blog_posts (
  id          uuid PK
  website_id  uuid REFERENCES websites(id)
  title       text NOT NULL
  slug        text NOT NULL
  content     text                     -- JSON: { html, delta }
  excerpt     text
  featured_image text
  category_id uuid REFERENCES blog_categories(id)
  published   boolean DEFAULT false
  meta_title  text
  meta_description text
  created_at  timestamptz DEFAULT now()
  updated_at  timestamptz DEFAULT now()
)

-- leads: Contact form submissions
leads (
  id          uuid PK
  website_id  uuid REFERENCES websites(id)
  name        text
  email       text NOT NULL
  phone       text
  subject     text
  message     text
  source      text DEFAULT 'website'
  page_path   text
  status      text DEFAULT 'new'        -- new | in_progress | closed
  priority    text DEFAULT 'medium'     -- low | medium | high
  created_at  timestamptz DEFAULT now()
)

-- website_visits: Analytics
website_visits (
  id          uuid PK
  website_id  uuid REFERENCES websites(id)
  page_path   text
  source      text                      -- organic | direct | social | referral
  is_unique   boolean DEFAULT true
  visited_at  timestamptz DEFAULT now()
  user_agent  text
  ip_hash     text
)

-- profiles: User profiles (replaces auth.users metadata)
profiles (
  id           uuid PK REFERENCES auth.users(id)
  display_name text
  email        text
  role         text
  created_at   timestamptz DEFAULT now()
)

-- popups: Popup configurations
popups (
  id              uuid PK
  website_id      uuid REFERENCES websites(id)
  name            text NOT NULL
  template        text                  -- offer | email | contact | custom
  trigger_type    text DEFAULT 'time'   -- time | scroll | exit_intent
  trigger_value   int DEFAULT 5
  target_pages    text[] DEFAULT ARRAY['all']
  title           text
  description     text
  button_text     text
  redirect_url    text
  background_color text DEFAULT '#ffffff'
  accent_color    text DEFAULT '#0ea5e9'
  text_color      text DEFAULT '#1f2937'
  is_active       boolean DEFAULT true
  views           int DEFAULT 0
  conversions     int DEFAULT 0
  created_at      timestamptz DEFAULT now()
)`}</pre>
      </>
    )
  },
  {
    id: 'd-auth',
    title: 'Flujo de autenticación',
    icon: Settings,
    category: 'Backend',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">AuthContext</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// cms/src/context/AuthContext.tsx

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email, password) => Promise<void>
  logout: () => void
  resetPassword: (email) => Promise<void>
}

// Flow de inicialización:
// 1. Lee cms_user de localStorage (cacheada)
// 2. Llama a getSessionCached() → supabase.auth.getSession()
// 3. Si session válida → sobrescribe localStorage con datos reales
// 4. Si no → limpia localStorage, setea user = null
// 5. Se suscribe a onAuthStateChange para updates en tiempo real

const initAuth = async () => {
  const session = await getSessionCached()  // memoized promise
  if (session?.user) {
    setUser({ id, name, email })
    localStorage.setItem('cms_user', JSON.stringify(userData))
  } else {
    setUser(null)
    localStorage.removeItem('cms_user')  // stale cache cleanup
  }
}

// Session expiry handling:
// - onAuthStateChange detecta SIGNED_OUT, TOKEN_REFRESHED
// - requireAuthLoader en App.tsx redirige a /login si no hay session
// - catchError en initAuth también limpia todo`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Route guards</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// cms/src/App.tsx
const requireAuthLoader = async () => {
  try {
    const session = await getSessionCached()
    if (!session) throw redirect('/login')
    return null
  } catch {
    throw redirect('/login')  // session expired → redirect
  }
}

// Todas las rutas protegidas usan:
{ element: <DashboardLayout />, loader: requireAuthLoader, children: [...] }
{ path: '/login', loader: redirectIfAuthenticatedLoader, element: <Login /> }`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Password Reset</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// AuthContext
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: \`\${window.location.origin}/reset-password\`,
  })
  if (error) throw error
}

// Login.tsx: "Zapomniałeś hasła?" → showReset form → handleReset → resetPassword(email)
// → Supabase envía email con link → usuario abre link → establece nuevo password`}</pre>
      </>
    )
  },
  {
    id: 'd-cms-data',
    title: 'CMS Data Fetching (Next.js)',
    icon: Code,
    category: 'Frontend WWW',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">lib/cms.ts — Capa de datos</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// Dual-source fetching:
// 1. site_content (legacy): page_path + section_key rows
// 2. pages.content (new): JSON blob { elements: [{ id, type, value, path }] }

export async function getPageContent(pagePath, languageCode='pl', forceRefresh=false) {
  // Cache: 5 min TTL, key: \`page_\${pagePath}_\${languageCode}\`
  const cached = getFromCache(cacheKey)
  if (cached && !forceRefresh) return cached

  // 1. Query site_content
  const { data: legacyData } = await supabase
    .from('site_content')
    .select('*')
    .eq('page_path', pagePath)
    .eq('language_code', languageCode)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // 2. Query cms_pages table
  const slug = pagePath === '/' ? 'home' : pagePath.replace(/^\\//, '')
  const { data: pageData } = await supabase
    .from('cms_pages')
    .select('content')
    .eq('slug', slug)
    .single()

  // 3. Parse JSON content → map to SiteContent[]
  const elements = pageData?.content?.elements || []
  const mappedElements = elements.map(el => ({
    id: el.id,
    section_key: el.id,       // full ID: "home_hero_title_0"
    content_value: el.value,
    content_type: el.type || 'text',
    ...
  }))

  // 4. Merge: pages data takes priority over site_content
  // Conflict resolution by section_key Set
  const allContent = [...mappedElements, ...legacyData.filter(...)]
  setCache(cacheKey, allContent)
  return allContent
}

// getSectionContent() — para fetch individual (usado por CmsComponents client-side)
// Similar logic pero con .single() en vez de .select('*')`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">CmsComponents — Client-side fetch</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// components/cms/CmsComponents.tsx
// 'use client' — cada componente hace su propio fetch

export function CmsText({ pagePath, sectionKey, fallback, as: Component, className }) {
  const { isEditing } = useVisualEditor()
  const [content, setContent] = useState(null)

  useEffect(() => {
    // Client-side fetch, independiente del server pageData
    const data = await getSectionContent(pagePath, sectionKey, 'pl', isEditing)
    setContent(data ? getContentValue(data, fallback) : fallback)
  }, [pagePath, sectionKey, fallback, isEditing])

  return <Component dangerouslySetInnerHTML={{ __html: content }} />
}

// PROBLEMA CONOCIDO:
// CmsText/CmsImage/CmsButton ignoran el pageData del servidor
// y hacen fetch redundante client-side.
// SOLUCIÓN pending: pasar datos como props cuando están disponibles
// y solo hacer fetch client-side cuando isEditing=true.`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">ISR + Revalidation</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// app/*/page.tsx
export const revalidate = 60  // ISR: revalidar cada 60s

// Cuando el CMS guarda contenido:
// POST /api/revalidate → clearContentCache() → revalidatePath(pagePath)

// api/revalidate/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  clearContentCache()  // limpia Map cache en lib/cms.ts
  revalidatePath(body.pagePath || '/')
  return NextResponse.json({ revalidated: true })
}`}</pre>
      </>
    )
  },
  {
    id: 'd-components',
    title: 'Componentes clave y patrones',
    icon: Layers,
    category: 'Frontend WWW',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Patrón de páginas: Server + Client</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// app/kontakt/page.tsx (Server Component)
export default async function Kontakt() {
  const pageData = await fetchPageData('/kontakt')
  const heroTitle = getPageContentValue(pageData, 'hero_title', '')
  return <KontaktClient heroTitle={heroTitle} pageData={pageData} />
}

// app/kontakt/KontaktClient.tsx ('use client')
export default function KontaktClient({ heroTitle, pageData }) {
  // Estado local: formulario, submit a Supabase
  // CmsText hace fetch client-side independiente
  // Form submit: supabase.from('leads').insert({...})
}`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Header/Footer — CMS editable</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// components/Header.tsx
// Recibe pageData del parent Server Component
// Renderiza logo, teléfono, email desde:
<CmsText pagePath="/" sectionKey="header_phone" fallback="+48 123..." />
<CmsText pagePath="/" sectionKey="header_email" fallback="..." />

// components/Footer.tsx
// Columnas editables via CMS:
<CmsText pagePath="/" sectionKey="footer_col1_title" />
<CmsList pagePath="/" sectionKey="footer_col1_links" renderItem={...} />`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Cómo agregar una nueva página</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm mt-2">
          <li>Crear carpeta: <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">app/nueva-pagina/page.tsx</code></li>
          <li>Server component con <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">fetchPageData('/nueva-pagina')</code></li>
          <li>Exportar <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">revalidate = 60</code> y <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">generateMetadata()</code></li>
          <li>Si necesita interactividad → crear <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">NuevaPaginaClient.tsx</code> con <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">'use client'</code></li>
          <li>Agregar contenido en Supabase: <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">site_content</code> con <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">page_path = '/nueva-pagina'</code></li>
        </ol>
      </>
    )
  },
  {
    id: 'd-cms-panel',
    title: 'CMS Panel — Desarrollo',
    icon: Code,
    category: 'CMS Panel',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Routing del panel</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// cms/src/App.tsx
const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    loader: requireAuthLoader,  // TODAS las rutas hijas están protegidas
    children: [
      { path: 'website', lazy: () => import('./pages/Website') },
      { path: 'pages', lazy: () => import('./pages/Pages') },
      { path: 'blog', lazy: () => import('./pages/BlogList') },
      { path: 'blog/:id', lazy: () => import('./pages/BlogForm') },
      { path: 'media', lazy: () => import('./pages/Media') },
      { path: 'leads', lazy: () => import('./pages/Leads') },
      { path: 'seo', lazy: () => import('./pages/Seo') },
      { path: 'popups', lazy: () => import('./pages/Popups') },
      { path: 'settings', lazy: () => import('./pages/Settings') },
      { path: 'docs', lazy: () => import('./pages/DocsPage') },
      { path: '*', loader: () => redirect('/website') },
    ],
  },
], { basename: '/panel' })

// Lazy loading: cada página se carga on-demand (code splitting)
// Base path: /panel → mounted en index.html base="/panel/"`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Cómo agregar una nueva página al CMS</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// 1. Crear componente: cms/src/pages/NuevaPagina.tsx
export default function NuevaPagina() {
  const { currentSite } = useSite()
  const toast = useToast()
  // ... lógica
  return <div>...</div>
}

// 2. Registrar ruta en App.tsx:
{ path: 'nueva', lazy: async () => {
  const { default: NuevaPagina } = await import('./pages/NuevaPagina')
  return { Component: NuevaPagina }
}}

// 3. Agregar al Sidebar (Sidebar.tsx):
// - Añadir al array de items de navegación
// - Si es módulo addon: fetch website_addons para mostrar/ocultar

// 4. Si necesita datos de Supabase:
// - Crear feature module: features/nueva/api.ts + hooks.ts
// - O usar supabase directamente en el componente (para queries simples)`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Supabase client en el CMS</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// cms/src/lib/supabaseClient.ts
const supabase = createClient(url, anonKey)

let sessionPromise: Promise<Session | null> | null = null
supabase.auth.onAuthStateChange(() => { sessionPromise = null })

export async function getSessionCached(): Promise<Session | null> {
  if (!sessionPromise) {
    sessionPromise = supabase.auth.getSession()
      .then(({ data }) => data.session)
      .catch(() => null)
  }
  return sessionPromise  // memoized: solo 1 llamada real
}`}</pre>
      </>
    )
  },
  {
    id: 'd-rls',
    title: 'RLS Policies y seguridad',
    icon: Settings,
    category: 'CMS Panel',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Row Level Security — site_content</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`-- Lectura pública (frontend Next.js usa anon key)
CREATE POLICY "site_content public read"
  ON site_content FOR SELECT
  USING (is_active = true);

-- Escritura solo para autenticados (CMS)
CREATE POLICY "site_content authenticated write"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Storage — bucket media</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`-- Lectura pública (las imágenes se sirven directamente)
CREATE POLICY "media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Upload solo autenticados (CMS)
CREATE POLICY "media authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Delete solo autenticados
CREATE POLICY "media authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Consideraciones de seguridad</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Nunca exponer el service_role_key</strong> — solo en server-side (API routes de Next.js)</li>
          <li>El frontend Next.js usa anon key + RLS policies</li>
          <li>El CMS usa anon key + auth session (usuario logueado)</li>
          <li>Las variables <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">VITE_*</code> son públicas — no poner secretos ahí</li>
          <li>RLS en <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">leads</code>: INSERT público (formulario), SELECT autenticado (CMS)</li>
        </ul>
      </>
    )
  },
  {
    id: 'd-integrations',
    title: 'Integracje (Analytics & Scripts)',
    icon: Zap,
    category: 'CMS Panel',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Configuración desde CMS</h3>
        <p>En <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">Settings → Integracje</code> el usuario configura 4 integraciones. Los datos se guardan en la tabla <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">site_settings</code> (o en la tabla <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">website_settings</code> según schema).</p>
        <h4 className="font-semibold text-gray-800 mt-4 mb-2">1. Google Analytics 4</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Campo:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">analytics_id</code> — formato: <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">G-XXXXXXXXXX</code></li>
          <li><strong>Validación:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">/^G-[A-Z0-9]{'{10,}'}$/</code></li>
          <li><strong>UI:</strong> Card con estado "Nieskonfigurowane" → "Połączono" cuando válido</li>
          <li><strong>Cómo obtenerlo:</strong> Google Analytics → Admin → Data Streams → Measurement ID</li>
        </ul>
        <h4 className="font-semibold text-gray-800 mt-4 mb-2">2. Google Search Console</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Campo:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">search_console_code</code> — meta tag completo o solo código</li>
          <li><strong>Validación:</strong> debe contener <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">google-site-verification</code> o tener más de 20 chars</li>
          <li><strong>Tipo:</strong> textarea (acepta HTML completo)</li>
          <li><strong>Cómo obtenerlo:</strong> Search Console → Configuración → Verificación de propiedad → Meta tag HTML</li>
        </ul>
        <h4 className="font-semibold text-gray-800 mt-4 mb-2">3. Meta (Facebook) Pixel</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Campo:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">pixel_id</code> — solo el ID numérico (15-18 dígitos)</li>
          <li><strong>Validación:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">/^\d{'{15,18}'}$/</code></li>
          <li><strong>Cómo obtenerlo:</strong> Meta Events Manager → Pixel → ID de pixel</li>
        </ul>
        <h4 className="font-semibold text-gray-800 mt-4 mb-2">4. Skrypty niestandardowe (Custom Scripts)</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Campo:</strong> <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">custom_scripts</code> — HTML libre (textarea)</li>
          <li><strong>Uso:</strong> Hotjar, Chat widgets, Tag Manager, cualquier script de terceros</li>
          <li><strong>Sin validación</strong> — el usuario puede pegar cualquier HTML/JS</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Cómo se guardan los datos</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// cms/src/features/settings/hooks.ts
// useUpdateSettings() → SettingsAPI.update(websiteId, formData)
// Los campos se guardan en site_settings como key-value:

site_settings:
  setting_key          setting_value
  'analytics_id'       'G-ABC123DEF0'
  'pixel_id'           '123456789012345'
  'search_console_code' '<meta name="google-site-verification" ... />'
  'custom_scripts'     '<script>...</script>'`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Inyección en el Frontend (Next.js)</h3>
        <p>Los scripts configurados en el CMS deben inyectarse en el <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">&lt;head&gt;</code> de cada página del frontend Next.js. Para implementar esto:</p>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// app/layout.tsx — Agregar al inicio del <body> o <head>
// Los settings se obtienen via fetchPageData('/') o desde site_settings

import Script from 'next/script'

async function getIntegrations() {
  const { data } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['analytics_id', 'pixel_id', 'search_console_code', 'custom_scripts'])

  const settings: Record<string, string> = {}
  data?.forEach(row => {
    settings[row.setting_key] = row.setting_value
  })
  return settings
}

export default async function RootLayout({ children }) {
  const settings = await getIntegrations()

  return (
    <html lang="pl">
      <head>
        {/* Google Search Console Verification */}
        {settings.search_console_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.search_console_code }} />
        )}
        {/* Meta SEO tags ya están en generateMetadata() */}
      </head>
      <body>
        {/* Google Analytics 4 */}
        {settings.analytics_id && (
          <>
            <Script
              strategy="afterInteractive"
              src={\`https://www.googletagmanager.com/gtag/js?id=\${settings.analytics_id}\`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: \`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '\${settings.analytics_id}');
                \`
              }}
            />
          </>
        )}

        {/* Meta (Facebook) Pixel */}
        {settings.pixel_id && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: \`
                !function(f,b,e,v,n,t,s){
                  if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '\${settings.pixel_id}');
                fbq('track', 'PageView');
              \`
            }}
          />
        )}

        {/* Custom Scripts (Hotjar, Chat, etc.) */}
        {settings.custom_scripts && (
          <div dangerouslySetInnerHTML={{ __html: settings.custom_scripts }} />
        )}

        {children}
      </body>
    </html>
  )
}`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Flujo completo de configuración</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Usuario abre <strong>Settings → Integracje</strong> en el CMS</li>
          <li>Hace clic en la tarjeta (ej: "Google Analytics 4")</li>
          <li>Modal se abre → ingresa el ID (ej: <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">G-ABC123DEF0</code>)</li>
          <li>Validación en tiempo real: si el formato es correcto, el card muestra "Połączono"</li>
          <li>Clic en <strong>"Zapisz zmiany"</strong> → <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">SettingsAPI.update()</code> → actualiza DB</li>
          <li>El frontend lee los settings al hacer SSR (cada request o cache ISR 60s)</li>
          <li>Los scripts se inyectan automáticamente en <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">&lt;head&gt;</code> o <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">&lt;body&gt;</code></li>
        </ol>
      </>
    )
  },
  {
    id: 'd-privacy',
    title: 'Prywatność i cookies (GDPR)',
    icon: Settings,
    category: 'CMS Panel',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Sección en el CMS</h3>
        <p>En <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">Settings → Prywatność i cookies</code> se configura la conformidad con RODO (GDPR polaco) y el banner de cookies.</p>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Datos que se configuran</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Banner de cookies:</strong> texto del banner, botón de aceptar, botón de rechazar</li>
          <li><strong>Política de privacidad:</strong> URL de la página con la política completa</li>
          <li><strong>Consentimiento:</strong> qué categorías de cookies se activan por defecto</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Dónde se almacenan</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`site_settings:
  setting_key                setting_value
  'cookie_banner_enabled'    'true'
  'cookie_banner_text'       'Ta strona używa plików cookies...'
  'cookie_banner_accept'     'Akceptuję'
  'cookie_banner_reject'     'Odrzucam'
  'privacy_policy_url'       '/polityka-prywatnosci'
  'cookie_consent_analytics' 'true'    -- consentimiento para analytics
  'cookie_consent_marketing' 'false'   -- consentimiento para marketing`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Implementación en el Frontend</h3>
        <p>El banner de cookies debe ser un componente client-side que:</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Muestre el banner solo si el usuario no ha dado consentimiento</li>
          <li>Guarde la preferencia en <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">localStorage</code> o cookie</li>
          <li>Solo cargue GA4/Pixel si el usuario aceptó cookies de analytics/marketing</li>
        </ol>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// components/CookieBanner.tsx — Client Component
'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [consent, setConsent] = useState<string | null>(null)

  useEffect(() => {
    // Leer consentimiento previo
    setConsent(localStorage.getItem('cookie_consent'))
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setConsent('accepted')
    // Aktywnar scripts de analytics/marketing
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'consent_granted' })
  }

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    setConsent('rejected')
    // Solo cookies esenciales
  }

  if (consent) return null  // Ya dio consentimiento

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Ta strona używa plików cookies.{' '}
          <a href="/polityka-prywatnosci" className="text-blue-600 underline">
            Dowiedz się więcej
          </a>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Odrzucam
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  )
}`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Integración con scripts</h3>
        <p>Para que GA4 y Facebook Pixel solo se carguen con consentimiento:</p>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`// app/layout.tsx — Condicional por consentimiento
// Los scripts de analytics/marketing solo se inyectan si consent = true

{settings.analytics_id && shouldLoadAnalytics && (
  <>
    <Script src={\`https://www.googletagmanager.com/gtag/js?id=\${settings.analytics_id}\`} />
    <Script id="gtag" dangerouslySetInnerHTML={{ __html: \`...\` }} />
  </>
)}

{settings.pixel_id && shouldLoadMarketing && (
  <Script id="fbpixel" dangerouslySetInnerHTML={{ __html: \`...\` }} />
)}`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Página de política de privacidad</h3>
        <p>Se recomienda crear una página <code className="bg-gray-100 px-1 rounded text-rose-600 text-xs">/polityka-prywatnosci</code> en el CMS con:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Qué datos se recopilan (visitas, formularios de contacto, cookies)</li>
          <li>Finalidad del tratamiento (analítica, marketing, funcional)</li>
          <li>Base legal (consentimiento, interés legítimo)</li>
          <li>Derechos del usuario (acceso, rectificación, eliminación)</li>
          <li>Datos de contacto del responsable</li>
        </ul>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Requisitos legales (RODO/GDPR)</h3>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 my-2">
          <p className="text-sm text-amber-800"><strong>⚠️ Importante:</strong> Bajo RODO (GDPR polaco), el consentimiento debe ser:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2 text-amber-700">
            <li><strong>Libre</strong> — el usuario puede rechazar sin perder funcionalidad esencial</li>
            <li><strong>Informado</strong> — explicar qué cookies se usan y para qué</li>
            <li><strong>Específico</strong> — categorías separadas (esenciales, analytics, marketing)</li>
            <li><strong>Revocable</strong> — el usuario puede cambiar su elección en cualquier momento</li>
          </ul>
        </div>
      </>
    )
  },
  {
    id: 'd-workflow',
    title: 'Workflow de desarrollo',
    icon: Monitor,
    category: 'Deployment',
    content: (
      <>
        <h3 className="font-semibold text-gray-900 mt-2 mb-2">Desarrollo local</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`# Terminal 1 — Frontend Next.js
cd root/
npm run dev          # → http://localhost:3000

# Terminal 2 — CMS Panel
cd cms/
npm run dev          # → http://localhost:5174/panel

# Ambos comparten la misma DB de Supabase`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Git workflow sugerido</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`main              ← producción
├── develop        ← integración
│   ├── feature/nueva-pagina
│   ├── feature/cms-shop-module
│   └── fix/realizacje-images`}</pre>
        <h3 className="font-semibold text-gray-900 mt-6 mb-2">Build producción</h3>
        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">{`# CMS (SPA estática)
cd cms && npm run build
# Output: cms/dist/ → deploy a Netlify/Vercel/S3

# Next.js (SSR + ISR)
npm run build
# Deploy a Vercel (recomendado) o node server con PM2`}</pre>
      </>
    )
  },
]

// ==================== MAIN COMPONENT ====================
type TabType = 'user' | 'dev'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('user')
  const [activeId, setActiveId] = useState('u-welcome')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const currentSections = activeTab === 'user' ? userSections : devSections

  // Reset activeId when switching tabs
  useEffect(() => {
    setActiveId(currentSections[0]?.id || '')
  }, [activeTab])

  // Auto-expand categories
  useEffect(() => {
    const cats: Record<string, boolean> = {}
    currentSections.forEach(s => { cats[s.category] = true })
    setExpandedCategories(cats)
  }, [])

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const ids = currentSections.map(s => s.id)
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(ids[i])
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSections])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
      setSidebarOpen(false)
    }
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filteredSections = searchQuery
    ? currentSections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentSections

  const filteredCategories = Array.from(new Map(filteredSections.map(s => [s.category, s.category])).values())

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 overflow-y-auto transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-sky-600" />
              <h2 className="text-lg font-bold text-gray-900">Dokumentacja</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 mb-3">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'user' ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen size={12} />
              Użytkownik
            </button>
            <button
              onClick={() => setActiveTab('dev')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'dev' ? 'bg-white text-slate-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code size={12} />
              Deweloper
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="p-3">
          {filteredCategories.map(cat => (
            <div key={cat} className="mb-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                {expandedCategories[cat] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {cat}
              </button>
              {expandedCategories[cat] && (
                <div className="ml-1">
                  {filteredSections.filter(s => s.category === cat).map(s => {
                    const Icon = s.icon
                    const isActive = s.id === activeId
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left ${
                          isActive
                            ? 'bg-sky-50 text-sky-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={14} className={isActive ? 'text-sky-500' : 'text-gray-400'} />
                        {s.title}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
            <Menu size={20} />
          </button>
          <BookOpen size={18} className="text-sky-600" />
          <span className="font-semibold text-gray-900 text-sm">
            Dokumentacja — {activeTab === 'user' ? 'Użytkownik' : 'Deweloper'}
          </span>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 lg:px-12">
          {/* Tab indicator */}
          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setActiveTab('user')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'user' ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookMarked size={16} />
                Dla użytkowników
              </button>
              <button
                onClick={() => setActiveTab('dev')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'dev' ? 'bg-white text-slate-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package size={16} />
                Dla deweloperów
              </button>
            </div>
          </div>

          {currentSections.map((section) => (
            <section key={section.id} id={section.id} className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeTab === 'user' ? 'bg-sky-50' : 'bg-slate-100'
                }`}>
                  <section.icon size={20} className={activeTab === 'user' ? 'text-sky-600' : 'text-slate-600'} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.category}</p>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}

          <hr className="my-12 border-gray-200" />
          <p className="text-xs text-gray-400 text-center">
            {activeTab === 'user'
              ? 'Dokumentacja użytkownika — CMS v1.0 — kwiecień 2026'
              : 'Dokumentacja techniczna — CMS v1.0 — kwiecień 2026'
            }
          </p>
        </div>
      </main>
    </div>
  )
}

