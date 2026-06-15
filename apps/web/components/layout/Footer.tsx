'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-950 text-white">
      {/* ── Upper: Brand + Links ── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-10 w-auto brightness-0 invert mb-5" />
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Dream Gadgets is the largest mobile store in West Bengal, offering a wide range of certified pre-owned smartphones at competitive prices with warranty and quality assurance.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="tel:+918017999888"
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                8017 999 888
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl text-emerald-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Our Stores', href: '/stores' },
                { label: 'Sell Your Phone', href: '/sell' },
                { label: 'Blog', href: '/blog' },
                { label: 'FAQ', href: '/faq' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-5">Policies</h3>
            <ul className="space-y-3">
              {[
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Refund & Return Policy', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Warranty Policy', href: '/warranty' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-5">Connect With Us</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-white/60">Kolkata, West Bengal, India</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:dreamgadgetskolkata@gmail.com" className="text-sm text-white/60 hover:text-white transition-colors">dreamgadgetskolkata@gmail.com</a>
              </div>
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { href: 'https://facebook.com', label: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z' },
                { href: 'https://instagram.com', label: 'Instagram', icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 01-1.25 1.25A1.25 1.25 0 0114.75 5a1.25 1.25 0 011.25-1.25 1.25 1.25 0 011.25 1.25M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z' },
                { href: 'https://youtube.com', label: 'YouTube', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48L15.5 11.75l-5.75 3.27z' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary/20 flex items-center justify-center text-white/60 hover:text-primary transition-all"
                  aria-label={s.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} <span className="text-primary font-semibold">Dream Gadgets</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 font-medium">We Accept</span>
            <div className="flex gap-1.5">
              {['Visa', 'MC', 'UPI', 'NetBanking', 'EMI'].map(m => (
                <span key={m} className="text-[10px] font-medium bg-white/10 text-white/50 px-2.5 py-1 rounded-md">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
