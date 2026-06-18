/*=====================================================================
  1️⃣  TABLAS BASE
=====================================================================*/
CREATE TABLE IF NOT EXISTS pages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          TEXT NOT NULL,
    tenant_id     TEXT NOT NULL DEFAULT 'tenant-local-dev',
    content       JSONB,
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, slug)
);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pages'
          AND column_name = 'published_at'
    ) THEN
        ALTER TABLE pages ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS component_types (
    type           TEXT PRIMARY KEY,
    label          TEXT NOT NULL,
    fields_def     JSONB NOT NULL,
    default_props  JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS page_components (
    id               BIGSERIAL PRIMARY KEY,
    page_id          UUID REFERENCES pages(id) ON DELETE CASCADE,
    component_type   TEXT REFERENCES component_types(type),
    component_data   JSONB NOT NULL,
    component_order  INT NOT NULL,
    UNIQUE (page_id, component_order)
);

/*=====================================================================
  2️⃣  DEFINICIONES REALES DE LOS COMPONENTES
  (tomados de los archivos bajo components/)
=====================================================================*/
INSERT INTO component_types (type, label, fields_def, default_props) VALUES

-- -------------------  HERO  -------------------
('Hero',
 'Hero Section',
 '{
    "hero_title":           { "label":"Tytuł","type":"text" },
    "hero_subtitle":        { "label":"Podtytuł","type":"textarea" },
    "hero_button_primary":  { "label":"Przycisk główny","type":"object","properties":{ "text":"{\"label\":\"Tekst\",\"type\":\"text\"}","href":"{\"label\":\"Link\",\"type\":\"text\"}" } },
    "hero_button_secondary":{ "label":"Przycisk drugorzędny","type":"object","properties":{ "text":"{\"label\":\"Tekst\",\"type\":\"text\"}","href":"{\"label\":\"Link\",\"type\":\"text\"}" } }
}'::jsonb,
 '{
    "hero_title":"Inteligentne folie PDLC i LCD na okna",
    "hero_subtitle":"Prywatność na żądanie bez rolet — do domu, biura i hoteli.",
    "hero_button_primary":{ "text":"Kontakt", "href":"/kontakt" },
    "hero_button_secondary":{ "text":"Zobacz produkty", "href":"/inteligentne-folie" }
}'::jsonb),

-- -------------------  FEATURES  -------------------
('Features',
 'Features Section',
 '{
    "features_title":    { "label":"Tytuł sekcji","type":"text" },
    "features_subtitle": { "label":"Podtytuł","type":"text" },
    "features_list":     { "label":"Lista cech","type":"array",
                            "items":{
                                "type":"object",
                                "properties":{
                                    "icon":{ "label":"Ikona","type":"select","options":["Shield","Zap","Sparkles","Smartphone","Clock"] },
                                    "title":{ "label":"Tytuł","type":"text" },
                                    "description":{ "label":"Opis","type":"textarea" }
                                }
                            }
                          }
}'::jsonb,
 '{
    "features_title":"Dlaczego warto wybrać nasze folie?",
    "features_subtitle":"Nowoczesna technologia, która zmienia przestrzeń",
    "features_list":[
        { "icon":"Shield", "title":"Prywatność na żądanie", "description":"Natychmiastowe zamienianie przezroczystej szyby w matową jednym kliknięciem. Pełna kontrola nad prywatnością." },
        { "icon":"Zap", "title":"Oszczędność energii", "description":"Redukcja kosztów klimatyzacji do 30%. Blokada promieniowania UV i ciepła bez utraty światła." },
        { "icon":"Sparkles", "title":"Elegancja premium", "description":"Nowoczesna technologia, która nadaje wnętrzom ekskluzywny, futurystyczny charakter." },
        { "icon":"Smartphone", "title":"Łatwe sterowanie", "description":"Obsługa przez smartfona, pilota, włącznik lub automatykę. Integracja z Alexa i Google Home." },
        { "icon":"Clock", "title":"Trwałość i jakość", "description":"10-letnia gwarancja producenta. Odporna na zarysowania, wilgoć i promieniowanie UV." }
    ]
}'::jsonb),

