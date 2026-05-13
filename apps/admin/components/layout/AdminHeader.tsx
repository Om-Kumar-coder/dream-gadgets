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
    router.push('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium">{user?.email ?? 'Admin'}</span>
          <span className="text-xs text-gray-400 capitalize">({user?.role ?? 'staff'})</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
