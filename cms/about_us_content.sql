-- ====================================================================
-- ABOUT US (O NAS) PAGE - CMS CONTENT SEED
-- ====================================================================
-- Run this SQL in PocketBase Admin > SQL Shell
-- ====================================================================

-- HERO SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_hero_image', 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_hero_image', 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- ABOUT SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_section_about', 'O NASZEJ FIRMIE', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_welcome_title', 'Jesteśmy HETOR', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_welcome_text', 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą HETOR Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_company_name', 'HETOR Sp. z o.o.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_company_address', 'ul. Starołęcka 45, 61-361 Poznań', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_company_phone', '+48 790 555 900', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_email_1', 'biuro@scianki-szklane.com', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_email_2', 'biuro@inteligentnefolie.pl', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- GALLERY IMAGES (6 images)
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_gallery_1', 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_gallery_2', 'https://pb.fullwork.pl/api/files/pbc_2708086759/mv7c5owp9qxsur1/2_opt_kz1p4ed3i8.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_gallery_3', 'https://pb.fullwork.pl/api/files/pbc_2708086759/dejvpa5dl1zvlou/gal_scianki_27_sb_opt_k6klpvv1zk.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_gallery_4', 'https://pb.fullwork.pl/api/files/pbc_2708086759/0ayy95pegxq9fu5/5_opt_6st0pkuwzq.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_gallery_5', 'https://pb.fullwork.pl/api/files/pbc_2708086759/zrkb3l9wyl75eol/6_opt_pc8qsk8w68.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_gallery_6', 'https://pb.fullwork.pl/api/files/pbc_2708086759/t6mepmv1oj3d57h/4_opt_ioo5yfz3sm.webp', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- STATS SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_stat_projects', '500+', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_projects_label', 'Zrealizowanych projektów', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_years', '15+', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_years_label', 'Lat doświadczenia', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_clients', '300+', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_clients_label', 'Zadowolonych klientów', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_cities', '50+', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_stat_cities_label', 'Miast w Polsce', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- MISSION SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_section_values', 'NASZE WARTOŚCI', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_mission_image', 'https://pb.fullwork.pl/api/files/pbc_2708086759/750oxago8yu2ydt/scianki_inteligentne_13_sb_opt_2e4te9xw42.webp', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_mission_title', 'Nasza misja', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_mission_text', 'Dostarczamy naszym klientom najwyższej jakości rozwiązania szklane, które łączą funkcjonalność z estetyką. Dzięki indywidualnemu podejściu do każdego projektu realizujemy nawet najbardziej wymagające oczekiwania.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_title', 'Dlaczego wybrać HETOR i Inteligentne Folie?', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_item_1', 'HETOR i Inteligentne Folie to ta sama firma - lider w branży konstrukcji szklanych w Polsce, działająca pod firmą HETOR Sp. z o.o.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_item_2', 'Autoryzowany partner DORMA', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_item_3', 'Szkło hartowane i laminowane najwyższej jakości', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_item_4', 'Indywidualne podejście do każdego projektu', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_why_item_5', 'Realizacje od A do Z - pomiar, produkcja, montaż', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- PRODUCTS SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_products_label', 'Nasze produkty', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_products_title', 'Nasze produkty', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_products_subtitle', 'Kompleksowa oferta systemów szklanych', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_title', 'Systemy akcesoriów do drzwi', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_1', 'Studio Rondo', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_2', 'Studio Classic', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_3', 'Studio Gala 2', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_4', 'Studio Arcos', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_5', 'Office Junior', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_6', 'Manet Compact', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_7', 'MUTO', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_doorAccessories_8', '+12 więcej', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_title', 'Ścianki mobilne', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_1', 'HSW-G', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_2', 'HSW-GP', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_3', 'HSW-R', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_4', 'HSW-ISO', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_movableWalls_5', 'FSW', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_profiles_title', 'Profile systemowe', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_profiles_1', 'TP/TA', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_profiles_2', 'LM', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_profiles_3', 'MR 22/28', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_smartGlass_title', 'Folie inteligentne', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_smartGlass_1', 'PDLC', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_smartGlass_2', 'LCD', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_product_smartGlass_3', 'Integracja między szybowa', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- SERVICES SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_services_label', 'Usługi', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_services_title', 'Usługi', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_services_subtitle', 'Od projektu po montaż', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_services_offer', 'Oferujemy kompleksowe usługi montażu i wsparcia w budowie oraz projektowaniu nietypowych konstrukcji szklanych.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_services_warranty', 'Świadczymy również usługi gwarancyjne i pogwarancyjne.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_1_title', 'Profesjonalny montaż', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_1_desc', 'Nasi doświadczeni монтаżownicy realizują instalacje w całej Polsce, gwarantując najwyższą jakość wykonania.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_2_title', 'Doradztwo techniczne', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_2_desc', 'Pomagamy w doborze odpowiednich rozwiązań szklanych, uwzględniając indywidualne potrzeby każdego projektu.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_3_title', 'Gwarancja i serwis', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_3_desc', 'Oferujemy roczną gwarancję na wszystkie realizacje oraz profesjonalny serwis pogwarancyjny.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_4_title', 'Ekologia i recykling', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_service_4_desc', 'Dbamy o środowisko - zajmujemy się zbieraniem i utylizacją odpadów szklanych.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_contact_button', 'Skontaktuj się z nami', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- ECOLOGICAL SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_eco_title', 'Świadomi ekologicznie', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_eco_text', 'Dla ochrony środowiska zajmujemy się również zbieraniem i utylizacją odpadów szklanych.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_eco_image', '/images/reciclaje.webp', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- POLAND SECTION
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'about_poland_label', 'ZASIĘG DZIAŁANIA', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_poland_title', 'Pracujemy w całej Polsce', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_poland_text', 'Realizujemy projekty w każdym zakątku Polski. Niezależnie od lokalizacji, gwarantujemy profesjonalną obsługę i najwyższą jakość wykonania.', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_poland_button', 'Skontaktuj się z nami', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'about_poland_map', '/images/mapa.webp', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- SEO METADATA
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'pl', 'meta_title', 'O nas - HETOR Sp. z o.o. | Inteligentne Folie - Profesjonalne konstrukcje szklane', true, NOW(), NOW()),
  ('/o-nas', 'pl', 'meta_description', 'Poznaj HETOR Sp. z o.o. - specjalistów w dziedzinie konstrukcji szklanych, ścianek szklanych, balustrad i inteligentnych folii. Wieloletnie doświadczenie i profesjonalny montaż.', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- ====================================================================
-- ENGLISH TRANSLATIONS
-- ====================================================================
INSERT INTO "site_content" ("page_path", "language_code", "section_key", "content_value", "is_active", "created", "updated")
VALUES 
  ('/o-nas', 'en', 'about_section_about', 'ABOUT OUR COMPANY', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_welcome_title', 'We are HETOR', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_welcome_text', 'We are a leading manufacturer and installer of glass structures in Poland. We operate under HETOR Sp. z o.o. We specialize in the production of glass partitions, balustrades, glass doors, glass stairs, glass floors and innovative solutions using smart films.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_section_values', 'OUR VALUES', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_title', 'Why choose HETOR and Inteligentne Folie?', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_item_1', 'HETOR and Inteligentne Folie are the same company - a leader in the glass construction industry in Poland, operating under HETOR Sp. z o.o.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_item_2', 'Authorized DORMA partner', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_item_3', 'Highest quality tempered and laminated glass', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_item_4', 'Individual approach to every project', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_why_item_5', 'Turnkey solutions - measurement, production, installation', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_mission_title', 'Our mission', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_mission_text', 'We provide our clients with the highest quality glass solutions that combine functionality with aesthetics. Thanks to an individual approach to each project, we fulfill even the most demanding expectations.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_products_label', 'Our products', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_products_title', 'Our products', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_products_subtitle', 'Complete range of glass systems', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_services_label', 'Services', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_services_title', 'Services', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_services_subtitle', 'From design to installation', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_services_offer', 'We offer comprehensive installation services and support in the construction and design of unusual glass structures.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_services_warranty', 'We also provide warranty and post-warranty services.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_eco_title', 'Environmentally conscious', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_eco_text', 'To protect the environment, we also deal with the collection and disposal of glass waste.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_poland_label', 'COVERAGE AREA', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_poland_title', 'We work throughout Poland', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_poland_text', 'We carry out projects in every corner of Poland. Regardless of location, we guarantee professional service and the highest quality of work.', true, NOW(), NOW()),
  ('/o-nas', 'en', 'about_contact_button', 'Contact us', true, NOW(), NOW()),
  ('/o-nas', 'en', 'meta_title', 'About us - HETOR Sp. z o.o. | Inteligentne Folie - Professional glass constructions', true, NOW(), NOW()),
  ('/o-nas', 'en', 'meta_description', 'Meet HETOR Sp. z o.o. - specialists in glass constructions, glass partitions, balustrades and smart films. Many years of experience and professional installation.', true, NOW(), NOW())
ON CONFLICT ("page_path", "language_code", "section_key") DO UPDATE SET "content_value" = EXCLUDED."content_value";

-- ====================================================================
-- COMPLETE LIST OF CMS KEYS FOR ABOUT US PAGE
-- ====================================================================
/*
about_hero_image            - Hero banner image
about_section_about         - Label "O NASZEJ FIRMIE"
about_welcome_title         - Title "Jesteśmy HETOR"
about_welcome_text          - Company description
about_company_name          - Company name
about_company_address       - Company address
about_company_phone         - Phone number
about_email_1               - Email scianki-szklane.com
about_email_2               - Email inteligentnefolie.pl
about_gallery_1-6           - Gallery images (6)
about_stat_projects         - Stats value
about_stat_projects_label   - Stats label
about_stat_years            - Stats value
about_stat_years_label      - Stats label
about_stat_clients          - Stats value
about_stat_clients_label    - Stats label
about_stat_cities           - Stats value
about_stat_cities_label     - Stats label
about_section_values        - Label "NASZE WARTOŚCI"
about_mission_image         - Mission section image
about_mission_title         - Mission title
about_mission_text          - Mission text
about_why_title             - Why choose title
about_why_item_1-5          - Why choose items
about_products_label        - Products label
about_products_title         - Products title
about_products_subtitle      - Products subtitle
about_product_doorAccessories_title    - Door accessories category title
about_product_doorAccessories_1-8      - Door accessories items
about_product_movableWalls_title      - Movable walls category title
about_product_movableWalls_1-5          - Movable walls items
about_product_profiles_title          - Profiles category title
about_product_profiles_1-3            - Profiles items
about_product_smartGlass_title         - Smart glass category title
about_product_smartGlass_1-3           - Smart glass items
about_services_label        - Services label
about_services_title         - Services title
about_services_subtitle      - Services subtitle
about_services_offer        - Services offer text
about_services_warranty     - Warranty text
about_service_1_title       - Service 1 title
about_service_1_desc        - Service 1 description
about_service_2_title       - Service 2 title
about_service_2_desc        - Service 2 description
about_service_3_title       - Service 3 title
about_service_3_desc        - Service 3 description
about_service_4_title       - Service 4 title
about_service_4_desc        - Service 4 description
about_contact_button        - CTA button text
about_eco_title             - Ecological title
about_eco_text              - Ecological text
about_eco_image             - Ecological image
about_poland_label          - Poland section label
about_poland_title          - Poland section title
about_poland_text           - Poland section text
about_poland_button         - Poland CTA button
about_poland_map           - Poland map image
meta_title                  - SEO title
meta_description           - SEO description

TOTAL: 85 editable fields
*/