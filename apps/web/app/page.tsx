import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
  description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
};

const BRANDS = [
  { name: 'Apple', emoji: '🍎' },
  { name: 'Samsung', emoji: '📱' },
  { name: 'OnePlus', emoji: '🔴' },
  { name: 'Xiaomi', emoji: '🟠' },
  { name: 'Realme', emoji: '⚡' },
  { name: 'Vivo', emoji: '💙' },
  { name: 'Oppo', emoji: '🟢' },
  { name: 'Google', emoji: '🔵' },
];

const SERVICES = [
  { icon: '📱', label: 'Mobile', href: '/sell?type=mobile' },
  { icon: '💻', label: 'Laptop', href: '/sell?type=laptop' },
  { icon: '📟', label: 'Tablet', href: '/sell?type=tablet' },
  { icon: '⌚', label: 'Smartwatch', href: '/sell?type=smartwatch' },
  { icon: '🎮', label: 'Gaming Console', href: '/sell?type=gaming' },
];

const TESTIMONIALS = [
  { initials: 'RM', name: 'Rohit Mehra', city: 'Delhi', device: 'OnePlus Nord', review: 'Got an instant quote, they picked it up next day and I received payment right away. Completely hassle-free.' },
  { initials: 'NJ', name: 'Neha Joshi', city: 'Pune', device: 'Xiaomi Mi 11x', review: 'Scheduled a pickup for the morning just how I wanted. The agent arrived, checked my phone, and I got cash on the spot.' },
  { initials: 'AV', name: 'Amit Verma', city: 'Bengaluru', device: 'iPhone 12', review: 'Dream Gadgets did a complete data wipe and all my past data was securely erased. Fast and secure process.' },
  { initials: 'RP', name: 'Rishikesh Patil', city: 'Mumbai', device: 'iPhone 14', review: 'Selling my phone was fast and stress-free. Would definitely use again.' },
  { initials: 'AG', name: 'Abhi Gupta', city: 'Navi Mumbai', device: 'Samsung Note 20 Ultra', review: 'The payment was processed instantly, and the entire experience was smooth. Highly recommend!' },
];

