'use client';

import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from './CartContext';
import { useEffect, useState } from 'react';
import PaymentQr from './PaymentQr';
import CurrencySelect from './CurrencySelect';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, total, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [payMethod, setPayMethod] = useState('now_payments');
  const [nowPaymentsResult, setNowPaymentsResult] = useState<any | null>(null);

  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/checkout/now-payments/currencies');
        const data = await response.json();
        setCurrencies(data?.currencies || data || []);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    fetchCurrencies();
  }, []);

  const handleCheckout = async () => {
    if (!customerEmail) {
      alert('Podaj adres email')
      return
    }

    setIsCheckingOut(true)
    try {
      const response = await fetch(payMethod == 'now_payments' ? '/api/checkout/now-payments' : '/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail,
          customerName: customerName || 'Klient',
          totalCents: total,
          currency: selectedCurrency || undefined,
        }),
      })

      const result = await response.json()

      if (result.testMode) {
        alert(`Tryb testowy! Kwota: ${result.amount} zł\nSkonfiguruj TPAY w .env`)
        clearCart()
        setIsOpen(false)
        return
      }

      if (payMethod == 'now_payments') {
        setNowPaymentsResult(result)
      } else {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        } else {
          alert('Błąd płatności. Spróbuj ponownie.')
        }
      }

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Błąd podczas przetwarzania zamówienia')
    } finally {
      setIsCheckingOut(false)
    }
  };

  const formatPrice = (cents: number | undefined | null): string => {
    const price = Number(cents || 0) / 100;
    return isNaN(price) ? '0.00' : price.toFixed(2).replace('.', ',');
  };

  useEffect(() => {
    if (!isOpen) {
      setNowPaymentsResult(null);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Twój Koszyk</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{items.length} produkty</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Koszyk jest pusty</h3>
                <p className="text-sm text-gray-500 mt-1">Dodaj produkty, aby rozpocząć zakupy.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                    <img
                      src={item.image || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-cyan font-bold mb-3">{formatPrice(item.price_cents)} zł</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              {nowPaymentsResult ? (
                <PaymentQr data={nowPaymentsResult} onClose={() => setIsOpen(false)} onClear={() => { clearCart(); setIsOpen(false); }} />
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <input
                      type="email"
                      placeholder="Email (wymagany)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Imię i nazwisko (opcjonalnie)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4"
                    />
                    {/* Payment method radios (UI only) */}
                    <div className="flex flex-col gap-2 mt-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="now_payments"
                          checked={payMethod === 'now_payments'}
                          onChange={() => setPayMethod('now_payments')}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Now Payments</span>
                      </label>

                      <label className="flex items-center gap-3 opacity-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="tpay"
                          checked={payMethod === 'tpay'}
                          onChange={() => setPayMethod('tpay')}
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Tpay (Próximamente)</span>
                      </label>
                    </div>

                    {payMethod === 'now_payments' && (
                      <div className="mt-4">
                        <label className="block text-sm text-gray-500 mb-2">Pagar con</label>
                        <CurrencySelect
                          currencies={currencies}
                          value={selectedCurrency}
                          onChange={(code) => setSelectedCurrency(code)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Suma częściowa</span>
                      <span>{formatPrice(total)} zł</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Wysyłka</span>
                      <span className="text-emerald-600 font-medium">Gratis</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-gray-900">Razem</span>
                      <span className="text-2xl font-black text-gray-900">{formatPrice(total)} zł</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !customerEmail}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        Przejdź do płatności
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
                    Bezpieczne płatności SSL • NOW PAYMENTS & TPAY
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
