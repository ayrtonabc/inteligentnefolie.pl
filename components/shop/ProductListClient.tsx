'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ShoppingCart, Check, Calculator, Search, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { Product } from '@/lib/shop';

interface ProductListClientProps {
  initialProducts: Product[];
}

export default function ProductListClient({ initialProducts }: ProductListClientProps) {
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

  const categories = useMemo(() => {
    const cats = new Set<string>(['Wszystkie']);
    initialProducts.forEach(p => {
      if (p.category_name) cats.add(p.category_name);
    });
    return Array.from(cats);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description_html || '').replace(/<[^>]*>/g, ' ').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Wszystkie' || 
        p.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, searchTerm, selectedCategory]);

  const getImageUrl = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img?.url || '';
    }
    return 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = getImageUrl(product);
    
    return (
      <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col group transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
        <div className="relative p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <img 
              src={imageUrl}
              alt={product.name} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
            />
            {product.category_name && (
              <span className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[9px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-[0.1em]">
                {product.category_name}
              </span>
            )}
          </div>
        </div>

        <div className="px-7 pb-7 pt-2 flex flex-col flex-1">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-bold text-[#00D1FF] text-xl leading-tight mb-2 group-hover:opacity-80 transition-opacity">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {(product.price_cents / 100).toLocaleString('pl-PL')}
            </span>
            <span className="text-sm font-bold text-gray-400 uppercase">{product.currency}/m²</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
            {product.short_description || 'Inteligentna technologia'}
          </p>

          <button 
            onClick={() => {
              addItem({
                id: product.id,
                name: product.name,
                price_cents: product.price_cents,
                currency: product.currency,
                image: getImageUrl(product),
              });
            }}
            className="w-full bg-[#00D1FF] text-white font-bold py-4 rounded-2xl hover:bg-[#00B8DB] transition-colors flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Dodaj do koszyka
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section className="py-4 bg-white border border-gray-100 rounded-3xl shadow-sm px-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj produktów..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 bg-gray-50 border border-gray-100 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-cyan/20 transition-all outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-cyan">{filteredProducts.length}</span>
            <span>produktów</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nie znaleziono produktów.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('Wszystkie'); }}
              className="text-cyan hover:underline text-sm"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}