'use client';

import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, GitCompare, Clock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type AuditLogEntry = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  performerName: string | null;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function PermissionChangesWidget() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['dashboard-audit-logs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/audit-logs/recent?limit=8');
      return (data?.data ?? []) as AuditLogEntry[];
    },
  });

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-sm font-semibold text-surface-700">Recent Access Changes</h2>
        </div>
        {(logs?.length ?? 0) > 0 && (
          <span className="badge-info text-[10px]">{logs!.length} recent</span>
        )}
      </div>

      {isLoading ? (
        <div className="h-[120px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-surface-400">Loading…</span>
          </div>
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center text-sm text-surface-400">
          No recent access changes
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const changes = log.changes;
            const isPermissionChange = log.action === 'permissions_updated';
            const isFinancialGrant = log.action === 'financial_access_granted';
            const isFinancialRevoke = log.action === 'financial_access_revoked';

            // Build description
            let description = '';
            let icon: 'git-compare' | 'shield-check' | 'shield-off' = 'git-compare';
            let iconColor = 'bg-surface-100 text-surface-500';

            if (isPermissionChange && changes) {
              const added = changes.addedCount ?? 0;
              const removed = changes.removedCount ?? 0;
              const roleName = (changes.roleName ?? 'role').replace(/_/g, ' ');
              description = `${roleName}: ${added} added, ${removed} removed`;
              icon = 'git-compare';
              iconColor = 'bg-violet-100 text-violet-600';
            } else if (isFinancialGrant) {
              description = `Financial access granted`;
              icon = 'shield-check';
              iconColor = 'bg-emerald-100 text-emerald-600';
            } else if (isFinancialRevoke) {
              description = `Financial access revoked`;
              icon = 'shield-off';
              iconColor = 'bg-red-100 text-red-600';
            }

            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-50 transition-colors"
              >
                <div className={`p-1 rounded-md shrink-0 ${iconColor}`}>
                  {icon === 'git-compare' && <GitCompare className="w-3.5 h-3.5" />}
                  {icon === 'shield-check' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {icon === 'shield-off' && <ShieldOff className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-700 leading-relaxed">{description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {log.performerName && (
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                        <UserIcon className="w-2.5 h-2.5" />
                        {log.performerName}
                      </span>
                    )}
                    <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                  {/* Show first 2 added/removed permissions as chips */}
                  {isPermissionChange && changes && (changes.added?.length > 0 || changes.removed?.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {changes.added?.slice(0, 2).map((perm: string) => (
                        <span
                          key={`+${perm}`}
                          className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          +{perm}
                        </span>
                      ))}
                      {changes.added?.length > 2 && (
                        <span className="text-[9px] text-surface-400">+{changes.added.length - 2}</span>
                      )}
                      {changes.removed?.slice(0, 2).map((perm: string) => (
                        <span
                          key={`-${perm}`}
                          className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200"
                        >
                          -{perm}
                        </span>
                      ))}
                      {changes.removed?.length > 2 && (
                        <span className="text-[9px] text-surface-400">+{changes.removed.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
