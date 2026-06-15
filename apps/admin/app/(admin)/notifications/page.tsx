'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';

interface Notification {
  id: string;
  userId: string | null;
  clientId: string | null;
  type: string;
  channel: string;
  subject: string | null;
  body: string | null;
  status: string;
  target: string | null;
  attempts: number;
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  lastAttemptAt: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'text-green-600 bg-green-50 border-green-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  sent: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageSquare,
  in_app: Bell,
};

const CHANNEL_COLORS: Record<string, string> = {
  email: 'text-blue-600 bg-blue-50',
  sms: 'text-purple-600 bg-purple-50',
  whatsapp: 'text-green-600 bg-green-50',
  in_app: 'text-orange-600 bg-orange-50',
};

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications', statusFilter, channelFilter, page],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter) params.status = statusFilter;
      if (channelFilter) params.channel = channelFilter;
      const { data: res } = await apiClient.get('/admin/notifications', { params });
      return res as { data: Notification[]; total: number; page: number; limit: number };
    },
  });

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      refetch();
    }, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [refetch]);

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/notifications/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const retryAllMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/admin/notifications/retry-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const failedCount = notifications.filter((n) => n.status === 'failed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Notifications</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Delivery tracking &amp; management — {total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => retryAllMutation.mutate()}
              disabled={retryAllMutation.isPending}
              className="inline-flex items-center gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {retryAllMutation.isPending ? 'Retrying...' : `Retry All (${failedCount})`}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <span className="text-xs font-medium text-surface-600">Filters</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
            className="border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="in_app">In-App</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', count: total, color: 'bg-blue-500', icon: Bell },
          { label: 'Sent', count: notifications.filter((n) => n.status === 'sent').length, color: 'bg-green-500', icon: CheckCircle },
          { label: 'Failed', count: failedCount, color: 'bg-red-500', icon: XCircle },
          { label: 'Pending', count: notifications.filter((n) => n.status === 'pending').length, color: 'bg-yellow-500', icon: Clock },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-surface-500">{s.label}</p>
              <p className="text-lg font-bold text-surface-900">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">No notifications found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="table-cell text-left">Status</th>
                  <th className="table-cell text-left">Channel</th>
                  <th className="table-cell text-left">Type</th>
                  <th className="table-cell text-left">Subject / Body</th>
                  <th className="table-cell text-left">Target</th>
                  <th className="table-cell text-center">Attempts</th>
                  <th className="table-cell text-left">Created</th>
                  <th className="table-cell text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notifications.map((n) => {
                  const StatusIcon = STATUS_ICONS[n.status] ?? Clock;
                  const ChannelIcon = CHANNEL_ICONS[n.channel] ?? Bell;
                  const statusClass = STATUS_COLORS[n.status] ?? 'text-gray-600 bg-gray-50 border-gray-200';
                  const channelClass = CHANNEL_COLORS[n.channel] ?? 'text-gray-600 bg-gray-50';

                  return (
                    <tr key={n.id} className="table-row">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
                          <StatusIcon className="w-3 h-3" />
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${channelClass}`}>
                          <ChannelIcon className="w-3 h-3" />
                          {n.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-mono max-w-[120px] truncate">
                        {n.type}
                      </td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="text-xs font-medium text-gray-900 truncate">{n.subject ?? '—'}</p>
                        {n.errorMessage && n.status === 'failed' && (
                          <p className="text-[10px] text-red-500 truncate mt-0.5" title={n.errorMessage}>
                            <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />
                            {n.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-[140px] truncate">
                        {n.target ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${n.attempts > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                          {n.attempts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {n.status === 'failed' && (
                          <button
                            onClick={() => retryMutation.mutate(n.id)}
                            disabled={retryMutation.isPending}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                            title="Retry delivery"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100">
            <p className="text-xs text-surface-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-xs font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-xs font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
