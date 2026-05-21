'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  ArrowLeftRight,
  RefreshCw,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  BarChart2,
  UserCog,
  Settings,
  Undo2,
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
  { href: '/buyback', label: 'Buyback Leads', icon: DollarSign },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/refunds', label: 'Refunds', icon: Undo2 },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/users', label: 'Users & Roles', icon: UserCog },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700">
        <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-8 w-auto rounded-md" />
        <span className="font-bold text-white text-sm">Dream Gadgets</span>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
