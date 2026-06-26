// Script para crear colecciones de Shop en PocketBase
// Ejecutar: node create-shop-collections.js

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.fullwork.pl';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'kontakt@jestemprogramista.pl';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'Programista2026';

async function login() {
  // Intentar primero como admin
  let response = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.token;
  }
  
  // Si falla, intentar como usuario
  response = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to login: ${errorData.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.token;
}

async function createCollection(token, schema) {
  const response = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(schema),
  });
  
  const data = await response.json();
  if (response.ok) {
    console.log(`✅ Colección "${schema.name}" creada`);
    return data;
  } else {
    console.log(`⚠️ ${data.message || 'Error'} - ${JSON.stringify(data.data || {})}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Creando colecciones de Shop en PocketBase...\n');
  
  const token = await login();
  console.log('✅ Login exitoso\n');
  
  // 1. COLLECTION: categories
  await createCollection(token, {
    name: 'shop_categories',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        type: 'text',
      },
      {
        name: 'icon',
        type: 'text',
      },
      {
        name: 'order_index',
        type: 'number',
      },
    ],
  });
  
  // 2. COLLECTION: tags
  await createCollection(token, {
    name: 'shop_tags',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
      },
    ],
  });
  
  // 3. COLLECTION: products
  await createCollection(token, {
    name: 'shop_products',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        type: 'editor',
      },
      {
        name: 'price',
        type: 'number',
        required: true,
      },
      {
        name: 'compare_at_price',
        type: 'number',
      },
      {
        name: 'sku',
        type: 'text',
      },
      {
        name: 'stock_quantity',
        type: 'number',
      },
      {
        name: 'category',
        type: 'relation',
        required: false,
        maxSelect: 1,
        collectionId: 'shop_categories',
      },
      {
        name: 'tags',
        type: 'relation',
        required: false,
        maxSelect: null,
        collectionId: 'shop_tags',
      },
      {
        name: 'images',
        type: 'file',
        required: false,
        maxSelect: 10,
      },
      {
        name: 'is_published',
        type: 'bool',
      },
      {
        name: 'is_featured',
        type: 'bool',
      },
      {
        name: 'weight',
        type: 'number',
      },
      {
        name: 'metadata',
        type: 'json',
      },
    ],
  });
  
  // 4. COLLECTION: reviews
  await createCollection(token, {
    name: 'shop_reviews',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'product',
        type: 'relation',
        required: true,
        maxSelect: 1,
        collectionId: 'shop_products',
      },
      {
        name: 'author_name',
        type: 'text',
        required: true,
      },
      {
        name: 'author_email',
        type: 'email',
        required: true,
      },
      {
        name: 'rating',
        type: 'number',
        required: true,
        min: 1,
        max: 5,
      },
      {
        name: 'title',
        type: 'text',
      },
      {
        name: 'comment',
        type: 'text',
      },
      {
        name: 'is_approved',
        type: 'bool',
      },
    ],
  });
  
  // 5. COLLECTION: orders
  await createCollection(token, {
    name: 'shop_orders',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'order_number',
        type: 'text',
        required: true,
      },
      {
        name: 'customer_name',
        type: 'text',
        required: true,
      },
      {
        name: 'customer_email',
        type: 'email',
        required: true,
      },
      {
        name: 'customer_phone',
        type: 'text',
      },
      {
        name: 'shipping_address',
        type: 'text',
      },
      {
        name: 'notes',
        type: 'text',
      },
      {
        name: 'items',
        type: 'json',
        required: true,
      },
      {
        name: 'subtotal',
        type: 'number',
        required: true,
      },
      {
        name: 'shipping_cost',
        type: 'number',
      },
      {
        name: 'tax',
        type: 'number',
      },
      {
        name: 'total',
        type: 'number',
        required: true,
      },
      {
        name: 'currency',
        type: 'select',
        options: ['PLN', 'EUR', 'USD'],
        defaultValue: 'PLN',
      },
      {
        name: 'status',
        type: 'select',
        options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        defaultValue: 'pending',
      },
      {
        name: 'payment_status',
        type: 'select',
        options: ['pending', 'paid', 'failed', 'refunded'],
        defaultValue: 'pending',
      },
      {
        name: 'payment_method',
        type: 'select',
        options: ['card', 'transfer', 'blik', 'paypal'],
      },
      {
        name: 'stripe_session_id',
        type: 'text',
      },
      {
        name: 'stripe_payment_intent',
        type: 'text',
      },
    ],
  });
  
  // 6. COLLECTION: cart_items
  await createCollection(token, {
    name: 'shop_cart_items',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        name: 'user',
        type: 'text',
        required: true,
      },
      {
        name: 'product',
        type: 'relation',
        required: true,
        maxSelect: 1,
        collectionId: 'shop_products',
      },
      {
        name: 'quantity',
        type: 'number',
        required: true,
        min: 1,
      },
    ],
  });
  
  console.log('\n✅ ¡Colecciones de Shop creadas exitosamente!\n');
  console.log('Colecciones disponibles:');
  console.log('  - shop_categories');
  console.log('  - shop_tags');
  console.log('  - shop_products');
  console.log('  - shop_reviews');
  console.log('  - shop_orders');
  console.log('  - shop_cart_items');
  console.log('\n📝 Nota: Necesitarás configurar las variables de entorno:');
  console.log('  NEXT_PUBLIC_POCKETBASE_URL');
  console.log('  POCKETBASE_ADMIN_EMAIL');
  console.log('  POCKETBASE_ADMIN_PASSWORD');
  console.log('');
}

main().catch(console.error);
