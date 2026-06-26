import { Check } from 'lucide-react';
import Link from 'next/link';
import { CmsText } from '@/components/cms/CmsServerComponents';
import { PageData } from '@/lib/pageData';
import { getShopProducts, Product } from '@/lib/shop';

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

function formatPrice(product: Product) {
  return `${(product.price_cents / 100).toLocaleString('pl-PL')} ${product.currency}/m²`;
}

export default async function Products({ pageData }: { pageData?: PageData }) {
  let products = await getShopProducts({ featured: true });
  
  if (products.length === 0) {
    products = (await getShopProducts()).slice(0, 3);
  } else {
    products = products.slice(0, 3);
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-cyan font-medium text-xs tracking-[0.2em] uppercase text-center mb-4">PRODUKTY</p>
        <h2 className="text-3xl md:text-4xl font-light text-gray-900 text-center mb-4">Nasza Oferta</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto font-light">Sprawdzone rozwiązania dla domu, biura i hoteli</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const bullets = getBulletPoints(product.description_html);
            const shortDesc = product.short_description ? stripHtml(product.short_description) : '';
            const imageUrl = product.images?.[0]?.url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600';

            return (
              <article key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}