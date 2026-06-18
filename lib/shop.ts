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