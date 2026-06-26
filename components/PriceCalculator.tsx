'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CmsText } from '@/components/cms/CmsServerComponents';
import { PageData } from '@/lib/pageData';

const FOIL_TYPES = {
  samoprzylepna: {
    name: 'Folia PDLC',
    pricePerM2: 1200,
  },
  laminacja: {
    name: 'Folia LCD',
    pricePerM2: 1500,
  }
};

const EXCHANGE_RATE = 0.24;

export default function PriceCalculator({ pageData }: { pageData?: PageData }) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(150);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'samoprzylepna' | 'laminacja'>('samoprzylepna');
  const [currency, setCurrency] = useState<'PLN' | 'EUR'>('PLN');

  const foilType = FOIL_TYPES[type];
  const pricePerM2 = foilType.pricePerM2;
  const area = (width * height) / 10000;
  const totalPricePLN = Math.round(area * pricePerM2 * quantity);
  const totalPrice = currency === 'EUR' ? Math.round(totalPricePLN * EXCHANGE_RATE) : totalPricePLN;

  const [displayPrice, setDisplayPrice] = useState(totalPrice);
  const priceRef = useRef(totalPrice);

  useEffect(() => {
    const startPrice = priceRef.current;
    const diff = totalPrice - startPrice;
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(Math.round(startPrice + diff * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [totalPrice]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <CmsText pageData={pageData} sectionKey="calculator_title" fallback="Oblicz koszt folii inteligentnej" as="h2" className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" />
        </div>

        <div className="flex items-stretch justify-center gap-0">
          
          <div className="relative w-full max-w-md hidden md:block">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/calculator.webp"
                alt="Folia inteligentna"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-100 flex flex-col h-[105%]">
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Typ folii</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FOIL_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setType(key as any)}
                      className={`py-2 px-3 rounded-lg text-center transition-all border-2 font-medium text-sm ${
                        type === key 
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-bold">{value.name}</div>
                      <div className="text-xs mt-0.5 opacity-70">
                        {currency === 'EUR' ? (value.pricePerM2 * EXCHANGE_RATE).toFixed(0) : value.pricePerM2} {currency}/m²
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Szerokość</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">{width}</div>
                    <div className="text-xs text-gray-500">cm</div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="450"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Wysokość</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-gray-900">{height}</div>
                    <div className="text-xs text-gray-500">cm</div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max={type === 'samoprzylepna' ? 180 : 200}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500">Ilość sztuk</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-700 font-bold transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900 text-xl">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(20, quantity + 1))}
                    disabled={quantity >= 20}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-700 font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400">{width} × {height} cm · {quantity} szt.</div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setCurrency('PLN')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                      currency === 'PLN' ? 'bg-cyan-500 text-black shadow' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    PLN
                  </button>
                  <button
                    onClick={() => setCurrency('EUR')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                      currency === 'EUR' ? 'bg-cyan-500 text-black shadow' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    EUR
                  </button>
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="text-4xl font-black text-gray-900">
                  {displayPrice.toLocaleString('pl-PL')}
                </div>
                <div className="text-sm text-gray-400 font-medium">{currency} netto</div>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mb-3 px-1">
                <span>{area.toFixed(2)} m²</span>
                <span className="text-cyan-600 font-medium">{foilType.name}</span>
              </div>

              <a 
                href="/kontakt"
                className="block w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-green-400 hover:to-emerald-300 text-white font-bold py-4 rounded-xl transition-all text-center shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 text-base uppercase tracking-wide"
              >
                Zamów wycenę szczegółową
              </a>

              <p className="text-xs text-gray-400 text-center mt-3">
                1 PLN = {EXCHANGE_RATE} EUR
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}