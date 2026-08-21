'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import {
  TrendingUp, Package, ShoppingCart, Users, RefreshCw, Clock,
  ArrowUpRight, ArrowDownRight, Store, Phone, BarChart3, FileText,
  MessageSquare, AlertTriangle, CheckCircle, Plus, Search,
  DollarSign, Eye, ShoppingCart as CartIcon, AlertCircle,
} from 'lucide-react';

interface KPI {
  todaySalesCount: number;
  todaySalesValue: number;
  todayPurchases: number;
  netIncome: number;
  activeStockCount: number;
  activeStockValue: number;
  bookedItems: number;
  pendingReturns: number;
  newClientsToday: number;
  onlineOrdersCount: number;
}

const EMPTY_KPI: KPI = {
  todaySalesCount: 0, todaySalesValue: 0, todayPurchases: 0,
  netIncome: 0, activeStockCount: 0, activeStockValue: 0,
  bookedItems: 0, pendingReturns: 0, newClientsToday: 0, onlineOrdersCount: 0,
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function StatCard({ title, value, sub, icon: Icon, color, href }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className="stat-card group cursor-pointer">
      <div className={`p-2.5 rounded-xl ${color} shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickAction({ href, icon: Icon, label, color }: {
  href: string; icon: React.ElementType; label: string; color: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 border border-surface-100 transition-colors">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-medium text-surface-700">{label}</span>
    </Link>
  );
}

// ─── Owner Dashboard ───────────────────────────────────────────────────────────
export function OwnerDashboard({ kpi, loading }: { kpi: KPI; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={loading ? '—' : fmt(kpi.todaySalesValue)} sub={`${kpi.todaySalesCount} transactions`} icon={TrendingUp} color="bg-primary" href="/sales" />
        <StatCard title="Net Income" value={loading ? '—' : fmt(kpi.netIncome)} sub="today" icon={DollarSign} color="bg-teal-500" />
        <StatCard title="Active Stock" value={loading ? '—' : String(kpi.activeStockCount)} sub={fmt(kpi.activeStockValue)} icon={Package} color="bg-emerald-500" href="/inventory" />
        <StatCard title="New Clients" value={loading ? '—' : String(kpi.newClientsToday)} sub="registered today" icon={Users} color="bg-amber-500" href="/clients" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Purchases" value={loading ? '—' : String(kpi.todayPurchases)} sub="items acquired" icon={ShoppingCart} color="bg-violet-500" href="/purchases" />
        <StatCard title="Online Orders" value={loading ? '—' : String(kpi.onlineOrdersCount)} sub="pending" icon={CartIcon} color="bg-pink-500" />
        <StatCard title="Booked Items" value={loading ? '—' : String(kpi.bookedItems)} sub="reserved" icon={Clock} color="bg-amber-500" />
        <StatCard title="Pending Returns" value={loading ? '—' : String(kpi.pendingReturns)} sub="awaiting approval" icon={RefreshCw} color="bg-red-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction href="/inventory" icon={Plus} label="Add Product" color="bg-primary" />
        <QuickAction href="/users" icon={Users} label="Manage Staff" color="bg-violet-500" />
        <QuickAction href="/reports" icon={BarChart3} label="View Reports" color="bg-emerald-500" />
        <QuickAction href="/settings" icon={FileText} label="Settings" color="bg-surface-600" />
      </div>
    </div>
  );
}

// ─── Multi-Store Manager Dashboard ─────────────────────────────────────────────
export function MultiStoreManagerDashboard({ kpi, loading }: { kpi: KPI; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales Today" value={loading ? '—' : fmt(kpi.todaySalesValue)} sub={`${kpi.todaySalesCount} transactions`} icon={TrendingUp} color="bg-primary" href="/sales" />
        <StatCard title="Active Stock" value={loading ? '—' : String(kpi.activeStockCount)} sub={`${fmt(kpi.activeStockValue)} total value`} icon={Package} color="bg-emerald-500" href="/inventory" />
        <StatCard title="Pending Transfers" value={loading ? '—' : String(kpi.bookedItems)} sub="in transit" icon={RefreshCw} color="bg-amber-500" href="/transfers" />
        <StatCard title="New Clients" value={loading ? '—' : String(kpi.newClientsToday)} sub="today" icon={Users} color="bg-violet-500" href="/clients" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction href="/branches" icon={Store} label="All Stores" color="bg-primary" />
        <QuickAction href="/inventory" icon={Package} label="All Inventory" color="bg-emerald-500" />
        <QuickAction href="/transfers" icon={RefreshCw} label="Transfer Stock" color="bg-amber-500" />
        <QuickAction href="/users" icon={Users} label="Manage Staff" color="bg-violet-500" />
        <QuickAction href="/reports" icon={BarChart3} label="Reports" color="bg-teal-500" />
        <QuickAction href="/sales" icon={TrendingUp} label="All Sales" color="bg-pink-500" />
      </div>
      {kpi.pendingReturns > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-amber-800">{kpi.pendingReturns} returns pending approval across all stores</span>
        </div>
      )}
    </div>
  );
}

// ─── Low Stock Alerts Widget ──────────────────────────────────────────────────
function LowStockAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/inventory/low-stock?threshold=3');
      return data.data as Array<{ modelId: string; modelName: string; brandName: string; available: number }>;
    },
  });

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <div className="card p-5 border-l-4 border-amber-400">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-semibold text-surface-700">Low Stock Alerts</h3>
        </div>
        <Link href="/inventory" className="text-xs font-medium text-primary hover:underline">View All →</Link>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.modelId} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">
                {item.brandName} {item.modelName}
              </p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              item.available === 0 ? 'bg-red-100 text-red-700' :
              item.available === 1 ? 'bg-orange-100 text-orange-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {item.available === 0 ? 'OUT OF STOCK' : `${item.available} left`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Store Manager Dashboard ───────────────────────────────────────────────────
export function StoreManagerDashboard({ kpi, loading }: { kpi: KPI; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={loading ? '—' : fmt(kpi.todaySalesValue)} sub={`${kpi.todaySalesCount} transactions`} icon={TrendingUp} color="bg-primary" href="/sales" />
        <StatCard title="Stock Available" value={loading ? '—' : String(kpi.activeStockCount)} sub={fmt(kpi.activeStockValue)} icon={Package} color="bg-emerald-500" href="/inventory" />
        <StatCard title="Purchases" value={loading ? '—' : String(kpi.todayPurchases)} sub="items today" icon={ShoppingCart} color="bg-violet-500" href="/purchases" />
        <StatCard title="New Clients" value={loading ? '—' : String(kpi.newClientsToday)} sub="today" icon={Users} color="bg-amber-500" href="/clients" />
      </div>
      <LowStockAlerts />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction href="/sales/pos" icon={Plus} label="New Sale (POS)" color="bg-primary" />
        <QuickAction href="/inventory" icon={Package} label="Manage Stock" color="bg-emerald-500" />
        <QuickAction href="/transfers" icon={RefreshCw} label="Transfer Stock" color="bg-amber-500" />
        <QuickAction href="/clients" icon={Users} label="Manage Clients" color="bg-violet-500" />
        <QuickAction href="/buyback" icon={MessageSquare} label="Buyback Leads" color="bg-pink-500" />
        <QuickAction href="/reports" icon={BarChart3} label="Reports" color="bg-teal-500" />
      </div>
      {kpi.pendingReturns > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-amber-800">{kpi.pendingReturns} returns pending your approval</span>
          <Link href="/returns" className="ml-auto text-xs font-medium text-amber-700 hover:underline">Review →</Link>
        </div>
      )}
    </div>
  );
}

// ─── Sales Staff Dashboard (Shop Sales + Store Sales) ──────────────────────────
export function SalesDashboard({ kpi, loading }: { kpi: KPI; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="My Sales Today" value={loading ? '—' : fmt(kpi.todaySalesValue)} sub={`${kpi.todaySalesCount} transactions`} icon={TrendingUp} color="bg-primary" />
        <StatCard title="Stock Available" value={loading ? '—' : String(kpi.activeStockCount)} sub="in store" icon={Package} color="bg-emerald-500" />
        <StatCard title="New Clients" value={loading ? '—' : String(kpi.newClientsToday)} sub="today" icon={Users} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/sales/pos" icon={Plus} label="New Sale (POS)" color="bg-primary" />
        <QuickAction href="/inventory" icon={Search} label="Check Stock" color="bg-emerald-500" />
        <QuickAction href="/clients" icon={Users} label="New Client" color="bg-violet-500" />
        <QuickAction href="/exchange" icon={RefreshCw} label="Exchange Device" color="bg-amber-500" />
      </div>
    </div>
  );
}

// ─── Follow-Up Queue Widget ──────────────────────────────────────────────────
interface FollowUpClient {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  nextFollowUpAt: string;
  followUpNotes: string | null;
  followUpStatus: string;
  isOverdue: boolean;
  branchName: string | null;
}

function FollowUpQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ['follow-up-queue'],
    queryFn: async () => {
      const { data } = await apiClient.get('/clients/follow-ups/queue?limit=10');
      return data.data as FollowUpClient[];
    },
  });

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  const overdue = data.filter(c => c.isOverdue);
  const upcoming = data.filter(c => !c.isOverdue);

  function timeUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h`;
    return 'soon';
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'just now';
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-surface-700">Follow-Up Queue</h3>
        </div>
        <Link href="/clients" className="text-xs font-medium text-primary hover:underline">View All →</Link>
      </div>

      {overdue.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            OVERDUE ({overdue.length})
          </p>
          <div className="space-y-1.5">
            {overdue.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    {client.firstName} {client.lastName || ''}
                  </p>
                  <p className="text-xs text-surface-500 truncate">{client.phone}</p>
                  {client.followUpNotes && (
                    <p className="text-xs text-surface-400 truncate mt-0.5">📝 {client.followUpNotes}</p>
                  )}
                </div>
                <div className="text-right ml-3">
                  <span className="text-xs font-semibold text-red-600">{timeAgo(client.nextFollowUpAt)}</span>
                  <p className="text-[10px] text-surface-400">overdue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            UPCOMING ({upcoming.length})
          </p>
          <div className="space-y-1.5">
            {upcoming.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    {client.firstName} {client.lastName || ''}
                  </p>
                  <p className="text-xs text-surface-500 truncate">{client.phone}</p>
                  {client.followUpNotes && (
                    <p className="text-xs text-surface-400 truncate mt-0.5">📝 {client.followUpNotes}</p>
                  )}
                </div>
                <div className="text-right ml-3">
                  <span className="text-xs font-semibold text-amber-600">{timeUntil(client.nextFollowUpAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calling Staff Dashboard ───────────────────────────────────────────────────
export function CallingStaffDashboard({ kpi, loading }: { kpi: KPI; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="New Clients Today" value={loading ? '—' : String(kpi.newClientsToday)} sub="registered" icon={Users} color="bg-primary" />
        <StatCard title="Online Orders" value={loading ? '—' : String(kpi.onlineOrdersCount)} sub="pending" icon={CartIcon} color="bg-amber-500" />
        <StatCard title="Buyback Leads" value={loading ? '—' : String(kpi.bookedItems)} sub="to follow up" icon={MessageSquare} color="bg-pink-500" />
      </div>
      <FollowUpQueue />
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/clients" icon={Users} label="Manage Clients" color="bg-primary" />
        <QuickAction href="/buyback" icon={MessageSquare} label="Buyback Leads" color="bg-pink-500" />
        <QuickAction href="/orders" icon={CartIcon} label="Online Orders" color="bg-amber-500" />
        <QuickAction href="/returns" icon={RefreshCw} label="Returns" color="bg-red-500" />
      </div>
    </div>
  );
}

// ─── Employee Dashboard ────────────────────────────────────────────────────────
export function EmployeeDashboard({ userName }: { userName?: string }) {
  return (
    <div className="space-y-6">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">
          Welcome{userName ? `, ${userName}` : ''}!
        </h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          You have read-only access to the dashboard. Contact your store manager for any operational tasks.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-surface-700">Need Help?</h3>
          </div>
          <p className="text-xs text-surface-500">Contact your store manager or the admin team for any questions about your role or tasks.</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-surface-700">Your Access</h3>
          </div>
          <p className="text-xs text-surface-500">Dashboard view only. For inventory, sales, or client access, ask your manager to update your role permissions.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Role Dashboard Router ─────────────────────────────────────────────────────
export default function RoleDashboard() {
  const user = useAdminAuthStore((s) => s.user);
  const role = user?.role;

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/dashboard');
      return data.data as KPI;
    },
  });

  const kpi = kpiData ?? EMPTY_KPI;
  const userName = (user as any)?.email?.split('@')[0] ?? '';

  switch (role) {
    case 'shop_owner':
      return <OwnerDashboard kpi={kpi} loading={isLoading} />;
    case 'multi_store_manager':
      return <MultiStoreManagerDashboard kpi={kpi} loading={isLoading} />;
    case 'store_manager':
      return <StoreManagerDashboard kpi={kpi} loading={isLoading} />;
    case 'shop_sales':
    case 'store_sales':
      return <SalesDashboard kpi={kpi} loading={isLoading} />;
    case 'calling_staff':
      return <CallingStaffDashboard kpi={kpi} loading={isLoading} />;
    case 'employee':
      return <EmployeeDashboard userName={userName} />;
    default:
      return <OwnerDashboard kpi={kpi} loading={isLoading} />;
  }
}
