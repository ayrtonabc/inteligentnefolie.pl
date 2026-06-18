// Script para crear datos de ejemplo para el shop en PocketBase
// Ejecutar: node seed-shop-data.js

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl';
const WEBSITE_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'dktsle4yev6syo4';

const sampleProducts = [
  {
    name: 'Folie PDLC T16 Czarna',
    slug: 'folia-pdlc-t16-czarna',
    description: 'Folia inteligentna PDLC w kolorze czarnym. Idealna do biur, domów i hoteli.',
    price: 95000,
    sku: 'PDLC-T16-BLK',
    stock_quantity: 100,
    is_published: true,
    is_featured: true,
  },
  {
    name: 'Folie PDLC T91 Biała',
    slug: 'folia-pdlc-t91-biala',
    description: 'Folie inteligentna PDLC w kolorze białym o wysokiej przezroczystości.',
    price: 105000,
    sku: 'PDLC-T91-WHT',
    stock_quantity: 75,
    is_published: true,
    is_featured: true,
  },
  {
    name: 'Folie PDLC T83 Standard',
    slug: 'folia-pdlc-t83-standard',
    description: 'Folie inteligentna PDLC o normalnej przezroczystości. Uniwersalne zastosowanie.',
    price: 89000,
    sku: 'PDLC-T83-STD',
    stock_quantity: 50,
    is_published: true,
    is_featured: false,
  },
  {
    name: 'Folie PDLC T60 Jasnoszara',
    slug: 'folia-pdlc-t60-jasnoszara',
    description: 'Folia inteligentna PDLC w kolorze jasnoszarym. Elegancki wygląd.',
    price: 92000,
    sku: 'PDLC-T60-LGR',
    stock_quantity: 30,
    is_published: true,
    is_featured: false,
  },
  {
    name: 'Folie PDLC T40 Ciemnoszara',
    slug: 'folia-pdlc-t40-ciemnoszara',
    description: 'Folia inteligentna PDLC w kolorze ciemnoszarym. Nowoczesny design.',
    price: 95000,
    sku: 'PDLC-T40-DGR',
    stock_quantity: 8,
    is_published: true,
    is_featured: false,
  },
  {
    name: 'Folie LCD Premium',
    slug: 'folia-lcd-premium',
    description: 'Folia LCD premium z kontrolą przezroczystości. Najwyższa jakość obrazu.',
    price: 250000,
    sku: 'LCD-PRE-001',
    stock_quantity: 20,
    is_published: true,
    is_featured: true,
  },
  {
    name: 'Sterownik PDLC Pro',
    slug: 'sterownik-pdlc-pro',
    description: 'Profesjonalny sterownik do folii PDLC. Łatwa instalacja i obsługa.',
    price: 45000,
    sku: 'CTL-PDLC-PRO',
    stock_quantity: 150,
    is_published: true,
    is_featured: false,
  },
  {
    name: 'Montaż Foli Inteligentnej',
    slug: 'montaz-folii-inteligentnej',
    description: 'Profesjonalny montaż folii inteligentnej przez nasz zespół.',
    price: 150000,
    sku: 'SVC-INSTALL',
    stock_quantity: 999,
    is_published: true,
    is_featured: false,
  },
];

const sampleCategories = [
  { name: 'Folie PDLC', slug: 'folie-pdlc', description: 'Folie inteligentne PDLC', icon: 'Layers', order_index: 1 },
  { name: 'Folie LCD', slug: 'folie-lcd', description: 'Folie LCD', icon: 'Monitor', order_index: 2 },
  { name: 'Akcesoria', slug: 'akcesoria', description: 'Sterowniki i akcesoria', icon: 'Settings', order_index: 3 },
  { name: 'Usługi', slug: 'uslugi', description: 'Montaż i serwis', icon: 'Wrench', order_index: 4 },
];

const sampleOrders = [
  {
    order_number: 'ZAM-001',
    customer_name: 'Jan Kowalski',
    customer_email: 'jan.kowalski@example.pl',
    customer_phone: '+48 123 456 789',
    items: [{ product_id: '1', product_name: 'Folie PDLC T16 Czarna', quantity: 5, price: 95000 }],
    subtotal: 475000,
    shipping_cost: 0,
    tax: 109250,
    total: 584250,
    currency: 'PLN',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'card',
    tpay_transaction_id: 'TPAY-001-ABCD',
  },
  {
    order_number: 'ZAM-002',
    customer_name: 'Anna Nowak',
    customer_email: 'anna.nowak@company.pl',
    customer_phone: '+48 987 654 321',
    items: [
      { product_id: '2', product_name: 'Folie PDLC T91 Biała', quantity: 3, price: 105000 },
      { product_id: '7', product_name: 'Sterownik PDLC Pro', quantity: 3, price: 45000 },
    ],
    subtotal: 450000,
    shipping_cost: 15000,
    tax: 106950,
    total: 571950,
    currency: 'PLN',
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'transfer',
    tpay_transaction_id: 'TPAY-002-EFGH',
  },
  {
    order_number: 'ZAM-003',
    customer_name: 'Piotr Wiśniewski',
    customer_email: 'piotr.w@hotel.pl',
    customer_phone: '+48 555 123 456',
    items: [{ product_id: '6', product_name: 'Folie LCD Premium', quantity: 2, price: 250000 }],
    subtotal: 500000,
    shipping_cost: 0,
    tax: 115000,
    total: 615000,
    currency: 'PLN',
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'blik',
    tpay_transaction_id: 'TPAY-003-IJKL',
  },
];

async function createRecord(collection, data) {
  try {
    const response = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        website_id: WEBSITE_ID,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ Error creando en ${collection}:`, error.message || error);
      return null;
    }
    
    const record = await response.json();
    console.log(`✅ Creado: ${record.name || record.order_number || record.id}`);
    return record;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Creando datos de ejemplo para Shop...\n');
  console.log(`📦 URL: ${PB_URL}`);
  console.log(`🏢 Website ID: ${WEBSITE_ID}\n`);

  console.log('\n📁 Creando categorías...');
  for (const cat of sampleCategories) {
    await createRecord('shop_categories', cat);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n📦 Creando productos...');
  for (const product of sampleProducts) {
    await createRecord('shop_products', product);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n🛒 Creando pedidos...');
  for (const order of sampleOrders) {
    await createRecord('shop_orders', order);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n✅ ¡Datos de ejemplo creados!');
  console.log(`   - ${sampleCategories.length} categorías`);
  console.log(`   - ${sampleProducts.length} productos`);
  console.log(`   - ${sampleOrders.length} pedidos`);
}

main().catch(console.error);