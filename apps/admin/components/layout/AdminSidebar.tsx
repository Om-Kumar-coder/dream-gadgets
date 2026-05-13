'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Users,
  ArrowLeftRight, RefreshCw, ShoppingBag, RotateCcw,
  BarChart2, UserCog, Settings, Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { href: '/sales', label: 'Sales / POS', icon: ShoppingBag },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { href: '/exchange', label: 'Exchange', icon: RefreshCw },
  { href: '/orders', label: 'Online Orders', icon: Package },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/users', label: 'Users & Roles', icon: UserCog },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#0A0A0A] border-r border-[#2a2a2a] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#2a2a2a]">
        <div className="w-7 h-7 rounded-lg bg-[#FF2D2D] flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-wide">Dream Gadgets</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                active
                  ? 'bg-[#FF2D2D]/10 text-[#FF2D2D] border border-[#FF2D2D]/30'
                  : 'text-gray-500 hover:text-[#00FF9C] hover:bg-[#00FF9C]/5',
              )}
              style={active ? { boxShadow: '0 0 8px rgba(255,45,45,0.2)' } : {}}
            >
              <Icon className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                active ? 'text-[#FF2D2D]' : 'text-gray-600 group-hover:text-[#00FF9C]',
              )} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF2D2D]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-700">v1.0.0 · Admin Panel</p>
      </div>
    </aside>
  );
}