const BLOGS = [
  { title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22', date: '19th April 2022', excerpt: 'Samsung keeps on adding to their series of smartphones each year, aiming at low as well as high budget mobile phones.', slug: 'samsung-galaxy-m53-5g-launch' },
  { title: 'Future Of Mobile Technology And Its Impact On Modern Family', date: '21st April 2022', excerpt: 'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable.', slug: 'future-of-mobile-technology' },
  { title: 'How To Contribute Used Mobiles To Poor School Children', date: '18th March 2022', excerpt: 'Smartphones have become a significant part of our life. However, not every individual who needs access to a smartphone has it.', slug: 'contribute-used-mobiles-school-children' },
];

const ECO_STATS = [
  { icon: '♻️', value: '70–80%', label: 'E-Waste Reduction', desc: 'Prevent e-waste from manufacturing and disposing of new devices.' },
  { icon: '💧', value: '7,500L', label: 'Water Saved', desc: 'Save over 7,500 litres of water used during smartphone production.' },
  { icon: '🌿', value: '60kg', label: 'CO₂ Avoided', desc: 'Avoid emitting up to 60kg of CO₂ per refurbished device.' },
  { icon: '💰', value: '50–65%', label: 'Cost Savings', desc: 'Make technology affordable by extending the life of devices.' },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-[#0A0A0A]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] py-28 text-center">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-cyber-grid opacity-60 pointer-events-none" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF2D2D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#00FF9C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4">
          <span className="inline-block border border-[#FF2D2D]/40 bg-[#FF2D2D]/10 text-[#FF2D2D] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase font-mono">
            ✦ India's Most Transparent Mobile Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tight text-white">
            Sell Your Old Phone<br />
            <span className="text-[#00FF9C]" style={{ textShadow: '0 0 30px rgba(0,255,156,0.4)' }}>in Minutes!</span>
          </h1>
          <p className="text-lg text-gray-400 mb-3 max-w-xl mx-auto font-mono">
            Highest Price &nbsp;·&nbsp; Doorstep Pickups &nbsp;·&nbsp; Instant Payment
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/sell"
              className="px-8 py-3.5 bg-[#FF2D2D] text-white rounded-xl font-bold text-sm transition-all duration-200"
              style={{ boxShadow: '0 0 20px rgba(255,45,45,0.4)' }}>
              Sell Now →
            </Link>
            <Link href="/products"
              className="px-8 py-3.5 bg-transparent border border-[#2a2a2a] hover:border-[#00FF9C] text-gray-300 hover:text-[#00FF9C] rounded-xl font-semibold text-sm transition-all duration-200">
              Buy Phone
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { v: '10,000+', l: 'Phones Sold' },
            { v: '4.8 ★', l: 'Customer Rating' },
            { v: '5+', l: 'City Branches' },
            { v: '100%', l: 'IMEI Verified' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-2xl font-extrabold text-[#00FF9C]" style={{ textShadow: '0 0 10px rgba(0,255,156,0.4)' }}>{s.v}</p>
              <p className="text-xs text-gray-600 mt-0.5 font-mono">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Selling Services ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Selling Services</h2>
            <p className="text-sm text-gray-600 mt-1">We buy all kinds of gadgets</p>
          </div>
          <Link href="/sell" className="text-sm text-[#FF2D2D] font-semibold hover:text-[#00FF9C] transition-colors">View All →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {SERVICES.map(s => (
            <Link key={s.label} href={s.href}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#00FF9C] transition-all duration-200 group"
              style={{ ['--hover-shadow' as any]: '0 0 12px rgba(0,255,156,0.2)' }}>
              <span className="text-4xl">{s.icon}</span>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-[#00FF9C] transition-colors">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Brand ── */}
      <section className="bg-[#0f0f0f] border-y border-[#2a2a2a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Buy Phone by Brand</h2>
              <p className="text-sm text-gray-600 mt-1">Certified used phones from top brands</p>
            </div>
            <Link href="/products" className="text-sm text-[#FF2D2D] font-semibold hover:text-[#00FF9C] transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {BRANDS.map(b => (
              <Link key={b.name} href={`/products?brand=${b.name}`}
                className="flex flex-col items-center p-3 rounded-xl bg-[#0A0A0A] border border-[#2a2a2a] hover:border-[#FF2D2D] transition-all duration-200 group">
                <span className="text-3xl mb-1.5">{b.emoji}</span>
                <span className="text-xs font-bold text-gray-500 group-hover:text-[#FF2D2D] transition-colors">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Refurbished ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block border border-[#00FF9C]/30 bg-[#00FF9C]/10 text-[#00FF9C] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider font-mono">
              Quality Promise
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
              What is Verified<br />Refurbished?
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed text-sm">
              Every device goes through a rigorous inspection process before it reaches your hands.
            </p>
            <ul className="space-y-3">
              {['20-point professional inspection', 'Strict quality charter that protects you', 'Free warranty with every purchase', '30 days to change your mind'].map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="w-5 h-5 bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/products"
              className="inline-block mt-8 px-6 py-3 bg-[#0A0A0A] border border-[#FF2D2D] text-white hover:border-[#00FF9C] hover:text-[#00FF9C] rounded-xl font-semibold text-sm transition-all duration-200">
              Shop Verified Phones →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🔬', title: '20-Point Check', desc: 'Battery, screen, camera, speakers — all tested.' },
              { icon: '📋', title: 'Quality Charter', desc: 'Strict standards every device must pass.' },
              { icon: '🛡️', title: 'Free Warranty', desc: 'Every purchase comes with warranty coverage.' },
              { icon: '↩️', title: '30-Day Returns', desc: 'Not happy? Return within 30 days, no questions.' },
            ].map(c => (
              <div key={c.title} className="bg-[#0f0f0f] rounded-xl p-5 border border-[#2a2a2a] hover:border-[#FF2D2D]/40 transition-all duration-200">
                <span className="text-3xl mb-3 block">{c.icon}</span>
                <h3 className="font-bold text-white text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#0f0f0f] border-y border-[#2a2a2a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">What Our Customers Say</h2>
            <p className="text-sm text-gray-600 mt-2">Real reviews from real people</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.slice(0, 3).map(t => (
              <div key={t.name} className="bg-[#0A0A0A] rounded-xl p-6 border border-[#2a2a2a] hover:border-[#00FF9C]/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 rounded-full flex items-center justify-center text-[#FF2D2D] text-sm font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-600">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-[#FF2D2D] text-sm mb-2">★★★★★</div>
                <p className="text-sm text-gray-500 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 max-w-2xl mx-auto">
            {TESTIMONIALS.slice(3).map(t => (
              <div key={t.name} className="bg-[#0A0A0A] rounded-xl p-6 border border-[#2a2a2a] hover:border-[#00FF9C]/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 rounded-full flex items-center justify-center text-[#FF2D2D] text-sm font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-600">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-[#FF2D2D] text-sm mb-2">★★★★★</div>
                <p className="text-sm text-gray-500 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-2 border border-[#00FF9C]/30 bg-[#00FF9C]/5 text-[#00FF9C] text-xs font-mono px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse" />
              10,000+ CUSTOMERS TRUST US
            </span>
          </div>
        </div>
      </section>

      {/* ── Eco Impact ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="inline-block border border-[#00FF9C]/30 bg-[#00FF9C]/10 text-[#00FF9C] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider font-mono">
            🌍 Environmental Impact
          </span>
          <h2 className="text-2xl font-bold text-white">Used vs. Brand New</h2>
          <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto">
            Here's what you help prevent by choosing a refurbished smartphone over a brand new one.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ECO_STATS.map(e => (
            <div key={e.label} className="bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#00FF9C]/40 rounded-xl p-6 text-center transition-all duration-200 group">
              <span className="text-4xl mb-3 block">{e.icon}</span>
              <p className="text-2xl font-extrabold text-[#00FF9C] mb-1 group-hover:[text-shadow:0_0_10px_rgba(0,255,156,0.5)]">{e.value}</p>
              <p className="font-bold text-white text-sm mb-2">{e.label}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="bg-[#0f0f0f] border-y border-[#2a2a2a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Our Blog</h2>
              <p className="text-sm text-gray-600 mt-1">Tips, news & tech insights</p>
            </div>
            <Link href="/blog" className="text-sm text-[#FF2D2D] font-semibold hover:text-[#00FF9C] transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOGS.map(b => (
              <Link key={b.slug} href={`/blog/${b.slug}`}
                className="bg-[#0A0A0A] rounded-xl overflow-hidden border border-[#2a2a2a] hover:border-[#FF2D2D]/40 transition-all duration-200 group">
                <div className="h-40 bg-[#0f0f0f] border-b border-[#2a2a2a] flex items-center justify-center text-5xl">
                  📰
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-700 mb-2 font-mono">By Dream Gadgets · {b.date}</p>
                  <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#00FF9C] transition-colors">{b.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <span className="inline-block mt-3 text-xs text-[#FF2D2D] font-semibold group-hover:text-[#00FF9C] transition-colors">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(255,45,45,0.08)' }}>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FF2D2D]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#00FF9C]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-3xl mb-1">💌</p>
            <h2 className="text-2xl font-extrabold text-white mb-2">Love gadgets? We do too.</h2>
            <p className="text-gray-600 text-sm mb-6">Fresh deals, cool tech drops, and zero spam. Promise!</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2a2a2a] text-white text-sm placeholder-gray-700
                           focus:outline-none focus:border-[#00FF9C] focus:ring-1 focus:ring-[#00FF9C] transition-all duration-200" />
              <button type="submit"
                className="px-6 py-3 bg-[#FF2D2D] hover:bg-[#FF2D2D]/80 text-white font-bold text-sm rounded-xl transition-all duration-200 whitespace-nowrap"
                style={{ boxShadow: '0 0 16px rgba(255,45,45,0.3)' }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── About blurb ── */}
      <section className="bg-[#0f0f0f] border-t border-[#2a2a2a] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Sell/Buy Your Old Mobile Phone Online with Dream Gadgets</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs — all in one place. We offer a process that is 100% transparent, secure, and fast.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            In the current digital era, everyone seeks the latest smartphone at the most competitive price. Dream Gadgets enables you to determine the value of your phone online, sell it at the best market price, or purchase a high-quality refurbished smartphone at a reasonable price.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Sell Old Apple Mobile', 'Sell Old Samsung Mobile', 'Sell Old OnePlus Mobile', 'Sell Old Xiaomi Mobile', 'Sell Old Vivo Mobile'].map(l => (
              <Link key={l} href="/sell"
                className="text-xs text-gray-600 hover:text-[#00FF9C] border border-[#2a2a2a] hover:border-[#00FF9C]/40 px-3 py-1.5 rounded-full transition-all duration-200">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