-- -------------------  HOW IT WORKS  -------------------
('HowItWorks',
 'How It Works Section',
 '{
    "how_it_works_title":           { "label":"Tytuł sekcji","type":"text" },
    "how_it_works_subtitle":          { "label":"Podtytuł","type":"textarea" },
    "how_it_works_off_title":         { "label":"Tytuł OFF (mat)","type":"text" },
    "how_it_works_off_description":   { "label":"Opis OFF","type":"textarea" },
    "how_it_works_on_title":          { "label":"Tytuł ON (przezroczysta)","type":"text" },
    "how_it_works_on_description":    { "label":"Opis ON","type":"textarea" }
}'::jsonb,
 '{
    "how_it_works_title":"Jak to działa?",
    "how_it_works_subtitle":"Przełączanie między przezroczystością a prywatnością jednym przyciskiem",
    "how_it_works_off_title":"OFF – mat (prywatność)",
    "how_it_works_off_description":"Bez zasilania kryształy ciekłe rozpraszają światło. Szkło jest matowe, a obraz za szybą niewidoczny. Idealne do łazienek i gabinetów.",
    "how_it_works_on_title":"ON – przezroczysta (światło)",
    "how_it_works_on_description":"Po podaniu napięcia kryształy ustawiają się równolegle i przepuszczają światło. Wersja laminowana zapewnia najwyższą klarowność."
}'::jsonb),

-- -------------------  COMPARISON TABLE  -------------------
('ComparisonTable',
 'Comparison Table Section',
 '{
    "comparison_title":       { "label":"Tytuł sekcji","type":"text" },
    "comparison_col1_header": { "label":"Nagłówek kolumny 1","type":"text" },
    "comparison_col2_header": { "label":"Nagłówek kolumny 2","type":"text" },
    "comparison_rows":        { "label":"Wiersze porównania","type":"array",
                               "items":{
                                   "type":"object",
                                   "properties":{
                                       "feature":{ "label":"Cecha","type":"text" },
                                       "selfAdhesive":{ "label":"Samoprzylepna","type":"text" },
                                       "laminated":{ "label":"Do laminacji","type":"text" }
                                   }
                               }
                             }
}'::jsonb,
 '{
    "comparison_title":"Folia samoprzylepna vs do laminacji",
    "comparison_col1_header":"Samoprzylepna PDLC",
    "comparison_col2_header":"Do laminacji LCD/PDLC",
    "comparison_rows":[
        { "feature":"Montaż", "selfAdhesive":"Na istniejącej szybie (szybko)", "laminated":"W procesie laminacji (efekt premium)" },
        { "feature":"Przezroczystość ON", "selfAdhesive":"~80-85%", "laminated":"~90-92%" },
        { "feature":"Najlepsze dla", "selfAdhesive":"Domy, biura, łazienki", "laminated":"Hotele, inwestycje premium" }
    ]
}'::jsonb),

-- -------------------  PRODUCTS  -------------------
('Products',
 'Products Section',
 '{
    "products_title":    { "label":"Tytuł sekcji","type":"text" },
    "products_subtitle": { "label":"Podtytuł","type":"text" }
}'::jsonb,
 '{
    "products_title":"Najchętniej wybierane folie inteligentne",
    "products_subtitle":"Sprawdzone rozwiązania dla domu, biura i hoteli"
}'::jsonb),

