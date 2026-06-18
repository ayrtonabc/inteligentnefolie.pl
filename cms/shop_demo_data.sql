-- =====================================================
-- SQL DEMO DATA dla Sklepu E-commerce (Polska)
-- Złoty polski (PLN), Dostawa DPD, Płatności PayU
-- =====================================================

-- Wstaw ustawienia sklepu (PLN, VAT 23%)
INSERT INTO shop_settings (
  store_name,
  currency,
  tax_rate,
  tax_included_in_prices,
  stripe_enabled,
  free_shipping_threshold,
  created_at,
  updated_at
) VALUES (
  'Sklep Demo PL',
  'PLN',
  23,
  true,
  false,
  200.00,
  NOW(),
  NOW()
);

-- Kategorie produktów
INSERT INTO shop_categories (id, name, slug, description, is_active, sort_order, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Elektronika', 'elektronika', 'Urządzenia elektroniczne i gadżety', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'Moda', 'moda', 'Ubrania i akcesoria modowe', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Dom i Ogród', 'dom-i-ogrod', 'Meble, wyposażenie i dekoracje', true, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Sport', 'sport', 'Sprzęt sportowy i rekreacyjny', true, 4, NOW(), NOW()),
  (gen_random_uuid(), 'Książki', 'ksiazki', 'Literatura i podręczniki', true, 5, NOW(), NOW());

-- Produkty (Elektronika)
WITH elektronika AS (SELECT id FROM shop_categories WHERE slug = 'elektronika' LIMIT 1)
INSERT INTO shop_products (
  id, category_id, name, slug, sku, description, short_description,
  price, compare_price, cost_price, stock, track_stock, allow_backorders,
  status, featured, images, tags, weight, dimensions, created_at, updated_at
) VALUES
  (gen_random_uuid(), (SELECT id FROM elektronika),
   'Smartfon Samsung Galaxy S24', 'smartfon-samsung-galaxy-s24', 'SMS-S24-001',
   'Najnowszy smartfon Samsung z serii Galaxy S24. Ekran AMOLED 6.2", procesor Snapdragon 8 Gen 3, 8GB RAM, 256GB pamięci. Aparat 50MP z OIS.',
   'Flagowy smartfon Samsung Galaxy S24 z najnowszym procesorem',
   3999.00, 4299.00, 3200.00, 25, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1610945265078-3858a0828671?w=500'],
   ARRAY['smartfon', 'samsung', 'galaxy', 'android'], 0.168,
   '{"length": 14.7, "width": 7.0, "height": 0.79}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM elektronika),
   'Laptop Dell XPS 15', 'laptop-dell-xps-15', 'LPT-DXP-001',
   'Laptop biznesowy Dell XPS 15 z ekranem 15.6" 4K OLED, procesor Intel Core i7-13700H, 16GB RAM, dysk SSD 512GB, karta graficzna RTX 4050.',
   'Profesjonalny laptop Dell XPS 15 z ekranem OLED 4K',
   6999.00, 7499.00, 5600.00, 12, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500'],
   ARRAY['laptop', 'dell', 'xps', 'biznes'], 1.86,
   '{"length": 34.4, "width": 23.0, "height": 1.8}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM elektronika),
   'Słuchawki Apple AirPods Pro 2', 'sluchawki-apple-airpods-pro-2', 'AUD-APP-001',
   'Bezprzewodowe słuchawki Apple AirPods Pro 2 generacji z aktywną redukcją szumów, przestrzenią audio i dopasowaniem na miarę.',
   'Premium słuchawki Apple z ANC i przestrzenią audio',
   1199.00, 1399.00, 950.00, 50, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1603351154351-5cfb3d04ef32?w=500'],
   ARRAY['sluchawki', 'apple', 'airpods', 'audio'], 0.005,
   '{"length": 4.5, "width": 5.4, "height": 2.1}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM elektronika),
   'Smartwatch Garmin Fenix 7', 'smartwatch-garmin-fenix-7', 'WCH-GRM-001',
   'Zaawansowany zegarek sportowy Garmin Fenix 7 z GPS, monitorowaniem tętna, mapami topograficznymi i wieloma profilami sportowymi.',
   'Sportowy smartwatch Garmin z GPS i wieloma funkcjami',
   2499.00, 2799.00, 2000.00, 18, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'],
   ARRAY['zegarek', 'garmin', 'sport', 'gps'], 0.079,
   '{"length": 4.7, "width": 4.7, "height": 1.47}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM elektronika),
   'Głośnik JBL Flip 6', 'glosnik-jbl-flip-6', 'SPK-JBL-001',
   'Przenośny głośnik Bluetooth JBL Flip 6 z wodoodpornością IP67, 12 godzinami odtwarzania i głośnym, czystym dźwiękiem.',
   'Wodoodporny głośnik JBL z 12h odtwarzania',
   499.00, 599.00, 380.00, 35, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
   ARRAY['glosnik', 'jbl', 'bluetooth', 'portable'], 0.55,
   '{"length": 17.8, "width": 6.8, "height": 7.0}', NOW(), NOW());

-- Produkty (Moda)
WITH moda AS (SELECT id FROM shop_categories WHERE slug = 'moda' LIMIT 1)
INSERT INTO shop_products (
  id, category_id, name, slug, sku, description, short_description,
  price, compare_price, cost_price, stock, track_stock, allow_backorders,
  status, featured, images, tags, weight, dimensions, created_at, updated_at
) VALUES
  (gen_random_uuid(), (SELECT id FROM moda),
   'Kurtka Zimowa North Face', 'kurtka-zimowa-north-face', 'JKT-TNF-001',
   'Ciepła kurtka zimowa The North Face z technologią ThermoBall, wodoodporna i oddychająca, idealna na ekstremalne warunki.',
   'Ciepła kurtka zimowa z technologią ThermoBall',
   899.00, 1199.00, 650.00, 20, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'],
   ARRAY['kurtka', 'north-face', 'zima', 'outdoor'], 0.8,
   '{"length": 30, "width": 25, "height": 8}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM moda),
   'Buty Sportowe Nike Air Max', 'buty-sportowe-nike-air-max', 'SHO-NKE-001',
   'Ikoniczne buty Nike Air Max z widoczną jednostką Air, zapewniające komfort i styl na co dzień.',
   'Kultowe buty Nike Air Max z amortyzacją Air',
   549.00, 699.00, 380.00, 40, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
   ARRAY['buty', 'nike', 'air-max', 'sport'], 0.9,
   '{"length": 32, "width": 20, "height": 12}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM moda),
   'Torebka Skórzana', 'torebka-skorzana', 'BGG-LEA-001',
   'Elegancka torebka damska ze skóry naturalnej, pojemna z wieloma kieszeniami i regulowanym paskiem.',
   'Elegancka skórzana torebka damska',
   299.00, 399.00, 180.00, 15, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'],
   ARRAY['torebka', 'skora', 'moda', 'damska'], 0.45,
   '{"length": 28, "width": 22, "height": 10}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM moda),
   'Zegarek Męski Casio Edifice', 'zegarek-meski-casio-edifice', 'WTC-CAS-001',
   'Elegancki zegarek męski Casio Edifice z chronografem, szafirowym szkłem i wodoszczelnością 100m.',
   'Elegancki zegarek Casio z chronografem',
   649.00, 799.00, 450.00, 22, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
   ARRAY['zegarek', 'casio', 'edifice', 'meski'], 0.15,
   '{"length": 5.2, "width": 4.8, "height": 1.1}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM moda),
   'Okulary Przeciwsłoneczne Ray-Ban', 'okulary-przeciwsoneczne-ray-ban', 'SUN-RBN-001',
   'Stylowe okulary przeciwsłoneczne Ray-Ban Aviator z polaryzacją i ochroną UV400.',
   'Kultowe okulary Ray-Ban Aviator',
   499.00, 649.00, 320.00, 28, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
   ARRAY['okulary', 'ray-ban', 'aviator', 'slonce'], 0.03,
   '{"length": 14, "width": 5, "height": 4}', NOW(), NOW());

-- Produkty (Dom i Ogród)
WITH dom AS (SELECT id FROM shop_categories WHERE slug = 'dom-i-ogrod' LIMIT 1)
INSERT INTO shop_products (
  id, category_id, name, slug, sku, description, short_description,
  price, compare_price, cost_price, stock, track_stock, allow_backorders,
  status, featured, images, tags, weight, dimensions, created_at, updated_at
) VALUES
  (gen_random_uuid(), (SELECT id FROM dom),
   'Ekspres do Kawy DeLonghi', 'ekspres-do-kawy-delonghi', 'CFF-DLG-001',
   'Automatyczny ekspres do kawy DeLonghi z systemem Cappuccino, młynkiem ceramicznym i programowalnymi ustawieniami.',
   'Automatyczny ekspres do kawy z systemem Cappuccino',
   1299.00, 1599.00, 980.00, 10, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=500'],
   ARRAY['ekspres', 'kawa', 'delonghi', 'kuchnia'], 9.5,
   '{"length": 23.8, "width": 43.0, "height": 35.1}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM dom),
   'Zestaw Narzędzi Bosch', 'zestaw-narzedzi-bosch', 'TLS-BOS-001',
   'Profesjonalny zestaw narzędzi Bosch z wiertarką udarową, wkrętarką i akcesoriami w walizce.',
   'Zestaw elektronarzędzi Bosch dla majsterkowiczów',
   799.00, 999.00, 580.00, 18, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500'],
   ARRAY['narzedzia', 'bosch', 'wiertarka', 'majsterkowanie'], 4.2,
   '{"length": 45, "width": 35, "height": 15}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM dom),
   'Lampa LED Philips Hue', 'lampa-led-philips-hue', 'LAM-PHI-001',
   'Inteligentna lampa LED Philips Hue z możliwością sterowania kolorem i jasnością przez aplikację.',
   'Inteligentna lampa LED sterowana aplikacją',
   349.00, 449.00, 250.00, 30, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500'],
   ARRAY['lampa', 'philips', 'hue', 'inteligentny-dom'], 0.8,
   '{"length": 15, "width": 15, "height": 25}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM dom),
   'Grill Ogrodowy Weber', 'grill-ogrodowy-weber', 'GRL-WBR-001',
   'Klasyczny grill węglowy Weber z dużą powierzchnią grillowania, termometrem i systemem oczyszczania.',
   'Klasyczny grill węglowy Weber do ogrodu',
   699.00, 899.00, 520.00, 12, true, false, 'active', false,
   ARRAY['https://images.unsplash.com/photo-1555041469-a586c61bbaae?w=500'],
   ARRAY['grill', 'weber', 'ogrod', 'bbq'], 15.0,
   '{"length": 65, "width": 58, "height": 107}', NOW(), NOW()),

  (gen_random_uuid(), (SELECT id FROM dom),
   'Robot Odkurzacz iRobot Roomba', 'robot-odkurzacz-irobot-roomba', 'VAC-IRB-001',
   'Inteligentny robot odkurzacz iRobot Roomba z nawigacją, aplikacją mobilną i systemem automatycznego opróżniania.',
   'Inteligentny robot odkurzacz z aplikacją mobilną',
   1899.00, 2299.00, 1450.00, 8, true, false, 'active', true,
   ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500'],
   ARRAY['robot', 'odkurzacz', 'roomba', 'inteligentny-dom'], 3.4,
   '{"length": 34, "width": 34, "height": 9.2}', NOW(), NOW());

-- Klienci demo
INSERT INTO shop_customers (
  id, first_name, last_name, email, phone,
  accepts_marketing, total_orders, total_spent, notes, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'Jan', 'Kowalski', 'jan.kowalski@example.pl', '+48 500 123 456', true, 3, 5247.00, 'Stały klient, preferuje płatność BLIKiem', NOW() - INTERVAL '3 months', NOW()),
  (gen_random_uuid(), 'Anna', 'Nowak', 'anna.nowak@example.pl', '+48 512 234 567', true, 5, 3891.00, 'Zapisana na newsletter', NOW() - INTERVAL '6 months', NOW()),
  (gen_random_uuid(), 'Piotr', 'Wiśniewski', 'piotr.wisniewski@example.pl', '+48 603 345 678', false, 1, 899.00, 'Nowy klient', NOW() - INTERVAL '1 week', NOW()),
  (gen_random_uuid(), 'Katarzyna', 'Wójcik', 'kasia.wojcik@example.pl', '+48 794 456 789', true, 2, 2148.00, NULL, NOW() - INTERVAL '2 months', NOW()),
  (gen_random_uuid(), 'Michał', 'Kamiński', 'michal.kaminski@example.pl', '+48 505 567 890', false, 4, 6789.00, 'VIP - duże zamówienia', NOW() - INTERVAL '1 year', NOW());

-- Zamówienia demo
DO $$
DECLARE
  customer1_id UUID;
  customer2_id UUID;
  customer3_id UUID;
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
BEGIN
  -- Pobierz ID klientów
  SELECT id INTO customer1_id FROM shop_customers WHERE email = 'jan.kowalski@example.pl' LIMIT 1;
  SELECT id INTO customer2_id FROM shop_customers WHERE email = 'anna.nowak@example.pl' LIMIT 1;
  SELECT id INTO customer3_id FROM shop_customers WHERE email = 'michal.kaminski@example.pl' LIMIT 1;
  
  -- Pobierz ID produktów
  SELECT id INTO product1_id FROM shop_products WHERE sku = 'SMS-S24-001' LIMIT 1;
  SELECT id INTO product2_id FROM shop_products WHERE sku = 'LPT-DXP-001' LIMIT 1;
  SELECT id INTO product3_id FROM shop_products WHERE sku = 'JKT-TNF-001' LIMIT 1;

  -- Zamówienie 1 (Zrealizowane)
  INSERT INTO shop_orders (
    id, customer_id, order_number, status, payment_status, fulfillment_status,
    currency, subtotal, shipping_total, tax_total, discount_total, total,
    customer_email, customer_first_name, customer_last_name, customer_phone,
    shipping_address, billing_address, notes, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    customer1_id,
    'ZAM-2024-001',
    'delivered',
    'paid',
    'fulfilled',
    'PLN',
    3999.00, 15.00, 919.77, 0, 4933.77,
    'jan.kowalski@example.pl', 'Jan', 'Kowalski', '+48 500 123 456',
    '{"first_name": "Jan", "last_name": "Kowalski", "address1": "ul. Marszałkowska 100", "city": "Warszawa", "postal_code": "00-517", "country": "Polska", "phone": "+48 500 123 456"}',
    '{"first_name": "Jan", "last_name": "Kowalski", "address1": "ul. Marszałkowska 100", "city": "Warszawa", "postal_code": "00-517", "country": "Polska"}',
    NULL,
    NOW() - INTERVAL '2 weeks',
    NOW()
  );

  -- Zamówienie 2 (W realizacji)
  INSERT INTO shop_orders (
    id, customer_id, order_number, status, payment_status, fulfillment_status,
    currency, subtotal, shipping_total, tax_total, discount_total, total,
    customer_email, customer_first_name, customer_last_name, customer_phone,
    shipping_address, billing_address, notes, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    customer2_id,
    'ZAM-2024-002',
    'processing',
    'paid',
    'unfulfilled',
    'PLN',
    10497.00, 0, 2414.31, 500, 12411.31,
    'anna.nowak@example.pl', 'Anna', 'Nowak', '+48 512 234 567',
    '{"first_name": "Anna", "last_name": "Nowak", "address1": "ul. Gdańska 45", "city": "Kraków", "postal_code": "31-123", "country": "Polska", "phone": "+48 512 234 567"}',
    '{"first_name": "Anna", "last_name": "Nowak", "address1": "ul. Gdańska 45", "city": "Kraków", "postal_code": "31-123", "country": "Polska"}',
    'Proszę o przesłanie faktury VAT',
    NOW() - INTERVAL '3 days',
    NOW()
  );

  -- Zamówienie 3 (Oczekujące na płatność)
  INSERT INTO shop_orders (
    id, customer_id, order_number, status, payment_status, fulfillment_status,
    currency, subtotal, shipping_total, tax_total, discount_total, total,
    customer_email, customer_first_name, customer_last_name, customer_phone,
    shipping_address, billing_address, notes, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    customer3_id,
    'ZAM-2024-003',
    'pending',
    'pending',
    'unfulfilled',
    'PLN',
    6999.00, 15.00, 1609.77, 0, 8623.77,
    'michal.kaminski@example.pl', 'Michał', 'Kamiński', '+48 505 567 890',
    '{"first_name": "Michał", "last_name": "Kamiński", "address1": "ul. Słoneczna 78", "city": "Gdańsk", "postal_code": "80-123", "country": "Polska", "phone": "+48 505 567 890"}',
    '{"first_name": "Michał", "last_name": "Kamiński", "address1": "ul. Słoneczna 78", "city": "Gdańsk", "postal_code": "80-123", "country": "Polska"}',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW()
  );

END $$;

-- Dodaj pozycje do zamówień (wstawienie bezpośrednie z relacją do zamówień)
INSERT INTO shop_order_items (
  id, order_id, product_id, name, sku, quantity, price, total, created_at
)
SELECT 
  gen_random_uuid(),
  o.id,
  p.id,
  p.name,
  p.sku,
  1,
  p.price,
  p.price,
  NOW()
FROM shop_orders o
CROSS JOIN shop_products p
WHERE o.order_number = 'ZAM-2024-001' AND p.sku = 'SMS-S24-001'
UNION ALL
SELECT 
  gen_random_uuid(),
  o.id,
  p.id,
  p.name,
  p.sku,
  1,
  p.price,
  p.price,
  NOW()
FROM shop_orders o
CROSS JOIN shop_products p
WHERE o.order_number = 'ZAM-2024-002' AND p.sku IN ('LPT-DXP-001', 'AUD-APP-001', 'JKT-TNF-001')
UNION ALL
SELECT 
  gen_random_uuid(),
  o.id,
  p.id,
  p.name,
  p.sku,
  1,
  p.price,
  p.price,
  NOW()
FROM shop_orders o
CROSS JOIN shop_products p
WHERE o.order_number = 'ZAM-2024-003' AND p.sku = 'LPT-DXP-001';

-- Aktualizuj statystyki produktów
UPDATE shop_products 
SET 
  sales_count = CASE sku
    WHEN 'SMS-S24-001' THEN 1
    WHEN 'LPT-DXP-001' THEN 2
    WHEN 'AUD-APP-001' THEN 1
    WHEN 'JKT-TNF-001' THEN 1
    ELSE 0
  END,
  stock = stock - CASE sku
    WHEN 'SMS-S24-001' THEN 1
    WHEN 'LPT-DXP-001' THEN 2
    WHEN 'AUD-APP-001' THEN 1
    WHEN 'JKT-TNF-001' THEN 1
    ELSE 0
  END
WHERE sku IN ('SMS-S24-001', 'LPT-DXP-001', 'AUD-APP-001', 'JKT-TNF-001');

COMMIT;
