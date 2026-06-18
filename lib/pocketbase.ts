import { TENANT_ID, PB_URL } from './config';
export { TENANT_ID };

export const pbFetch = async (endpoint: string, options: any = {}) => {
  let finalEndpoint = endpoint;
  if (finalEndpoint.includes('sort=')) {
    if (finalEndpoint.includes('created')) {
      finalEndpoint = finalEndpoint.replace(/[&?]?sort=[^&]+/, '');
    }
  }

  const url = `${PB_URL}/api/collections/${finalEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData = '';
    try {
      errorData = JSON.stringify(await response.json());
    } catch {
      errorData = response.statusText;
    }
    throw new Error(`PocketBase error: ${response.status} - ${errorData}`);
  }

  return response.json();
};

export const getTenantFilter = () => {
    return `website_id = "${TENANT_ID}"`;
};

export function getCurrentTenant(): string {
    return TENANT_ID;
}

export interface SiteContent {
  id: string;
  page_path: string;
  section_key: string;
  content_type: string;
  content_value: any;
  metadata?: any;
  language_code: string;
  tenant?: string;
  updated?: string;
}

export { PB_URL };

export const pb = {
  collection: (name: string) => ({
    getFullList: async (opts?: any) => {
      const filter = opts?.filter || '';
      const url = `${PB_URL}/api/collections/${name}/records${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      return data.items || [];
    },
    getList: async (page: number, perPage: number, opts?: any) => {
      const filter = opts?.filter || '';
      const url = `${PB_URL}/api/collections/${name}/records?page=${page}&perPage=${perPage}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      return res.json();
    }
  })
};