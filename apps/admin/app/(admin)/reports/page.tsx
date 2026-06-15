'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { TrendingUp, Package, ShoppingCart, Users, Download, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@dream-gadgets/ui';

const REPORT_TYPES = [
  { value: 'daily_sales', label: 'Daily Sales Summary' },
  { value: 'weekly_sales', label: 'Weekly Sales' },
  { value: 'monthly_sales', label: 'Monthly Sales' },
  { value: 'purchase', label: 'Purchase Report' },
  { value: 'gst', label: 'GST Report (GSTR-1)' },
  { value: 'stock_aging', label: 'Stock Aging' },
  { value: 'inventory_valuation', label: 'Inventory Valuation' },
  { value: 'employee_sales', label: 'Employee Sales' },
  { value: 'exchange', label: 'Exchange Report' },
  { value: 'return', label: 'Return Report' },
  { value: 'branch_pl', label: 'Branch P&L' },
];

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
    <div className="stat-card">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily_sales');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard').then(r => r.data),
  });

  const exportMutation = useMutation({
    mutationFn: (type: string) =>
      apiClient
        .get(`/reports/${type}/excel`, {
          params: { startDate: fromDate, endDate: toDate },
          responseType: 'blob',
        })
        .then((r) => {
          const url = window.URL.createObjectURL(new Blob([r.data]));
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}-report-${fromDate}-to-${toDate}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        }),
    onError: (error: any) => {
      console.error('Export failed:', error);
    },
  });

  const kpis = dashboard?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-sm text-surface-900">Reports & Analytics</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Key metrics, business insights, and report exports
        </p>
      </div>

      {/* KPI Cards */}
      {dashboardLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-gray-200 mb-3" />
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Today's Sales"
            value={`₹${Number(kpis.todaySalesValue ?? 0).toLocaleString('en-IN')}`}
            sub={`${kpis.todaySalesCount ?? 0} transactions`}
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <KpiCard
            title="Today's Purchases"
            value={`${kpis.todayPurchases ?? 0} items`}
            sub={`${kpis.todayPurchases ?? 0} acquired today`}
            icon={ShoppingCart}
            color="bg-violet-500"
          />
          <KpiCard
            title="Active Stock"
            value={`${kpis.activeStockCount ?? 0} items`}
            sub={`₹${Number(kpis.activeStockValue ?? 0).toLocaleString('en-IN')}`}
            icon={Package}
            color="bg-emerald-500"
          />
          <KpiCard
            title="Net Income"
            value={`₹${Number(kpis.netIncome ?? 0).toLocaleString('en-IN')}`}
            sub="Today"
            icon={Users}
            color="bg-teal-500"
          />
        </div>
      ) : null}

      {/* Report Export */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-surface-500" />
          <h2 className="text-base font-semibold text-surface-900">Export Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input"
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => exportMutation.mutate(reportType)}
            disabled={exportMutation.isPending}
            isLoading={exportMutation.isPending}
            className="inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exportMutation.isPending ? 'Generating...' : 'Export Excel'}
          </Button>
          {exportMutation.isError && (
            <span className="text-xs text-red-500">Export failed. Please try again.</span>
          )}
          {exportMutation.isSuccess && (
            <span className="text-xs text-green-600">✓ Downloaded successfully</span>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-surface-900">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Sales Dashboard', href: '/sales', desc: 'View all sales' },
            { label: 'Inventory', href: '/inventory', desc: 'Stock overview' },
            { label: 'Purchase Reports', href: '/purchases', desc: 'Acquisition data' },
            { label: 'User Activity', href: '/users', desc: 'Employee performance' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 rounded-lg border border-surface-100 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <p className="text-sm font-medium text-surface-900">{link.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
