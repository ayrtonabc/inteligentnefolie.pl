import { NextRequest, NextResponse } from 'next/server'
import { pb } from '@/lib/pocketbase'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const order = searchParams.get('order')
  const payment = searchParams.get('payment')
  
  if (payment === 'success' && order) {
    console.log('Payment successful for order:', order)
    return NextResponse.redirect(new URL(`/?payment=success&order=${order}`, request.url))
  }

  if (payment === 'error') {
    return NextResponse.redirect(new URL('/?payment=error', request.url))
  }

  if (payment === 'cancelled') {
    return NextResponse.redirect(new URL('/?payment=cancelled', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const id = formData.get('id') as string
    const tr_id = formData.get('tr_id') as string
    const tr_crc = formData.get('tr_crc') as string
    const tr_status = formData.get('tr_status') as string
    const tr_paid = formData.get('tr_paid') as string
    const tr_amount = formData.get('tr_amount') as string
    const tr_date = formData.get('tr_date') as string
    const tr_email = formData.get('tr_email') as string
    const md5sum = formData.get('md5sum') as string
    const test_mode = formData.get('test_mode') as string
    const tr_description = formData.get('tr_description') as string
    
    console.log('TPAY notification received:', { id, tr_id, tr_crc, tr_status, test_mode })
    
    if (tr_status !== 'true') {
      console.log('Payment not successful, status:', tr_status)
      return new NextResponse('TRUE', { status: 200 })
    }

    const securityCode = process.env.TPAY_SECRET_KEY || ''
    
    const expectedMd5 = crypto
      .createHash('md5')
      .update(id + tr_id + (tr_paid || tr_amount || '0') + (tr_crc || '') + securityCode)
      .digest('hex')
    
    if (md5sum && md5sum !== expectedMd5) {
      console.error('Invalid MD5 checksum:', { received: md5sum, expected: expectedMd5 })
    }

    const transactionId = tr_id || id
    const orderId = tr_crc || `ORD-${Date.now()}`
    const totalAmount = parseFloat(tr_paid || tr_amount || '0')
    const items = tr_description ? tr_description.split(', ') : []
    const customerEmail = tr_email || ''
    
    const existingOrder = await pb.collection('shop_orders').getList(1, 1, {
      filter: `transaction_id = "${transactionId}"`,
    }).catch(() => ({ items: [] }))

    if (existingOrder.items.length === 0) {
      const order = await pb.collection('shop_orders').create({
        order_number: orderId,
        transaction_id: transactionId,
        customer_email: customerEmail,
        customer_name: '',
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'tpay',
        total: totalAmount,
        subtotal: totalAmount,
        shipping_cost: 0,
        tax: 0,
        currency: 'PLN',
        items: items,
        discount: 0,
        is_shipped: false,
        is_paid: true,
        website_id: process.env.NEXT_PUBLIC_TENANT_ID || '',
        tpay_session_id: transactionId,
        created: tr_date ? new Date(tr_date).toISOString() : new Date().toISOString(),
      })
      
      console.log('Order saved to PocketBase:', { orderId: order?.id, transactionId, totalAmount })
    }

    return new NextResponse('TRUE', { status: 200 })
  } catch (error) {
    console.error('TPAY callback error:', error)
    return new NextResponse('TRUE', { status: 200 })
  }
}