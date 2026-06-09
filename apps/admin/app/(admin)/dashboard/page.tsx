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
import { TrendingUp, Package, ShoppingCart, Users, RefreshCw, Clock } from 'lucide-react';
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
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Today's overview — live updates enabled</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Sales"
          value={kpiLoading ? '—' : fmt(kpi.todaySalesValue)}
          sub={kpiLoading ? undefined : `${kpi.todaySalesCount} transactions`}
          icon={TrendingUp}
          color="bg-blue-500"
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
          color="bg-orange-500"
        />
        <KpiCard
          title="Net Income"
          value={kpiLoading ? '—' : fmt(kpi.netIncome)}
          sub="today"
          icon={TrendingUp}
          color="bg-teal-500"
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
          color="bg-yellow-500"
        />
        <KpiCard
          title="Pending Returns"
          value={kpiLoading ? '—' : String(kpi.pendingReturns)}
          sub="awaiting approval"
          icon={RefreshCw}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Sales (₹)</h2>
          {salesChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Sales']} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#E50914"
                  fill="url(#salesGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Stock by Condition</h2>
          {stockChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No stock data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="condition" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF2D2D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