-- -------------------  PORTFOLIO  -------------------
('Portfolio',
 'Portfolio Section',
 '{
    "portfolio_title":       { "label":"Tytuł sekcji","type":"text" },
    "portfolio_subtitle":    { "label":"Podtytuł","type":"text" },
    "portfolio_button_text": { "label":"Tekst przycisku","type":"text" },
    "portfolio_projects":    { "label":"Projekty","type":"array",
                               "items":{
                                   "type":"object",
                                   "properties":{
                                       "image":{ "label":"URL zdjęcia","type":"text" },
                                       "title":{ "label":"Tytuł projektu","type":"text" },
                                       "category":{ "label":"Kategoria","type":"text" }
                                   }
                               }
                             }
}'::jsonb,
 '{
    "portfolio_title":"Nasze realizacje",
    "portfolio_subtitle":"Zobacz jak folia PDLC transformuje wnętrza w całej Polsce",
    "portfolio_button_text":"Zobacz wszystkie realizacje",
    "portfolio_projects":[
        { "image":"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Apartament Warszawa", "category":"Łazienka z folią PDLC" },
        { "image":"https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Biuro Kraków", "category":"Szkło konferencyjne" },
        { "image":"https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Hotel Gdańsk", "category":"Szyby panoramiczne" },
        { "image":"https://images.pexels.com/photos/1454496/pexels-photo-1454496.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Rezydencja Wrocław", "category":"Drzwi szklane" },
        { "image":"https://images.pexels.com/photos/1454722/pexels-photo-1454722.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Showroom Poznań", "category":"Witryny sklepowe" },
        { "image":"https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Klinika Łódź", "category":"Kabiny prysznicowe" }
    ]
}'::jsonb),

-- -------------------  FAQ  -------------------
('FAQ',
 'FAQ Section',
 '{
    "faq_title":  { "label":"Tytuł sekcji","type":"text" },
    "faq_items":  { "label":"Pytania i odpowiedzi","type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "question":{ "label":"Pytanie","type":"textarea" },
                            "answer":{ "label":"Odpowiedź","type":"textarea" }
                        }
                    }
                  }
}'::jsonb,
 '{
    "faq_title":"Często zadawane pytania",
    "faq_items":[
        { "question":"Jaka jest różnica między folią PDLC a LCD?", "answer":"Folia PDLC to samoprzylepna folia montowana na istniejących szybach, natomiast folia LCD wymaga procesu laminacji w szkle. Folie LCD oferują wyższą przezroczystość (~90-92% vs ~80-85%) i są bardziej trwałe, idealne dla projektów premium." },
        { "question":"Czy folia PDLC może być montowana na istniejących szybach?", "answer":"Tak, folia PDLC samoprzylepna jest idealna do montażu na istniejących szybach. Jest to szybkie i ekonomiczne rozwiązanie, które nie wymaga wymiany całej szyby." },
        { "question":"Jaka jest żywotność folii PDLC i LCD?", "answer":"Folie PDLC i LCD oferują długą żywotność — minimum 10 lat przy normalnym użytkowaniu. Wersje premium mogą działać nawet 15-20 lat. Wszystkie nasze produkty objęte są gwarancją producenta." },
        { "question":"Czy folia PDLC chroni przed promieniowaniem UV?", "answer":"Tak, folie PDLC blokują do 99% szkodliwego promieniowania UV, chroniąc wnętrze i mieszkańców przed jego negatywnym wpływem. Dodatkowo redukują nagrzewanie się pomieszczeń." },
        { "question":"Jak sterować folią PDLC — czy można to zrobić zdalnie?", "answer":"Folia PDLC może być sterowana na wiele sposobów: przełącznik naścienny, pilot zdalnego sterowania, aplikacja mobilna, a także integracja z systemami smart home (Google Home, Alexa). Sterowanie zdalne jest możliwe dzięki dedykowanym sterownikom WiFi." }
    ]
}'::jsonb),

-- -------------------  CTA  -------------------
('CTA',
 'CTA Section',
 '{
    "cta_title":    { "label":"Tytuł","type":"text" },
    "cta_subtitle": { "label":"Podtytuł","type":"textarea" },
    "cta_button":   { "label":"Przycisk","type":"object",
                       "properties":{
                           "text":{ "label":"Tekst","type":"text" },
                           "href":{ "label":"Link","type":"text" }
                       }
                     }
}'::jsonb,
 '{
    "cta_title":"Zamów darmową próbkę folii PDLC",
    "cta_subtitle":"Przekonaj się na własne oczy, jak działa technologia PDLC. Wysyłamy próbki za darmo w całej Polsce!",
    "cta_button":{ "text":"Zamów teraz bezpłatnie", "href":"/kontakt" }
}'::jsonb)

