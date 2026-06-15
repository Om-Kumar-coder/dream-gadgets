import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
  description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const BRAND_NAMES = ['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Xiaomi', 'Motorola', 'Google', 'Nothing'];

const BRANCHES = [
  { name: 'Barrackpore', address: 'Kolkata, West Bengal', phone: '8017999888', email: 'dreamgadgetskolkata@gmail.com', status: 'Open', hours: '10:30 AM - 9:30 PM' },
  { name: 'Salt Lake', address: 'Sector 5, Salt Lake City, Kolkata', phone: '8017999888', email: 'dreamgadgetskolkata@gmail.com', status: 'Open', hours: '10:30 AM - 9:30 PM' },
  { name: 'Howrah', address: 'Howrah Station Area, Howrah', phone: '8017999888', email: 'dreamgadgetskolkata@gmail.com', status: 'Open', hours: '10:30 AM - 9:30 PM' },
];

async function getHomeProducts() {
  try {
    const res = await fetch(`${API}/public/products?limit=12&sort=popular`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json.items ?? [];
  } catch {
    return [];
  }
}

function computeDiscount(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

function formatPrice(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function getQualityClass(q: string): string {
  const map: Record<string, string> = {
    super_mint: 'Super Mint', sealed_pack: 'Sealed Pack', open_box: 'Open Box',
    mint: 'Mint', good: 'Good',
  };
  return map[q?.toLowerCase()] || q || 'Mint';
}

function getProductImage(p: any): string | null {
  if (p.images?.[0]) return p.images[0];
  if (p.thumbnail) return p.thumbnail;
  return null;
}

export default async function HomePage() {
  const products = await getHomeProducts();
  const trending = products.slice(0, 6);
  const dealOfDay = products.slice(0, 3);
  const hotDeals = products.slice(0, 4);
  const recommended = products.slice(2, 6);

  const lastSoldProduct = products[0];
  const lsPrice = lastSoldProduct ? Number(lastSoldProduct.online_price ?? lastSoldProduct.price ?? lastSoldProduct.selling_price ?? 0) : 0;
  const lsName = lastSoldProduct ? (lastSoldProduct.item_name ?? `${lastSoldProduct.model ?? ''} ${lastSoldProduct.storage ?? ''}`.trim()) : 'APPLE IPHONE 16 PRO';
  const lsBranch = lastSoldProduct?.branch_name ?? 'Barrackpore';
  const lsImg = lastSoldProduct ? getProductImage(lastSoldProduct) : null;

  return (
    <main className="overflow-hidden">
      {/* ════════════════════════════════════════
          HERO SECTION — Premium Banner + Last Sold
          ════════════════════════════════════════ */}
      <section className="relative bg-gradient-hero overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-amber/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Main Hero Banner ── */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-surface-950 border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center">
              <div className="absolute inset-0 noise-bg" />
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-semibold mb-5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
                  Certified & Verified
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
                  Premium Phones
                  <br />
                  <span className="text-gradient-brand">Best Prices</span>
                </h1>
                <p className="text-lg text-white/60 mb-6 max-w-lg">
                  Certified pre-owned smartphones with warranty, quality checked, and delivered to your doorstep.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/30"
                  >
                    Shop Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/20 active:scale-[0.97] transition-all border border-white/10"
                  >
                    Sell Your Phone
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-xl font-bold text-white">10K+</p>
                    <p className="text-xs text-white/40">Phones Sold</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">4.8★</p>
                    <p className="text-xs text-white/40">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">50+</p>
                    <p className="text-xs text-white/40">Cities</p>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64">
                <div className="w-full h-full rounded-full border border-white/5" />
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              </div>
            </div>

            {/* ── Last Sold Product Card ── */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 min-h-[320px] md:min-h-[400px] flex items-center">
              <div className="p-6 md:p-8 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full text-amber-400 text-xs font-semibold mb-4">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Just Sold
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Last Sold Product</p>

                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                    {lsImg ? (
                      <img src={lsImg} alt={lsName} className="w-full h-full object-contain p-3" />
                    ) : (
                      <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{lsName}</h3>
                  <p className="text-xs text-white/40 mb-3">{lsBranch}</p>
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25">
                    {formatPrice(lsPrice)}
                  </span>
                </div>

                <Link
                  href="/products"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-all"
                >
                  View All Products
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP
          ════════════════════════════════════════ */}
      <section className="bg-surface-50 border-y border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="trust-strip justify-center">
            {[
              { icon: '🛡️', label: '6-Month Warranty' },
              { icon: '🔬', label: '20-Point Inspection' },
              { icon: '📦', label: 'Free Delivery' },
              { icon: '↩️', label: '7-Day Returns' },
              { icon: '💳', label: 'No Cost EMI' },
              { icon: '🔋', label: '90%+ Battery Health' },
            ].map(t => (
              <div key={t.label} className="trust-badge">
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRANDS CAROUSEL
          ════════════════════════════════════════ */}
      <section className="py-14 md:py-20 container-page">
        <div className="commonHdn">
          <h3><span>Shop</span> by Brand</h3>
          <Link href="/products" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BRAND_NAMES.map(b => (
            <Link
              key={b}
              href={`/products?brand=${b}`}
              className="mobi-brand-item"
            >
              <div className="mobi-brand-item-img">
                <div className="w-[70px] h-[70px] rounded-xl bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center text-2xl font-bold text-surface-300">
                  {b.charAt(0)}
                </div>
              </div>
              <div className="mobi-brand-item-dtls">
                <h4>{b}</h4>
                <p className="text-xs text-surface-400">Shop {b}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRENDING PRODUCTS
          ════════════════════════════════════════ */}
      <section className="pb-14 md:pb-20 container-page">
        <div className="commonHdn">
          <h3><span>Trending</span> Products</h3>
          <Link href="/products" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trending.map((p: any, i: number) => {
            const price = Number(p.online_price ?? p.price ?? p.selling_price ?? 0);
            const origPrice = p.original_price ? Number(p.original_price) : undefined;
            const discount = computeDiscount(price, origPrice);
            const img = getProductImage(p);
            const name = p.item_name ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim();
            const quality = getQualityClass(p.condition);
            return (
              <Link
                key={p.id || i}
                href={`/products/${p.id}`}
                className="group relative bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
                  {discount && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-0.5 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      -{discount}%
                    </span>
                  )}
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-5">
                  <span className="inline-block text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full mb-2 capitalize">
                    {quality}
                  </span>
                  <h3 className="text-sm md:text-base font-semibold text-surface-900 line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  {p.branch_name && (
                    <p className="text-xs text-surface-400 mb-2">{p.branch_name}</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-surface-900">{formatPrice(price)}</span>
                    {origPrice && <span className="text-sm text-surface-400 line-through">{formatPrice(origPrice)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          DEAL OF THE DAY
          ════════════════════════════════════════ */}
      <section className="mobi-deal-of-the-day">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-semibold mb-3 w-fit">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Limited Time
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-surface-900 leading-tight mb-2">
                Deal of<br />
                <span className="text-primary">the Day</span>
              </h3>
              <p className="text-sm text-surface-400 mb-4">Best offers on premium phones. Grab yours before they&apos;re gone!</p>
              <Link href="/products?sort=discount" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                View All Deals
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dealOfDay.map((p: any, i: number) => {
                  const price = Number(p.online_price ?? p.price ?? p.selling_price ?? 0);
                  const origPrice = p.original_price ? Number(p.original_price) : undefined;
                  const discount = computeDiscount(price, origPrice);
                  const img = getProductImage(p);
                  const name = p.item_name ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim();
                  const quality = getQualityClass(p.condition);
                  return (
                    <Link key={p.id || i} href={`/products/${p.id}`} className="group bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100">
                        {discount && (
                          <span className="absolute top-3 right-3 z-10 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                            -{discount}%
                          </span>
                        )}
                        {img ? (
                          <img src={img} alt={name} className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-14 h-14 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full capitalize">{quality}</span>
                        <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 mt-1.5 mb-1 group-hover:text-primary transition-colors">{name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-surface-900">{formatPrice(price)}</span>
                          {origPrice && <span className="text-xs text-surface-400 line-through">{formatPrice(origPrice)}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES GRID
          ════════════════════════════════════════ */}
      <section className="py-16 md:py-20 container-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: '🔒', title: 'Secured Payment', desc: '100% safe & secure transactions' },
            { icon: '💰', title: 'Best Price Guarantee', desc: 'Highest market price for your device' },
            { icon: '📞', title: '24/7 Support', desc: 'Dedicated support team always available' },
            { icon: '📍', title: 'Store Pickup', desc: 'Pick up from your nearest store' },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-card border border-surface-100 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-3xl mb-3">{f.icon}</span>
              <h4 className="text-sm font-bold text-surface-900 mb-1">{f.title}</h4>
              <p className="text-xs text-surface-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOT DEALS
          ════════════════════════════════════════ */}
      <section className="pb-14 md:pb-20 container-page">
        <div className="commonHdn">
          <h3><span>Hot</span> Deals</h3>
          <Link href="/products?sort=discount" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotDeals.map((p: any, i: number) => {
            const price = Number(p.online_price ?? p.price ?? p.selling_price ?? 0);
            const origPrice = p.original_price ? Number(p.original_price) : undefined;
            const discount = computeDiscount(price, origPrice);
            const img = getProductImage(p);
            const name = p.item_name ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim();
            const quality = getQualityClass(p.condition);
            return (
              <Link key={p.id || i} href={`/products/${p.id}`} className="group bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100">
                  {discount && (
                    <span className="absolute top-3 right-3 z-10 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">-{discount}%</span>
                  )}
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-14 h-14 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full capitalize">{quality}</span>
                  <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 mt-1.5 mb-1 group-hover:text-primary transition-colors">{name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-surface-900">{formatPrice(price)}</span>
                    {origPrice && <span className="text-xs text-surface-400 line-through">{formatPrice(origPrice)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          APP BANNER
          ════════════════════════════════════════ */}
      <section className="container-page mb-14 md:mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero-alt border border-white/5 min-h-[220px] md:min-h-[300px] flex items-center justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 text-center p-8 md:p-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/60 text-xs font-semibold mb-4">
              Coming Soon
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">📱 Dream Gadgets App</h2>
            <p className="text-white/50 text-sm md:text-base mb-6">Sell & Buy on the go. Download now for the best experience!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white/60 rounded-xl text-sm font-semibold border border-white/10 cursor-not-allowed">
                App Store
              </span>
              <span className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white/60 rounded-xl text-sm font-semibold border border-white/10 cursor-not-allowed">
                Play Store
              </span>
              <Link href="/sell" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                Start Selling →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          RECOMMENDED PRODUCTS
          ════════════════════════════════════════ */}
      <section className="pb-14 md:pb-20 container-page">
        <div className="commonHdn">
          <h3><span>Recommended</span> Products</h3>
          <Link href="/products" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map((p: any, i: number) => {
            const price = Number(p.online_price ?? p.price ?? p.selling_price ?? 0);
            const origPrice = p.original_price ? Number(p.original_price) : undefined;
            const discount = computeDiscount(price, origPrice);
            const img = getProductImage(p);
            const name = p.item_name ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim();
            const quality = getQualityClass(p.condition);
            return (
              <Link key={p.id || i} href={`/products/${p.id}`} className="group bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100">
                  {discount && (
                    <span className="absolute top-3 right-3 z-10 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">-{discount}%</span>
                  )}
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-14 h-14 text-surface-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full capitalize">{quality}</span>
                  <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 mt-1.5 mb-1 group-hover:text-primary transition-colors">{name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-surface-900">{formatPrice(price)}</span>
                    {origPrice && <span className="text-xs text-surface-400 line-through">{formatPrice(origPrice)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICE RANGE SECTION
          ════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-surface-50">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="pricerangeleft">
              <h5>Dream Gadgets – Trusted Source for Premium Pre-Owned Mobiles.</h5>
              <p>Dream Gadgets, known as smartphone expert and leading industry, focused on delivering quality products at most affordable prices along with continued customer support services. We ensure best quality products passed from strict quality checks.</p>
              <Link href="/about" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold text-sm border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">
                Learn More
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="pricerangemdl">
              <div className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-2xl bg-gradient-to-br from-surface-900 to-surface-950 flex items-center justify-center border border-surface-800">
                <svg className="w-20 h-20 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
            </div>
            <div className="pricerangeRight">
              <ul>
                {[
                  { label: 'Between', range: '₹ 0 & ₹ 7,999' },
                  { label: 'Between', range: '₹ 8,000 & ₹ 14,999' },
                  { label: 'Between', range: '₹ 15,000 & ₹ 29,999' },
                  { label: 'Between', range: '₹ 30,000 & ₹ 49,999' },
                  { label: 'Between', range: '₹ 50,000 & ₹ 79,999' },
                  { label: 'Between', range: '₹ 80,000 & ₹ 1,50,000' },
                ].map((r, i) => (
                  <li key={i}>
                    <Link href={`/products?minPrice=${r.range.split('&')[0].replace(/[^0-9]/g, '') || '0'}&maxPrice=${r.range.split('&')[1]?.replace(/[^0-9]/g, '') || '150000'}`}>
                      <label>{r.label}</label>
                      <span>{r.range}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR BRANCHES
          ════════════════════════════════════════ */}
      <section className="py-14 md:py-20 container-page">
        <div className="commonHdn">
          <h3><span>Our</span> Branches</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BRANCHES.map(b => (
            <div key={b.name} className="mobi-branch-item">
              <div className="mobi-branch-item-img bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center">
                <span className="brnchstatus">{b.status}</span>
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="branchTime">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {b.hours}
                </span>
              </div>
              <div className="mobi-branch-item-details">
                <h2>{b.name}</h2>
                <p>
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{b.address}</span>
                </p>
                <p>
                  <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <a href={`tel:${b.phone}`} className="text-primary font-semibold hover:text-surface-600 transition-colors">{b.phone}</a>
                </p>
                <p>
                  <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href={`mailto:${b.email}`} className="text-primary hover:text-surface-600 transition-colors truncate">{b.email}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ABOUT / SEO TEXT
          ════════════════════════════════════════ */}
      <section className="bg-surface-50 border-t border-surface-100 py-14 md:py-20">
        <div className="container-narrow text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-surface-900 mb-4">
            Sell/Buy Your Old Mobile Phone Online with Dream Gadgets
          </h2>
          <p className="text-sm text-surface-500 leading-relaxed mb-4 max-w-3xl mx-auto">
            Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs — all in one place. We offer a process that is 100% transparent, secure, and fast.
          </p>
          <p className="text-sm text-surface-500 leading-relaxed mb-6 max-w-3xl mx-auto">
            In the current digital era, everyone seeks the latest smartphone at the most competitive price. Dream Gadgets enables you to determine the value of your phone online, sell it at the best market price, or purchase a high-quality refurbished smartphone at a reasonable price.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi'].map(b => (
              <Link
                key={b}
                href={`/products?brand=${b}`}
                className="text-xs text-primary border border-primary/20 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all"
              >
                Sell Old {b} Mobile
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
