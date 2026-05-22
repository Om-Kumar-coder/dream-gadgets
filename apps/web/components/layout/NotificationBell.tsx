'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'order_status':
    case 'order_status_changed':
      return '📦';
    case 'refund_processed':
    case 'payment_confirmed':
      return '💰';
    case 'invoice_delivery':
      return '📄';
    case 'buyback_lead':
      return '🔄';
    case 'birthday_offer':
      return '🎂';
    case 'otp':
      return '🔐';
    default:
      return '🔔';
  }
}

function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

// ─── NotificationBell Component ─────────────────────────────────────────────────

export function NotificationBell() {
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data, isLoading, isError } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: () =>
      apiClient.get('/notifications').then(r => r.data?.data ?? r.data),
    refetchInterval: 30_000, // Poll every 30s
    staleTime: 10_000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Mark single as read
  const markReadMut = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMut = useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
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

  const handleClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markReadMut.mutate(n.id);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setDropdownOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white animate-dropdown-fade-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 origin-top-right animate-dropdown-fade-in"
          role="menu"
        >
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {hasUnread && (
                <button
                  onClick={() => markAllReadMut.mutate()}
                  disabled={markAllReadMut.isPending}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {markAllReadMut.isPending ? 'Marking…' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-2.5 bg-gray-50 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <p className="text-sm text-gray-400 font-medium">Couldn&apos;t load notifications</p>
                  <p className="text-xs text-gray-300 mt-1">Pull down to try again</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-300 mt-1">We&apos;ll notify you when something arrives</p>
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      n.isRead
                        ? 'hover:bg-gray-50'
                        : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            n.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'
                          }`}
                        >
                          {n.subject ? truncateText(n.subject, 60) : 'Notification'}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {n.body.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
