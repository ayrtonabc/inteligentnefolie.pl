-- ============================================================================
-- SEED DATA - Real Content from Next.js Frontend
-- ============================================================================
-- This file contains all the actual content from the Inteligentne Folie website
-- to populate the CMS database with real data.
-- ============================================================================

-- ============================================================================
-- MIGRACJE - Dodaj brakujące kolumny i napraw typy
-- ============================================================================

-- Dodaj kolumnę metadata do site_content jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_content' AND column_name = 'metadata') THEN
        ALTER TABLE public.site_content ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Zmień typ content_value z JSONB na TEXT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'site_content' AND column_name = 'content_value' AND data_type = 'jsonb') THEN
        ALTER TABLE public.site_content ALTER COLUMN content_value TYPE TEXT;
    END IF;
END $$;

-- Dodaj kolumnę website_id do blog_categories jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_categories' AND column_name = 'website_id') THEN
        ALTER TABLE public.blog_categories ADD COLUMN website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Dodaj kolumnę website_id do blog_posts jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'website_id') THEN
        ALTER TABLE public.blog_posts ADD COLUMN website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Dodaj kolumnę order_index do site_content jeśli nie istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_content' AND column_name = 'order_index') THEN
        ALTER TABLE public.site_content ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- 1. CMS PAGES (Strony do edycji w Page Editor)
-- ============================================================================

INSERT INTO public.cms_pages (id, website_id, title, path, language_code, content, seo, is_published, published_at) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Strona główna',
  '/',
  'pl',
  '[
    {"type": "hero", "section_key": "hero", "title": "hero_title", "subtitle": "hero_subtitle"},
    {"type": "features", "section_key": "features"},
    {"type": "how_it_works", "section_key": "how_it_works"},
    {"type": "comparison", "section_key": "comparison"},
    {"type": "calculator", "section_key": "calculator"},
    {"type": "products", "section_key": "products"},
    {"type": "portfolio", "section_key": "portfolio"},
    {"type": "faq", "section_key": "faq"},
    {"type": "cta", "section_key": "cta"}
  ]',
  '{"title": "Inteligentne Folie PDLC i LCD - Technologia Przyszłości", "description": "Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD. Technologia przyszłości dla Twojego domu i biura.", "keywords": "folia PDLC, folia LCD, inteligentne szkło, smart glass, montaż folii"}',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Inteligentne Folie',
  '/inteligentne-folie',
  'pl',
  '[
    {"type": "hero", "section_key": "products_hero"},
    {"type": "products_list", "section_key": "products_list"},
    {"type": "filters", "section_key": "filters"},
    {"type": "comparison_table", "section_key": "comparison_table"},
    {"type": "calculator", "section_key": "price_calculator"},
    {"type": "cta", "section_key": "products_cta"}
  ]',
  '{"title": "Inteligentne Folie PDLC i LCD - Produkt", "description": "Inteligentne folie PDLC i LCD na okna. Przełączanie między przezroczystością a prywatnością jednym przyciskiem.", "keywords": "folia PDLC, folia LCD, produkty, cena, wycena"}',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Montaż i Serwis',
  '/montaz-folii-inteligentnej',
  'pl',
  '[
    {"type": "hero", "section_key": "installation_hero"},
    {"type": "steps", "section_key": "installation_steps"},
    {"type": "benefits", "section_key": "installation_benefits"},
    {"type": "cta", "section_key": "installation_cta"}
  ]',
  '{"title": "Montaż folii PDLC i LCD - Profesjonalna instalacja", "description": "Profesjonalny montaż folii inteligentnych w całej Polsce. 10 lat gwarancji. Bezpłatny pomiar i wycena.", "keywords": "montaż folii, instalacja, serwis, gwarancja, pomiar"}',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Realizacje',
  '/realizacje',
  'pl',
  '[
    {"type": "hero", "section_key": "realizations_hero"},
    {"type": "projects", "section_key": "projects"},
    {"type": "before_after", "section_key": "before_after"},
    {"type": "cta", "section_key": "realizations_cta"}
  ]',
  '{"title": "Realizacje - Folie PDLC i LCD w akcji", "description": "Zobacz nasze realizacje folii inteligentnych PDLC i LCD. Apartamenty, biura, hotele. Zobacz efekt ON/OFF.", "keywords": "realizacje, portfolio, projekty, zdjęcia, efekt ON/OFF"}',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Blog',
  '/blog',
  'pl',
  '[
    {"type": "hero", "section_key": "blog_hero"},
    {"type": "posts", "section_key": "blog_posts"},
    {"type": "categories", "section_key": "blog_categories"}
  ]',
  '{"title": "Blog - Inteligentne Folie PDLC i LCD", "description": "Aktualności, porady i inspiracje związane z inteligentnymi foliami PDLC i LCD. Technologia przyszłości dla Twojego domu.", "keywords": "blog, aktualności, porady, inspiracje, PDLC, LCD"}',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  'Kontakt',
  '/kontakt',
  'pl',
  '[
    {"type": "hero", "section_key": "contact_hero"},
    {"type": "form", "section_key": "contact_form"},
    {"type": "info", "section_key": "contact_info"},
    {"type": "map", "section_key": "contact_map"}
  ]',
  '{"title": "Kontakt - Inteligentne Folie PDLC i LCD", "description": "Skontaktuj się z nami. Profesjonalne doradztwo, bezpłatna wycena. Montaż w całej Polsce.", "keywords": "kontakt, telefon, email, adres, wycena"}',
  true,
  NOW()
)
ON CONFLICT (path, language_code) DO UPDATE SET
  content = EXCLUDED.content,
  seo = EXCLUDED.seo,
  is_published = true,
  updated_at = NOW();

