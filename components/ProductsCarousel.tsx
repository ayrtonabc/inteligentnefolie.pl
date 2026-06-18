'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/shop';

function stripHtml(html: string | null | undefined) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBulletPoints(text: string | null | undefined): string[] {
  if (!text) return [];
  const liMatches = [...text.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
  if (liMatches.length > 0) return liMatches.slice(0, 5);
  return text.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 5);
}

function getImageUrl(product: Product): string {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : img?.url || '';
  }
  return 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600';
}

function formatPrice(product: Product) {
  return `${(product.price_cents / 100).toLocaleString('pl-PL')} ${product.currency}/m²`;
}

interface ProductsCarouselProps {
  products: Product[];
}

export default function ProductsCarousel({ products }: ProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = products.length;
  const visibleSlides = totalSlides >= 3 ? 3 : totalSlides === 2 ? 2 : 1;

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-cyan font-medium text-xs tracking-[0.2em] uppercase text-center mb-4">PRODUKTY</p>
        <h2 className="text-3xl md:text-4xl font-light text-gray-900 text-center mb-4">Nasza Oferta</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto font-light">Sprawdzone rozwiązania dla domu, biura i hoteli</p>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 disabled:opacity-50"
                aria-label="Poprzedni"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 disabled:opacity-50"
                aria-label="Następny"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Slides */}
          <div className="overflow-hidden mx-12">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleSlides)}%)` 
              }}
            >
              {products.map((product) => {
                const bullets = getBulletPoints(product.description_html);
                const shortDesc = product.short_description ? stripHtml(product.short_description) : '';
                const imageUrl = getImageUrl(product);

                return (
                  <div 
                    key={product.id} 
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
                  >
                    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img 
                          src={imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-lg text-gray-900 leading-snug mb-1">{product.name}</h3>
                        <p className="text-xl font-bold text-gray-900 mb-2">{formatPrice(product)}</p>
                        
                        {shortDesc && (
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{shortDesc}</p>
                        )}
                        
                        <div className="space-y-2 mb-6 flex-1">
                          {bullets.length > 0 ? (
                            bullets.map((bullet, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0">
                                  <Check className="text-cyan" size={10} strokeWidth={3} />
                                </div>
                                <span className="text-sm text-gray-700 line-clamp-1">{bullet}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 italic">Brak szczegółowych informacji</p>
                          )}
                        </div>
                        
                        <Link href="/sklep" className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition text-center mt-auto">
                          Zobacz szczegóły
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-cyan w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Przejdź do slajdu ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link 
            href="/sklep" 
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-all"
          >
            Zobacz wszystkie produkty
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}