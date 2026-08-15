import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard from '../../../components/product/ProductCard';
import { JsonLd } from '../../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../../lib/seo/schemas';

interface Props {
  params: { slug: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function getBranch(slug: string) {
  try {
    const res = await fetch(`${API}/public/branches`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const branches: any[] = json.data ?? json ?? [];
    return branches.find((b: any) => String(b.code ?? '').toLowerCase() === slug.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

async function getBranchProducts(branchId: string) {
  try {
    const res = await fetch(
      `${API}/public/products?branchId=${encodeURIComponent(branchId)}&limit=48`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json.items ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const branch = await getBranch(params.slug);
  if (!branch) return { title: 'Store Not Found — Dream Gadgets' };
  const shortName = branch.name.replace(/^Dream Gadgets\s*/, '').replace(/\(Main Branch\)/i, 'Main Branch').trim();
  return {
    title: `Products at ${branch.name} — Dream Gadgets`,
    description: `Browse certified used phones and gadgets available at our ${shortName} store. ${branch.address ?? ''} ${branch.city ?? ''}. Visit us or order online with warranty.`,
    openGraph: {
      title: `Products at ${branch.name} — Dream Gadgets`,
      description: `Browse certified used phones and gadgets available at our ${shortName} store.`,
    },
  };
}

export default async function StorePage({ params }: Props) {
  const branch = await getBranch(params.slug);
  if (!branch) notFound();

  const products = await getBranchProducts(branch.id);
  const slug = String(branch.code ?? '').toLowerCase();
  const shortName = (branch.name ?? 'Store').replace(/^Dream Gadgets\s*/, '').trim();

  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Our Stores', url: '/stores' },
        { name: branch.name, url: `/stores/${slug}` },
      ]} />
      <JsonLd data={webPageSchema(
        `${branch.name} — Dream Gadgets`,
        `Browse certified used phones and gadgets available at ${branch.name}.`,
        [
          { name: 'Home', url: '/' },
          { name: 'Our Stores', url: '/stores' },
          { name: branch.name, url: `/stores/${slug}` },
        ],
      )} />

      {/* Hero */}
      <section className="text-white py-14 px-4 relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-2 font-semibold">Our Store</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{branch.name}</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            {[branch.address, branch.city, branch.state].filter(Boolean).join(', ')}
            {branch.pincode ? ` — ${branch.pincode}` : ''}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            {branch.phone && (
              <a href={`tel:+91${branch.phone}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-full transition-all">
                📞 {branch.phone}
              </a>
            )}
            {branch.whatsapp && (
              <a href={`https://wa.me/91${branch.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 rounded-full transition-all font-semibold">
                💬 WhatsApp
              </a>
            )}
            {branch.workingHours && (
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                🕐 {branch.workingHours}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-surface-900">Available at this store</h2>
            <p className="text-sm text-surface-400 mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} in stock now{shortName ? ` at ${shortName}` : ''}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-surface-900 mb-1">No products listed yet</h3>
            <p className="text-sm text-surface-400 max-w-sm mx-auto">
              This store&apos;s online catalog is being refreshed. Check back soon or visit us in person — we have plenty on the shelves!
            </p>
            <a href="/stores" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
              Browse Other Stores
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} variant="grid" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
