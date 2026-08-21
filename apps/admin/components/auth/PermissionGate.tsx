'use client';

import { useAdminAuthStore } from '@/store/auth.store';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface PermissionGateProps {
  /** Permission required to access this page */
  permission?: string;
  /** Multiple permissions — user needs at least one */
  anyOf?: string[];
  /** Children to render if authorized */
  children: React.ReactNode;
  /** Custom fallback when denied */
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  anyOf,
  children,
  fallback,
}: PermissionGateProps) {
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);

  const allowed = permission
    ? hasPermission(permission)
    : anyOf
      ? anyOf.some((p) => hasPermission(p))
      : true;

  if (allowed) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <ShieldAlert className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-surface-900 mb-1">
        Access Denied
      </h2>
      <p className="text-sm text-surface-500 max-w-md mb-6">
        You don&apos;t have permission to access this page.
        {permission && (
          <span className="block mt-1 text-xs text-surface-400 font-mono">
            Required: {permission}
          </span>
        )}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
