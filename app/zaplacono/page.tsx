'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Package, Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { Order } from '@/lib/shop';

function formatPrice(cents: number, currency: string = 'PLN'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id');
        const transactionId = params.get('transaction_id');

        if (!orderId && !transactionId) {
          setError('Nie znaleziono identyfikatora zamówienia');
          setLoading(false);
          return;
        }

        const endpoint = orderId
          ? `/api/order?id=${orderId}`
          : `/api/order?transaction_id=${transactionId}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Nie znaleziono zamówienia');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania zamówienia');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie zamówienia...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full bg-gray-50 min-h-screen">
        <Header pageData={{} as any} />
        <div className="pt-48 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😕</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Coś poszło nie tak</h1>
            <p className="text-gray-600 mb-8">{error || 'Nie mogliśmy znaleźć Twojego zamówienia'}</p>
            <Link
              href="/sklep"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Wróć do sklepu
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <Footer pageData={{} as any} />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans">
      <Header pageData={{} as any} />

      {/* Success Hero */}
      <section className="bg-black text-white pt-48 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Płatność zrealizowana!</h1>
          <p className="text-gray-400 text-lg mb-2">
            Dziękujemy za złożenie zamówienia
          </p>
          <div className="inline-block bg-white/10 rounded-lg px-4 py-2 mt-4">
            <span className="text-sm text-gray-300">Numer zamówienia:</span>
            <span className="ml-2 font-mono font-semibold text-white">{order.order_number}</span>
          </div>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Customer Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-gray-400" />
                Dane kontaktowe
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-gray-600">{order.customer_email}</p>
                {order.customer_phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {order.customer_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                Szczegóły płatności
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Metoda:</span>
                  <span className="font-medium text-gray-900">
                    {order.payment_method === 'now_payments' ? 'Crypto' : order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Opłacone
                  </span>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transakcja:</span>
                    <span className="font-mono text-xs text-gray-500">{order.transaction_id}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Data:</span>
                  <span className="text-gray-900">{formatDate(order.created)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Zamówione produkty</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.price_cents, item.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price_cents * item.quantity, item.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Suma częściowa:</span>
                  <span className="text-gray-900">{formatPrice(order.subtotal, order.currency)}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dostawa:</span>
                    <span className="text-gray-900">{formatPrice(order.shipping_cost, order.currency)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabat:</span>
                    <span>-{formatPrice(order.discount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-lg">
                  <span className="text-gray-900">Razem:</span>
                  <span className="text-gray-900">{formatPrice(order.total, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-cyan/10 rounded-xl p-6 border border-cyan/20">
            <h3 className="font-semibold text-gray-900 mb-3">Co dalej?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Potwierdzenie zamówienia zostało wysłane na Twój adres e-mail</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Przygotujemy Twoje zamówienie do wysyłki</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Otrzymasz informację o statusie przesyłki</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sklep"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Kontynuuj zakupy
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition"
            >
              Masz pytania? Skontaktuj się
            </Link>
          </div>
        </div>
      </section>

      <Footer pageData={{} as any} />
      <FloatingChat pageData={{} as any} />
    </div>
  );
}
