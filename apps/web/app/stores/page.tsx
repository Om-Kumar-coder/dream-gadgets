import type { Metadata } from 'next';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Our Stores — Dream Gadgets Kolkata',
  description: 'Visit Dream Gadgets stores across Kolkata & South 24 Parganas. Buy, sell, and exchange certified used phones, laptops, and gadgets.',
  openGraph: {
    title: 'Our Stores — Dream Gadgets Kolkata',
    description: 'Visit our stores across Kolkata & South 24 Parganas. Buy, sell, and exchange certified used phones.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Stores — Dream Gadgets Kolkata',
    description: 'Visit Dream Gadgets stores in Kolkata & South 24 Parganas.',
  },
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  workingHours: string;
  mapUrl: string;
  sortOrder: number;
}

const EMOJIS = ['🏪', '🏬', '🏢', '🏙️', '🛍️'];

/** Unwrap the API envelope — the response is { status, data: { data: [...] } }. */
async function getBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(`${API}/public/branches`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const raw = json?.data ?? json ?? [];
    return (Array.isArray(raw) ? raw : (raw?.data ?? [])) as Branch[];
  } catch {
    return [];
  }
}

export default async function StoresPage() {
  const branches = await getBranches();

  const storeSchemas = branches.map((s, i) => {
    const [opens, closes] = (s.workingHours ?? '').split('–');
    return {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: s.name,
      telephone: s.phone?.replace(/\s/g, ''),
      address: {
        '@type': 'PostalAddress',
        streetAddress: s.address,
        addressLocality: s.city,
        addressRegion: s.state,
        postalCode: s.pincode,
        addressCountry: 'IN',
      },
      ...(opens && closes ? {
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: opens.trim(),
          closes: closes.trim(),
        },
      } : {}),
      url: s.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(`${s.address} ${s.city}`)}`,
    };
  });

  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Our Stores', url: '/stores' },
      ]} />
      <JsonLd data={webPageSchema('Our Stores — Dream Gadgets Kolkata', 'Visit Dream Gadgets stores across Kolkata & South 24 Parganas.', [
        { name: 'Home', url: '/' },
        { name: 'Our Stores', url: '/stores' },
      ])} />
      <JsonLd data={storeSchemas} />
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Our Stores</h1>
          <p className="text-white/70">Visit us at a branch near you in Kolkata & South 24 Parganas</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        {branches.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📍</span>
            </div>
            <p className="text-surface-500 font-medium">Store list is being updated — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((s, i) => {
              const slug = String(s.code ?? '').toLowerCase();
              const fullAddress = [s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ');
              return (
                <div key={s.id} className="card p-6 hover:shadow-card-hover transition-all flex flex-col group">
                  <span className="text-4xl mb-4 block">{EMOJIS[i % EMOJIS.length]}</span>
                  <h2 className="font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors">
                    <a href={`/stores/${slug}`} className="hover:text-primary transition-colors">{s.name}</a>
                  </h2>
                  <p className="text-sm text-surface-500 mb-1">{s.address}</p>
                  <p className="text-xs text-surface-400 mb-3">{[s.city, s.state].filter(Boolean).join(', ')} — {s.pincode}</p>

                  <div className="space-y-1.5 text-sm mb-4 flex-1">
                    <p className="flex items-center gap-2 text-surface-600">
                      <span>📞</span> {s.phone}
                    </p>
                    <p className="flex items-center gap-2 text-surface-600">
                      <span>🕐</span> {s.workingHours}
                    </p>
                    {s.instagram && (
                      <a
                        href={`https://instagram.com/${s.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:underline"
                      >
                        <span>📸</span> {s.instagram}
                      </a>
                    )}
                    {s.whatsapp && (
                      <a
                        href={`https://wa.me/91${s.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-600 hover:underline"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <a
                      href={s.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Get Directions →
                    </a>
                    <a
                      href={`/stores/${slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-900 bg-primary/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-all"
                    >
                      View Products
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 card p-8 text-center bg-gradient-brand-subtle border-primary/20">
          <h2 className="heading-sm text-surface-900 mb-2">Can&apos;t visit a store?</h2>
          <p className="text-surface-500 text-sm mb-5">No problem! We offer free doorstep pickup across Kolkata and nearby areas.</p>
          <a href="/sell" className="btn-primary btn-lg">
            Schedule Pickup →
          </a>
        </div>
      </section>

      {/* Common Info */}
      <section className="bg-surface-50 border-t border-surface-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-sm text-surface-900 mb-4">Common Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { label: '📧 Email', value: 'dreamgadgetskolkata@gmail.com', href: 'mailto:dreamgadgetskolkata@gmail.com' },
              { label: '🌐 Website', value: 'dreamgadgets.co', href: 'https://dreamgadgets.co' },
              { label: '📺 YouTube', value: '@dream_gadgets', href: 'https://youtube.com/@dream_gadgets' },
              { label: '👍 Facebook', value: 'Dream Gadgets Kolkata', href: 'https://facebook.com/DreamGadgets.Kolkata' },
            ].map((item) => (
              <div key={item.label} className="card p-4 hover:shadow-card-hover transition-all">
                <p className="font-semibold text-surface-900">{item.label}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
