'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import {
  IconUser,
  IconPackage,
  IconRefreshCw,
  IconHeart,
  IconSettings,
  IconShield,
  IconLogout,
  IconWallet,
  IconChevronDown,
  IconCheckCircle,
} from '../icons';

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

  // Handle logout — store.logout() now syncs localStorage automatically
  const handleLogout = useCallback(() => {
    logout();
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
          <IconUser size={20} />
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

          <IconChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 hidden sm:block ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
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
                          {displayName}
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
                      <IconWallet size={16} className="text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">Wallet Balance</span>
                    </div>
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{Number(profile.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="py-1.5" role="none">
                <DropdownItem href="/account" icon={<IconUser size={16} />} label="My Profile" onClick={() => setDropdownOpen(false)} />
                <DropdownItem href="/orders" icon={<IconPackage size={16} />} label="My Orders" onClick={() => setDropdownOpen(false)} />
                <DropdownItem href="/buyback" icon={<IconRefreshCw size={16} />} label="Buyback Orders" onClick={() => setDropdownOpen(false)} disabled />
                <DropdownItem href="/wishlist" icon={<IconHeart size={16} />} label="Wishlist" onClick={() => setDropdownOpen(false)} disabled />
                <DropdownItem href="/account/edit" icon={<IconSettings size={16} />} label="Settings" onClick={() => setDropdownOpen(false)} />
              </div>

              {/* Divider + Admin + Logout */}
              <div className="border-t border-gray-50 py-1.5">
                {isAdmin && (
                  <DropdownItem
                    href="/admin"
                    icon={<IconShield size={16} />}
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
                  <IconLogout size={16} className="shrink-0" />
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

function DropdownItem({
  href,
  icon,
  label,
  onClick,
  badge,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 cursor-not-allowed select-none">
        <span className="shrink-0 text-gray-200">{icon}</span>
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
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
