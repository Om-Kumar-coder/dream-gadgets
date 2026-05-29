'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { IconSmartphone, IconHeadphones, IconTablet, IconLaptop, IconWallet, IconSearch } from '@/components/icons';

const CATEGORIES = [
  {
    name: 'Phones',
    href: '/products',
    icon: IconSmartphone,
    brands: [
      { name: 'Apple iPhone', href: '/products?brand=Apple' },
      { name: 'Samsung Galaxy', href: '/products?brand=Samsung' },
      { name: 'OnePlus', href: '/products?brand=OnePlus' },
      { name: 'Xiaomi', href: '/products?brand=Xiaomi' },
      { name: 'Vivo', href: '/products?brand=Vivo' },
      { name: 'Oppo', href: '/products?brand=Oppo' },
      { name: 'Realme', href: '/products?brand=Realme' },
      { name: 'Google Pixel', href: '/products?brand=Google' },
    ],
  },
  {
    name: 'Accessories',
    href: '/products?category=accessories',
    icon: IconHeadphones,
    items: ['Cases & Covers', 'Screen Protectors', 'Chargers', 'Cables', 'Power Banks', 'Headphones', 'Smartwatches'],
  },
  {
    name: 'Tablets',
    href: '/products?category=tablets',
    icon: IconTablet,
    items: ['iPad', 'Samsung Tab', 'Lenovo', 'Xiaomi Pad'],
  },
  {
    name: 'Laptops',
    href: '/products?category=laptops',
    icon: IconLaptop,
    items: ['MacBook', 'Windows', 'Chromebook'],
  },
  {
    name: 'Sell',
    href: '/sell',
    icon: IconWallet,
    sublinks: [
      { label: 'Sell Phone', href: '/sell?type=mobile' },
      { label: 'Sell Tablet', href: '/sell?type=tablet' },
      { label: 'Sell Laptop', href: '/sell?type=laptop' },
      { label: 'Sell Smartwatch', href: '/sell?type=smartwatch' },
      { label: 'Sell Gaming Console', href: '/sell?type=gaming' },
    ],
  },
];

export function CategoryMegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      {/* Desktop trigger */}
      <button
        onMouseEnter={() => setMobileOpen(true)}
        onClick={() => setMobileOpen(o => !o)}
        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Categories
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="Categories"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {(mobileOpen || activeCategory) && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
          />

          <div
            className={`
              ${mobileOpen ? 'block' : 'hidden'} md:block
              absolute left-0 top-full mt-2 w-full md:w-[700px] origin-top-left animate-dropdown-fade-in z-50
            `}
            onMouseLeave={() => { setActiveCategory(null); }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Category List */}
                <div className="md:w-56 shrink-0 p-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 hidden md:block">
                    Shop by Category
                  </p>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      onMouseEnter={() => setActiveCategory(cat.name)}
                      onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                        ${activeCategory === cat.name
                          ? 'bg-primary/5 text-primary font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <cat.icon size={18} />
                      <span>{cat.name}</span>
                      <svg className="w-3.5 h-3.5 ml-auto text-gray-300 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                  {/* View all link */}
                  <Link
                    href="/products"
                    onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary font-semibold hover:bg-primary/5 transition-colors mt-1"
                  >
                    <IconSearch size={18} />
                    <span>View All Products</span>
                  </Link>
                </div>

                {/* Sub-menu */}
                <div className="hidden md:block flex-1 p-4 bg-gray-50/50 min-h-[280px]">
                  {CATEGORIES.filter(c => c.name === (activeCategory || CATEGORIES[0].name)).map(cat => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                        <Link
                          href={cat.href}
                          onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          View All →
                        </Link>
                      </div>

                      {'brands' in cat && cat.brands && (
                        <div className="grid grid-cols-2 gap-1">
                          {cat.brands.map(b => (
                            <Link
                              key={b.name}
                              href={b.href}
                              onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                              className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                            >
                              {b.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {'items' in cat && cat.items && (
                        <div className="grid grid-cols-2 gap-1">
                          {cat.items.map(item => (
                            <Link
                              key={item}
                              href={`/products?search=${encodeURIComponent(item)}`}
                              onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                              className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      )}

                      {'sublinks' in cat && cat.sublinks && (
                        <div className="space-y-1">
                          {cat.sublinks.map(s => (
                            <Link
                              key={s.label}
                              href={s.href}
                              onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile submenu */}
              <div className="md:hidden border-t border-gray-100 px-2 pb-2">
                {mobileOpen && CATEGORIES.filter(c => c.name === activeCategory).map(cat => (
                  <div key={cat.name} className="py-2 space-y-1">
                    <Link
                      href={cat.href}
                      onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                      className="block px-3 py-2 text-sm font-semibold text-primary"
                    >
                      View All {cat.name} →
                    </Link>
                    {'brands' in cat && cat.brands?.map(b => (
                      <Link key={b.name} href={b.href} onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {b.name}
                      </Link>
                    ))}
                    {'items' in cat && cat.items?.map(item => (
                      <Link key={item} href={`/products?search=${encodeURIComponent(item)}`} onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {item}
                      </Link>
                    ))}
                    {'sublinks' in cat && cat.sublinks?.map(s => (
                      <Link key={s.label} href={s.href} onClick={() => { setMobileOpen(false); setActiveCategory(null); }}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
