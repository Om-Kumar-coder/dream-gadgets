import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Gadgets — Buy & Sell Certified Used Phones',
  description: "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.",
};

const BRANDS = [
  { name: 'Apple', logo: '/logos/apple.svg', color: 'from-gray-50 to-gray-100', text: 'text-gray-700' },
  { name: 'Samsung', logo: '/logos/samsung.svg', color: 'from-blue-50 to-blue-100', text: 'text-blue-700' },
  { name: 'OnePlus', logo: '/logos/oneplus.svg', color: 'from-red-50 to-red-100', text: 'text-red-700' },
  { name: 'Xiaomi', logo: '/logos/xiaomi.svg', color: 'from-orange-50 to-orange-100', text: 'text-orange-700' },
  { name: 'Realme', logo: '/logos/realme.svg', color: 'from-yellow-50 to-yellow-100', text: 'text-yellow-700' },
  { name: 'Vivo', logo: '/logos/vivo.svg', color: 'from-blue-50 to-blue-100', text: 'text-blue-700' },
  { name: 'Oppo', logo: '/logos/oppo.svg', color: 'from-green-50 to-green-100', text: 'text-green-700' },
  { name: 'Google', logo: '/logos/google.svg', color: 'from-gray-50 to-gray-100', text: 'text-gray-700' },
];

const DEVICE_CATEGORIES = [
  { name: 'iPhone', image: '/logos/mobile.svg', count: '120+', href: '/products?brand=Apple' },
  { name: 'Samsung Galaxy', image: '/logos/mobile.svg', count: '85+', href: '/products?brand=Samsung' },
  { name: 'OnePlus', image: '/logos/mobile.svg', count: '45+', href: '/products?brand=OnePlus' },
  { name: 'Laptops', image: '/logos/laptop.svg', count: '30+', href: '/products?category=laptop' },
  { name: 'Tablets', image: '/logos/tablet.svg', count: '25+', href: '/products?category=tablet' },
  { name: 'Smartwatches', image: '/logos/smartwatch.svg', count: '20+', href: '/products?category=smartwatch' },
];

const SERVICES = [
  { icon: '/logos/mobile.svg', label: 'Mobile', href: '/sell?type=mobile' },
  { icon: '/logos/laptop.svg', label: 'Laptop', href: '/sell?type=laptop' },
  { icon: '/logos/tablet.svg', label: 'Tablet', href: '/sell?type=tablet' },
  { icon: '/logos/smartwatch.svg', label: 'Smartwatch', href: '/sell?type=smartwatch' },
  { icon: '/logos/gaming.svg', label: 'Gaming Console', href: '/sell?type=gaming' },
];

const TRUST_BADGES = [
  { icon: '🏆', label: '1M+ Customers', desc: 'Trusted by millions' },
  { icon: '🚚', label: 'Free Pickup', desc: 'Doorstep service' },
  { icon: '⚡', label: 'Instant Payment', desc: 'Within 24 hours' },
  { icon: '🛡️', label: 'Data Secure', desc: '100% safe wiping' },
];

const QUALITY_POINTS = [
  '20-point professional inspection',
  'Strict quality charter that protects you',
  'Free warranty with every purchase',
  '30 days to change your mind',
];

const TESTIMONIALS = [
  { initials: 'RM', name: 'Rohit Mehra', city: 'Delhi', device: 'OnePlus Nord', review: "I didn't want the hassle of selling it. Got an instant quote, they picked it up next day and I received payment right away." },
  { initials: 'NJ', name: 'Neha Joshi', city: 'Pune', device: 'Xiaomi Mi 11x', review: 'They scheduled a pickup for the morning just how I wanted. The agent arrived, checked my phone, and I got cash on the spot.' },
  { initials: 'AV', name: 'Amit Verma', city: 'Bengaluru', device: 'Apple iPhone 12', review: 'I was worried about data security. Dream Gadgets did a complete data wipe and all my past data was securely erased. Fast and secure process.' },
  { initials: 'RP', name: 'Rishikesh Patil', city: 'Mumbai', device: 'Apple iPhone 14', review: 'Great experience, no complaints. Selling my phone was fast and stress-free. Would definitely use again.' },
  { initials: 'AG', name: 'Abhi Gupta', city: 'Navi Mumbai', device: 'Samsung Note 20 Ultra', review: 'Quick and easy process. The payment was processed instantly, and the entire experience was smooth. Highly recommend!' },
];

