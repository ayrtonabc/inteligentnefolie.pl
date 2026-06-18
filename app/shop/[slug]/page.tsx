import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailClient from './ProductDetailClient';
import { getShopProductBySlug, getShopProducts } from '@/lib/shop';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produkt nie znaleziony',
    };
  }

  return {
    title: `${product.name} - Inteligentne Folie`,
    description: product.short_description || product.name,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produkt nie znaleziony</h1>
          <a href="/inteligentne-folie" className="text-cyan hover:underline">
            Wróć do sklepu
          </a>
        </div>
      </div>
    );
  }

  const allProducts = await getShopProducts();
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <>
      <Header pageData={null} />
      <div className="pt-20">
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
      <Footer pageData={null} />
    </>
  );
}