ON CONFLICT (type) DO NOTHING;

/*=====================================================================
  3️⃣  INSERCIÓN DE LAS PÁGINAS REALES
=====================================================================*/
INSERT INTO pages (slug, title, content, published_at) VALUES

-- ----------  Home (/) ----------
('home',
 'Inteligentne Folie PDLC i LCD - Technologia Przyszłości',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Inteligentne folie PDLC i LCD na okna", "hero_subtitle":"Prywatność na żądanie bez rolet — do domu, biura i hoteli.", "hero_button_primary":{ "text":"Kontakt", "href":"/kontakt" }, "hero_button_secondary":{ "text":"Zobacz produkty", "href":"/inteligentne-folie" } } },
        { "type":"Features", "props":{ "features_title":"Dlaczego warto wybrać nasze folie?", "features_subtitle":"Nowoczesna technologia, która zmienia przestrzeń", "features_list":[ { "icon":"Shield", "title":"Prywatność na żądanie", "description":"Natychmiastowe zamienianie przezroczystej szyby w matową jednym kliknięciem." }, { "icon":"Zap", "title":"Oszczędność energii", "description":"Redukcja kosztów klimatyzacji do 30%." }, { "icon":"Sparkles", "title":"Elegancja premium", "description":"Nowoczesna technologia, która nadaje wnętrzom ekskluzywny charakter." }, { "icon":"Smartphone", "title":"Łatwe sterowanie", "description":"Obsługa przez smartfona, pilota, włącznik lub automatykę." }, { "icon":"Clock", "title":"Trwałość i jakość", "description":"10-letnia gwarancja producenta." } ] } },
        { "type":"HowItWorks", "props":{ "how_it_works_title":"Jak to działa?", "how_it_works_subtitle":"Przełączanie między przezroczystością a prywatnością jednym przyciskiem", "how_it_works_off_title":"OFF – mat (prywatność)", "how_it_works_off_description":"Bez zasilania kryształy ciekłe rozpraszają światło. Szkło jest matowe.", "how_it_works_on_title":"ON – przezroczysta (światło)", "how_it_works_on_description":"Po podaniu napięcia kryształy ustawiają się równolegle i przepuszczają światło." } },
        { "type":"ComparisonTable", "props":{ "comparison_title":"Folia samoprzylepna vs do laminacji", "comparison_col1_header":"Samoprzylepna PDLC", "comparison_col2_header":"Do laminacji LCD/PDLC", "comparison_rows":[ { "feature":"Montaż", "selfAdhesive":"Na istniejącej szybie (szybko)", "laminated":"W procesie laminacji (efekt premium)" }, { "feature":"Przezroczystość ON", "selfAdhesive":"~80-85%", "laminated":"~90-92%" }, { "feature":"Najlepsze dla", "selfAdhesive":"Domy, biura, łazienki", "laminated":"Hotele, inwestycje premium" } ] } },
        { "type":"Products", "props":{ "products_title":"Najchętniej wybierane folie inteligentne", "products_subtitle":"Sprawdzone rozwiązania dla domu, biura i hoteli" } },
        { "type":"Portfolio", "props":{ "portfolio_title":"Nasze realizacje", "portfolio_subtitle":"Zobacz jak folia PDLC transformuje wnętrza w całej Polsce", "portfolio_button_text":"Zobacz wszystkie realizacje", "portfolio_projects":[ { "image":"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Apartament Warszawa", "category":"Łazienka z folią PDLC" }, { "image":"https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Biuro Kraków", "category":"Szkło konferencyjne" }, { "image":"https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600", "title":"Hotel Gdańsk", "category":"Szyby panoramiczne" } ] } },
        { "type":"FAQ", "props":{ "faq_title":"Często zadawane pytania", "faq_items":[ { "question":"Jaka jest różnica między folią PDLC a LCD?", "answer":"Folia PDLC to samoprzylepna folia montowana na istniejących szybach, natomiast folia LCD wymaga laminacji." }, { "question":"Czy folia PDLC może być montowana na istniejących szybach?", "answer":"Tak, folia PDLC samoprzylepna jest idealna do montażu na istniejących szybach." }, { "question":"Jaka jest żywotność folii PDLC i LCD?", "answer":"Minimum 10 lat przy normalnym użytkowaniu." } ] } },
        { "type":"CTA", "props":{ "cta_title":"Zamów darmową próbkę folii PDLC", "cta_subtitle":"Przekonaj się na własne oczy, jak działa technologia PDLC.", "cta_button":{ "text":"Zamów teraz bezpłatnie", "href":"/kontakt" } } }
    ]
}'::jsonb, NOW()),

