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
  BarChart3,
  UserCog,
  Settings,
  Undo2,
  Bell,
  Building2,
  ShieldCheck,
  FileText,
  Receipt,
  ChevronDown,
  Image as ImageIcon,
  PanelTop,
  Home,
  Store,
  Megaphone,
  Palette,
  Tag,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { href: '/sales', label: 'Sales / POS', icon: ShoppingBag },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/accessories', label: 'Accessories', icon: Package },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { href: '/exchange', label: 'Exchange', icon: RefreshCw },
  { href: '/orders', label: 'Online Orders', icon: ShoppingBag },
  { href: '/buyback', label: 'Buyback Leads', icon: DollarSign },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/coupons', label: 'Coupons', icon: Tag },
  { href: '/emi', label: 'EMI Plans', icon: CreditCard },
  { href: '/refunds', label: 'Refunds', icon: Undo2 },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/gst', label: 'GST Reports', icon: Receipt },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/users', label: 'Users & Roles', icon: UserCog },
  { href: '/brands', label: 'Brand Heroes', icon: Palette },
  { href: '/announcement-bar', label: 'Announcement Bar', icon: Megaphone },
];

const whatsappItems = [
  { href: '/whatsapp', label: 'Inbox', icon: MessageSquare },
  { href: '/whatsapp/templates', label: 'Templates', icon: FileText },
  { href: '/whatsapp/campaigns', label: 'Campaigns', icon: BarChart3 },
];

const bannerItems: Array<{
  href: string;
  label: string;
  icon: any;
  pageType: string | undefined;
  isExact?: boolean;
}> = [
  { href: '/banners', label: 'All Banners', icon: PanelTop, pageType: undefined, isExact: true },
  { href: '/banners', label: 'Home Banners', icon: Home, pageType: 'home' },
  { href: '/banners', label: 'Shop Banners', icon: Store, pageType: 'shop' },
  { href: '/banners', label: 'Promotional', icon: Megaphone, pageType: 'promotional' },
];

const settingsItems = [
  { href: '/settings?tab=Branches', label: 'Branches', icon: Building2, tab: 'Branches' },
  { href: '/settings?tab=Roles', label: 'Roles', icon: ShieldCheck, tab: 'Roles' },
  { href: '/settings?tab=Content', label: 'Content', icon: FileText, tab: 'Content' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname === '/settings' || pathname.startsWith('/settings')
  );
  const [bannersOpen, setBannersOpen] = useState(
    pathname === '/banners' || pathname.startsWith('/banners')
  );
  const [whatsappOpen, setWhatsappOpen] = useState(
    pathname === '/whatsapp' || pathname.startsWith('/whatsapp')
  );

  const isActive = (href: string, tab?: string) => {
    const base = href.split('?')[0];
    if (tab) {
      return pathname === base && searchParams.get('tab') === tab;
    }
    return pathname === base || pathname.startsWith(base + '/');
  };

  return (
    <aside className="w-60 min-h-screen bg-surface-950 text-sidebar-foreground flex flex-col shrink-0 border-r border-surface-800">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-800">
        <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-8 w-auto rounded-lg ring-1 ring-white/10" />
        <div>
          <span className="font-bold text-white text-sm block leading-tight">Dream Gadgets</span>
          <span className="text-[10px] text-surface-400 font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const { href, label, icon: Icon } = item;
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-surface-400 hover:bg-surface-900 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 mx-3 h-px bg-surface-800" />

        {/* WhatsApp Communication dropdown */}
        <div>
          <button
            onClick={() => setWhatsappOpen(!whatsappOpen)}
            className={cn(
              'flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              whatsappOpen
                ? 'bg-surface-900 text-white'
                : 'text-surface-400 hover:bg-surface-900 hover:text-white',
            )}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', whatsappOpen && 'rotate-180')} />
          </button>
          {whatsappOpen && (
            <div className="ml-2 mt-0.5 space-y-0.5 pl-6 border-l border-surface-800">
              {whatsappItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200',
                      active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-surface-500 hover:text-white',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 mx-3 h-px bg-surface-800" />

        {/* Banner Management dropdown */}
        <div>
          <button
            onClick={() => setBannersOpen(!bannersOpen)}
            className={cn(
              'flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              bannersOpen
                ? 'bg-surface-900 text-white'
                : 'text-surface-400 hover:bg-surface-900 hover:text-white',
            )}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Banner Management</span>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', bannersOpen && 'rotate-180')} />
          </button>
          {bannersOpen && (
            <div className="ml-2 mt-0.5 space-y-0.5 pl-6 border-l border-surface-800">
              {bannerItems.map((item) => {
                const currentPageType = searchParams.get('pageType');
                const active = item.isExact
                  ? pathname === '/banners' && !currentPageType
                  : pathname === '/banners' && (currentPageType || 'home') === (item.pageType || 'home');
                return (
                  <Link
                    key={item.label}
                    href={item.pageType ? `/banners?pageType=${item.pageType}` : '/banners'}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200',
                      active
                        ? 'bg-primary/20 text-primary'
                        : 'text-surface-500 hover:text-white',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 mx-3 h-px bg-surface-800" />

        {/* Settings dropdown */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              'flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              settingsOpen && !settingsItems.some(s => isActive(s.href, s.tab))
                ? 'bg-surface-900 text-white'
                : 'text-surface-400 hover:bg-surface-900 hover:text-white',
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', settingsOpen && 'rotate-180')} />
          </button>
          {settingsOpen && (
            <div className="ml-2 mt-0.5 space-y-0.5 pl-6 border-l border-surface-800">
              {settingsItems.map((item) => {
                const active = isActive(item.href, item.tab);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200',
                      active
                        ? 'bg-primary/20 text-primary'
                        : 'text-surface-500 hover:text-white',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
