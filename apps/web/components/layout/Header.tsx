'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';
import { ShoppingCart, Menu, X, Smartphone } from 'lucide-react';

export function Header() {
  const items = useCartStore(s => s.items);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/sell', label: 'Sell Phone', highlight: true },
    { href: '/sell?type=gadget', label: 'Sell Gadgets' },
    { href: '/products', label: 'Buy Phone' },
    { href: '/sell?type=recycle', label: 'Recycle Device' },
    { href: '/stores', label: 'Our Stores' },
    { href: '/about', label: 'More' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#2a2a2a]"
      style={{ boxShadow: '0 1px 0 rgba(255,45,45,0.15)' }}>
      {/* Top bar */}
      <div className="hidden md:block bg-[#FF2D2D]/10 border-b border-[#FF2D2D]/20 text-center py-1.5">
        <span className="text-xs text-[#FF2D2D] font-mono tracking-wide">
          🚀 Free doorstep pickup across India &nbsp;·&nbsp; Instant payment within 24 hours
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-[#FF2D2D] rounded-lg flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(255,45,45,0.6)]">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            Dream<span className="text-[#FF2D2D]">Gadgets</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          {navLinks.map(({ href, label, highlight }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                highlight
                  ? 'text-[#FF2D2D] hover:text-[#00FF9C] hover:bg-[#00FF9C]/5'
                  : 'text-gray-400 hover:text-[#00FF9C] hover:bg-[#00FF9C]/5'
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart"
            className="relative flex items-center gap-1.5 p-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:border-[#00FF9C] hover:text-[#00FF9C] transition-all duration-200">
            <ShoppingCart className="w-4 h-4" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF2D2D] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={{ boxShadow: '0 0 6px rgba(255,45,45,0.6)' }}>
                {items.length}
              </span>
            )}
          </Link>

          <Link href="/login"
            className="hidden sm:block text-sm font-medium text-gray-400 hover:text-[#00FF9C] px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-[#00FF9C] transition-all duration-200">
            Login
          </Link>

          <Link href="/sell"
            className="px-4 py-2 bg-[#FF2D2D] hover:bg-[#FF2D2D]/80 text-white text-sm font-bold rounded-lg transition-all duration-200"
            style={{ boxShadow: '0 0 0 rgba(255,45,45,0)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 16px rgba(255,45,45,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(255,45,45,0)')}>
            Sell Now
          </Link>

          <button onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:border-[#00FF9C] hover:text-[#00FF9C] transition-all duration-200">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 space-y-1">
          {[...navLinks, { href: '/login', label: 'Login' }].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-[#00FF9C] hover:bg-[#00FF9C]/5 transition-all duration-200">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