-- ----------  Blog (/blog) ----------
('blog',
 'Blog - Folie PDLC i LCD',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Blog", "hero_subtitle":"Aktualności, porady i inspiracje ze świata folii inteligentnych", "hero_button_primary":{ "text":"Zobacz artykuły", "href":"#articles" }, "hero_button_secondary":{ "text":"Zapisz się", "href":"#newsletter" } } }
    ]
}'::jsonb, NOW()),

-- ----------  Kontakt (/kontakt) ----------
('kontakt',
 'Kontakt - Inteligentne Folie',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Skontaktuj się z nami", "hero_subtitle":"Masz pytania o folie inteligentne? Chcesz umówić pomiar lub otrzymać wycenę?", "hero_button_primary":{ "text":"Zadzwoń", "href":"tel:+48123456789" }, "hero_button_secondary":{ "text":"Formularz", "href":"#form" } } }
    ]
}'::jsonb, NOW()),

-- ----------  Realizacje (/realizacje) ----------
('realizacje',
 'Realizacje - Folie PDLC i LCD w akcji',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Nasze realizacje", "hero_subtitle":"Przesuń suwak aby zobaczyć efekt ON/OFF. Zobacz jak folia inteligentna transformuje wnętrza.", "hero_button_primary":{ "text":"Zobacz realizacje", "href":"#projects" }, "hero_button_secondary":{ "text":"Zamów wycenę", "href":"/kontakt" } } },
        { "type":"CTA", "props":{ "cta_title":"Chcesz podobny efekt?", "cta_subtitle":"Skontaktuj się z nami i otrzymaj darmową wycenę swojego projektu.", "cta_button":{ "text":"Zapytaj o wycenę", "href":"/kontakt" } } }
    ]
}'::jsonb, NOW()),

-- ----------  Inteligentne Folie (/inteligentne-folie) ----------
('inteligentne-folie',
 'Inteligentne Folie PDLC i LCD - Sklep',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Inteligentne Folie PDLC i LCD", "hero_subtitle":"Folia elektryczna na okna i szyby — natychmiastowa prywatność, kontrola światła i nowoczesny design.", "hero_button_primary":{ "text":"Zobacz produkty", "href":"#products" }, "hero_button_secondary":{ "text":"Kalkulator", "href":"#calculator" } } },
        { "type":"ComparisonTable", "props":{ "comparison_title":"Porównanie: Folia samoprzylepna vs Folia do laminacji", "comparison_col1_header":"Folia samoprzylepna PDLC", "comparison_col2_header":"Folia do laminacji LCD", "comparison_rows":[ { "feature":"Montaż", "selfAdhesive":"Łatwy, DIY możliwy", "laminated":"Wymaga laminacji profesjonalnej" }, { "feature":"Przezroczystość ON", "selfAdhesive":"80-85%", "laminated":"90-92%" }, { "feature":"Trwałość", "selfAdhesive":"10 lat", "laminated":"15+ lat" }, { "feature":"Cena", "selfAdhesive":"od 950-1200 zł/m²", "laminated":"od 1500-2500 zł/m²" }, { "feature":"Najlepsze dla", "selfAdhesive":"Domów, biur, łazienek, szyb", "laminated":"Hoteli, dużych witryn, projektów premium" } ] } },
        { "type":"Products", "props":{ "products_title":"Najchętniej wybierane folie inteligentne", "products_subtitle":"Sprawdzone rozwiązania dla domu, biura i hoteli" } },
        { "type":"CTA", "props":{ "cta_title":"Potrzebujesz pomocy w wyborze?", "cta_subtitle":"Nasi eksperci pomogą Ci dobrać idealną folię inteligentną do Twoich potrzeb.", "cta_button":{ "text":"Skontaktuj się z ekspertem", "href":"/kontakt" } } }
    ]
}'::jsonb, NOW()),

