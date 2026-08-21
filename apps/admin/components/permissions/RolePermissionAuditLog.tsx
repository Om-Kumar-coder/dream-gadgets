'use client';

import { useQuery } from '@tanstack/react-query';
import { GitCompare, Clock, User as UserIcon, Loader2, Plus, Minus } from 'lucide-react';
import { apiClient } from '@/lib/api';

type AuditLogEntry = {
  id: string;
  action: string;
  changes: {
    roleName: string;
    oldPermissionCount: number;
    newPermissionCount: number;
    added: string[];
    removed: string[];
    addedCount: number;
    removedCount: number;
    performedBy: string;
  } | null;
  performedById: string | null;
  performerName: string | null;
  createdAt: string;
};

export function RolePermissionAuditLog({ roleId }: { roleId: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['role-audit-logs', roleId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/roles/${roleId}/audit-logs?limit=10`);
      return (data?.data ?? []) as AuditLogEntry[];
    },
    enabled: !!roleId,
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
      <p className="text-xs text-surface-400 py-2">No permission change history.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        Permission Change History
      </h4>
      <div className="space-y-1.5">
        {logs.map((log) => {
          const changes = log.changes;
          if (!changes) return null;

          const net = changes.addedCount - changes.removedCount;

          return (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-surface-50 border border-surface-100 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-3.5 h-3.5 text-surface-400" />
                  <span className="text-xs font-medium text-surface-700">
                    {changes.addedCount} added, {changes.removedCount} removed
                  </span>
                  {net !== 0 && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        net > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {net > 0 ? '+' : ''}{net} net
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-surface-400">
                  {log.performerName && (
                    <span className="flex items-center gap-0.5">
                      <UserIcon className="w-2.5 h-2.5" />
                      {log.performerName}
                    </span>
                  )}
                  <span>
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Show first few added/removed permissions */}
              {(changes.added.length > 0 || changes.removed.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {changes.added.slice(0, 5).map((perm) => (
                    <span
                      key={`+${perm}`}
                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <Plus className="w-2 h-2" />
                      {perm}
                    </span>
                  ))}
                  {changes.added.length > 5 && (
                    <span className="text-[9px] text-surface-400">+{changes.added.length - 5} more</span>
                  )}
                  {changes.removed.slice(0, 5).map((perm) => (
                    <span
                      key={`-${perm}`}
                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200"
                    >
                      <Minus className="w-2 h-2" />
                      {perm}
                    </span>
                  ))}
                  {changes.removed.length > 5 && (
                    <span className="text-[9px] text-surface-400">+{changes.removed.length - 5} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
