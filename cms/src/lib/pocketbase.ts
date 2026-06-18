import PocketBase from 'pocketbase';

const PB_URL = 'https://pb.fullwork.pl';

export const pb = new PocketBase(PB_URL);

pb.autoCancellation(false);

pb.beforeSend = function (url, options) {
    if (options && options.query && typeof options.query.sort === 'string') {
        const sort = options.query.sort;
        const match = String(url || '').match(/\/api\/collections\/([^/]+)\//);
        const collection = match ? match[1] : '';
        const allowSortCollections = new Set(['seo_audits', 'seo_page_analysis']);
        const sortTargetsSystemField = sort.includes('created') || sort.includes('updated');
        if (sortTargetsSystemField && !allowSortCollections.has(collection)) {
            delete options.query.sort;
        }
        if (options.query.skipTotal !== undefined) {
            delete options.query.skipTotal;
        }
    }
    return { url, options };
};

export const DEFAULT_TENANT_ID = 'dktsle4yev6syo4';
export const TENANT_ID = DEFAULT_TENANT_ID;

let currentTenantId: string = DEFAULT_TENANT_ID;

export function setCurrentTenant(tenantId: string) {
    currentTenantId = tenantId;
    localStorage.setItem('cms_active_tenant_id', tenantId);
}

export function getCurrentTenant(): string {
    return currentTenantId;
}

export function initTenantFromStorage() {
    const savedTenant = localStorage.getItem('cms_active_tenant_id');
    if (savedTenant) {
        currentTenantId = savedTenant;
    }
}

export const getTenantFilter = () => {
    return `website_id = "${currentTenantId}"`;
};

export { PB_URL };
