import { pbFetch, TENANT_ID } from '@/lib/pocketbase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { popupId, sessionId, action } = body;

    if (!popupId || !sessionId || !action) {
      return NextResponse.json({ 
        error: 'popupId, sessionId and action are required' 
      }, { status: 400 });
    }

    const websiteId = process.env.NEXT_PUBLIC_WEBSITE_ID || TENANT_ID;

    // Record event in PocketBase
    await pbFetch('popup_events/records', {
      method: 'POST',
      body: JSON.stringify({
        popup_id: popupId,
        session_id: sessionId,
        event_type: action, // 'view' or 'convert'
        website_id: websiteId,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error tracking popup in PocketBase:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
