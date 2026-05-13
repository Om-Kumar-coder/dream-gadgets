'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
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

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily_sales');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard').then(r => r.data),
  });

  const exportMutation = useMutation({
    mutationFn: (type: string) =>
      apiClient.get(`/reports/export/${type}?format=excel&from=${fromDate}&to=${toDate}`, { responseType: 'blob' }).then(r => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report.xlsx`;
        a.click();
      }),
  });

  const kpis = dashboard?.data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today's Sales", value: `₹${Number(kpis.todaySalesValue ?? 0).toLocaleString('en-IN')}`, sub: `${kpis.todaySalesCount ?? 0} transactions` },
            { label: "Today's Purchases", value: `₹${Number(kpis.todayPurchasesValue ?? 0).toLocaleString('en-IN')}`, sub: `${kpis.todayPurchasesCount ?? 0} items` },
            { label: 'Active Stock', value: `${kpis.activeStockCount ?? 0} items`, sub: `₹${Number(kpis.activeStockValue ?? 0).toLocaleString('en-IN')}` },
            { label: 'Net Income', value: `₹${Number(kpis.netIncome ?? 0).toLocaleString('en-IN')}`, sub: 'Today' },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report Export */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              {REPORT_TYPES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
        <Button
          onClick={() => exportMutation.mutate(reportType)}
          disabled={exportMutation.isPending}
          isLoading={exportMutation.isPending}
        >
          {exportMutation.isPending ? 'Generating...' : 'Export Excel'}
        </Button>
      </div>
    </div>
  );
}
