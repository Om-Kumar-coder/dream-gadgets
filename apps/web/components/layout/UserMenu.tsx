'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  walletBalance?: number | string | null;
  role?: { name: string } | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

function getAvatarColor(name?: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in-down">
      <div className="flex items-center gap-2.5 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {message}
      </div>
    </div>
  );
}

// ─── UserMenu Component ─────────────────────────────────────────────────────────

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useWebAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch full profile when user is logged in
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () =>
      apiClient.get('/auth/me').then(r => {
        const raw = r.data;
        return (raw?.data ?? raw) as ProfileData;
      }),
    enabled: !!user,
    retry: 1,
    staleTime: 60_000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setDropdownOpen(false);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      router.push('/');
    }, 1200);
  }, [logout, router]);

  // If user is not authenticated, show Login button
  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link
          href="/login"
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Login"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </>
    );
  }

  // ── Derived data ──
  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : (user.email || 'User');
  const initials = profile
    ? getInitials(profile.firstName, profile.lastName)
    : getInitials(user.email);
  const avatarColor = getAvatarColor(displayName);
  const avatarUrl = profile?.avatarUrl;
  const isAdmin = profile?.role?.name === 'admin' || user.role === 'admin';

  return (
    <>
      <Toast message="Logged out successfully" visible={toastVisible} />

      <div ref={dropdownRef} className="relative">
        {/* Avatar Button */}
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="relative flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
          aria-label="User menu"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {/* Online indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-10" />

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-gray-200 transition-all"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-white/50 transition-all`}
            >
              {initials}
            </div>
          )}

          {/* Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 origin-top-right animate-dropdown-fade-in"
            role="menu"
          >
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
              {/* User Info Header */}
              <div className="px-4 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {profileLoading ? (
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-24" />
                        <div className="h-2.5 bg-gray-50 rounded animate-pulse w-32" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {profile?.firstName ? displayName : 'Loading...'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {profile?.email || user.email}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              {/* Wallet Balance */}
              {profile && !profileLoading && (
                <div className="px-4 py-2.5 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 10V8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2v-2h1a2 2 0 002-2v-2a2 2 0 000-4zM6 4h10v2H6V4zm10 16H6v-2h10v2zm3-4h-3v-4h3v4z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Wallet Balance</span>
                    </div>
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{Number(profile.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="py-1.5" role="none">
                <DropdownItem href="/account" icon="User" label="My Profile" onClick={() => setDropdownOpen(false)} />
                <DropdownItem href="/orders" icon="Package" label="My Orders" onClick={() => setDropdownOpen(false)} />
                <DropdownItem href="/buyback" icon="RefreshCw" label="Buyback Orders" onClick={() => setDropdownOpen(false)} disabled />
                <DropdownItem href="/wishlist" icon="Heart" label="Wishlist" onClick={() => setDropdownOpen(false)} disabled />
                <DropdownItem href="/account/edit" icon="Settings" label="Settings" onClick={() => setDropdownOpen(false)} />
              </div>

              {/* Divider + Admin + Logout */}
              <div className="border-t border-gray-50 py-1.5">
                {isAdmin && (
                  <DropdownItem
                    href="/admin"
                    icon="Shield"
                    label="Admin Panel"
                    onClick={() => setDropdownOpen(false)}
                    badge="Admin"
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Dropdown Item ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  User: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Package: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  RefreshCw: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Heart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

function DropdownItem({
  href,
  icon,
  label,
  onClick,
  badge,
  disabled,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 cursor-not-allowed select-none">
        <span className="shrink-0 text-gray-200">{ICON_MAP[icon]}</span>
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-gray-300 font-medium bg-gray-50 px-1.5 py-0.5 rounded-full">
          Coming soon
        </span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
      role="menuitem"
    >
      <span className="shrink-0 text-gray-400">{ICON_MAP[icon]}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
