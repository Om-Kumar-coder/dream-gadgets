'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { useWebAuthStore } from '../../store/auth.store';

export function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
  const { user } = useWebAuthStore();

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/products',
      label: 'Shop',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      badge: count > 0 ? count : undefined,
    },
    {
      href: '/sell',
      label: 'Sell',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      href: user ? '/account' : '/login',
      label: 'Account',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: '/stores',
      label: 'Stores',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="bg-white/95 backdrop-blur-lg border-t border-surface-200 shadow-elevation-4">
        <nav className="flex items-center justify-around">
          {tabs.map(tab => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-3 transition-all duration-200 relative ${
                  active ? 'text-primary' : 'text-surface-400 hover:text-surface-600'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 border-[1.5px] border-white shadow-sm">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold leading-none ${active ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
