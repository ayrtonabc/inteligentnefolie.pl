"use client";

import QRCode from 'react-qr-code';
import { useEffect, useRef, useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';

type Props = {
  data: any;
  onClose?: () => void;
  onClear?: () => void;
};

export default function PaymentQr({ data, onClose, onClear }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const formatPrice = (cents: number | undefined | null): string => {
    const price = Number(cents || 0) / 100;
    return isNaN(price) ? '0.00' : price.toFixed(2).replace('.', ',');
  };

  useEffect(() => {
    if (!data) return;

    const np = data.nowPayments || {};
    const exp = np.expiration_estimate_date || np.valid_until || null;

    const update = () => {
      if (!exp) {
        setTimeLeft(0);
        return;
      }
      const diff = Math.max(0, Math.floor((new Date(exp).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0 && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    update();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(update, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [data]);

  const copyToClipboard = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!data) return null;

  const np = data.nowPayments || {};

  const [notifying, setNotifying] = useState(false);

  const getPaymentId = () => {
    return (
      data?.payment_id ||
      np?.payment_id ||
      np?.purchase_id ||
      data?.purchase_id ||
      null
    );
  };

  const complete = async () => {
    const paymentId = getPaymentId();
    if (!paymentId) {
      alert('Brak ID płatności');
      return;
    }

    setNotifying(true);
    try {
      const res = await fetch('/api/checkout/now-payments/ipn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const result = await res.json();

      const status = result?.status || null;
      const isPaid = status === 'finished' || status === 'confirmed' || status === 'completed' || status === 'paid';
      const order = result?.order || null;

      if (isPaid) {
        window.location.href = `/api/checkout/result?payment=success&order=${order || ''}`;
      } else {
        window.location.href = `/api/checkout/result?payment=error`;
      }
    } catch (err) {
      console.error('Notify error', err);
      window.location.href = `/api/checkout/result?payment=error`;
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 mb-4">
          <QRCode
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={data.qrUri}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">ID zamówienia</div>
          <div className="font-semibold">{data.orderId || np.order_id}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Suma (fiat)</span>
          <span className="font-medium">{formatPrice(np.price_amount * 100)} zł</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Kwota (crypto)</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{np.pay_amount}</span>
            <button onClick={() => copyToClipboard(String(np.pay_amount))} className="p-1 rounded hover:bg-gray-100">
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Waluta (crypto)</span>
          <div className="flex items-center gap-2">
            <span className="font-medium uppercase">{np.pay_currency}</span>
            <button onClick={() => copyToClipboard(String(np.pay_currency))} className="p-1 rounded hover:bg-gray-100">
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Adres płatności</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{np.pay_address}</span>
            <button onClick={() => copyToClipboard(np.pay_address)} className="p-1 rounded hover:bg-gray-100">
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Ważne przez</span>
          <span className="font-medium">{timeLeft > 0 ? formatTime(timeLeft) : 'Wygasło'}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={() => onClose && onClose()} className="flex-1 py-3 bg-gray-200 rounded-lg">Zamknij</button>
        <button
          onClick={complete}
          disabled={notifying}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg disabled:opacity-60"
        >
          {notifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sprawdzam...
            </>
          ) : (
            'Już dokonałem płatności'
          )}
        </button>
      </div>
    </div>
  );
}
