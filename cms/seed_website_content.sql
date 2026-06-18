-- Seed data for website content
-- Run this after setting up the schema to populate initial content

-- Home Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/', 'hero_title', 'text', '{"text": "Inteligentne folie PDLC i LCD na okna"}', 'pl', 1, true),
('/', 'hero_subtitle', 'text', '{"text": "Prywatność na żądanie bez rolet — do domu, biura i hoteli."}', 'pl', 2, true),
('/', 'hero_button_primary', 'json', '{"text": "Kontakt", "href": "/kontakt"}', 'pl', 3, true),
('/', 'hero_button_secondary', 'json', '{"text": "Zobacz produkty", "href": "/inteligentne-folie"}', 'pl', 4, true),
('/', 'features_title', 'text', '{"text": "Dlaczego inteligentne folie PDLC to przyszłość wnętrz?"}', 'pl', 5, true),
('/', 'features_subtitle', 'text', '{"text": "Technologia PDLC i LCD pozwala w sekundę przełączyć szkło z matowego na przezroczyste. To prywatność, światło i nowoczesny design w jednej tafli."}', 'pl', 6, true),
('/', 'products_title', 'text', '{"text": "Najchętniej wybierane folie inteligentne"}', 'pl', 7, true),
('/', 'products_subtitle', 'text', '{"text": "Sprawdzone rozwiązania dla domu, biura i hoteli"}', 'pl', 8, true),
('/', 'cta_title', 'text', '{"text": "Zamów darmową próbkę folii PDLC"}', 'pl', 9, true),
('/', 'cta_subtitle', 'text', '{"text": "Przekonaj się na własne oczy, jak działa technologia PDLC. Wysyłamy próbki za darmo w całej Polsce!"}', 'pl', 10, true),
('/', 'cta_button', 'json', '{"text": "Zamów teraz bezpłatnie", "href": "/kontakt"}', 'pl', 11, true),
('/', 'portfolio_title', 'text', '{"text": "Nasze realizacje"}', 'pl', 12, true),
('/', 'portfolio_subtitle', '{"text": "Zobacz jak folia PDLC transformuje wnętrza w całej Polsce"}', 'pl', 13, true),
('/', 'faq_title', 'text', '{"text": "Najczęściej zadawane pytania"}', 'pl', 14, true),
('/', 'meta_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD - Technologia Przyszłości"}', 'pl', 0, true),
('/', 'meta_description', 'text', '{"text": "Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD. Technologia przyszłości dla Twojego domu i biura."}', 'pl', 0, true);

-- Products Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/inteligentne-folie', 'hero_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD"}', 'pl', 1, true),
('/inteligentne-folie', 'hero_subtitle', 'text', '{"text": "Folia elektryczna na okna i szyby — natychmiastowa prywatność, kontrola światła i nowoczesny design dla Twojego domu, biura lub hotelu."}', 'pl', 2, true),
('/inteligentne-folie', 'filters_title', 'text', '{"text": "Filtruj produkty"}', 'pl', 3, true),
('/inteligentne-folie', 'calculator_title', 'text', '{"text": "Kalkulator ceny — cięcie na wymiar"}', 'pl', 4, true),
('/inteligentne-folie', 'calculator_subtitle', 'text', '{"text": "Podaj wymiary, wybierz rodzaj, a my wyślemy darmową wycenę. Możesz zamówić folię PDLC lub LCD, z montażem lub bez."}', 'pl', 5, true),
('/inteligentne-folie', 'comparison_title', 'text', '{"text": "Porównanie: Folia samoprzylepna vs Folia do laminacji"}', 'pl', 6, true),
('/inteligentne-folie', 'help_title', 'text', '{"text": "Potrzebujesz pomocy w wyborze?"}', 'pl', 7, true),
('/inteligentne-folie', 'help_subtitle', 'text', '{"text": "Nasi eksperci pomogą Ci dobrać idealną folię inteligentną do Twoich potrzeb. Skontaktuj się z nami!"}', 'pl', 8, true),
('/inteligentne-folie', 'meta_title', 'text', '{"text": "Inteligentne Folie PDLC i LCD - Sklep"}', 'pl', 0, true),
('/inteligentne-folie', 'meta_description', 'text', '{"text": "Kup folię PDLC i LCD. Samoprzylepna i do laminacji. Ceny od 950 zł/m². Darmowa wycena i montaż w całej Polsce."}', 'pl', 0, true);

