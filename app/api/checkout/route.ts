import { NextRequest, NextResponse } from 'next/server'
import TPayAuthService from '@/lib/tpayAuth'

const TPAY_MERCHANT_ID = process.env.TPAY_CLIENT_ID?.split('-')[0] || ''
const TPAY_CLIENT_SECRET = process.env.TPAY_SECRET_KEY || ''
const TPAY_IS_SANDBOX = process.env.NODE_ENV !== 'production'

export interface CartItem {
  id: string
  name: string
  price_cents: number
  quantity: number
}

export interface CheckoutRequest {
  items: CartItem[]
  customerEmail: string
  customerName: string
  totalCents: number
  currency?: string
}

export function generateOrderId(): string {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const { items, customerEmail, customerName, totalCents } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 })
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email jest wymagany' }, { status: 400 })
    }

    const amount = (totalCents / 100).toFixed(2)
    const description = items.map(i => `${i.name} x${i.quantity}`).join(', ').substring(0, 128)
    const orderId = generateOrderId()

    if (!TPAY_MERCHANT_ID || !TPAY_CLIENT_SECRET) {
      return NextResponse.json({
        success: true,
        testMode: true,
        orderId,
        message: 'Tryb testowy - brak konfiguracji TPAY',
        amount: totalCents / 100,
        items,
      })
    }

    const tpay = new TPayAuthService(TPAY_MERCHANT_ID, TPAY_CLIENT_SECRET, TPAY_IS_SANDBOX)

    const transaction = await tpay.request('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
        description: description,
        hiddenDescription: orderId,
        payer: {
          email: customerEmail,
          name: customerName || '',
          phone: ''
        },
        callbacks: {
          notification: {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inteligentnefolie.pl'}/api/checkout/result`
          },
          payerUrls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inteligentnefolie.pl'}/?payment=success&order=${orderId}`,
            error: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://inteligentnefolie.pl'}/?payment=error&order=${orderId}`
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      orderId,
      transactionId: transaction.transactionId,
      paymentUrl: transaction.transactionPaymentUrl,
      amount: parseFloat(amount),
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Błąd podczas przetwarzania zamówienia' }, { status: 500 })
  }
}