-- ----------  Montaż (/montaz-folii-inteligentnej) ----------
('montaz-folii-inteligentnej',
 'Montaż folii PDLC i LCD - Profesjonalna instalacja',
 '{
    "content": [
        { "type":"Hero", "props":{ "hero_title":"Montaż folii krok po kroku", "hero_subtitle":"Profesjonalny montaż folii PDLC i LCD w całej Polsce. Od konsultacji po serwis.", "hero_button_primary":{ "text":"Zamów pomiar", "href":"/kontakt" }, "hero_button_secondary":{ "text":"Proces montażu", "href":"#steps" } } },
        { "type":"Features", "props":{ "features_title":"Dlaczego warto wybrać nasz montaż?", "features_subtitle":"Profesjonalizm i doświadczenie w każdym projekcie", "features_list":[ { "icon":"Users", "title":"Doświadczony zespół", "description":"Ponad 10 lat doświadczenia. 500+ zrealizowanych projektów" }, { "icon":"Shield", "title":"10 lat gwarancji", "description":"Pełna gwarancja na produkt i montaż" }, { "icon":"Clock", "title":"Szybka realizacja", "description":"Montaż standardowy w 1-2 dni robocze" }, { "icon":"MapPin", "title":"Cała Polska", "description":"Montaż w całej Polsce, bez dodatkowych kosztów dojazdu" } ] } },
        { "type":"CTA", "props":{ "cta_title":"Umów bezpłatny pomiar i wycenę", "cta_subtitle":"Nasi eksperci przyjadą do Ciebie, wykonają profesjonalny pomiar i przedstawią szczegółową wycenę.", "cta_button":{ "text":"Wypełnij formularz", "href":"/kontakt" } } }
    ]
}'::jsonb, NOW())

ON CONFLICT (slug) DO UPDATE
SET content = EXCLUDED.content,
    published_at = EXCLUDED.published_at;

/*=====================================================================
  4️⃣  RELACIÓN PÁGINA ↔ COMPONENTES (orden correcto)
=====================================================================*/
DO $$
DECLARE
    pg_rec      RECORD;
    comp_rec    RECORD;
    order_idx   INT;
BEGIN
    -- Limpiar componentes existentes
    DELETE FROM page_components;

    FOR pg_rec IN
        SELECT id, slug, content FROM pages
    LOOP
        order_idx := 1;
        FOR comp_rec IN
            SELECT 
                (element->>'type') as ctype,
                element as cdata
            FROM jsonb_array_elements(pg_rec.content->'content') AS element
        LOOP
            INSERT INTO page_components (page_id, component_type, component_data, component_order)
            VALUES (pg_rec.id, comp_rec.ctype, comp_rec.cdata, order_idx)
            ON CONFLICT DO NOTHING;
            order_idx := order_idx + 1;
        END LOOP;
    END LOOP;
END $$;

/*=====================================================================
  5️⃣  VALIDACIÓN
=====================================================================*/
SELECT count(*) AS total_pages          FROM pages;
SELECT count(*) AS total_component_types FROM component_types;
SELECT count(*) AS total_page_components FROM page_components;

-- Mostrar los componentes de cada página en orden
SELECT 
    p.slug as page_slug,
    pc.component_order,
    pc.component_type,
    pc.component_data->'props' as props
FROM page_components pc
JOIN pages p ON p.id = pc.page_id
ORDER BY p.slug, pc.component_order;