-- Installation Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/montaz-folii-inteligentnej', 'hero_title', 'text', '{"text": "Montaż folii krok po kroku"}', 'pl', 1, true),
('/montaz-folii-inteligentnej', 'hero_subtitle', 'text', '{"text": "Profesjonalny montaż folii PDLC i LCD w całej Polsce. Od konsultacji po serwis."}', 'pl', 2, true),
('/montaz-folii-inteligentnej', 'steps_title', 'text', '{"text": "Proces montażu krok po kroku"}', 'pl', 3, true),
('/montaz-folii-inteligentnej', 'steps_subtitle', 'text', '{"text": "Od konsultacji po gotowe rozwiązanie"}', 'pl', 4, true),
('/montaz-folii-inteligentnej', 'benefits_title', 'text', '{"text": "Dlaczego warto wybrać nasz montaż?"}', 'pl', 5, true),
('/montaz-folii-inteligentnej', 'benefits_subtitle', 'text', '{"text": "10 lat doświadczenia i 500+ zrealizowanych projektów"}', 'pl', 6, true),
('/montaz-folii-inteligentnej', 'cta_title', 'text', '{"text": "Umów bezpłatny pomiar i wycenę"}', 'pl', 7, true),
('/montaz-folii-inteligentnej', 'cta_subtitle', 'text', '{"text": "Nasi eksperci przyjadą do Ciebie, wykonają profesjonalny pomiar i przedstawią szczegółową wycenę"}', 'pl', 8, true),
('/montaz-folii-inteligentnej', 'meta_title', 'text', '{"text": "Montaż folii PDLC i LCD - Profesjonalna instalacja"}', 'pl', 0, true),
('/montaz-folii-inteligentnej', 'meta_description', 'text', '{"text": "Profesjonalny montaż folii inteligentnych w całej Polsce. 10 lat gwarancji. Bezpłatny pomiar i wycena."}', 'pl', 0, true);

-- Realizations Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/realizacje', 'hero_title', 'text', '{"text": "Nasze realizacje"}', 'pl', 1, true),
('/realizacje', 'hero_subtitle', 'text', '{"text": "Przesuń suwak aby zobaczyć efekt ON/OFF. Zobacz jak folia inteligentna transformuje wnętrza."}', 'pl', 2, true),
('/realizacje', 'meta_title', 'text', '{"text": "Realizacje - Folie PDLC i LCD w akcji"}', 'pl', 0, true),
('/realizacje', 'meta_description', 'text', '{"text": "Zobacz nasze realizacje folii inteligentnych PDLC i LCD. Apartamenty, biura, hotele. Zobacz efekt ON/OFF."}', 'pl', 0, true);

-- Contact Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/kontakt', 'hero_title', 'text', '{"text": "Skontaktuj się z nami"}', 'pl', 1, true),
('/kontakt', 'hero_subtitle', 'text', '{"text": "Masz pytanie? Napisz lub zadzwoń. Odpowiadamy w ciągu 24h."}', 'pl', 2, true),
('/kontakt', 'meta_title', 'text', '{"text": "Kontakt - Inteligentne Folie"}', 'pl', 0, true),
('/kontakt', 'meta_description', 'text', '{"text": "Skontaktuj się z nami. Darmowa wycena. Telefon: +48 123 456 789. Email: kontakt@inteligentnefolie.pl"}', 'pl', 0, true);

-- Blog Page Content
INSERT INTO site_content (page_path, section_key, content_type, content_value, language_code, order_index, is_active) VALUES
('/blog', 'hero_title', 'text', '{"text": "Blog"}', 'pl', 1, true),
('/blog', 'hero_subtitle', 'text', '{"text": "Aktualności, porady i inspiracje ze świata folii inteligentnych"}', 'pl', 2, true),
('/blog', 'meta_title', 'text', '{"text": "Blog - Folie PDLC i LCD"}', 'pl', 0, true),
('/blog', 'meta_description', 'text', '{"text": "Blog o foliach inteligentnych PDLC i LCD. Porady, inspiracje, aktualności."}', 'pl', 0, true);

-- Update default site settings for Inteligentne Folie
UPDATE site_settings 
SET setting_value = '"Inteligentne Folie"'
WHERE setting_key = 'site_name';

UPDATE site_settings 
SET setting_value = '"Wiodący specjalista w Polsce w zakresie Inteligentnych folii PDLC i LCD"'
WHERE setting_key = 'site_description';

UPDATE site_settings 
SET setting_value = '"+48 123 456 789"'
WHERE setting_key = 'whatsapp_number';

-- Insert if not exists
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description)
VALUES 
  ('contact_phone', '"+48 123 456 789"', 'string', 'contact', 'Primary contact phone'),
  ('contact_email', '"kontakt@inteligentnefolie.pl"', 'string', 'contact', 'Primary contact email'),
  ('business_hours', '"Pn-Pt: 9:00 - 18:00"', 'string', 'contact', 'Business hours'),
  ('address', '"ul. Przykładowa 123, 00-001 Warszawa"', 'string', 'contact', 'Business address')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();
