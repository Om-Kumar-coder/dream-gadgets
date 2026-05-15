import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
  description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
};

const BRANDS = [
  { name: 'Apple', emoji: '🍎', color: 'from-gray-50 to-gray-100', text: 'text-gray-700' },
  { name: 'Samsung', emoji: '📱', color: 'from-blue-50 to-blue-100', text: 'text-blue-700' },
  { name: 'OnePlus', emoji: '🔴', color: 'from-red-50 to-red-100', text: 'text-red-700' },
  { name: 'Xiaomi', emoji: '🟠', color: 'from-orange-50 to-orange-100', text: 'text-orange-700' },
  { name: 'Realme', emoji: '⚡', color: 'from-yellow-50 to-yellow-100', text: 'text-yellow-700' },
  { name: 'Vivo', emoji: '💙', color: 'from-indigo-50 to-indigo-100', text: 'text-indigo-700' },
  { name: 'Oppo', emoji: '🟢', color: 'from-emerald-50 to-emerald-100', text: 'text-emerald-700' },
  { name: 'Google', emoji: '🔵', color: 'from-sky-50 to-sky-100', text: 'text-sky-700' },
];

const SERVICES = [
  { icon: '📱', label: 'Mobile', href: '/sell?type=mobile' },
  { icon: '💻', label: 'Laptop', href: '/sell?type=laptop' },
  { icon: '📟', label: 'Tablet', href: '/sell?type=tablet' },
  { icon: '⌚', label: 'Smartwatch', href: '/sell?type=smartwatch' },
  { icon: '🎮', label: 'Gaming Console', href: '/sell?type=gaming' },
];

const QUALITY_POINTS = [
  '20-point professional inspection',
  'Strict quality charter that protects you',
  'Free warranty with every purchase',
  '30 days to change your mind',
];

const TESTIMONIALS = [
  { initials: 'RM', name: 'Rohit Mehra', city: 'Delhi', device: 'OnePlus Nord', review: 'I had a OnePlus phone and didn\'t want the hassle of selling it. Got an instant quote, they picked it up next day and I received payment right away.' },
  { initials: 'NJ', name: 'Neha Joshi', city: 'Pune', device: 'Xiaomi Mi 11x', review: 'I was on a time crunch and they scheduled a pickup for the morning just how I wanted. The agent arrived, checked my phone, and I got cash on the spot.' },
  { initials: 'AV', name: 'Amit Verma', city: 'Bengaluru', device: 'Apple iPhone 12', review: 'I was worried about data security. Dream Gadgets did a complete data wipe and all my past data was securely erased. Fast and secure process.' },
  { initials: 'RP', name: 'Rishikesh Patil', city: 'Mumbai', device: 'Apple iPhone 14', review: 'Great experience, no complaints. Selling my phone was fast and stress-free. Would definitely use again.' },
  { initials: 'AG', name: 'Abhi Gupta', city: 'Navi Mumbai', device: 'Samsung Note 20 Ultra', review: 'Quick and easy process. The payment was processed instantly, and the entire experience was smooth. Highly recommend!' },
];

const BLOGS = [
  {
    title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22',
    date: '19th April 2022',
    excerpt: 'Samsung keeps on adding to their series of smartphones each year. With multiple lines of series and aiming at low as well as high budget mobile phones, it has always been on the top of the list.',
    slug: 'samsung-galaxy-m53-5g-launch',
  },
  {
    title: 'Future Of Mobile Technology And Its Impact On Modern Family',
    date: '21st April 2022',
    excerpt: 'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable. From heavy handsets to slim and portable smartphones.',
    slug: 'future-of-mobile-technology',
  },
  {
    title: 'How To Contribute Used Mobiles To Poor School Children',
    date: '18th March 2022',
    excerpt: 'Smartphones have become a significant part of our life\'s functional values. However, it is unfortunate that not every individual who needs access to a smartphone has it.',
    slug: 'contribute-used-mobiles-school-children',
  },
];

