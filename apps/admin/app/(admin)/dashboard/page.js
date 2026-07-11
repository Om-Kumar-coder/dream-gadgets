'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, } from 'recharts';
import { TrendingUp, Package, ShoppingCart, Users, RefreshCw, Clock, MessageSquare, ArrowUpRight, ArrowDownRight, } from 'lucide-react';
import { BannerAnalyticsWidget } from '@/components/banners/BannerAnalyticsWidget';
import { apiClient } from '@/lib/api';
import { useSocket } from '@/lib/useSocket';
const EMPTY_KPI = {
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
function KpiCard({ title, value, sub, icon: Icon, color, trend, }) {
    return (_jsxs("div", { className: "stat-card group", children: [_jsx("div", { className: `p-2.5 rounded-xl ${color} shadow-sm`, children: _jsx(Icon, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-surface-500 font-medium uppercase tracking-wide", children: title }), trend && (_jsx("span", { className: trend === 'up' ? 'text-emerald-500' : 'text-red-500', children: trend === 'up' ? _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" }) : _jsx(ArrowDownRight, { className: "w-3.5 h-3.5" }) }))] }), _jsx("p", { className: "text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors", children: value }), sub && _jsx("p", { className: "text-xs text-surface-400 mt-0.5", children: sub })] })] }));
}
export default function DashboardPage() {
    const [liveKpi, setLiveKpi] = useState(null);
    const { data: kpiData, isLoading: kpiLoading } = useQuery({
        queryKey: ['dashboard-kpi'],
        queryFn: async () => {
            const { data } = await apiClient.get('/reports/dashboard');
            return data.data;
        },
    });
    const { data: weeklySalesData } = useQuery({
        queryKey: ['dashboard-weekly-sales'],
        queryFn: async () => {
            const { data } = await apiClient.get('/reports/weekly-sales');
            return data.data;
        },
    });
    const { data: stockByConditionData } = useQuery({
        queryKey: ['dashboard-stock-condition'],
        queryFn: async () => {
            const { data } = await apiClient.get('/reports/stock-by-condition');
            return data.data;
        },
    });
    const { data: buybackStats } = useQuery({
        queryKey: ['dashboard-buyback-stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/buyback/stats');
            return data.data;
        },
    });
    const kpi = liveKpi ?? kpiData ?? EMPTY_KPI;
    const salesChartData = weeklySalesData ?? [];
    const stockChartData = stockByConditionData ?? [];
    // WebSocket live updates
    const qc = useQueryClient();
    const socket = useSocket();
    useEffect(() => {
        const unsubs = [];
        unsubs.push(socket.on('dashboard.refresh', (data) => setLiveKpi(data)));
        unsubs.push(socket.on('sale.created', () => {
            setLiveKpi((prev) => prev ? { ...prev, todaySalesCount: prev.todaySalesCount + 1 } : null);
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
    const fmt = (n) => n >= 100000
        ? `₹${(n / 100000).toFixed(1)}L`
        : n >= 1000
            ? `₹${(n / 1000).toFixed(1)}K`
            : `₹${n}`;
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "Dashboard" }), _jsxs("p", { className: "text-sm text-surface-500 mt-0.5", children: ["Today's overview \u2014 ", _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" }), " live"] })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KpiCard, { title: "Today's Sales", value: kpiLoading ? '—' : fmt(kpi.todaySalesValue), sub: kpiLoading ? undefined : `${kpi.todaySalesCount} transactions`, icon: TrendingUp, color: "bg-primary", trend: "up" }), _jsx(KpiCard, { title: "Active Stock", value: kpiLoading ? '—' : String(kpi.activeStockCount), sub: kpiLoading ? undefined : fmt(kpi.activeStockValue), icon: Package, color: "bg-emerald-500" }), _jsx(KpiCard, { title: "Today's Purchases", value: kpiLoading ? '—' : String(kpi.todayPurchases), sub: "items acquired", icon: ShoppingCart, color: "bg-violet-500" }), _jsx(KpiCard, { title: "New Clients", value: kpiLoading ? '—' : String(kpi.newClientsToday), sub: "registered today", icon: Users, color: "bg-amber-500" }), _jsx(KpiCard, { title: "Net Income", value: kpiLoading ? '—' : fmt(kpi.netIncome), sub: "today", icon: TrendingUp, color: "bg-teal-500", trend: "up" }), _jsx(KpiCard, { title: "Online Orders", value: kpiLoading ? '—' : String(kpi.onlineOrdersCount), sub: "pending fulfillment", icon: ShoppingCart, color: "bg-pink-500" }), _jsx(KpiCard, { title: "Booked Items", value: kpiLoading ? '—' : String(kpi.bookedItems), sub: "reserved", icon: Clock, color: "bg-amber-500" }), _jsx(KpiCard, { title: "Pending Returns", value: kpiLoading ? '—' : String(kpi.pendingReturns), sub: "awaiting approval", icon: RefreshCw, color: "bg-red-500", trend: "down" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-sm font-semibold text-surface-700", children: "Weekly Sales (\u20B9)" }), _jsx("span", { className: "badge-success text-[10px]", children: "+12% vs last week" })] }), salesChartData.length === 0 ? (_jsx("div", { className: "h-[220px] flex items-center justify-center text-sm text-surface-400", children: "No sales data yet" })) : (_jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(AreaChart, { data: salesChartData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "salesGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "hsl(357, 92.4%, 46.7%)", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "hsl(357, 92.4%, 46.7%)", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(0, 0%, 93%)" }), _jsx(XAxis, { dataKey: "day", tick: { fontSize: 12, fill: 'hsl(0, 0%, 55%)' } }), _jsx(YAxis, { tick: { fontSize: 12, fill: 'hsl(0, 0%, 55%)' }, tickFormatter: (v) => `${v / 1000}K` }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: '1px solid hsl(0, 0%, 93%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, formatter: (v) => [`₹${v.toLocaleString()}`, 'Sales'] }), _jsx(Area, { type: "monotone", dataKey: "sales", stroke: "hsl(357, 92.4%, 46.7%)", fill: "url(#salesGrad)", strokeWidth: 2 })] }) }))] }), _jsxs("div", { className: "card p-5", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("h2", { className: "text-sm font-semibold text-surface-700", children: "Stock by Condition" }) }), stockChartData.length === 0 ? (_jsx("div", { className: "h-[220px] flex items-center justify-center text-sm text-surface-400", children: "No stock data yet" })) : (_jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(BarChart, { data: stockChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(0, 0%, 93%)" }), _jsx(XAxis, { dataKey: "condition", tick: { fontSize: 11, fill: 'hsl(0, 0%, 55%)' } }), _jsx(YAxis, { tick: { fontSize: 12, fill: 'hsl(0, 0%, 55%)' } }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: '1px solid hsl(0, 0%, 93%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }), _jsx(Bar, { dataKey: "count", fill: "hsl(357, 92.4%, 46.7%)", radius: [6, 6, 0, 0] })] }) }))] })] }), _jsx(BannerAnalyticsWidget, {}), _jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 rounded-lg bg-primary/10", children: _jsx(MessageSquare, { className: "w-4 h-4 text-primary" }) }), _jsx("h2", { className: "text-sm font-semibold text-surface-700", children: "Buyback Leads" })] }), _jsxs("span", { className: "badge-info text-[10px]", children: [buybackStats?.total ?? '…', " total"] })] }), !buybackStats ? (_jsx("div", { className: "h-[120px] flex items-center justify-center text-sm text-surface-400", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" }), "Loading\u2026"] }) })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
                            { title: 'Screen Condition', data: buybackStats.byScreenCondition },
                            { title: 'Body Condition', data: buybackStats.byBodyCondition },
                            { title: 'Battery Health', data: buybackStats.byBatteryHealth },
                            { title: 'By Status', data: buybackStats.byStatus },
                        ].map((section) => (_jsxs("div", { className: "p-3 bg-surface-50 rounded-xl border border-surface-100", children: [_jsx("p", { className: "text-xs font-medium text-surface-500 mb-2", children: section.title }), section.data.length === 0 ? (_jsx("p", { className: "text-xs text-surface-400", children: "No data" })) : (_jsx("div", { className: "space-y-1", children: section.data.map((item) => (_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-surface-600 truncate capitalize", children: item.value || item.status }), _jsx("span", { className: "font-semibold text-surface-900 ml-2", children: item.count })] }, item.value || item.status))) }))] }, section.title))) }))] })] }));
}
//# sourceMappingURL=page.js.map