import { NextResponse } from 'next/server';
import { pbFetch, TENANT_ID } from '@/lib/pocketbase';
import { cookies } from 'next/headers';

async function verifyWebsiteExists(websiteId: string): Promise<boolean> {
  try {
    await pbFetch(`websites/records/${websiteId}`, {
      method: 'GET'
    });
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json({ success: true, message: 'Empty body ignored' });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const { path, device_type, browser, referrer } = body;

    const cookieStore = await cookies();
    const hasVisited = cookieStore.get('has_visited');

    if (!hasVisited) {
      const visitData: any = {
        website_id: TENANT_ID,
        page_path: path || '/',
      };

      if (device_type) visitData.device_type = device_type;
      if (browser) visitData.browser = browser;
      if (referrer) visitData.referrer = referrer;

      try {
        await pbFetch('website_visits/records', {
          method: 'POST',
          body: JSON.stringify(visitData)
        });
      } catch (error: any) {
        if (error?.message?.includes('no rows in result set') || error?.message?.includes('create rule failure')) {
          console.warn('[Analytics] Website record not found, skipping visit tracking');
        } else {
          console.warn('[Analytics] Failed to track visit:', error?.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
