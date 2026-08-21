'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Save, Loader2, ChevronDown, ChevronRight, ShieldCheck, ShieldOff, Sparkles, History } from 'lucide-react';
import { RolePermissionAuditLog } from './RolePermissionAuditLog';
import { PERMISSION_PRESETS } from './presets';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/auth.store';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
};

type RolePermissions = {
  id: string;
  permissions: string[];
};

// Module groups for visual organization
const MODULE_GROUPS: Record<string, { label: string; modules: string[] }> = {
  core: {
    label: 'Core Operations',
    modules: ['dashboard', 'inventory', 'purchases', 'sales', 'clients'],
  },
  operations: {
    label: 'Operations',
    modules: ['transfers', 'exchange', 'orders', 'returns', 'buyback'],
  },
  financial: {
    label: 'Financial',
    modules: ['financial', 'gst', 'reports', 'payments'],
  },
  management: {
    label: 'Management',
    modules: ['users', 'settings', 'content', 'notifications'],
  },
  communication: {
    label: 'Communication',
    modules: ['whatsapp', 'coupons', 'emi'],
  },
};

const ALL_MODULES = Object.values(MODULE_GROUPS).flatMap((g) => g.modules);
const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'send', 'retry'];

// Role display config
const ROLE_DISPLAY: Record<string, { label: string; color: string }> = {
  shop_owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  multi_store_manager: { label: 'Multi-Store Mgr', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  store_manager: { label: 'Store Mgr', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shop_sales: { label: 'Shop Sales', color: 'bg-green-100 text-green-700 border-green-200' },
  store_sales: { label: 'Store Sales', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  calling_staff: { label: 'Calling Staff', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  employee: { label: 'Employee', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  customer: { label: 'Customer', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PermissionMatrix() {
  const qc = useQueryClient();
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const canEdit = hasPermission('settings.edit');

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    core: true,
    operations: false,
    financial: true,
    management: false,
    communication: false,
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Set<string>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [auditLogRoleId, setAuditLogRoleId] = useState<string | null>(null);

  // Fetch all roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/roles');
      return ((data?.data ?? data ?? []) as Role[]).filter(
        (r) => r.name !== 'employee' && r.name !== 'customer',
      );
    },
  });

  // Fetch user counts per role
  const { data: roleUserCounts } = useQuery({
    queryKey: ['admin-role-user-counts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/roles/user-counts');
      return (data?.data ?? {}) as Record<string, number>;
    },
  });

  // Fetch permissions for all roles
  const { data: allPermissions, isLoading: permsLoading } = useQuery({
    queryKey: ['admin-role-permissions'],
    queryFn: async () => {
      if (!roles) return {};
      const result: Record<string, string[]> = {};
      for (const role of roles) {
        try {
          const { data } = await apiClient.get(`/admin/roles/${role.id}/permissions`);
          result[role.id] = data?.data?.permissions ?? [];
        } catch {
          result[role.id] = [];
        }
      }
      return result;
    },
    enabled: !!roles,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const perms = getCurrentPermissions(roleId);
      const permArray = Array.from(perms).sort();
      await apiClient.patch(`/admin/roles/${roleId}/permissions`, {
        permissions: permArray,
      });
    },
    onSuccess: () => {
      toast.success('Permissions saved');
      qc.invalidateQueries({ queryKey: ['admin-role-permissions'] });
      setPendingChanges({});
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to save permissions');
    },
  });

  // Get effective permissions for a role (pending changes override saved)
  const getCurrentPermissions = (roleId: string): Set<string> => {
    if (pendingChanges[roleId]) {
      return pendingChanges[roleId];
    }
    return new Set(allPermissions?.[roleId] ?? []);
  };

  // Toggle a single permission
  const togglePermission = (roleId: string, permission: string) => {
    if (!canEdit) return;

    setPendingChanges((prev) => {
      const current = new Set(prev[roleId] ?? new Set(allPermissions?.[roleId] ?? []));
      if (current.has(permission)) {
        current.delete(permission);
      } else {
        current.add(permission);
      }
      setHasUnsavedChanges(true);
      return { ...prev, [roleId]: current };
    });
  };

  // Toggle all permissions for a module × role
  const toggleModulePermissions = (roleId: string, module: string, enabled: boolean) => {
    if (!canEdit) return;

    setPendingChanges((prev) => {
      const current = new Set(prev[roleId] ?? new Set(allPermissions?.[roleId] ?? []));
      for (const action of ALL_ACTIONS) {
        const perm = `${module}.${action}`;
        if (enabled) {
          current.add(perm);
        } else {
          current.delete(perm);
        }
      }
      setHasUnsavedChanges(true);
      return { ...prev, [roleId]: current };
    });
  };

  // Toggle all permissions for a role
  const toggleAllRolePermissions = (roleId: string, enabled: boolean) => {
    if (!canEdit) return;

    setPendingChanges((prev) => {
      const current = new Set<string>();
      if (enabled) {
        for (const mod of ALL_MODULES) {
          for (const action of ALL_ACTIONS) {
            current.add(`${mod}.${action}`);
          }
        }
      }
      setHasUnsavedChanges(true);
      return { ...prev, [roleId]: current };
    });
  };

  // Apply a preset to a role
  const applyPreset = (roleId: string, presetId: string) => {
    if (!canEdit) return;
    const preset = PERMISSION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setPendingChanges((prev) => ({
      ...prev,
      [roleId]: new Set(preset.permissions),
    }));
    setHasUnsavedChanges(true);
    setShowPresets(false);
    toast.success(`Applied "${preset.label}" preset`);
  };

  // Reset changes for a role
  const resetChanges = (roleId: string) => {
    setPendingChanges((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
    setHasUnsavedChanges(Object.keys(pendingChanges).length > 1);
  };

  // Save all pending changes
  const saveAll = async () => {
    for (const roleId of Object.keys(pendingChanges)) {
      await saveMutation.mutateAsync(roleId);
    }
  };

  // Check if a module is fully enabled for a role
  const isModuleEnabled = (roleId: string, module: string): boolean => {
    const perms = getCurrentPermissions(roleId);
    return ALL_ACTIONS.every((action) => perms.has(`${module}.${action}`));
  };

  // Check if a module is partially enabled for a role
  const isModulePartial = (roleId: string, module: string): boolean => {
    const perms = getCurrentPermissions(roleId);
    const enabled = ALL_ACTIONS.filter((action) => perms.has(`${module}.${action}`));
    return enabled.length > 0 && enabled.length < ALL_ACTIONS.length;
  };

  // Count permissions for a role
  const countPermissions = (roleId: string): number => {
    return getCurrentPermissions(roleId).size;
  };

  if (rolesLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-surface-500">Loading permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Permission Matrix</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Toggle permissions for each role. Changes are highlighted and must be saved.
          </p>
        </div>
        {canEdit && hasUnsavedChanges && (
          <button
            onClick={saveAll}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        )}
      </div>

      {/* Preset selector */}
      {canEdit && (
        <div className="space-y-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-surface-900 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showPresets ? 'Hide presets' : 'Apply a preset'}
          </button>
          {showPresets && (
            <div className="flex flex-wrap gap-2 p-3 bg-surface-50 rounded-xl border border-surface-200">
              {PERMISSION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (selectedRole) {
                      applyPreset(selectedRole, preset.id);
                    } else {
                      toast.error('Select a role first to apply a preset');
                    }
                  }}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${preset.color}`}
                  title={preset.description}
                >
                  <span>{preset.label}</span>
                  <span className="text-[9px] opacity-70 font-normal leading-tight max-w-[180px] text-left">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role selector chips */}
      <div className="flex flex-wrap gap-2">
        {(roles ?? []).map((role) => {
          const display = ROLE_DISPLAY[role.name] ?? { label: role.name, color: 'bg-gray-100 text-gray-700 border-gray-200' };
          const permCount = countPermissions(role.id);
          const isSelected = selectedRole === role.id;
          const hasPending = !!pendingChanges[role.id];

          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(isSelected ? null : role.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-1 ' + display.color
                  : display.color + ' hover:shadow-sm'
              }`}
            >
              {permCount > 0 ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldOff className="w-3.5 h-3.5" />
              )}
              {display.label}
              <span className="text-[10px] opacity-70">{permCount}</span>
              {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </button>
          );
        })}
      </div>

      {/* Permission grid — show selected role or all roles */}
      <div className="border border-surface-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-2.5 font-semibold text-surface-700 sticky left-0 bg-surface-50 z-10 min-w-[160px]">
                  Module / Action
                </th>
                {(selectedRole
                  ? roles?.filter((r) => r.id === selectedRole)
                  : roles
                )?.map((role) => {
                  const display = ROLE_DISPLAY[role.name] ?? { label: role.name, color: '' };
                  return (
                    <th
                      key={role.id}
                      className="text-center px-3 py-2.5 font-semibold text-surface-700 min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${display.color}`}>
                          {display.label}
                        </span>
                        {(roleUserCounts?.[role.id] ?? 0) > 0 && (
                          <span className="text-[9px] text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded-full font-medium">
                            {roleUserCounts![role.id]} user{(roleUserCounts![role.id] ?? 0) !== 1 ? 's' : ''}
                          </span>
                        )}
                        {canEdit && (
                          <div className="flex gap-1 items-center">
                            <button
                              onClick={() => toggleAllRolePermissions(role.id, true)}
                              className="text-[9px] text-emerald-600 hover:underline"
                              title="Select all"
                            >
                              All
                            </button>
                            <span className="text-surface-300">|</span>
                            <button
                              onClick={() => toggleAllRolePermissions(role.id, false)}
                              className="text-[9px] text-red-500 hover:underline"
                              title="Clear all"
                            >
                              None
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setAuditLogRoleId(role.id)}
                          className="text-surface-400 hover:text-surface-600 transition-colors"
                          title="View permission change history"
                        >
                          <History className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(MODULE_GROUPS).map(([groupKey, group]) => {
                const isExpanded = expandedGroups[groupKey];
                return (
                  <Fragment key={groupKey}>
                    {/* Group header */}
                    <tr
                      className="bg-surface-100/50 border-b border-surface-200 cursor-pointer hover:bg-surface-100"
                      onClick={() =>
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [groupKey]: !prev[groupKey],
                        }))
                      }
                    >
                      <td
                        colSpan={1 + (selectedRole ? 1 : (roles?.length ?? 0))}
                        className="px-4 py-2 font-semibold text-surface-700 flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                        {group.label}
                      </td>
                    </tr>

                    {/* Module rows */}
                    {isExpanded &&
                      group.modules.map((mod) => {
                        const displayModules: Record<string, string> = {
                          dashboard: 'Dashboard',
                          inventory: 'Inventory',
                          purchases: 'Purchases',
                          sales: 'Sales / POS',
                          clients: 'Clients',
                          transfers: 'Transfers',
                          exchange: 'Exchange',
                          orders: 'Online Orders',
                          returns: 'Returns',
                          buyback: 'Buyback',
                          financial: 'Financial',
                          gst: 'GST',
                          reports: 'Reports',
                          payments: 'Payments',
                          users: 'Users & Roles',
                          settings: 'Settings',
                          content: 'Content / Banners',
                          notifications: 'Notifications',
                          whatsapp: 'WhatsApp',
                          coupons: 'Coupons',
                          emi: 'EMI Plans',
                        };

                        return (
                          <Fragment key={mod}>
                            {/* Module row with toggle-all */}
                            <tr className="border-b border-surface-100 hover:bg-surface-50/50">
                              <td className="px-4 py-2 font-medium text-surface-800 sticky left-0 bg-white z-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">{displayModules[mod] ?? mod}</span>
                                  {canEdit && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const visibleRoles = selectedRole
                                            ? roles?.filter((r) => r.id === selectedRole)
                                            : roles;
                                          visibleRoles?.forEach((r) =>
                                            toggleModulePermissions(r.id, mod, true),
                                          );
                                        }}
                                        className="text-[9px] text-emerald-600 hover:underline"
                                      >
                                        All
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const visibleRoles = selectedRole
                                            ? roles?.filter((r) => r.id === selectedRole)
                                            : roles;
                                          visibleRoles?.forEach((r) =>
                                            toggleModulePermissions(r.id, mod, false),
                                          );
                                        }}
                                        className="text-[9px] text-red-500 hover:underline"
                                      >
                                        None
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              {(selectedRole
                                ? roles?.filter((r) => r.id === selectedRole)
                                : roles
                              )?.map((role) => {
                                const enabled = isModuleEnabled(role.id, mod);
                                const partial = isModulePartial(role.id, mod);
                                return (
                                  <td key={role.id} className="text-center px-3 py-2">
                                    <button
                                      onClick={() => {
                                        if (!canEdit) return;
                                        // Toggle entire module
                                        const visibleRoles = selectedRole
                                          ? roles?.filter((r) => r.id === selectedRole)
                                          : roles;
                                        visibleRoles?.forEach((r) =>
                                          toggleModulePermissions(r.id, mod, !enabled),
                                        );
                                      }}
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                                        enabled
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : partial
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-surface-100 text-surface-400'
                                      } ${canEdit ? 'hover:shadow-sm cursor-pointer' : 'cursor-default'}`}
                                      title={
                                        enabled
                                          ? `${mod}: all actions enabled`
                                          : partial
                                            ? `${mod}: some actions enabled`
                                            : `${mod}: no actions enabled`
                                      }
                                    >
                                      {enabled ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : partial ? (
                                        <span className="text-[10px] font-bold">~</span>
                                      ) : (
                                        <X className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Action rows (individual permissions) */}
                            {ALL_ACTIONS.map((action) => {
                              // Only show actions that exist for this module
                              const permKey = `${mod}.${action}`;
                              const hasAnyRole = (roles ?? []).some((r) =>
                                (allPermissions?.[r.id] ?? []).includes(permKey),
                              );
                              if (!hasAnyRole && !isExpanded) return null;

                              return (
                                <tr
                                  key={permKey}
                                  className="border-b border-surface-50 hover:bg-surface-50/30"
                                >
                                  <td className="px-4 py-1.5 text-surface-500 sticky left-0 bg-white z-10 pl-8">
                                    <span className="font-mono text-[11px]">{action}</span>
                                  </td>
                                  {(selectedRole
                                    ? roles?.filter((r) => r.id === selectedRole)
                                    : roles
                                  )?.map((role) => {
                                    const perms = getCurrentPermissions(role.id);
                                    const isEnabled = perms.has(permKey);

                                    return (
                                      <td key={role.id} className="text-center px-3 py-1">
                                        <button
                                          onClick={() => togglePermission(role.id, permKey)}
                                          disabled={!canEdit}
                                          className={`inline-flex items-center justify-center w-5 h-5 rounded transition-colors ${
                                            isEnabled
                                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                              : 'bg-surface-50 text-surface-300 hover:bg-surface-100 hover:text-surface-500'
                                          } ${!canEdit ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                                        >
                                          {isEnabled ? (
                                            <Check className="w-3 h-3" />
                                          ) : (
                                            <X className="w-3 h-3" />
                                          )}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Modal */}
      {auditLogRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
              <h3 className="text-sm font-semibold text-surface-900">
                Permission History — {roles?.find((r) => r.id === auditLogRoleId)?.name?.replace(/_/g, ' ')}
              </h3>
              <button
                onClick={() => setAuditLogRoleId(null)}
                className="p-1 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <RolePermissionAuditLog roleId={auditLogRoleId} />
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-surface-500">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-100 text-emerald-600">
            <Check className="w-2.5 h-2.5" />
          </span>
          Enabled
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-surface-50 text-surface-300">
            <X className="w-2.5 h-2.5" />
          </span>
          Disabled
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-100 text-amber-700">
            ~
          </span>
          Partial
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-amber-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}

// Fragment import
import { Fragment } from 'react';
