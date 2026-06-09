'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Building2,
  ShieldCheck,
  FileText,
  Receipt,
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
  { href: '/gst', label: 'GST Reports', icon: Receipt },
  { href: '/notifications', label: 'Notifications', icon: Undo2 },
  { href: '/users', label: 'Users & Roles', icon: UserCog },
  { href: '/settings?tab=Branches', label: 'Branches', icon: Building2, base: '/settings', tab: 'Branches' },
  { href: '/settings?tab=Roles', label: 'Roles', icon: ShieldCheck, base: '/settings', tab: 'Roles' },
  { href: '/settings?tab=Content', label: 'Content', icon: FileText, base: '/settings', tab: 'Content' },
  { href: '/settings', label: 'Settings', icon: Settings, base: '/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (item: (typeof navItems)[number]) => {
    const base = item.base || item.href;
    if (item.tab) {
      // For settings sub-tabs, match base path + correct tab param
      return pathname === base && searchParams.get('tab') === item.tab;
    }
    return pathname === base || pathname.startsWith(base + '/');
  };

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700">
        <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-8 w-auto rounded-md" />
        <span className="font-bold text-white text-sm">Dream Gadgets</span>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => {
          const { href, label, icon: Icon } = item;
          const active = isActive(item);
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
