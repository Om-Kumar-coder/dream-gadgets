'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../../store/cart.store';
import { useWebAuthStore } from '../../store/auth.store';
import { IconHome, IconCart, IconPlus, IconUser, IconSearch, IconLogin } from '../icons';

export function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCartStore(s => s.items.reduce((sum, i) => sum + (i.quantity || 1), 0));
  const { user } = useWebAuthStore();

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: <IconHome size={20} />,
    },
    {
      href: '/products',
      label: 'Buy',
      icon: <IconSearch size={20} />,
    },
    {
      href: '/sell',
      label: 'Sell',
      icon: <IconPlus size={20} />,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: <IconCart size={20} />,
      badge: count > 0 ? count : undefined,
    },
    {
      href: user ? '/account' : '/login',
      label: 'Account',
      icon: user ? <IconUser size={20} /> : <IconLogin size={20} />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-0 ${
              isActive(tab.href)
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            } transition-colors`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 shadow-sm">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