const ECO_STATS = [
  { icon: '♻️', value: '70–80%', label: 'Reduction in E-Waste', desc: 'Prevent e-waste generated from manufacturing and disposing of a new device.' },
  { icon: '💧', value: '7,500L', label: 'Water Saved', desc: 'Save over 7,500 litres of water used during the production of a single smartphone.' },
  { icon: '🌿', value: '60kg', label: 'CO₂ Avoided', desc: 'Avoid emitting up to 60kg of CO₂, significantly reducing environmental impact.' },
  { icon: '💰', value: '50–65%', label: 'Cost Savings', desc: 'Make technology affordable by extending the life of devices and choosing smarter alternatives.' },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative text-white overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        {/* Red glow overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(229, 9, 20, 0.25), transparent 60%)'
        }} />
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            ✦ India's Most Transparent Mobile Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tight">
            Sell Your Old Phone<br />
            <span style={{ color: '#E50914' }}>in Minutes!</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-3 max-w-xl mx-auto">
            Highest Price &nbsp;·&nbsp; Doorstep Pickups &nbsp;·&nbsp; Instant Payment
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/sell" className="px-8 py-3.5 text-white rounded-full font-bold text-sm hover:shadow-lg transition-all" style={{
              backgroundColor: '#E50914',
              boxShadow: '0 0 12px rgba(229, 9, 20, 0.4)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C40812';
              e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 45, 45, 0.6)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(229, 9, 20, 0.4)';
            }}>
              Sell Now →
            </Link>
            <Link href="/products" className="px-8 py-3.5 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/25 transition-colors">
              Buy Phone
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 56L1440 56L1440 0C1200 46 960 56 720 36C480 16 240 0 0 28L0 56Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { v: '10,000+', l: 'Phones Sold' },
            { v: '4.8 ★', l: 'Customer Rating' },
            { v: '5+', l: 'City Branches' },
            { v: '100%', l: 'IMEI Verified' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-2xl font-extrabold" style={{ color: '#E50914' }}>{s.v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Selling Services ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Selling Services</h2>
            <p className="text-sm text-gray-500 mt-1">We buy all kinds of gadgets</p>
          </div>
          <Link href="/sell" className="text-sm font-semibold hover:underline" style={{ color: '#E50914' }}>View All →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {SERVICES.map(s => (
            <Link key={s.label} href={s.href}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all" style={{
                borderColor: 'inherit'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E50914';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = '';
              }}>
              <span className="text-4xl">{s.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Brand ── */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Buy Phone by Brand</h2>
              <p className="text-sm text-gray-500 mt-1">Certified used phones from top brands</p>
            </div>
            <Link href="/products" className="text-sm font-semibold hover:underline" style={{ color: '#E50914' }}>View All →</Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {BRANDS.map(b => (
              <Link key={b.name} href={`/products?brand=${b.name}`}
                className={`flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br ${b.color} border border-white hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <span className="text-3xl mb-1.5">{b.emoji}</span>
                <span className={`text-xs font-bold ${b.text}`}>{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Refurbished ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider" style={{
              backgroundColor: 'rgba(229, 9, 20, 0.1)',
              color: '#E50914'
            }}>
              Quality Promise
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              What is Verified<br />Refurbished?
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              How we ensure quality for you. Every device goes through a rigorous inspection process before it reaches your hands.
            </p>
            <ul className="space-y-3">
              {QUALITY_POINTS.map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/products" className="inline-block mt-8 px-6 py-3 text-white rounded-xl font-semibold text-sm transition-colors" style={{
              backgroundColor: '#E50914',
              boxShadow: '0 0 12px rgba(229, 9, 20, 0.4)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C40812';
              e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 45, 45, 0.6)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(229, 9, 20, 0.4)';
            }}>
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
              <div key={c.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <span className="text-3xl mb-3 block">{c.icon}</span>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad" style={{
        backgroundColor: '#111'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">What Our Customers Say</h2>
            <p className="text-sm text-gray-400 mt-2">Real reviews from real people</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.slice(0, 3).map(t => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border" style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(229, 9, 20, 0.3)'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E50914';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.3)';
                e.currentTarget.style.boxShadow = '';
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{
                    backgroundColor: '#E50914',
                    boxShadow: '0 0 6px rgba(229, 9, 20, 0.4)'
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-400">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-sm mb-2" style={{ color: '#E50914' }}>★★★★★</div>
                <p className="text-sm text-gray-300 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 max-w-2xl mx-auto">
            {TESTIMONIALS.slice(3).map(t => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border" style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(229, 9, 20, 0.3)'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E50914';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.3)';
                e.currentTarget.style.boxShadow = '';
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{
                    backgroundColor: '#E50914',
                    boxShadow: '0 0 6px rgba(229, 9, 20, 0.4)'
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-400">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-sm mb-2" style={{ color: '#E50914' }}>★★★★★</div>
                <p className="text-sm text-gray-300 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eco Impact ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="text-center mb-10">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            🌍 Environmental Impact
          </span>
          <h2 className="text-2xl font-bold text-gray-900">Used vs. Brand New</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xl mx-auto">
            Here's what you help prevent on average by choosing a refurbished smartphone over a brand new one.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ECO_STATS.map(e => (
            <div key={e.label} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center card-hover">
              <span className="text-4xl mb-3 block">{e.icon}</span>
              <p className="text-2xl font-extrabold text-emerald-700 mb-1">{e.value}</p>
              <p className="font-bold text-gray-900 text-sm mb-2">{e.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Our Blog</h2>
              <p className="text-sm text-gray-500 mt-1">Tips, news & tech insights</p>
            </div>
            <Link href="/blog" className="text-sm font-semibold hover:underline" style={{ color: '#E50914' }}>View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOGS.map(b => (
              <Link key={b.slug} href={`/blog/${b.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all" onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E50914';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5E5';
                  e.currentTarget.style.boxShadow = '';
                }}>
                <div className="h-40 flex items-center justify-center text-5xl" style={{
                  background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.05), rgba(255, 45, 45, 0.05))'
                }}>
                  📰
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">By Dream Gadgets · {b.date}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <span className="inline-block mt-3 text-xs font-semibold" style={{ color: '#E50914' }}>Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-10 text-white text-center relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-3xl mb-1">💌</p>
            <h2 className="text-2xl font-extrabold mb-2">Love gadgets? We do too.</h2>
            <p className="text-white/80 text-sm mb-6">Fresh deals, cool tech drops, and zero spam. Promise!</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button type="submit" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── About blurb ── */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sell/Buy Your Old Mobile Phone Online with Dream Gadgets</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Dream Gadgets is one of the most trusted online platforms in India for selling old mobile phones, buying refurbished mobiles, and mobile phone repairs — all in one place. We offer a process that is 100% transparent, secure, and fast.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            In the current digital era, everyone seeks the latest smartphone at the most competitive price. Dream Gadgets enables you to determine the value of your phone online, sell it at the best market price, or purchase a high-quality refurbished smartphone at a reasonable price.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Sell Old Apple Mobile', 'Sell Old Samsung Mobile', 'Sell Old OnePlus Mobile', 'Sell Old Xiaomi Mobile', 'Sell Old Vivo Mobile'].map(l => (
              <Link key={l} href="/sell" className="text-xs text-violet-600 hover:underline border border-violet-200 px-3 py-1.5 rounded-full bg-violet-50">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
