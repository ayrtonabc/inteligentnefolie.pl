"use client";

import { useMemo, useState } from 'react';

type Currency = {
  id: number;
  code: string;
  name: string;
  enable: boolean;
  logo_url?: string | null;
  [key: string]: any;
};

type Props = {
  currencies: Currency[];
  value?: string | null;
  onChange?: (code: string) => void;
};

export default function CurrencySelect({ currencies = [], value = null, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return currencies.filter((c) => {
      if (!c) return false;
      if (!c.enable) return false;
      if (!q) return true;
      return (
        (c.code || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q)
      );
    });
  }, [currencies, query]);

  const selected = useMemo(() => currencies.find((c) => c.code === value) || null, [currencies, value]);

  const buildLogo = (c: Currency) => {
    if (!c) return '';
    if (c.logo_url) {
      return c.logo_url.startsWith('http') ? c.logo_url : `https://nowpayments.io${c.logo_url}`;
    }
    return `https://nowpayments.io/images/coins/${(c.code || '').toLowerCase()}.svg`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm"
      >
        <div className="flex items-center gap-3">
          {selected ? (
            <img src={buildLogo(selected)} alt={selected.code} className="w-6 h-6 rounded-sm" />
          ) : (
            <div className="w-6 h-6 bg-gray-100 rounded-sm" />
          )}
          <span className="font-medium">{selected ? `${selected.code} — ${selected.name}` : 'Wybierz walutę'}</span>
        </div>
        <span className="text-xs text-gray-500">{open ? 'Zamknij' : 'Otwórz'}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg bottom-14 left-0 right-0">
          <div className="p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj waluty..."
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
            />
          </div>
          <div className="max-h-[160px] overflow-auto divide-y">
            {items.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Nie znaleziono walut</div>
            ) : (
              items.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange && onChange(c.code);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                >
                  <img src={buildLogo(c)} alt={c.code} className="w-6 h-6 rounded-sm" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{c.code}</div>
                    <div className="text-xs text-gray-500">{c.name}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
