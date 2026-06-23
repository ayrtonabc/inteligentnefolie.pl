import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('id');
    const transactionId = searchParams.get('transaction_id');

    if (!orderId && !transactionId) {
      return NextResponse.json(
        { error: 'Brak identyfikatora zamówienia' },
        { status: 400 }
      );
    }

    let filter: string;
    if (orderId) {
      filter = `id = "${orderId}"`;
    } else {
      filter = `transaction_id = "${transactionId}"`;
    }

    const result = await pb.collection('shop_orders').getList(1, 1, { filter });

    if (!result.items?.length) {
      return NextResponse.json(
        { error: 'Zamówienie nie znalezione' },
        { status: 404 }
      );
    }

    const record = result.items[0];

    const order = {
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania zamówienia' },
      { status: 500 }
    );
  }
}
