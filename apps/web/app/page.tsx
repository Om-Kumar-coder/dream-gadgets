import Link from 'next/link';
import type { Metadata } from 'next';
import { BRANDS } from '../lib/brands';
import { HomeBannerHero } from '../components/banner/HomeBannerHero';
import { HomeBannerMid } from '../components/banner/HomeBannerMid';
import { HomeBannerOffer } from '../components/banner/HomeBannerOffer';
import ProductCard from '../components/product/ProductCard';

export const metadata: Metadata = {
  title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
  description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

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

export default async function HomePage() {
  const products = await getHomeProducts();
  const trending = products.slice(0, 6);
  const dealOfDay = products.slice(0, 3);
  const hotDeals = products.slice(0, 4);
  const recommended = products.slice(2, 6);

  return (
    <main className="overflow-hidden">
      {/* ════════════════════════════════════════
          HERO SECTION — Dynamic Banners
          ════════════════════════════════════════ */}
      <HomeBannerHero />

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
          {BRANDS.map(b => (
            <Link
              key={b.name}
              href={`/brands/${b.name.toLowerCase()}`}
              className="mobi-brand-item"
            >
              <div className="mobi-brand-item-img">
                <img
                  src={b.image}
                  alt={b.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="mobi-brand-item-dtls">
                <h4>{b.name}</h4>
                <p className="text-xs text-surface-400">Shop {b.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          MID-PAGE PROMOTIONAL BANNERS
          ════════════════════════════════════════ */}
      <HomeBannerMid />

      {/* ════════════════════════════════════════
          TRENDING PRODUCTS
          ════════════════════════════════════════ */}
      <section className="pb-14 md:pb-20 container-page">
        <div className="commonHdn">
          <h3><span>Trending</span> Products</h3>
          <Link href="/products" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trending.map((p: any, i: number) => (
            <ProductCard key={p.id || i} product={p} variant="grid" index={i} />
          ))}
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
                {dealOfDay.map((p: any, i: number) => (
                  <ProductCard key={p.id || i} product={p} variant="square" index={i} />
                ))}
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
          {hotDeals.map((p: any, i: number) => (
            <ProductCard key={p.id || i} product={p} variant="square" index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          OFFER BANNER — Dynamic
          ════════════════════════════════════════ */}
      <HomeBannerOffer />

      {/* ════════════════════════════════════════
          RECOMMENDED PRODUCTS
          ════════════════════════════════════════ */}
      <section className="pb-14 md:pb-20 container-page">
        <div className="commonHdn">
          <h3><span>Recommended</span> Products</h3>
          <Link href="/products" className="viewBtn">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map((p: any, i: number) => (
            <ProductCard key={p.id || i} product={p} variant="square" index={i} />
          ))}
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
                href={`/brands/${b.toLowerCase()}`}
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
