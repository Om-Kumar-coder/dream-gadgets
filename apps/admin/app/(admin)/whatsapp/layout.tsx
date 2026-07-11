'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, FileText, BarChart3, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/whatsapp', label: 'Inbox', icon: Inbox, exact: true },
  { href: '/whatsapp/templates', label: 'Templates', icon: FileText },
  { href: '/whatsapp/campaigns', label: 'Campaigns', icon: BarChart3 },
];

export default function WhatsappLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="heading-sm text-surface-900">WhatsApp</h1>
            <p className="text-sm text-surface-500">Customer communication platform</p>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-1 border-b border-surface-100">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
