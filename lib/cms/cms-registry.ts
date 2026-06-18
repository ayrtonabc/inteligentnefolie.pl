
export interface CMSEditableRegion {
  /** Slug único, ej: 'hero_title', 'cities_section', 'how_it_works_heading' */
  id: string;
  
  /** Colección en PocketBase */
  collection: string;
  
  /** Campo dentro del registro */
  field: string;
  
  /** Record ID en PocketBase (o 'auto' si se busca por slug) */
  recordId: string;
  
  /** 
   * Selector CSS para encontrar el elemento en el DOM.
   * Usar selectores estables, no dependientes de framework. 
   */
  selector: string;
  
  /** Tipo de contenido para el editor */
  type: 'text' | 'richtext' | 'image' | 'link' | 'list';
  
  /** Para listas: cuál es el selector de cada item */
  itemSelector?: string;
  
  /** Valores permitidos (para selects, categorías) */
  options?: string[];
}

// ============================================================
// REGISTRO DE TODAS LAS REGIONES EDITABLES DEL SITIO
// ============================================================
// Este es el ÚNICO lugar donde declaras qué es editable.
// El scanner automático lo lee y no necesita que toques el HTML.
// ============================================================

export const CMS_REGISTRY: CMSEditableRegion[] = [
  // --- HEADER ---
  {
    id: 'header_phone_1',
    collection: 'site_settings',
    field: 'setting_value',
    recordId: 'phone_1',
    selector: 'header [data-contact="phone-1"]',
    type: 'text',
  },
  {
    id: 'header_phone_2',
    collection: 'site_settings',
    field: 'setting_value',
    recordId: 'phone_2',
    selector: 'header [data-contact="phone-2"]',
    type: 'text',
  },
  {
    id: 'header_email',
    collection: 'site_settings',
    field: 'setting_value',
    recordId: 'email',
    selector: 'header [data-contact="email"]',
    type: 'text',
  },
  {
    id: 'header_logo',
    collection: 'site_settings',
    field: 'setting_value',
    recordId: 'logo_url',
    selector: 'header img, header .logo',
    type: 'image',
  },

  // --- SECCIÓN CIUDADES ---
  {
    id: 'cities_section_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'cities_title',
    selector: '[data-section="cities"] [data-cms-role="title"]',
    type: 'text',
  },
  {
    id: 'cities_list',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'cities',
    selector: '[data-section="cities"] a, [class*="city"] a',
    type: 'list',
    itemSelector: '[data-section="cities"] a',
  },

  // --- SECCIÓN "JAK TO DZIAŁA?" ---
  {
    id: 'how_it_works_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_how_it_works_subtitle_7',
    selector: '[data-section="how-it-works"] [data-cms-section="home_how_it_works_subtitle_7"]',
    type: 'text',
  },
  {
    id: 'how_it_works_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_how_it_works_title_6',
    selector: '[data-section="how-it-works"] [data-cms-section="home_how_it_works_title_6"]',
    type: 'text',
  },
  {
    id: 'how_it_works_image_off',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_how_it_works_off_image',
    selector: '[data-section="how-it-works"] [data-cms-section="home_how_it_works_off_image"] img',
    type: 'image',
  },
  {
    id: 'how_it_works_image_on',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_how_it_works_on_image',
    selector: '[data-section="how-it-works"] [data-cms-section="home_how_it_works_on_image"] img',
    type: 'image',
  },
  {
    id: 'how_it_works_label_off',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'how_label_off',
    selector: '[data-section="how-it-works"] [data-label="off"]',
    type: 'text',
  },
  {
    id: 'how_it_works_label_on',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'how_label_on',
    selector: '[data-section="how-it-works"] [data-label="on"]',
    type: 'text',
  },

  // --- SECCIÓN SERVICIOS ---
  {
    id: 'home_services_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_services_subtitle',
    selector: '[data-section="services"] [data-cms-section="home_services_subtitle"]',
    type: 'text',
  },
  {
    id: 'home_services_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_services_title',
    selector: '[data-section="services"] [data-cms-section="home_services_title"]',
    type: 'text',
  },
  {
    id: 'home_services_main_image',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_services_main_image',
    selector: '[data-section="services"] [data-cms-section="home_services_main_image"] img',
    type: 'image',
  },
  {
    id: 'home_services_quote',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'home_services_quote',
    selector: '[data-section="services"] [data-cms-section="home_services_quote"]',
    type: 'text',
  },

  // --- PÁGINA BLOG ---
  {
    id: 'blog_hero_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'blog_hero_title',
    selector: '[data-section="blog-header"] [data-cms-role="title"]',
    type: 'text',
  },
  {
    id: 'blog_hero_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'blog_hero_subtitle',
    selector: '[data-section="blog-header"] [data-cms-role="subtitle"]',
    type: 'text',
  },
  {
    id: 'blog_newsletter_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'blog_newsletter_title',
    selector: '[data-section="blog-newsletter"] [data-cms-role="title"]',
    type: 'text',
  },
  {
    id: 'blog_newsletter_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'blog_newsletter_subtitle',
    selector: '[data-section="blog-newsletter"] [data-cms-role="subtitle"]',
    type: 'text',
  },
  {
    id: 'blog_newsletter_button',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'blog_newsletter_button',
    selector: '[data-section="blog-newsletter"] [data-cms-role="button"]',
    type: 'text',
  },

  // --- CITY LANDING PAGES ---
  {
    id: 'city_hero_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="city-hero"] [data-cms-role="title"]',
    type: 'text',
  },
  {
    id: 'city_hero_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="city-hero"] [data-cms-role="subtitle"]',
    type: 'text',
  },
  {
    id: 'city_hero_button_primary',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="city-hero"] [data-cms-role="button-primary"]',
    type: 'text',
  },
  {
    id: 'city_hero_button_secondary',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="city-hero"] [data-cms-role="button-secondary"]',
    type: 'text',
  },
  {
    id: 'city_hero_slider',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="city-hero"] [data-cms-role="slider-images"]',
    type: 'image',
  },

  // --- INTELIGENTNE FOLIE PAGE ---
  {
    id: 'hero_title',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="folie-hero"] [data-cms-role="title"]',
    type: 'text',
  },
  {
    id: 'hero_subtitle',
    collection: 'site_content',
    field: 'content_value',
    recordId: 'auto',
    selector: '[data-section="folie-hero"] p',
    type: 'text',
  },

  // --- AGREGAR MÁS SECCIONES AQUÍ ---
];

// ============================================================
// HELPERS
// ============================================================

/** Busca una región por ID */
export function getRegion(id: string): CMSEditableRegion | undefined {
  return CMS_REGISTRY.find(r => r.id === id);
}

/** Filtra regiones por colección */
export function getRegionsByCollection(collection: string): CMSEditableRegion[] {
  return CMS_REGISTRY.filter(r => r.collection === collection);
}

/** Genera mapa de selector → región para scanning rápido */
export function buildSelectorMap(): Map<string, CMSEditableRegion> {
  const map = new Map<string, CMSEditableRegion>();
  for (const region of CMS_REGISTRY) {
    map.set(region.selector, region);
  }
  return map;
}
