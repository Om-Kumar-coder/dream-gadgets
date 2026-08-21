'use client';

import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, Clock, User as UserIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type AuditLogEntry = {
  id: string;
  action: string;
  changes: {
    field: string;
    oldValue: boolean;
    newValue: boolean;
    performedBy: string;
  } | null;
  performedById: string | null;
  performerName: string | null;
  createdAt: string;
};

export function FinancialAccessAuditLog({ userId }: { userId: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['user-audit-logs', userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/users/${userId}/audit-logs?limit=10`);
      return (data?.data ?? []) as AuditLogEntry[];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-surface-400" />
        <span className="text-xs text-surface-400">Loading audit history...</span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="text-xs text-surface-400 py-2">No audit history available.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        Financial Access History
      </h4>
      <div className="space-y-1.5">
        {logs.map((log) => {
          const isGrant = log.action === 'financial_access_granted';
          const changes = log.changes;

          return (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-50 border border-surface-100"
            >
              <div
                className={`p-1 rounded-md shrink-0 ${
                  isGrant ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}
              >
                {isGrant ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldOff className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isGrant ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isGrant ? 'Access Granted' : 'Access Revoked'}
                  </span>
                  {changes?.performedBy && (
                    <span className="text-[10px] text-surface-400 flex items-center gap-1">
                      <UserIcon className="w-2.5 h-2.5" />
                      {changes.performedBy}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-surface-400 mt-0.5">
                  {new Date(log.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
