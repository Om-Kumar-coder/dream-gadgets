/**
 * Permission preset templates for quick role setup.
 * Each preset defines a complete set of permissions that can be
 * applied to a role with one click.
 */

function perms(...pairs: Array<[string, string[]]>): string[] {
  const result: string[] = [];
  for (const [mod, actions] of pairs) {
    for (const action of actions) {
      result.push(`${mod}.${action}`);
    }
  }
  return result;
}

export interface PermissionPreset {
  id: string;
  label: string;
  description: string;
  color: string;
  permissions: string[];
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: 'full_access',
    label: 'Full Access',
    description: 'All permissions — equivalent to owner access',
    color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['inventory', ['view', 'create', 'edit', 'delete', 'export']],
      ['purchases', ['view', 'create', 'edit', 'delete', 'export']],
      ['sales', ['view', 'create', 'edit', 'delete', 'export', 'approve']],
      ['clients', ['view', 'create', 'edit', 'delete', 'export']],
      ['transfers', ['view', 'create', 'edit', 'delete']],
      ['exchange', ['view', 'create', 'edit', 'delete', 'approve']],
      ['orders', ['view', 'edit', 'delete']],
      ['returns', ['view', 'create', 'edit', 'delete', 'approve']],
      ['reports', ['view', 'export']],
      ['users', ['view', 'create', 'edit', 'delete']],
      ['settings', ['view', 'create', 'edit', 'delete']],
      ['content', ['view', 'create', 'edit', 'delete']],
      ['buyback', ['view', 'edit', 'delete']],
      ['whatsapp', ['view', 'create', 'edit', 'delete', 'send']],
      ['coupons', ['view', 'create', 'edit', 'delete']],
      ['emi', ['view', 'create', 'edit', 'delete']],
      ['gst', ['view', 'export']],
      ['notifications', ['view', 'retry']],
      ['payments', ['view', 'approve']],
      ['financial', ['view', 'reports', 'pnl', 'export']],
    ),
  },
  {
    id: 'multi_store_manager',
    label: 'Multi-Store Manager',
    description: 'Cross-store inventory, sales, and staff management — no financial access',
    color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['inventory', ['view', 'create', 'edit', 'export']],
      ['purchases', ['view', 'create', 'edit', 'export']],
      ['sales', ['view', 'create', 'edit', 'export', 'approve']],
      ['clients', ['view', 'create', 'edit', 'export']],
      ['transfers', ['view', 'create', 'edit']],
      ['exchange', ['view', 'create', 'edit', 'approve']],
      ['orders', ['view', 'edit']],
      ['returns', ['view', 'create', 'approve']],
      ['reports', ['view', 'export']],
      ['users', ['view', 'create', 'edit']],
      ['buyback', ['view', 'edit']],
      ['whatsapp', ['view', 'edit', 'send']],
      ['coupons', ['view', 'create', 'edit']],
      ['emi', ['view', 'create', 'edit']],
      ['gst', ['view', 'export']],
      ['notifications', ['view']],
      ['payments', ['view', 'approve']],
    ),
  },
  {
    id: 'store_manager',
    label: 'Store Manager',
    description: 'Full store-level access — inventory, sales, clients, approvals',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['inventory', ['view', 'create', 'edit', 'export']],
      ['purchases', ['view', 'create', 'edit', 'export']],
      ['sales', ['view', 'create', 'edit', 'export', 'approve']],
      ['clients', ['view', 'create', 'edit', 'export']],
      ['transfers', ['view', 'create', 'edit']],
      ['exchange', ['view', 'create', 'edit', 'approve']],
      ['orders', ['view', 'edit']],
      ['returns', ['view', 'create', 'approve']],
      ['reports', ['view', 'export']],
      ['users', ['view', 'create', 'edit']],
      ['buyback', ['view', 'edit']],
      ['whatsapp', ['view', 'edit', 'send']],
      ['coupons', ['view', 'create', 'edit']],
      ['emi', ['view', 'create', 'edit']],
      ['gst', ['view', 'export']],
      ['notifications', ['view']],
      ['payments', ['view', 'approve']],
      ['financial', ['view', 'reports']],
    ),
  },
  {
    id: 'sales_staff',
    label: 'Sales Staff',
    description: 'POS operations, inventory view, client management',
    color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['inventory', ['view']],
      ['purchases', ['view', 'create']],
      ['sales', ['view', 'create']],
      ['clients', ['view', 'create', 'edit']],
      ['exchange', ['view', 'create']],
      ['orders', ['view']],
      ['returns', ['view', 'create']],
      ['buyback', ['view']],
      ['whatsapp', ['view', 'send']],
      ['coupons', ['view']],
      ['emi', ['view']],
      ['payments', ['view']],
    ),
  },
  {
    id: 'calling_staff',
    label: 'Calling Staff',
    description: 'Client management, order updates, buyback leads, WhatsApp',
    color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['inventory', ['view']],
      ['purchases', ['view']],
      ['sales', ['view']],
      ['clients', ['view', 'create', 'edit']],
      ['orders', ['view', 'edit']],
      ['returns', ['view', 'create']],
      ['buyback', ['view', 'edit']],
      ['whatsapp', ['view', 'edit', 'send']],
      ['coupons', ['view']],
      ['emi', ['view']],
    ),
  },
  {
    id: 'read_only',
    label: 'Read Only',
    description: 'Dashboard view only — no operational access',
    color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
    permissions: perms(
      ['dashboard', ['view']],
    ),
  },
  {
    id: 'financial_viewer',
    label: 'Financial Viewer',
    description: 'Financial reports, GST, and P&L view only',
    color: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200',
    permissions: perms(
      ['dashboard', ['view']],
      ['financial', ['view', 'reports', 'pnl', 'export']],
      ['gst', ['view', 'export']],
      ['reports', ['view', 'export']],
    ),
  },
];
