import { pbFetch, getTenantFilter } from './pocketbase';

export interface Product {
  id: string;
  website_id: string;
  name: string;
  slug: string;
  description_html: string | null;
  short_description: string | null;
  category_name: string | null;
  price_cents: number;
  currency: string;
  stock: number;
  category_id: string;
  is_active: boolean;
  featured: boolean;
  images?: { url: string }[];
}

export async function getShopProducts(
  options: { featured?: boolean } = {}
): Promise<Product[]> {
  try {
    let filter = 'is_active = true';
    
    if (options.featured) {
      filter += ' && is_featured = true';
    }
    
    const encodedFilter = encodeURIComponent(filter);
    const data = await pbFetch(`shop_products/records?filter=${encodedFilter}&perPage=100&_cb=${Date.now()}`);
    
    let products = data.items || [];
    if (!products || products.length === 0) {
      return [];
    }

    return products.map((record: any) => {
      let images: { url: string }[] = [];
      
      const rawImages = record.images || record.images_json || '';
      
      if (rawImages) {
        if (typeof rawImages === 'string') {
          const urls = rawImages.split(',').filter(Boolean);
          images = urls.map((url: string) => ({ url: url.trim() }));
        } else if (Array.isArray(rawImages)) {
          images = rawImages.map((img: any) => ({ 
            url: typeof img === 'string' ? img : (img.url || '') 
          }));
        }
      }

      let priceCents = record.price || 0;
      if (record.price && record.price < 1000) {
        priceCents = Math.round(record.price * 100);
      }

      return {
        id: record.id,
        website_id: record.website_id,
        name: record.name,
        slug: record.slug,
        description_html: record.description || record.description_html || '',
        short_description: record.short_description || '',
        category_name: record.category_name || '',
        price_cents: priceCents,
        currency: record.currency || 'PLN',
        stock: record.stock_quantity || record.stock || 0,
        category_id: record.category_id || '',
        is_active: record.is_active ?? true,
        featured: record.is_featured ?? record.featured ?? false,
        images: images
      };
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return [];
  }
}

export async function getShopProductBySlug(slug: string): Promise<Product | null> {
  try {
    const encodedFilter = encodeURIComponent(`slug = "${slug}" && is_active = true`);
    const data = await pbFetch(`shop_products/records?filter=${encodedFilter}&perPage=1&_cb=${Date.now()}`);

    const record = data.items?.[0];
    if (!record) return null;

    let images: { url: string }[] = [];
    const rawImages = record.images || record.images_json || '';

    if (rawImages) {
      if (typeof rawImages === 'string') {
        const urls = rawImages.split(',').filter(Boolean);
        images = urls.map((url: string) => ({ url: url.trim() }));
      } else if (Array.isArray(rawImages)) {
        images = rawImages.map((img: any) => ({
          url: typeof img === 'string' ? img : (img.url || '')
        }));
      }
    }

    let priceCents = record.price || 0;
    if (record.price && record.price < 1000) {
      priceCents = Math.round(record.price * 100);
    }

    return {
      id: record.id,
      website_id: record.website_id,
      name: record.name,
      slug: record.slug,
      description_html: record.description || record.description_html || '',
      short_description: record.short_description || '',
      category_name: record.category_name || '',
      price_cents: priceCents,
      currency: record.currency || 'PLN',
      stock: record.stock_quantity || record.stock || 0,
      category_id: record.category_id || '',
      is_active: record.is_active ?? true,
      featured: record.is_featured ?? record.featured ?? false,
      images: images
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

export interface OrderItem {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  image: string;
  currency: string;
}

export interface Order {
  id: string;
  collectionId: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  status: string;
  is_paid: boolean;
  is_shipped: boolean;
  transaction_id: string;
  created: string;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const encodedFilter = encodeURIComponent(`id = "${orderId}"`);
    const data = await pbFetch(`shop_orders/records?filter=${encodedFilter}&perPage=1&_cb=${Date.now()}`);

    const record = data.items?.[0];
    if (!record) return null;

    return {
      id: record.id,
      collectionId: record.collectionId,
      order_number: record.order_number || '',
      customer_name: record.customer_name || '',
      customer_email: record.customer_email || '',
      customer_phone: record.customer_phone || '',
      items: record.items || [],
      subtotal: record.subtotal || 0,
      shipping_cost: record.shipping_cost || 0,
      tax: record.tax || 0,
      discount: record.discount || 0,
      total: record.total || 0,
      currency: record.currency || 'PLN',
      payment_method: record.payment_method || '',
      payment_status: record.payment_status || '',
      status: record.status || '',
      is_paid: record.is_paid ?? false,
      is_shipped: record.is_shipped ?? false,
      transaction_id: record.transaction_id || '',
      created: record.created || '',
    };
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return null;
  }
}

export async function getOrderByTransactionId(transactionId: string): Promise<Order | null> {
  try {
    const encodedFilter = encodeURIComponent(`transaction_id = "${transactionId}"`);
    const data = await pbFetch(`shop_orders/records?filter=${encodedFilter}&perPage=1&_cb=${Date.now()}`);

    const record = data.items?.[0];
    if (!record) return null;

    return {
      id: record.id,
      collectionId: record.collectionId,
      order_number: record.order_number || '',
      customer_name: record.customer_name || '',
      customer_email: record.customer_email || '',
      customer_phone: record.customer_phone || '',
      items: record.items || [],
      subtotal: record.subtotal || 0,
      shipping_cost: record.shipping_cost || 0,
      tax: record.tax || 0,
      discount: record.discount || 0,
      total: record.total || 0,
      currency: record.currency || 'PLN',
      payment_method: record.payment_method || '',
      payment_status: record.payment_status || '',
      status: record.status || '',
      is_paid: record.is_paid ?? false,
      is_shipped: record.is_shipped ?? false,
      transaction_id: record.transaction_id || '',
      created: record.created || '',
    };
  } catch (error) {
    console.error('Error fetching order by transaction id:', error);
    return null;
  }
}