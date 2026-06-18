import { pbFetch, TENANT_ID } from '@/lib/pocketbase';
import { NextResponse } from 'next/server';

const MAIN_PATHS = ['/', '/inteligentne-folie', '/montaz-folii-inteligentnej', '/realizacje', '/blog', '/kontakt'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId') || process.env.NEXT_PUBLIC_WEBSITE_ID || TENANT_ID;
    const currentPath = searchParams.get('path') || '/';
    const sessionId = searchParams.get('sessionId');

    const filter = `(is_active = true && (website_id = "${websiteId}" || website_id = ""))`;
    const data = await pbFetch(`popups/records?filter=${encodeURIComponent(filter)}&sort=-created`);

    const popups = data.items || [];

    const normalizePath = (path: string) => path !== '/' ? path.replace(/\/$/, '') : '/';
    const isCityPage = currentPath.startsWith('/folia-inteligentna-');
    
    const pathMatches = (popup: any) => {
      const content = popup.content || {};
      const targetPages = content.targetPages || popup.target_pages || ['all'];
      const excludePages = content.excludePages || popup.exclude_pages || [];
      const current = normalizePath(currentPath);

      if (excludePages.some((p: string) => {
        const norm = normalizePath(p);
        if (norm.endsWith('*')) return current.startsWith(norm.replace('*', ''));
        return norm === current;
      })) return false;

      if (targetPages.includes('all')) {
        return !isCityPage;
      }

      return targetPages.some((p: string) => {
        const norm = normalizePath(p);
        if (norm.endsWith('*')) return current.startsWith(norm.replace('*', ''));
        return norm === current;
      });
    };

    const filteredPopups = popups
      .filter(pathMatches)
      .map((popup: any) => ({
        ...popup,
        content: popup.content || {},
      }));

    return NextResponse.json({ popups: filteredPopups, sessionId });
  } catch (err) {
    console.error('Popup API error:', err);
    return NextResponse.json({ popups: [], sessionId: null }, { status: 200 });
  }
}
