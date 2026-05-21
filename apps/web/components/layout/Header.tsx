'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';

export function Header() {
  const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-accent text-accent-foreground text-xs py-1.5 px-4 text-center hidden md:block">
        🚀 Free doorstep pickup across India &nbsp;·&nbsp; Instant payment within 24 hours
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-9 w-auto rounded-md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/sell" className="px-3 py-1.5 rounded-lg font-semibold text-primary hover:bg-primary/10 transition-colors">
            Sell Phone
          </Link>
          <Link href="/sell?type=gadget" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            Sell Gadgets
          </Link>
          <Link href="/products" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            Buy Phone
          </Link>
          <Link href="/sell?type=recycle" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            Recycle Device
          </Link>
          <Link href="/stores" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            Our Stores
          </Link>
          <Link href="/orders" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            My Orders
          </Link>
          <Link href="/about" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
            More
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
          <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
            Login
          </Link>
          <Link href="/sell" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">
            Sell Now
          </Link>
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-muted/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {[
            { href: '/sell', label: 'Sell Phone' },
            { href: '/sell?type=gadget', label: 'Sell Gadgets' },
            { href: '/products', label: 'Buy Phone' },
            { href: '/sell?type=recycle', label: 'Recycle Device' },
            { href: '/stores', label: 'Our Stores' },
            { href: '/orders', label: 'My Orders' },
            { href: '/about', label: 'About' },
            { href: '/login', label: 'Login' },
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
