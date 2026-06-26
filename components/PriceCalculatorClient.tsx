'use client';

import { useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';

export default function PriceCalculatorClient() {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(150);
  const [quantity, setQuantity] = useState(1);

  const area = (width * height) / 10000;
  const basePrice = 1200;
  const totalPrice = area * basePrice * quantity;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-cyan/20 flex items-center justify-center">
          <Calculator className="text-cyan" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Kalkulator ceny</h3>
          <p className="text-gray-400 text-xs">Oblicz orientacyjny koszt folii inteligentnej</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Typ folii</label>
        <div className="relative">
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white appearance-none cursor-pointer">
            <option>Folia samoprzylepna PDLC</option>
            <option>Folia LCD do laminacji</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Szerokość (cm)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Wysokość (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-2">Ilość (szt.)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan"
        />
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <p className="text-gray-400 text-xs mb-1">Szacowana cena netto</p>
        <p className="text-3xl font-bold text-cyan">{totalPrice.toFixed(2)} zł</p>
        <p className="text-gray-500 text-xs mt-1">
          Cena za 1 szt. = {(totalPrice / quantity).toFixed(2)} zł
        </p>
      </div>

      <button className="w-full bg-cyan text-black font-semibold py-3 rounded-lg hover:bg-cyan/90 transition">
        Zamów wycenę szczegółową
      </button>
    </div>
  );
}
