'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import Link from 'next/link';

interface ProductImage {
  url: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description_html: string;
  short_description: string;
  category_name: string;
  price_cents: number;
  currency: string;
  stock: number;
  images: ProductImage[];
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem, items } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const currentProductInCart = items.find(i => i.id === product.id);
  const currentQuantity = currentProductInCart?.quantity || 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      quantity: quantity,
      image: product.images?.[0]?.url,
    });
  };

  const formatPrice = (cents: number) => {
    const price = Number(cents || 0) / 100;
    return isNaN(price) ? '0,00' : price.toFixed(2).replace('.', ',');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-cyan transition-colors">Strona główna</a>
          <span>/</span>
          <a href="/sklep" className="hover:text-cyan transition-colors">Sklep</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-lg">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ShoppingBag className="w-20 h-20 text-gray-300" />
                </div>
              )}

              {product.images && product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all hover:scale-105 z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all hover:scale-105 z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-cyan w-6' : 'bg-white/60 hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-cyan shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.category_name && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded-full">
                {product.category_name}
              </span>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black text-gray-900">
                {formatPrice(product.price_cents)}
              </span>
              <span className="text-lg text-gray-500 font-medium">{product.currency}</span>
            </div>

            {product.short_description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.short_description}
              </p>
            )}

            <div className="flex items-center gap-3">
              {product.stock > 0 ? (
                <>
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span className="text-emerald-700 font-semibold">
                    Dostępnych: {product.stock} szt.
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-semibold">Brak w magazynie</span>
              )}
              {currentQuantity > 0 && (
                <span className="text-sm text-gray-500 ml-4">
                  W koszyku: {currentQuantity}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-4 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="p-4 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-cyan text-black font-bold py-4 px-8 rounded-xl hover:bg-cyan/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-lg">
                  {currentQuantity > 0 ? 'Dodaj więcej do koszyka' : 'Dodaj do koszyka'}
                </span>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan rounded-full"></div>
                </div>
                <span>Darmowa dostawa od 500 zł</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan rounded-full"></div>
                </div>
                <span>Gwarancja 24 miesiące</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan rounded-full"></div>
                </div>
                <span>Profesjonalne doradztwo</span>
              </div>
            </div>
          </div>
        </div>

        {product.description_html && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Opis produktu</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <div dangerouslySetInnerHTML={{ __html: product.description_html }} />
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produkty powiązane</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <Link
                  key={related.id}
                  href={`/shop/${related.slug}`}
                  className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-gray-100">
                    {related.images && related.images[0] ? (
                      <img
                        src={related.images[0].url}
                        alt={related.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-cyan transition-colors text-sm line-clamp-2 mb-2">
                      {related.name}
                    </h3>
                    <p className="font-bold text-gray-900">
                      {formatPrice(related.price_cents)} {related.currency}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}