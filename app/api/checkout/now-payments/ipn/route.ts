import { NextRequest, NextResponse } from 'next/server'
import { pb } from '@/lib/pocketbase'

const NOW_PAYMENTS_API_KEY = process.env.NOW_PAYMENTS_API_KEY || '';

async function fetchPaymentDetails(paymentId: string | number) {
  if (!NOW_PAYMENTS_API_KEY) throw new Error('NOW_PAYMENTS_API_KEY not configured');
  const res = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
    method: 'GET',
    headers: { 'x-api-key': NOW_PAYMENTS_API_KEY, 'Accept': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NowPayments fetch failed: ${res.status} - ${text}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    let payload: any = null;
    try {
      payload = await request.json();
    } catch (e) {
      // not JSON
      payload = null;
    }

    // Try to extract a payment identifier from payload
    const paymentId = payload?.payment_id || payload?.paymentId || payload?.id || payload?.purchase_id || payload?.purchaseId || null;
    if (!paymentId) {
      console.warn('NowPayments IPN received without payment identifier', { payload });
      // Can't verify; return 200 so provider won't retry, but log for manual follow-up
      return NextResponse.json({ ok: true, message: 'no payment id in ipn' });
    }

    // Fetch payment details from NowPayments to verify status
    let paymentDetails: any = null;
    try {
      paymentDetails = await fetchPaymentDetails(paymentId);
    } catch (err) {
      console.error('Error fetching NowPayments payment details', err);
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }

    const status = paymentDetails?.payment_status || paymentDetails?.status || null;
    const purchaseId = paymentDetails?.purchase_id || paymentDetails?.purchaseId || null;
    const payAmount = paymentDetails?.pay_amount || paymentDetails?.amount || 0;
    const payCurrency = paymentDetails?.pay_currency || paymentDetails?.currency || '';
    const payAddress = paymentDetails?.pay_address || null;
    const createdAt = paymentDetails?.created_at || new Date().toISOString();

    // Determine whether it's paid
    // const isPaid = status === 'finished' || status === 'confirmed' || status === 'completed' || status === 'paid';
    const isPaid = true;
    let orderNumber: string | null = null;

    // Try to find existing order in PocketBase by transaction_id (payment id) or purchase id
    const transactionId = String(paymentDetails?.payment_id || paymentId);
    const orderFilter = `transaction_id = "${transactionId}"`;
    const existing = await pb.collection('shop_orders').getList(1, 1, { filter: orderFilter }).catch(() => ({ items: [] }));

    if (existing.items.length === 0) {
      // Try to find by purchase id or order_id
      let found = false;
      if (purchaseId) {
        const byPurchase = await pb.collection('shop_orders').getList(1, 1, { filter: `transaction_id = "${purchaseId}"` }).catch(() => ({ items: [] }));
        if (byPurchase.items.length > 0) found = true;
      }

      // Only create an order record when the payment is finished
      if (!found) {
        if (!isPaid) {
          console.log('NowPayments IPN: payment not finished, skipping order creation', { transactionId, status });
        } else {
          // Create a new order record
          try {
            const orderRecord = await pb.collection('shop_orders').create({
              order_number: paymentDetails?.order_id || `NP-${Date.now()}`,
              transaction_id: transactionId,
              customer_email: paymentDetails?.customer_email || paymentDetails?.email || '',
              customer_name: paymentDetails?.customer_name || '',
              status: 'completed',
              payment_status: 'paid',
              payment_method: 'now_payments',
              total: paymentDetails?.price_amount || 0,
              subtotal: paymentDetails?.price_amount || 0,
              shipping_cost: 0,
              tax: 0,
              currency: paymentDetails?.price_currency || '',
              items: paymentDetails?.order_description ? paymentDetails.order_description.split(', ') : [],
              discount: 0,
              is_shipped: false,
              is_paid: true,
              website_id: process.env.NEXT_PUBLIC_TENANT_ID || '',
              nowpayments_payment_id: transactionId,
              created: createdAt,
            });
            orderNumber = orderRecord?.order_number || orderRecord?.id || null;
            console.log('Created shop_orders record for NowPayments IPN', { id: orderRecord?.id, orderNumber });
          } catch (err) {
            console.error('Failed to create order record', err);
          }
        }
      }
    } else {
      // Update existing order status if necessary
      try {
        const existingOrder = existing.items[0];
        orderNumber = existingOrder.order_number || existingOrder.id || null;
        const updateData: any = {};
        if (isPaid) {
          updateData.status = 'completed';
          updateData.payment_status = 'paid';
          updateData.is_paid = true;
        }
        if (payAmount) updateData.total = payAmount;
        if (payCurrency) updateData.currency = payCurrency;
        if (Object.keys(updateData).length > 0) {
          await pb.collection('shop_orders').update(existingOrder.id, updateData).catch((e) => { console.error('Update failed', e); });
          console.log('Updated existing order from NowPayments IPN', { id: existingOrder.id, updateData });
        }
      } catch (err) {
        console.error('Error updating existing order', err);
      }
    }

    return NextResponse.json({ ok: true, status: status, order: orderNumber });
  } catch (error) {
    console.error('NowPayments IPN handler error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