-- ============================================================================
-- 2. SITE CONTENT (Contenido de cada sección)
-- ============================================================================

-- HOME PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/', 'hero_title', 'text', 'Inteligentne folie PDLC i LCD na okna', 'pl', true, '{"section": "hero", "type": "title"}', 1),
(gen_random_uuid(), '/', 'hero_subtitle', 'text', 'Prywatność na żądanie bez rolet — do domu, biura i hoteli.', 'pl', true, '{"section": "hero", "type": "subtitle"}', 2),
(gen_random_uuid(), '/', 'hero_button_primary', 'json', '{"text": "Kontakt", "href": "/kontakt"}', 'pl', true, '{"section": "hero"}', 3),
(gen_random_uuid(), '/', 'hero_button_secondary', 'json', '{"text": "Zobacz produkty", "href": "/inteligentne-folie"}', 'pl', true, '{"section": "hero"}', 4),
(gen_random_uuid(), '/', 'hero_badges', 'json', '["Montaż w całej Polsce", "10 lat gwarancji", "Darmowa próbka"]', 'pl', true, '{"section": "hero"}', 5),
(gen_random_uuid(), '/', 'features_title', 'text', 'Dlaczego warto wybrać nasze folie?', 'pl', true, '{"section": "features"}', 6),
(gen_random_uuid(), '/', 'features_subtitle', 'text', 'Nowoczesna technologia, która zmienia przestrzeń', 'pl', true, '{"section": "features"}', 7),
(gen_random_uuid(), '/', 'how_it_works_title', 'text', 'Jak to działa?', 'pl', true, '{"section": "how_it_works"}', 8),
(gen_random_uuid(), '/', 'how_it_works_subtitle', 'text', 'Przełączanie między przezroczystością a prywatnością jednym przyciskiem', 'pl', true, '{"section": "how_it_works"}', 9),
(gen_random_uuid(), '/', 'products_title', 'text', 'Nasze produkty', 'pl', true, '{"section": "products"}', 10),
(gen_random_uuid(), '/', 'products_subtitle', 'text', 'Wybierz folię dopasowaną do Twoich potrzeb', 'pl', true, '{"section": "products"}', 11),
(gen_random_uuid(), '/', 'portfolio_title', 'text', 'Nasze realizacje', 'pl', true, '{"section": "portfolio"}', 12),
(gen_random_uuid(), '/', 'portfolio_subtitle', 'text', 'Zobacz jak inteligentne folie zmieniają przestrzenie', 'pl', true, '{"section": "portfolio"}', 13),
(gen_random_uuid(), '/', 'faq_title', 'text', 'Często zadawane pytania', 'pl', true, '{"section": "faq"}', 14),
(gen_random_uuid(), '/', 'cta_title', 'text', 'Gotowy na zmianę?', 'pl', true, '{"section": "cta"}', 15),
(gen_random_uuid(), '/', 'cta_subtitle', 'text', 'Skontaktuj się z nami i przekształć swoją przestrzeń dzięki inteligentnym foliom.', 'pl', true, '{"section": "cta"}', 16),
(gen_random_uuid(), '/', 'cta_button', 'json', '{"text": "Bezpłatna wycena", "href": "/kontakt"}', 'pl', true, '{"section": "cta"}', 17)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- PRODUCTS PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/inteligentne-folie', 'products_hero_title', 'text', 'Inteligentne folie PDLC i LCD', 'pl', true, '{"section": "hero"}', 1),
(gen_random_uuid(), '/inteligentne-folie', 'products_hero_subtitle', 'text', 'Wybierz idealną folię dla swojego projektu. Od domowych łazienek po biurowe sale konferencyjne.', 'pl', true, '{"section": "hero"}', 2),
(gen_random_uuid(), '/inteligentne-folie', 'filters_title', 'text', 'Filtruj produkty', 'pl', true, '{"section": "filters"}', 3),
(gen_random_uuid(), '/inteligentne-folie', 'comparison_title', 'text', 'Porównanie technologii', 'pl', true, '{"section": "comparison"}', 4),
(gen_random_uuid(), '/inteligentne-folie', 'calculator_title', 'text', 'Kalkulator ceny', 'pl', true, '{"section": "calculator"}', 5),
(gen_random_uuid(), '/inteligentne-folie', 'calculator_subtitle', 'text', 'Wprowadź wymiary i otrzymaj wstępną wycenę', 'pl', true, '{"section": "calculator"}', 6),
(gen_random_uuid(), '/inteligentne-folie', 'products_cta_title', 'text', 'Potrzebujesz pomocy?', 'pl', true, '{"section": "cta"}', 7),
(gen_random_uuid(), '/inteligentne-folie', 'products_cta_subtitle', 'text', 'Skontaktuj się z nami, doradzimy najlepsze rozwiązanie dla Twojego projektu.', 'pl', true, '{"section": "cta"}', 8)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- INSTALLATION PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'installation_hero_title', 'text', 'Profesjonalny montaż folii', 'pl', true, '{"section": "hero"}', 1),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'installation_hero_subtitle', 'text', 'Od pomiaru po instruktaż — kompleksowa obsługa w całej Polsce', 'pl', true, '{"section": "hero"}', 2),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'steps_title', 'text', 'Proces instalacji', 'pl', true, '{"section": "steps"}', 3),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'steps_subtitle', 'text', '5 kroków do inteligentnego szkła w Twoim wnętrzu', 'pl', true, '{"section": "steps"}', 4),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'steps_content', 'json', '[
  {"number": 1, "title": "Konsultacja i pomiar", "description": "Bezpłatny projekt, pomiar, doradztwo techniczne i wycena szczegółowa"},
  {"number": 2, "title": "Przygotowanie powierzchni", "description": "Dokładne czyszczenie szyb, usuwanie zanieczyszczeń i przygotowanie do montażu"},
  {"number": 3, "title": "Montaż folii", "description": "Precyzyjne naklejanie lub laminacja folii przez doświadczony zespół"},
  {"number": 4, "title": "Podłączenie i konfiguracja", "description": "Instalacja sterownika, podłączenie elektryczne, konfiguracja smart home"},
  {"number": 5, "title": "Testy i instruktaż", "description": "Sprawdzenie działania, szkolenie z obsługi, przekazanie dokumentacji"}
]', 'pl', true, '{"section": "steps", "type": "list"}', 5),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'benefits_title', 'text', 'Dlaczego nasz montaż?', 'pl', true, '{"section": "benefits"}', 6),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'benefits_content', 'json', '[
  {"title": "Doświadczony zespół", "description": "Ponad 10 lat doświadczenia w montażu folii inteligentnych", "icon": "users"},
  {"title": "Gwarancja 10 lat", "description": "Pełna gwarancja na produkt i montaż bez ukrytych kosztów", "icon": "shield"},
  {"title": "Szybki termin", "description": "Montaż w ciągu 7-14 dni od zamówienia", "icon": "clock"},
  {"title": "Cała Polska", "description": "Działamy na terenie całego kraju", "icon": "map"}
]', 'pl', true, '{"section": "benefits", "type": "list"}', 7),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'installation_cta_title', 'text', 'Zamów bezpłatny pomiar', 'pl', true, '{"section": "cta"}', 8),
(gen_random_uuid(), '/montaz-folii-inteligentnej', 'installation_cta_subtitle', 'text', 'Otrzymaj szczegółową wycenę i projekt dopasowany do Twoich potrzeb.', 'pl', true, '{"section": "cta"}', 9)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- REALIZATIONS PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/realizacje', 'realizations_hero_title', 'text', 'Nasze realizacje', 'pl', true, '{"section": "hero"}', 1),
(gen_random_uuid(), '/realizacje', 'realizations_hero_subtitle', 'text', 'Zobacz jak inteligentne folie PDLC i LCD zmieniają przestrzenie w apartamentach, biurach i hotelach', 'pl', true, '{"section": "hero"}', 2),
(gen_random_uuid(), '/realizacje', 'projects_title', 'text', 'Zobacz efekt ON/OFF', 'pl', true, '{"section": "projects"}', 3),
(gen_random_uuid(), '/realizacje', 'projects_subtitle', 'text', 'Przeciągnij suwak i zobacz różnicę', 'pl', true, '{"section": "projects"}', 4),
(gen_random_uuid(), '/realizacje', 'projects_data', 'json', '[
  {"id": 1, "number": "01", "title": "Apartament Warszawa", "category": "FOLIA PDLC • ŁAZIENKA", "description": "Montaż folii PDLC w luksusowej łazience. Przełączanie między trybem prywatności a pełną przezroczystością.", "beforeImage": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800", "afterImage": "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {"id": 2, "number": "02", "title": "Biuro Kraków", "category": "FOLIA PDLC • SALA KONFERENCYJNA", "description": "Inteligentne szkło w nowoczesnym biurze. Prywatność podczas spotkań, światło dzienne na co dzień.", "beforeImage": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800", "afterImage": "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {"id": 3, "number": "03", "title": "Hotel Gdańsk", "category": "FOLIA LCD • SZYBA PANORAMICZNA", "description": "Widok na morze z kontrolą prywatności. System Smart Glass z automatycznym sterowaniem.", "beforeImage": "https://images.pexels.com/photos/1454722/pexels-photo-1454722.jpeg?auto=compress&cs=tinysrgb&w=800", "afterImage": "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {"id": 4, "number": "04", "title": "Rezydencja Wrocław", "category": "FOLIA PDLC • DOM", "description": "Zastosowanie folii PDLC w domu jednorodzinnym. Prywatność na żądanie w salonie i sypialniach.", "beforeImage": "https://images.pexels.com/photos/1454496/pexels-photo-1454496.jpeg?auto=compress&cs=tinysrgb&w=800", "afterImage": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800"}
]', 'pl', true, '{"section": "projects", "type": "projects_list"}', 5),
(gen_random_uuid(), '/realizacje', 'realizations_cta_title', 'text', 'Masz podobny projekt?', 'pl', true, '{"section": "cta"}', 6),
(gen_random_uuid(), '/realizacje', 'realizations_cta_subtitle', 'text', 'Skontaktuj się z nami, przygotujemy indywidualną wycenę i projekt.', 'pl', true, '{"section": "cta"}', 7)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- BLOG PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/blog', 'blog_hero_title', 'text', 'Blog', 'pl', true, '{"section": "hero"}', 1),
(gen_random_uuid(), '/blog', 'blog_hero_subtitle', 'text', 'Aktualności, porady i inspiracje związane z inteligentnymi foliami', 'pl', true, '{"section": "hero"}', 2),
(gen_random_uuid(), '/blog', 'blog_categories', 'json', '["Wszystkie", "Technologia", "Montaż", "Inspiracje", "Porady", "Aktualności"]', 'pl', true, '{"section": "blog"}', 3)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- CONTACT PAGE CONTENT
INSERT INTO public.site_content (id, page_path, section_key, content_type, content_value, language_code, is_published, metadata, order_index) VALUES
(gen_random_uuid(), '/kontakt', 'contact_hero_title', 'text', 'Kontakt', 'pl', true, '{"section": "hero"}', 1),
(gen_random_uuid(), '/kontakt', 'contact_hero_subtitle', 'text', 'Skontaktuj się z nami. Odpowiemy na wszystkie pytania i przygotujemy bezpłatną wycenę.', 'pl', true, '{"section": "hero"}', 2),
(gen_random_uuid(), '/kontakt', 'contact_info', 'json', '{
  "phone": "+48 123 456 789",
  "email": "kontakt@inteligentnefolie.pl",
  "address": "ul. Przykładowa 123, 00-001 Warszawa",
  "hours": "Pon-Pt: 8:00 - 18:00, Sob: 9:00 - 14:00"
}', 'pl', true, '{"section": "contact", "type": "info"}', 3),
(gen_random_uuid(), '/kontakt', 'contact_form_title', 'text', 'Formularz kontaktowy', 'pl', true, '{"section": "form"}', 4),
(gen_random_uuid(), '/kontakt', 'contact_form_subtitle', 'text', 'Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin', 'pl', true, '{"section": "form"}', 5)
ON CONFLICT (page_path, section_key, language_code) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  is_published = true,
  updated_at = NOW();

-- ============================================================================
-- 3. BLOG POSTS (Real blog posts)
-- ============================================================================

INSERT INTO public.blog_categories (id, website_id, name, slug, description) VALUES
  (gen_random_uuid(), (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1), 'Technologia', 'technologia', 'Artykuły o technologii folii PDLC i LCD'),
  (gen_random_uuid(), (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1), 'Montaż', 'montaz', 'Porady dotyczące montażu i instalacji'),
  (gen_random_uuid(), (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1), 'Inspiracje', 'inspiracje', 'Realizacje i pomysły na aranżację'),
  (gen_random_uuid(), (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1), 'Porady', 'porady', 'Praktyczne porady i wskazówki'),
  (gen_random_uuid(), (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1), 'Aktualności', 'aktualnosci', 'Nowości i aktualności z branży')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_posts (id, website_id, category_id, title, slug, content, excerpt, cover_image_url, meta_title, meta_description, published, published_at) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  (SELECT id FROM public.blog_categories WHERE slug = 'technologia' LIMIT 1),
  'Czym jest folia PDLC? Kompletny przewodnik po technologii',
  'czym-jest-folia-pdlc',
  '<h2>Czym jest folia PDLC?</h2><p>Folia PDLC (Polymer Dispersed Liquid Crystal) to innowacyjna technologia, która pozwala na przełączanie szkła między stanem przezroczystym a mlecznym...</p>',
  'Poznaj technologię folii PDLC i dowiedz się jak działa inteligentne szkło.',
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
  'Czym jest folia PDLC? Kompletny przewodnik',
  'Poznaj technologię folii PDLC - jak działa inteligentne szkło, gdzie znajduje zastosowanie i jakie są jego zalety.',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  (SELECT id FROM public.blog_categories WHERE slug = 'montaz' LIMIT 1),
  'Montaż folii PDLC - krok po kroku',
  'montaz-folii-pdlc-krok-po-kroku',
  '<h2>Jak przebiega montaż folii PDLC?</h2><p>Montaż folii PDLC to proces wymagający precyzji i doświadczenia. W tym artykule opisujemy cały proces krok po kroku...</p>',
  'Profesjonalny montaż folii PDLC - od pomiaru po instruktaż obsługi.',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
  'Montaż folii PDLC - krok po kroku',
  'Dowiedz się jak przebiega profesjonalny montaż folii PDLC. Kompletny przewodnik od pomiaru po instruktaż obsługi.',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  (SELECT id FROM public.blog_categories WHERE slug = 'inspiracje' LIMIT 1),
  '5 kreatywnych zastosowań folii inteligentnych w domu',
  '5-kreatywnych-zastosowan-folii-w-domu',
  '<h2>Folia inteligentna w nowoczesnym domu</h2><p>Odkryj 5 kreatywnych sposobów na wykorzystanie folii inteligentnych w Twoim domu...</p>',
  'Inspiracje i pomysły na wykorzystanie folii PDLC w aranżacji wnętrz.',
  'https://images.pexels.com/photos/1454722/pexels-photo-1454722.jpeg',
  '5 kreatywnych zastosowań folii inteligentnych w domu',
  'Odkryj kreatywne sposoby wykorzystania folii inteligentnych w domu - od łazienki po sypialnię.',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  (SELECT id FROM public.blog_categories WHERE slug = 'porady' LIMIT 1),
  'Jak dbać o folię PDLC? Praktyczne wskazówki',
  'jak-dbac-o-folie-pdlc',
  '<h2>Pielęgnacja folii PDLC</h2><p>Folia PDLC wymaga minimalnej pielęgnacji, ale warto znać kilka podstawowych zasad...</p>',
  'Praktyczne porady dotyczące pielęgnacji i konserwacji folii PDLC.',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  'Jak dbać o folię PDLC? Praktyczne wskazówki',
  'Dowiedz się jak prawidłowo dbać o folię PDLC, aby cieszyć się nią przez wiele lat.',
  true,
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.websites WHERE name = 'Inteligentne Folie' LIMIT 1),
  (SELECT id FROM public.blog_categories WHERE slug = 'aktualnosci' LIMIT 1),
  'Nowoczesne biura z inteligentnym szkłem',
  'nowoczesne-biura-z-inteligentnym-szklem',
  '<h2>Rewolucja w biurach</h2><p>Inteligentne szkło zmienia oblicze nowoczesnych przestrzeni biurowych. Poznaj najnowsze trendy...</p>',
  'Jak inteligentne szkło zmienia nowoczesne przestrzenie biurowe?',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  'Nowoczesne biura z inteligentnym szkłem - trendy 2024',
  'Poznaj najnowsze trendy w wykorzystaniu inteligentnego szkła w biurach i przestrzeniach komercyjnych.',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  published = true,
  updated_at = NOW();

-- ============================================================================
-- 4. SITE SETTINGS (Additional settings)
-- ============================================================================

INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('company_name', '"Inteligentne Folie Sp. z o.o."', 'string', 'company', 'Nazwa firmy', true),
  ('company_nip', '"123-456-78-90"', 'string', 'company', 'NIP firmy', false),
  ('company_regon', '"123456789"', 'string', 'company', 'REGON firmy', false),
  ('social_facebook', '"https://facebook.com/inteligentnefolie"', 'url', 'social', 'Facebook', true),
  ('social_instagram', '"https://instagram.com/inteligentnefolie"', 'url', 'social', 'Instagram', true),
  ('social_linkedin', '"https://linkedin.com/company/inteligentnefolie"', 'url', 'social', 'LinkedIn', true),
  ('analytics_google_id', '"GA-XXXXXXXXX"', 'string', 'analytics', 'Google Analytics ID', false),
  ('cookie_banner_enabled', 'true', 'boolean', 'gdpr', 'Włączyć baner cookies', true),
  ('cookie_banner_text', '"Ta strona używa plików cookie, aby zapewnić najlepszą jakość usług."', 'string', 'gdpr', 'Tekst banera cookies', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
SELECT '✅ Seed data wgrany pomyślnie!' as status;
SELECT '📄 Strony CMS: Strona główna, Inteligentne Folie, Montaż, Realizacje, Blog, Kontakt' as pages;
SELECT '📝 Content: Wszystkie sekcje z oryginalnej strony' as content;
SELECT '📰 Blog: 5 artykułów' as blog;
SELECT '⚙️ Settings: Konfiguracja firmy i SEO' as settings;
SELECT '🚀 CMS jest gotowy do użycia!' as ready;
