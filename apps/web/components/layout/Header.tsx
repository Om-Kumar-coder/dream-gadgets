'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { SearchSuggestions } from './SearchSuggestions';
import { useWebAuthStore } from '../../store/auth.store';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export function Header() {
  const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
  const { user: authUser } = useWebAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
      setSearchFocused(false);
      (document.activeElement as HTMLElement)?.blur();
    }
  }, [searchQuery, router]);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    const [basePath, queryString] = href.split('?');
    if (basePath === '/sell' && queryString) {
      const expectedParams = new URLSearchParams(queryString);
      const expectedType = expectedParams.get('type');
      const actualType = searchParams?.get('type');
      return pathname === '/sell' && actualType === expectedType;
    }
    if (href === '/sell') {
      return pathname === '/sell' && !searchParams?.has('type');
    }
    if (href === '/') return pathname === '/';
    if (href === '/products') return pathname === '/products';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navLinkClass = (href: string) => {
    const active = isActive(href);
    return `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;
  };

  const mobileLinkClass = (href: string) => {
    const active = isActive(href);
    return `block px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* ── Top announcement bar ── */}
      <div className="bg-gray-900 text-gray-100 text-xs py-1.5 px-4 text-center hidden md:block">
        🚀 Free doorstep pickup across India &nbsp;·&nbsp; Instant payment within 24 hours
      </div>

      {/* ── Main Header Row (Amazon-style) ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-1">
          <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-10 w-auto" />
        </Link>

        {/* Categories (Desktop) */}
        <div className="hidden lg:block">
          <CategoryMegaMenu />
        </div>

        {/* ── Search Bar (Center, Dominant) ── */}
        <form
          ref={searchRef}
          onSubmit={handleSearch}
          className={`flex-1 max-w-2xl relative transition-all duration-200 ${
            searchFocused ? 'scale-[1.01]' : ''
          }`}
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search products, brands and more..."
              className={`w-full h-10 pl-4 pr-12 rounded-xl border-2 text-sm bg-gray-50 transition-all outline-none ${
                searchFocused
                  ? 'border-primary bg-white shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-[hsl(var(--primary-hover))] active:scale-95 transition-all"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Search suggestions dropdown with debounced API */}
          {searchFocused && searchQuery.length >= 2 && (
            <SearchSuggestions query={searchQuery} onSelect={(q) => {
              router.push(`/products?search=${encodeURIComponent(q)}`);
              setSearchFocused(false);
            }} />
          )}
        </form>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Orders */}
          <Link
            href="/orders"
            className="hidden sm:flex flex-col items-start px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-[10px] text-gray-400 leading-none">Returns</span>
            <span className="text-xs font-semibold text-gray-700 leading-tight">& Orders</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="relative">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white animate-scale-in">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-gray-700">Cart</span>
          </Link>

          {/* Notifications */}
          {authUser && <NotificationBell />}

          {/* User */}
          <UserMenu />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bottom navigation links (Desktop) ── */}
      <div className="hidden md:block border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <Link href="/sell" className={navLinkClass('/sell')}>
            Sell Phone
          </Link>
          <Link href="/sell?type=gadget" className={navLinkClass('/sell?type=gadget')}>
            Sell Gadgets
          </Link>
          <Link href="/sell?type=recycle" className={`${navLinkClass('/sell?type=recycle')} hidden lg:inline-flex`}>
            Recycle
          </Link>
          <Link href="/products" className={navLinkClass('/products')}>
            Buy Phone
          </Link>
          <Link href="/stores" className={navLinkClass('/stores')}>
            Stores
          </Link>
          <Link href="/about" className={navLinkClass('/about')}>
            About
          </Link>
          <Link href="/blog" className={navLinkClass('/blog')}>
            Blog
          </Link>
          <Link href="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>
          <Link href="/about" className={navLinkClass('/about')}>
            More
          </Link>
        </div>
      </div>

      {/* ── Mobile Slide-Out Menu ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-1">
              {(authUser
                ? [
                    { href: '/sell', label: 'Sell Phone', icon: '💰' },
                    { href: '/sell?type=gadget', label: 'Sell Gadgets', icon: '⌚' },
                    { href: '/products', label: 'Buy Phone', icon: '📱' },
                    { href: '/stores', label: 'Our Stores', icon: '📍' },
                    { href: '/orders', label: 'My Orders', icon: '📦' },
                    { href: '/account', label: 'My Account', icon: '👤' },
                    { href: '/wishlist', label: 'Wishlist', icon: '❤️' },
                    { href: '/about', label: 'About', icon: 'ℹ️' },
                    { href: '/contact', label: 'Contact', icon: '✉️' },
                  ]
                : [
                    { href: '/sell', label: 'Sell Phone', icon: '💰' },
                    { href: '/sell?type=gadget', label: 'Sell Gadgets', icon: '⌚' },
                    { href: '/products', label: 'Buy Phone', icon: '📱' },
                    { href: '/stores', label: 'Our Stores', icon: '📍' },
                    { href: '/orders', label: 'My Orders', icon: '📦' },
                    { href: '/about', label: 'About', icon: 'ℹ️' },
                    { href: '/contact', label: 'Contact', icon: '✉️' },
                    { href: '/login', label: 'Login', icon: '🔑' },
                  ]
              ).map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                    isActive(l.href)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
