import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '../../components/product/ProductCard';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Hot Deals — Discounted Certified Used Phones | Dream Gadgets',
  description: 'Shop the best deals on certified pre-owned smartphones. Up to big discounts on Apple, Samsung, OnePlus & more. 6-month warranty, free delivery, 7-day returns.',
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function getDeals() {
  try {
    const res = await fetch(`${API}/public/products?limit=24&sort=discount`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json.items ?? [];
  } catch {
    return [];
  }
}

export default async function DealsPage() {
  const products = await getDeals();

  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Hot Deals', url: '/deals' },
      ]} />
      {/* Hero */}
      <section className="text-white py-14 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full text-xs font-bold text-primary-foreground mb-4">
            🔥 Limited Time
          </span>
          <h1 className="text-4xl font-extrabold mb-3">Hot Deals</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            The biggest discounts on certified pre-owned phones — quality checked, warrantied, and ready to ship.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-surface-700 mb-2">No deals right now</p>
            <p className="text-sm text-surface-400 mb-6">Check back soon or browse the full catalog.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/25"
            >
              Browse All Phones
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((p: any, i: number) => (
                <ProductCard key={p.id || i} product={p} variant="square" index={i} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/products?sort=discount"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                View All Discounted Phones
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
