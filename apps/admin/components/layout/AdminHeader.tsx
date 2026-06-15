'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAdminAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-surface-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <div />

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-surface-50 transition-colors text-surface-500 hover:text-surface-700">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_var(--glow-red)]" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-surface-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-surface-900 leading-tight">{user?.email ?? 'Admin'}</p>
              <p className="text-[10px] text-surface-400 capitalize">{user?.role ?? 'staff'}</p>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-surface-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-surface-100 shadow-lg shadow-black/5 py-1 animate-dropdown z-50">
              <div className="px-4 py-2 border-b border-surface-100 sm:hidden">
                <p className="text-sm font-medium text-surface-900">{user?.email ?? 'Admin'}</p>
                <p className="text-xs text-surface-400 capitalize">{user?.role ?? 'staff'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
