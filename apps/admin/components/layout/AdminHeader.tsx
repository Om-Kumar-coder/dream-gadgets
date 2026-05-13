'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';
import { useAdminAuthStore } from '@/store/auth.store';

export function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    document.cookie = 'admin_access_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#2a2a2a] flex items-center justify-between px-6">
      {/* Left: breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 font-mono">DREAM_GADGETS://ADMIN</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse" />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg border border-[#2a2a2a] hover:border-[#00FF9C] transition-all duration-200 group">
          <Bell className="w-4 h-4 text-gray-500 group-hover:text-[#00FF9C] transition-colors" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="w-6 h-6 rounded-full bg-[#FF2D2D]/20 border border-[#FF2D2D]/40 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#FF2D2D]" />
          </div>
          <span className="text-sm text-gray-300 font-medium">{user?.email ?? 'Admin'}</span>
          <span className="text-xs text-gray-600 capitalize">({user?.role ?? 'staff'})</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF2D2D] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#FF2D2D]/10 border border-transparent hover:border-[#FF2D2D]/30"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
