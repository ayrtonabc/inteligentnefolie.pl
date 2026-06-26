// seed_shop.js
// ====================================================================
// SCRIPT PARA POCKETBASE - POBLAR COLECCIONES DEL SHOP
// URL: https://pb.fullwork.pl
// ====================================================================

const PB_URL = 'https://pb.fullwork.pl';
const ADMIN_EMAIL = 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = 'Programista2026';
const WEBSITE_ID = 'dktsle4yev6syo4';

async function apiRequest(endpoint, method, body, token = null) {
  const url = `${PB_URL}${endpoint}`;
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (token) options.headers['Authorization'] = token;
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function seedShop() {
  try {
    console.log('🛒 Iniciando seed de SHOP...');
    
    // 1. Autenticarse
    console.log('\n🔐 Autenticando...');
    const authData = await apiRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = authData.token;
    console.log('✅ Autenticado');

    // ====================================================================
    // 2. CREAR CATEGORÍAS (shop_categories)
    // ====================================================================
    console.log('\n📁 Categorías...');
    const categories = [
      { name: 'Odzież', slug: 'odziez', description: 'Ubrania i akcesoria', icon: 'Shirt', order_index: 1 },
      { name: 'Elektronika', slug: 'elektronika', description: 'Gadżety i sprzęt', icon: 'Smartphone', order_index: 2 },
      { name: 'Dom i Ogród', slug: 'dom-ogrod', description: 'Wyposażenie domu', icon: 'Home', order_index: 3 },
      { name: 'Sport', slug: 'sport', description: 'Sprzęt sportowy', icon: 'Bike', order_index: 4 },
      { name: 'Uroda', slug: 'uroda', description: 'Kosmetyki i pielęgnacja', icon: 'Sparkles', order_index: 5 },
      { name: 'Akcesoria', slug: 'akcesoria', description: 'Dodatki i gadżety', icon: 'Watch', order_index: 6 },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const record = await apiRequest('/api/collections/shop_categories/records', 'POST', { ...cat, website_id: WEBSITE_ID }, token);
      categoryIds[cat.slug] = record.id;
      console.log(`  ✅ ${cat.name}`);
    }

    // ====================================================================
    // 3. CREAR PRODUCTOS (shop_products)
    // ====================================================================
    console.log('\n📦 Productos...');
    const products = [
      { name: 'Koszulka Premium Cotton', slug: 'koszulka-premium-cotton', price: 4999, compare_at_price: 6999, sku: 'KT-001', stock_quantity: 45, is_featured: true, category: categoryIds['odziez'], tags: ['bestseller','nowość'], discount_type: 'percentage', discount_value: 29 },
      { name: 'Słuchawki Bluetooth Pro', slug: 'sluchawki-bluetooth-pro', price: 14999, compare_at_price: 19999, sku: 'EL-001', stock_quantity: 72, is_featured: true, category: categoryIds['elektronika'], tags: ['gadżet','audio'], discount_type: 'percentage', discount_value: 25 },
      { name: 'Lampka LED Dotykowa', slug: 'lampka-led-dotykowa', price: 2999, compare_at_price: null, sku: 'DOM-001', stock_quantity: 120, is_featured: false, category: categoryIds['dom-ogrod'], tags: ['oświetlenie'] },
      { name: 'Rower Górski XT500', slug: 'rower-gorski-xt500', price: 249900, compare_at_price: 299900, sku: 'SP-001', stock_quantity: 8, is_featured: true, category: categoryIds['sport'], tags: ['premium','outdoor'], discount_type: 'fixed', discount_value: 500 },
      { name: 'Krem Nawilżający 50ml', slug: 'krem-nawilzajacy-50ml', price: 3999, compare_at_price: 5999, sku: 'UR-001', stock_quantity: 200, is_featured: false, category: categoryIds['uroda'], tags: ['pielęgnacja','bestseller'], discount_type: 'percentage', discount_value: 33 },
      { name: 'Smartwatch X200', slug: 'smartwatch-x200', price: 89999, compare_at_price: 109999, sku: 'AK-001', stock_quantity: 3, is_featured: true, category: categoryIds['akcesoria'], tags: ['gadżet','premium'], discount_type: 'fixed', discount_value: 200 },
      { name: 'Bluza z Kapturem', slug: 'bluza-z-kapturem', price: 7999, compare_at_price: 9999, sku: 'KT-002', stock_quantity: 60, is_featured: false, category: categoryIds['odziez'] },
      { name: 'PowerBank 20000mAh', slug: 'powerbank-20000mah', price: 5999, compare_at_price: null, sku: 'EL-002', stock_quantity: 150, is_featured: true, category: categoryIds['elektronika'], tags: ['gadżet','podróże'] },
      { name: 'Zestaw Doniczek 3szt', slug: 'zestaw-doniczek-3szt', price: 1999, compare_at_price: 2999, sku: 'DOM-002', stock_quantity: 85, is_featured: false, category: categoryIds['dom-ogrod'], discount_type: 'percentage', discount_value: 33 },
      { name: 'Buty Biegowe Ultra', slug: 'buty-biegowe-ultra', price: 19999, compare_at_price: 24999, sku: 'SP-002', stock_quantity: 2, is_featured: true, category: categoryIds['sport'], tags: ['bieganie','wyprzedaż'], discount_type: 'percentage', discount_value: 20 },
      { name: 'Kolczyki Srebrne', slug: 'kolczyki-srebrne', price: 4999, compare_at_price: null, sku: 'AK-002', stock_quantity: 10, is_featured: false, category: categoryIds['akcesoria'] },
      { name: 'Szampon Naturalny', slug: 'szampon-naturalny', price: 2499, compare_at_price: 3499, sku: 'UR-002', stock_quantity: 300, is_featured: false, category: categoryIds['uroda'], discount_type: 'percentage', discount_value: 29 },
    ];

    const productIds = {};
    for (const prod of products) {
      const record = await apiRequest('/api/collections/shop_products/records', 'POST', {
        ...prod,
        website_id: WEBSITE_ID,
        is_published: true,
        is_track_inventory: true,
        weight_unit: 'kg',
        discount_start: prod.discount_type !== 'none' && prod.discount_type ? '2025-01-01' : null,
        discount_end: prod.discount_type !== 'none' && prod.discount_type ? '2025-12-31' : null,
        free_shipping_on_product: prod.price > 10000,
      }, token);
      productIds[prod.slug] = record.id;
      console.log(`  ✅ ${prod.name} (${(prod.price/100).toFixed(2)} PLN)`);
    }

    // ====================================================================
    // 4. CREAR CLIENTES (shop_customers)
    // ====================================================================
    console.log('\n👥 Clientes...');
    const customers = [
      { email: 'anna.kowalska@email.pl', first_name: 'Anna', last_name: 'Kowalska', phone: '+48 501 234 567', accepts_marketing: true, total_orders: 3, total_spent: 45999, addresses: [{ type: 'shipping', city: 'Warszawa', postal_code: '00-001', country: 'PL', is_default: true }] },
      { email: 'piotr.nowak@email.pl', first_name: 'Piotr', last_name: 'Nowak', phone: '+48 502 345 678', accepts_marketing: false, total_orders: 1, total_spent: 14999, addresses: [{ type: 'shipping', city: 'Kraków', postal_code: '30-001', country: 'PL', is_default: true }] },
      { email: 'karolina.wisniewska@email.pl', first_name: 'Karolina', last_name: 'Wiśniewska', phone: '+48 503 456 789', accepts_marketing: true, total_orders: 5, total_spent: 124899, addresses: [{ type: 'shipping', city: 'Gdańsk', postal_code: '80-001', country: 'PL', is_default: true }] },
      { email: 'michal.dabrowski@email.pl', first_name: 'Michał', last_name: 'Dąbrowski', phone: '+48 504 567 890', accepts_marketing: true, total_orders: 2, total_spent: 28998, addresses: [{ type: 'shipping', city: 'Wrocław', postal_code: '50-001', country: 'PL', is_default: true }] },
      { email: 'aleksandra.lewandowska@email.pl', first_name: 'Aleksandra', last_name: 'Lewandowska', phone: '+48 505 678 901', accepts_marketing: false, total_orders: 4, total_spent: 75996, addresses: [{ type: 'shipping', city: 'Poznań', postal_code: '60-001', country: 'PL', is_default: true }] },
    ];

    const customerIds = {};
    for (const cust of customers) {
      const record = await apiRequest('/api/collections/shop_customers/records', 'POST', { ...cust, website_id: WEBSITE_ID }, token);
      customerIds[cust.email] = record.id;
      console.log(`  ✅ ${cust.first_name} ${cust.last_name}`);
    }

    // ====================================================================
    // 5. CREAR PEDIDOS (shop_orders)
    // ====================================================================
    console.log('\n📋 Pedidos...');
    const orderDefs = [
      { customer_name: 'Anna Kowalska', customer_email: 'anna.kowalska@email.pl', customer_phone: '+48 501 234 567', shipping_address: 'ul. Marszałkowska 1, 00-001 Warszawa', status: 'delivered', payment_status: 'paid', payment_method: 'blik', currency: 'PLN', items: [{ product_id: productIds['koszulka-premium-cotton'], product_name: 'Koszulka Premium Cotton', quantity: 2, price: 4999 }, { product_id: productIds['kolczyki-srebrne'], product_name: 'Kolczyki Srebrne', quantity: 1, price: 4999 }], subtotal: 14997, shipping_cost: 1699, tax: 3450, total: 20146 },
      { customer_name: 'Piotr Nowak', customer_email: 'piotr.nowak@email.pl', customer_phone: '+48 502 345 678', shipping_address: 'ul. Floriańska 5, 30-001 Kraków', status: 'delivered', payment_status: 'paid', payment_method: 'card', currency: 'PLN', items: [{ product_id: productIds['sluchawki-bluetooth-pro'], product_name: 'Słuchawki Bluetooth Pro', quantity: 1, price: 14999 }], subtotal: 14999, shipping_cost: 2499, tax: 3450, total: 20948 },
      { customer_name: 'Karolina Wiśniewska', customer_email: 'karolina.wisniewska@email.pl', customer_phone: '+48 503 456 789', shipping_address: 'ul. Długa 10, 80-001 Gdańsk', status: 'shipped', payment_status: 'paid', payment_method: 'transfer', currency: 'PLN', items: [{ product_id: productIds['powerbank-20000mah'], product_name: 'PowerBank 20000mAh', quantity: 3, price: 5999 }, { product_id: productIds['smartwatch-x200'], product_name: 'Smartwatch X200', quantity: 1, price: 89999 }], subtotal: 107996, shipping_cost: 1699, tax: 24833, total: 134528 },
      { customer_name: 'Michał Dąbrowski', customer_email: 'michal.dabrowski@email.pl', customer_phone: '+48 504 567 890', shipping_address: 'ul. Świdnicka 15, 50-001 Wrocław', status: 'processing', payment_status: 'paid', payment_method: 'blik', currency: 'PLN', items: [{ product_id: productIds['krem-nawilzajacy-50ml'], product_name: 'Krem Nawilżający 50ml', quantity: 2, price: 3999 }, { product_id: productIds['szampon-naturalny'], product_name: 'Szampon Naturalny', quantity: 1, price: 2499 }], subtotal: 10497, shipping_cost: 0, tax: 2414, total: 12911 },
      { customer_name: 'Aleksandra Lewandowska', customer_email: 'aleksandra.lewandowska@email.pl', customer_phone: '+48 505 678 901', shipping_address: 'ul. Półwiejska 20, 60-001 Poznań', status: 'pending', payment_status: 'pending', payment_method: 'card', currency: 'PLN', items: [{ product_id: productIds['buty-biegowe-ultra'], product_name: 'Buty Biegowe Ultra', quantity: 1, price: 19999 }], subtotal: 19999, shipping_cost: 2499, tax: 4600, total: 27098 },
      { customer_name: 'Anna Kowalska', customer_email: 'anna.kowalska@email.pl', customer_phone: '+48 501 234 567', shipping_address: 'ul. Marszałkowska 1, 00-001 Warszawa', status: 'delivered', payment_status: 'paid', payment_method: 'blik', currency: 'PLN', items: [{ product_id: productIds['bluza-z-kapturem'], product_name: 'Bluza z Kapturem', quantity: 1, price: 7999 }], subtotal: 7999, shipping_cost: 1699, tax: 1840, total: 11538 },
      { customer_name: 'Karolina Wiśniewska', customer_email: 'karolina.wisniewska@email.pl', customer_phone: '+48 503 456 789', shipping_address: 'ul. Długa 10, 80-001 Gdańsk', status: 'cancelled', payment_status: 'refunded', payment_method: 'transfer', currency: 'PLN', items: [{ product_id: productIds['rower-gorski-xt500'], product_name: 'Rower Górski XT500', quantity: 1, price: 249900 }], subtotal: 249900, shipping_cost: 1699, tax: 57477, total: 309076 },
      { customer_name: 'Aleksandra Lewandowska', customer_email: 'aleksandra.lewandowska@email.pl', customer_phone: '+48 505 678 901', shipping_address: 'ul. Półwiejska 20, 60-001 Poznań', status: 'delivered', payment_status: 'paid', payment_method: 'blik', currency: 'PLN', items: [{ product_id: productIds['lampka-led-dotykowa'], product_name: 'Lampka LED Dotykowa', quantity: 2, price: 2999 }, { product_id: productIds['zestaw-doniczek-3szt'], product_name: 'Zestaw Doniczek 3szt', quantity: 1, price: 1999 }], subtotal: 7997, shipping_cost: 1699, tax: 1840, total: 11536 },
      { customer_name: 'Piotr Nowak', customer_email: 'piotr.nowak@email.pl', customer_phone: '+48 502 345 678', shipping_address: 'ul. Floriańska 5, 30-001 Kraków', status: 'processing', payment_status: 'paid', payment_method: 'card', currency: 'PLN', items: [{ product_id: productIds['koszulka-premium-cotton'], product_name: 'Koszulka Premium Cotton', quantity: 3, price: 4999 }, { product_id: productIds['bluza-z-kapturem'], product_name: 'Bluza z Kapturem', quantity: 1, price: 7999 }], subtotal: 22996, shipping_cost: 0, tax: 5290, total: 28286 },
      { customer_name: 'Karolina Wiśniewska', customer_email: 'karolina.wisniewska@email.pl', customer_phone: '+48 503 456 789', shipping_address: 'ul. Długa 10, 80-001 Gdańsk', status: 'pending', payment_status: 'failed', payment_method: 'card', currency: 'PLN', items: [{ product_id: productIds['sluchawki-bluetooth-pro'], product_name: 'Słuchawki Bluetooth Pro', quantity: 2, price: 14999 }], subtotal: 29998, shipping_cost: 2499, tax: 6900, total: 39397 },
      { customer_name: 'Michał Dąbrowski', customer_email: 'michal.dabrowski@email.pl', customer_phone: '+48 504 567 890', shipping_address: 'ul. Świdnicka 15, 50-001 Wrocław', status: 'delivered', payment_status: 'paid', payment_method: 'transfer', currency: 'PLN', items: [{ product_id: productIds['smartwatch-x200'], product_name: 'Smartwatch X200', quantity: 1, price: 89999 }], subtotal: 89999, shipping_cost: 1699, tax: 20700, total: 112398 },
      { customer_name: 'Anna Kowalska', customer_email: 'anna.kowalska@email.pl', customer_phone: '+48 501 234 567', shipping_address: 'ul. Marszałkowska 1, 00-001 Warszawa', status: 'shipped', payment_status: 'paid', payment_method: 'blik', currency: 'PLN', items: [{ product_id: productIds['powerbank-20000mah'], product_name: 'PowerBank 20000mAh', quantity: 1, price: 5999 }, { product_id: productIds['sluchawki-bluetooth-pro'], product_name: 'Słuchawki Bluetooth Pro', quantity: 1, price: 14999 }], subtotal: 20998, shipping_cost: 1699, tax: 4830, total: 27527 },
    ];

    for (let i = 0; i < orderDefs.length; i++) {
      const o = orderDefs[i];
      const orderNumber = `ORD-${String(i + 1).padStart(4, '0')}`;
      await apiRequest('/api/collections/shop_orders/records', 'POST', {
        website_id: WEBSITE_ID,
        order_number: orderNumber,
        ...o,
        created: new Date(2025, 0, 1 + i * 15).toISOString(),
        notes: i === 4 ? 'Proszę o szybką wysyłkę' : '',
      }, token);
      console.log(`  ✅ ${orderNumber} - ${o.customer_name} (${o.status})`);
    }

    // ====================================================================
    // 6. CREAR RESEÑAS (shop_reviews)
    // ====================================================================
    console.log('\n⭐ Reseñas...');
    const reviews = [
      { product: productIds['koszulka-premium-cotton'], product_name: 'Koszulka Premium Cotton', author_name: 'Anna K.', author_email: 'anna.kowalska@email.pl', rating: 5, title: 'Świetna jakość!', comment: 'Koszulka jest bardzo wygodna i materiał jest wysokiej jakości. Polecam!', is_approved: true },
      { product: productIds['sluchawki-bluetooth-pro'], product_name: 'Słuchawki Bluetooth Pro', author_name: 'Piotr N.', author_email: 'piotr.nowak@email.pl', rating: 4, title: 'Dobry dźwięk', comment: 'Dźwięk jest czysty, bas mocny. Bateria trzyma długo. Jedyny minus to lekko ciasne na uszach.', is_approved: true },
      { product: productIds['smartwatch-x200'], product_name: 'Smartwatch X200', author_name: 'Karolina W.', author_email: 'karolina.wisniewska@email.pl', rating: 5, title: 'Rewelacyjny smartwatch!', comment: 'Funkcjonalność na najwyższym poziomie. Monitorowanie snu działa świetnie.', is_approved: true },
      { product: productIds['krem-nawilzajacy-50ml'], product_name: 'Krem Nawilżający 50ml', author_name: 'Michał D.', author_email: 'michal.dabrowski@email.pl', rating: 4, title: 'Dobry krem', comment: 'Nawilża dobrze, ale zapach mógłby być przyjemniejszy.', is_approved: true },
      { product: productIds['powerbank-20000mah'], product_name: 'PowerBank 20000mAh', author_name: 'Aleksandra L.', author_email: 'aleksandra.lewandowska@email.pl', rating: 5, title: 'Niezawodny powerbank', comment: 'Ładuje telefon 4 razy. Idealny na podróże!', is_approved: true },
      { product: productIds['buty-biegowe-ultra'], product_name: 'Buty Biegowe Ultra', author_name: 'Anna K.', author_email: 'anna.kowalska@email.pl', rating: 3, title: 'OK ale mogłyby być lepsze', comment: 'Amortyzacja dobra, ale podeszwa szybko się ściera.', is_approved: false },
    ];

    for (const rev of reviews) {
      await apiRequest('/api/collections/shop_reviews/records', 'POST', { ...rev, website_id: WEBSITE_ID }, token);
      console.log(`  ✅ ${rev.title} (★${rev.rating})`);
    }

    // ====================================================================
    // 7. CREAR CUPONES (shop_coupons)
    // ====================================================================
    console.log('\n🏷️ Cupones...');
    const coupons = [
      { code: 'PROMO20', description: '20% na wszystko', discount_type: 'percentage', discount_value: 20, min_order_value: 5000, max_uses: 100, current_uses: 34, start_date: '2025-01-01T00:00:00', end_date: '2025-12-31T23:59:59', is_active: true, first_time_only: false },
      { code: 'WELCOME50', description: '50 PLN dla nowych klientów', discount_type: 'fixed', discount_value: 50, min_order_value: 15000, max_uses: 50, current_uses: 12, start_date: '2025-06-01T00:00:00', end_date: '2025-08-31T23:59:59', is_active: true, first_time_only: true },
      { code: 'FREESHIP', description: 'Darmowa dostawa od 100 PLN', discount_type: 'free_shipping', discount_value: null, min_order_value: 10000, max_uses: null, current_uses: 89, start_date: null, end_date: null, is_active: true, first_time_only: false },
      { code: 'BLACK50', description: 'Black Friday -50%', discount_type: 'percentage', discount_value: 50, min_order_value: null, max_uses: 200, current_uses: 0, start_date: '2025-11-24T00:00:00', end_date: '2025-11-28T23:59:59', is_active: false, first_time_only: false },
    ];

    for (const coup of coupons) {
      await apiRequest('/api/collections/shop_coupons/records', 'POST', { ...coup, website_id: WEBSITE_ID }, token);
      console.log(`  ✅ ${coup.code} (${coup.is_active ? 'aktywny' : 'nieaktywny'})`);
    }

    // ====================================================================
    // 8. CREAR FLASH SALES (shop_flash_sales)
    // ====================================================================
    console.log('\n⚡ Flash Sales...');
    const flashSales = [
      { name: 'Wyprzedaż letnia', discount_type: 'percentage', discount_value: 30, start_date: '2025-07-01T00:00:00', end_date: '2025-07-07T23:59:59', is_active: true, message: '🔥 Letnia wyprzedaż! -30% na wybrane produkty' },
      { name: 'Wyprzedaż świąteczna', discount_type: 'percentage', discount_value: 25, start_date: '2025-12-01T00:00:00', end_date: '2025-12-24T23:59:59', is_active: false, message: '🎄 Świąteczne okazje! -25%' },
    ];

    for (const fs of flashSales) {
      await apiRequest('/api/collections/shop_flash_sales/records', 'POST', { ...fs, website_id: WEBSITE_ID }, token);
      console.log(`  ✅ ${fs.name} (${fs.is_active ? 'aktywna' : 'zaplanowana'})`);
    }

    // ====================================================================
    // 9. CREAR BUNDLES (shop_bundles)
    // ====================================================================
    console.log('\n🎁 Bundles...');
    const bundles = [
      { name: 'Zestaw startowy', description: 'Koszulka + PowerBank w super cenie', products: [{ product_id: productIds['koszulka-premium-cotton'], quantity: 1 }, { product_id: productIds['powerbank-20000mah'], quantity: 1 }], bundle_price: 7999, original_price: 10998, is_active: true },
      { name: 'Zestaw Audio Pro', description: 'Słuchawki + Smartwatch', products: [{ product_id: productIds['sluchawki-bluetooth-pro'], quantity: 1 }, { product_id: productIds['smartwatch-x200'], quantity: 1 }], bundle_price: 209900, original_price: 239998, is_active: true },
    ];

    for (const b of bundles) {
      await apiRequest('/api/collections/shop_bundles/records', 'POST', { ...b, website_id: WEBSITE_ID }, token);
      console.log(`  ✅ ${b.name} (${(b.bundle_price/100).toFixed(2)} PLN zamiast ${(b.original_price/100).toFixed(2)} PLN)`);
    }

    // ====================================================================
    // 10. CREAR CONFIGURACIÓN DE TIENDA (shop_settings)
    // ====================================================================
    console.log('\n⚙️ Configuración de tienda...');
    const existingSettings = await apiRequest('/api/collections/shop_settings/records?perPage=1', 'GET', null, token);
    
    if (existingSettings.items && existingSettings.items.length > 0) {
      const sid = existingSettings.items[0].id;
      await apiRequest(`/api/collections/shop_settings/records/${sid}`, 'PATCH', {
        website_id: WEBSITE_ID,
        store_name: 'Sklep Demo Panel',
        store_email: 'sklep@fullwork.pl',
        store_phone: '+48 123 456 789',
        currency: 'PLN',
        tax_rate: 23,
        tax_included_in_prices: true,
        free_shipping_threshold: 15000,
        inpost_enabled: true,
        inpost_api_key: 'shipx_api_key_demo',
        inpost_organization_id: 'org_12345',
        inpost_api_url: 'https://api-shipx-pl.easypack24.net',
        inpost_price: 16.99,
        courier_enabled: true,
        courier_price: 24.99,
        pickup_enabled: true,
        pickup_label: 'Odbiór osobisty - Warszawa',
        stripe_enabled: true,
        stripe_public_key: 'pk_test_demo',
        stripe_secret_key: 'sk_test_demo',
        stripe_webhook_secret: 'whsec_demo',
        tpay_enabled: true,
        transfer_enabled: true,
        blik_enabled: true,
      }, token);
      console.log('  ✅ Configuración actualizada');
    } else {
      await apiRequest('/api/collections/shop_settings/records', 'POST', {
        website_id: WEBSITE_ID,
        store_name: 'Sklep Demo Panel',
        store_email: 'sklep@fullwork.pl',
        store_phone: '+48 123 456 789',
        currency: 'PLN',
        tax_rate: 23,
        tax_included_in_prices: true,
        free_shipping_threshold: 15000,
        inpost_enabled: true,
        inpost_api_key: 'shipx_api_key_demo',
        inpost_organization_id: 'org_12345',
        inpost_api_url: 'https://api-shipx-pl.easypack24.net',
        inpost_price: 16.99,
        courier_enabled: true,
        courier_price: 24.99,
        pickup_enabled: true,
        pickup_label: 'Odbiór osobisty - Warszawa',
        stripe_enabled: true,
        stripe_public_key: 'pk_test_demo',
        stripe_secret_key: 'sk_test_demo',
        stripe_webhook_secret: 'whsec_demo',
        tpay_enabled: true,
        transfer_enabled: true,
        blik_enabled: true,
      }, token);
      console.log('  ✅ Configuración creada');
    }

    // ====================================================================
    // RESUMEN
    // ====================================================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ¡SHOP SEED COMPLETADO!');
    console.log('='.repeat(50));
    console.log(`📁 ${categories.length} categorías`);
    console.log(`📦 ${products.length} productos`);
    console.log(`👥 ${customers.length} clientes`);
    console.log(`📋 ${orderDefs.length} pedidos`);
    console.log(`⭐ ${reviews.length} reseñas`);
    console.log(`🏷️ ${coupons.length} cupones`);
    console.log(`⚡ ${flashSales.length} flash sales`);
    console.log(`🎁 ${bundles.length} bundles`);
    console.log('⚙️ Configuración de tienda lista');
    console.log(`\n🔗 Panel: ${PB_URL}/panel/shop`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

seedShop();
