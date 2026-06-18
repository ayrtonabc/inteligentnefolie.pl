'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from './cart/CartContext';
import { useEffect, useState } from 'react';

export default function FloatingCart() {
  const { items, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 left-6 z-50 bg-cyan text-black p-4 rounded-full shadow-xl hover:bg-cyan/90 transition-all hover:scale-110 flex items-center justify-center"
      aria-label="Otwórz koszyk"
    >
      <ShoppingBag size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}