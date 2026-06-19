'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp, Package, ShoppingCart, Users, RefreshCw, Clock, MessageSquare, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { BannerAnalyticsWidget } from '@/components/banners/BannerAnalyticsWidget';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/lib/useSocket';

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

interface SalesChartPoint {
  day: string;
  sales: number;
}

interface StockChartPoint {
  condition: string;
  count: number;
}

const EMPTY_KPI: KPI = {
  todaySalesCount: 0,
  todaySalesValue: 0,
  todayPurchases: 0,
  netIncome: 0,
  activeStockCount: 0,
  activeStockValue: 0,
  bookedItems: 0,
  pendingReturns: 0,
  newClientsToday: 0,
  onlineOrdersCount: 0,
};

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="stat-card group">
      <div className={`p-2.5 rounded-xl ${color} shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">{title}</p>
          {trend && (
            <span className={trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
              {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [liveKpi, setLiveKpi] = useState<KPI | null>(null);

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/dashboard');
      return data.data as KPI;
    },
  });

  const { data: weeklySalesData } = useQuery({
    queryKey: ['dashboard-weekly-sales'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/weekly-sales');
      return data.data as SalesChartPoint[];
    },
  });

  const { data: stockByConditionData } = useQuery({
    queryKey: ['dashboard-stock-condition'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/stock-by-condition');
      return data.data as StockChartPoint[];
    },
  });

  const { data: buybackStats } = useQuery({
    queryKey: ['dashboard-buyback-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/buyback/stats');
      return data.data as {
        total: number;
        byStatus: { status: string; count: number }[];
        byScreenCondition: { value: string; count: number }[];
        byBodyCondition: { value: string; count: number }[];
        byBatteryHealth: { value: string; count: number }[];
        weeklyTrend: { date: string; count: number }[];
      };
    },
  });

  const kpi = liveKpi ?? kpiData ?? EMPTY_KPI;
  const salesChartData = weeklySalesData ?? [];
  const stockChartData = stockByConditionData ?? [];

  // WebSocket live updates
  const qc = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(socket.on('dashboard.refresh', (data: KPI) => setLiveKpi(data)));
    unsubs.push(socket.on('sale.created', () => {
      setLiveKpi((prev) =>
        prev ? { ...prev, todaySalesCount: prev.todaySalesCount + 1 } : null,
      );
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
      qc.invalidateQueries({ queryKey: ['dashboard-weekly-sales'] });
    }));
    unsubs.push(socket.on('sale.voided', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));
    unsubs.push(socket.on('inventory.updated', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stock-condition'] });
    }));
    unsubs.push(socket.on('return.created', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));
    unsubs.push(socket.on('order.created', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));
    unsubs.push(socket.on('order.status_changed', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));
    unsubs.push(socket.on('stock.transfer.created', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));
    unsubs.push(socket.on('stock.transfer.received', () => {
      qc.invalidateQueries({ queryKey: ['dashboard-kpi'] });
    }));

    return () => { unsubs.forEach((fn) => fn()); };
  }, [socket, qc]);

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
        ? `₹${(n / 1000).toFixed(1)}K`
        : `₹${n}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-sm text-surface-900">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Today&apos;s overview — <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> live</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Sales"
          value={kpiLoading ? '—' : fmt(kpi.todaySalesValue)}
          sub={kpiLoading ? undefined : `${kpi.todaySalesCount} transactions`}
          icon={TrendingUp}
          color="bg-primary"
          trend="up"
        />
        <KpiCard
          title="Active Stock"
          value={kpiLoading ? '—' : String(kpi.activeStockCount)}
          sub={kpiLoading ? undefined : fmt(kpi.activeStockValue)}
          icon={Package}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Today's Purchases"
          value={kpiLoading ? '—' : String(kpi.todayPurchases)}
          sub="items acquired"
          icon={ShoppingCart}
          color="bg-violet-500"
        />
        <KpiCard
          title="New Clients"
          value={kpiLoading ? '—' : String(kpi.newClientsToday)}
          sub="registered today"
          icon={Users}
          color="bg-amber-500"
        />
        <KpiCard
          title="Net Income"
          value={kpiLoading ? '—' : fmt(kpi.netIncome)}
          sub="today"
          icon={TrendingUp}
          color="bg-teal-500"
          trend="up"
        />
        <KpiCard
          title="Online Orders"
          value={kpiLoading ? '—' : String(kpi.onlineOrdersCount)}
          sub="pending fulfillment"
          icon={ShoppingCart}
          color="bg-pink-500"
        />
        <KpiCard
          title="Booked Items"
          value={kpiLoading ? '—' : String(kpi.bookedItems)}
          sub="reserved"
          icon={Clock}
          color="bg-amber-500"
        />
        <KpiCard
          title="Pending Returns"
          value={kpiLoading ? '—' : String(kpi.pendingReturns)}
          sub="awaiting approval"
          icon={RefreshCw}
          color="bg-red-500"
          trend="down"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-700">Weekly Sales (₹)</h2>
            <span className="badge-success text-[10px]">+12% vs last week</span>
          </div>
          {salesChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-surface-400">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(357, 92.4%, 46.7%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(357, 92.4%, 46.7%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 93%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(0, 0%, 55%)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(0, 0%, 55%)' }} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(0, 0%, 93%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(357, 92.4%, 46.7%)" fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-700">Stock by Condition</h2>
          </div>
          {stockChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-surface-400">
              No stock data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 93%)" />
                <XAxis dataKey="condition" tick={{ fontSize: 11, fill: 'hsl(0, 0%, 55%)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(0, 0%, 55%)' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(0, 0%, 93%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="hsl(357, 92.4%, 46.7%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Banner Analytics Widget */}
      <BannerAnalyticsWidget />

      {/* Buyback Leads Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-surface-700">Buyback Leads</h2>
          </div>
          <span className="badge-info text-[10px]">{buybackStats?.total ?? '…'} total</span>
        </div>

        {!buybackStats ? (
          <div className="h-[120px] flex items-center justify-center text-sm text-surface-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Screen Condition', data: buybackStats.byScreenCondition },
              { title: 'Body Condition', data: buybackStats.byBodyCondition },
              { title: 'Battery Health', data: buybackStats.byBatteryHealth },
              { title: 'By Status', data: buybackStats.byStatus },
            ].map((section) => (
              <div key={section.title} className="p-3 bg-surface-50 rounded-xl border border-surface-100">
                <p className="text-xs font-medium text-surface-500 mb-2">{section.title}</p>
                {section.data.length === 0 ? (
                  <p className="text-xs text-surface-400">No data</p>
                ) : (
                  <div className="space-y-1">
                    {section.data.map((item: any) => (
                      <div key={item.value || item.status} className="flex items-center justify-between text-xs">
                        <span className="text-surface-600 truncate capitalize">{item.value || item.status}</span>
                        <span className="font-semibold text-surface-900 ml-2">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