const BLOGS = [
  {
    title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22',
    date: '19th April 2022',
    excerpt: 'Samsung keeps on adding to their series of smartphones each year. With multiple lines of series and aiming at low as well as high budget mobile phones...',
    slug: 'samsung-galaxy-m53-5g-launch',
  },
  {
    title: 'Future Of Mobile Technology And Its Impact On Modern Family',
    date: '21st April 2022',
    excerpt: 'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable...',
    slug: 'future-of-mobile-technology',
  },
  {
    title: 'How To Contribute Used Mobiles To Poor School Children',
    date: '18th March 2022',
    excerpt: 'Smartphones have become a significant part of our life\'s functional values. However, it is unfortunate that not every individual who needs access to a smartphone has it...',
    slug: 'contribute-used-mobiles-school-children',
  },
];

const ECO_STATS = [
  { icon: '♻️', value: '70–80%', label: 'Reduction in E-Waste', desc: 'Prevent e-waste generated from manufacturing a new device.' },
  { icon: '💧', value: '7,500L', label: 'Water Saved', desc: 'Save water used during production of a single smartphone.' },
  { icon: '🌿', value: '60kg', label: 'CO₂ Avoided', desc: 'Avoid emitting up to 60kg of CO₂ per device.' },
  { icon: '💰', value: '50–65%', label: 'Cost Savings', desc: 'Save significantly by choosing refurbished.' },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      {/* ── Hero Section (Cashify-style) ── */}
      <section className="relative text-white overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div>
              <span className="inline-block bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
                ✦ India&apos;s Most Trusted Platform
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
                Sell Your Old Phone<br />
                <span className="text-primary">in 60 Seconds!</span>
              </h1>
              <p className="text-base md:text-lg text-white/70 mb-6 max-w-lg">
                Get the highest price for your old phone. Free doorstep pickup, instant payment, 100% secure data wipe.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/sell" className="px-8 py-3.5 rounded-full font-bold text-sm btn-red hover:shadow-lg transition-all sell-cta-glow">
                  Sell Now →
                </Link>
                <Link href="/products" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold text-sm hover:bg-white/20 transition-all">
                  Browse Phones
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-5">
                {TRUST_BADGES.map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-lg">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{b.label}</p>
                      <p className="text-[10px] text-white/50">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick sell / search */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <p className="text-sm font-semibold text-white mb-4">📱 Sell your device</p>
              <div className="space-y-3">
                <select className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="" className="text-gray-800">Select brand</option>
                  {BRANDS.map(b => (
                    <option key={b.name} value={b.name} className="text-gray-800">{b.name}</option>
                  ))}
                </select>
                <select className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="" className="text-gray-800">Select model</option>
                </select>
                <Link href="/sell" className="block w-full py-3 text-center bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
                  Get Price →
                </Link>
                <p className="text-[10px] text-white/40 text-center">Get instant quote in seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
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
            { v: '50+', l: 'Cities Covered' },
            { v: '100%', l: 'IMEI Verified' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-2xl font-extrabold text-primary">{s.v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Actions: Buy / Sell / Stores ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/sell"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform">
              💰
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Sell Your Phone</p>
              <p className="text-sm text-gray-500">Get the best price today</p>
            </div>
          </Link>
          <Link href="/products"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform">
              📱
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Buy Refurbished</p>
              <p className="text-sm text-gray-500">Certified phones at great prices</p>
            </div>
          </Link>
          <Link href="/stores"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform">
              📍
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Find Stores</p>
              <p className="text-sm text-gray-500">Visit us in your city</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Device Categories ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-0.5">Find your perfect device</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {DEVICE_CATEGORIES.map(c => (
            <Link key={c.name} href={c.href} className="device-category-card group p-5 text-center">
              <img src={c.image} alt={c.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.count} devices</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Brand ── */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Brand</h2>
              <p className="text-sm text-gray-500 mt-1">Certified used phones from top brands</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {BRANDS.map(b => (
              <Link key={b.name} href={`/products?brand=${b.name}`}
                className={`flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br ${b.color} border border-white hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <img src={b.logo} alt={b.name} className="w-14 h-14 mb-1.5 object-contain" />
                <span className={`text-xs font-bold ${b.text}`}>{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 text-sm mt-2">Sell your phone in 4 simple steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '📋', title: 'Get Instant Quote', desc: 'Enter your device details and get the best price in seconds.', step: '01' },
            { icon: '📅', title: 'Schedule Pickup', desc: 'Choose a convenient time. Our agent comes to your doorstep.', step: '02' },
            { icon: '🔍', title: 'Device Inspection', desc: 'Quick on-spot inspection to verify the condition.', step: '03' },
            { icon: '💸', title: 'Instant Payment', desc: 'Get paid instantly via bank transfer or UPI.', step: '04' },
          ].map(s => (
            <div key={s.step} className="how-it-works-step bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1">
              <div className="how-it-works-icon bg-primary/10 text-3xl">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-primary tracking-widest">STEP {s.step}</span>
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Selling Services ── */}
      <section className="bg-gray-50 section-pad">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">We Buy All Gadgets</h2>
              <p className="text-sm text-gray-500 mt-1">Sell any device, get instant cash</p>
            </div>
            <Link href="/sell" className="text-sm font-semibold text-primary hover:underline">Sell Now →</Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {SERVICES.map(s => (
              <Link key={s.label} href={s.href}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all card-hover-red">
                <img src={s.icon} alt={s.label} className="w-16 h-16 object-contain" />
                <span className="text-sm font-semibold text-gray-700">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Refurbished ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-primary mb-4">Quality Promise</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              What is Verified<br />Refurbished?
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              How we ensure quality for you. Every device goes through a rigorous inspection process before it reaches your hands.
            </p>
            <ul className="space-y-3">
              {QUALITY_POINTS.map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/[0.15] text-primary">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/products" className="inline-block mt-8 px-6 py-3 rounded-xl font-semibold text-sm btn-red transition-colors">
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
              <div key={c.title} className="bg-surface-950 rounded-2xl p-5 border border-gray-800">
                <span className="text-3xl mb-3 block">{c.icon}</span>
                <h3 className="font-bold text-white text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad bg-surface-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="badge-primary mb-3">★★★★★</span>
            <h2 className="text-2xl font-bold text-white">What Our Customers Say</h2>
            <p className="text-sm text-gray-400 mt-2">Real reviews from real people</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.slice(0, 3).map(t => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border border-primary/30 card-hover-red bg-surface-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-primary shadow-glow-red">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-400">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-sm mb-2 text-primary">★★★★★</div>
                <p className="text-sm text-gray-300 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 max-w-2xl mx-auto">
            {TESTIMONIALS.slice(3).map(t => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border border-primary/30 card-hover-red bg-surface-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-primary shadow-glow-red">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}, {t.city}</p>
                    <p className="text-xs text-gray-400">Sold {t.device}</p>
                  </div>
                </div>
                <div className="text-sm mb-2 text-primary">★★★★★</div>
                <p className="text-sm text-gray-300 leading-relaxed">{t.review}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/testimonials" className="text-sm text-primary hover:underline font-medium">
              Read more reviews →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Eco Impact ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="text-center mb-10">
          <span className="badge-primary mb-4">🌍 Environmental Impact</span>
          <h2 className="text-2xl font-bold text-gray-900">Used vs. Brand New</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xl mx-auto">
            Here&apos;s what you help prevent on average by choosing a refurbished smartphone over a brand new one.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ECO_STATS.map(e => (
            <div key={e.label} className="bg-surface-950 border border-gray-800 rounded-2xl p-6 text-center card-hover">
              <span className="text-4xl mb-3 block">{e.icon}</span>
              <p className="text-2xl font-extrabold text-red-400 mb-1">{e.value}</p>
              <p className="font-bold text-white text-sm mb-2">{e.label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{e.desc}</p>
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
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOGS.map(b => (
              <Link key={b.slug} href={`/blog/${b.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all card-hover-red">
                <div className="h-40 flex items-center justify-center text-5xl bg-primary/[0.04]">
                  📰
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">By Dream Gadgets · {b.date}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-primary">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="max-w-7xl mx-auto section-pad">
        <div className="rounded-3xl p-10 text-white text-center relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-3xl mb-1">💌</p>
            <h2 className="text-2xl font-extrabold mb-2">Love gadgets? We do too.</h2>
            <p className="text-white/80 text-sm mb-6">Fresh deals, cool tech drops, and zero spam. Promise!</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-white text-sm bg-surface-950 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" className="px-6 py-3 text-white font-bold text-sm rounded-xl btn-red whitespace-nowrap transition-all">
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
              <Link key={l} href="/sell" className="text-xs text-primary border border-primary/20 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
