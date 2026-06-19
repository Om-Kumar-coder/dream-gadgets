'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Image as ImageIcon,
  MousePointerClick,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface BannerAnalytics {
  totalBanners: number;
  totalClicks: number;
  activeBanners: number;
  inactiveBanners: number;
  byPageType: { pageType: string; count: number; clicks: number }[];
  byPosition: { position: string; count: number; clicks: number }[];
  topBanners: {
    id: string;
    title: string;
    pageType: string;
    position: string;
    clicks: number;
    imageUrl: string;
    isActive: boolean;
  }[];
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  shop: 'Shop',
  promotional: 'Promotional',
};

const POSITION_LABELS: Record<string, string> = {
  slider: 'Hero Slider',
  middle: 'Mid-page',
  bottom: 'Bottom',
  offer: 'Offer/CTA',
};

export function BannerAnalyticsWidget() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['banner-analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/banners/analytics');
      return data.data as BannerAnalytics;
    },
    refetchInterval: 60_000, // auto-refresh every minute
  });

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3 h-[120px] justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-surface-400">Loading banner analytics…</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card p-5">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-surface-500">Failed to load banner analytics</p>
          <button onClick={() => refetch()} className="btn-outline btn-sm mt-3">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasData = data.totalBanners > 0;
  const barData = data.byPosition.map((p) => ({
    name: POSITION_LABELS[p.position] || p.position,
    clicks: p.clicks,
    count: p.count,
  }));

  const pageClickData = data.byPageType.map((p) => ({
    name: PAGE_LABELS[p.pageType] || p.pageType,
    clicks: p.clicks,
    banners: p.count,
    avg: p.count > 0 ? (p.clicks / p.count).toFixed(1) : '0',
  }));

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-surface-700">Banner Analytics</h2>
        </div>
        {data.totalClicks > 0 && (
          <span className="badge-primary text-[10px]">{data.totalClicks} total clicks</span>
        )}
      </div>

      {/* KPI Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="stat-card group">
          <div className="p-2.5 rounded-xl bg-primary shadow-sm"><ImageIcon className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Total Banners</p>
            <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{data.totalBanners}</p>
          </div>
        </div>
        <div className="stat-card group">
          <div className="p-2.5 rounded-xl bg-amber-500 shadow-sm"><MousePointerClick className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Total Clicks</p>
            <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{data.totalClicks}</p>
            {data.totalBanners > 0 && (
              <p className="text-xs text-surface-400 mt-0.5">{(data.totalClicks / data.totalBanners).toFixed(1)} avg/banner</p>
            )}
          </div>
        </div>
        <div className="stat-card group">
          <div className="p-2.5 rounded-xl bg-emerald-500 shadow-sm"><Eye className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Active</p>
            <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{data.activeBanners}</p>
            {data.totalBanners > 0 && (
              <p className="text-xs text-surface-400 mt-0.5">{Math.round((data.activeBanners / data.totalBanners) * 100)}%</p>
            )}
          </div>
        </div>
        <div className="stat-card group">
          <div className="p-2.5 rounded-xl bg-surface-400 shadow-sm"><EyeOff className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Inactive</p>
            <p className="text-2xl font-bold text-surface-900 mt-0.5 group-hover:text-primary transition-colors">{data.inactiveBanners}</p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-2">
            <ImageIcon className="w-6 h-6 text-surface-300" />
          </div>
          <p className="text-sm text-surface-400">No banners created yet</p>
          <p className="text-xs text-surface-300 mt-1">Create banners to see analytics</p>
        </div>
      ) : (
        <>
          {/* Page Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {pageClickData.map((page) => (
              <div
                key={page.name}
                className={`rounded-xl p-4 border ${
                  page.clicks > 0 ? 'bg-white border-surface-200' : 'bg-surface-50 border-surface-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">
                    {page.name}
                  </span>
                  <span className={`text-xs font-bold ${page.clicks > 0 ? 'text-primary' : 'text-surface-400'}`}>
                    {page.clicks} click{page.clicks !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-surface-500">
                    <ImageIcon className="w-3 h-3" />
                    <span>{page.banners} banner{page.banners !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-surface-400">avg </span>
                    <span className="text-xs font-semibold text-surface-600">{page.avg}/banner</span>
                  </div>
                </div>
                {/* Mini progress bar */}
                {data.totalClicks > 0 && (
                  <div className="mt-2.5 h-1 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(page.clicks / data.totalClicks) * 100}%`,
                        backgroundColor: page.clicks > 0 ? 'hsl(357, 92.4%, 46.7%)' : 'transparent',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Bar Chart: Clicks by Page */}
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
              <p className="text-xs font-medium text-surface-500 mb-3">Clicks by Page</p>
              {pageClickData.every((d) => d.clicks === 0) ? (
                <div className="h-[180px] flex items-center justify-center text-xs text-surface-400">
                  No click data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={pageClickData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 87%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(0, 0%, 55%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(0, 0%, 55%)' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid hsl(0, 0%, 93%)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'clicks' ? `${value} clicks` : value,
                        name === 'clicks' ? 'Clicks' : name,
                      ]}
                    />
                    <Bar dataKey="clicks" fill="hsl(357, 92.4%, 46.7%)" radius={[4, 4, 0, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar Chart: Clicks by Position */}
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
              <p className="text-xs font-medium text-surface-500 mb-3">Clicks by Position</p>
              {barData.every((d) => d.clicks === 0) ? (
                <div className="h-[180px] flex items-center justify-center text-xs text-surface-400">
                  No click data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 87%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(0, 0%, 55%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(0, 0%, 55%)' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid hsl(0, 0%, 93%)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="clicks" fill="hsl(357, 92.4%, 46.7%)" radius={[4, 4, 0, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Banners Table */}
          {data.topBanners.length > 0 && (
            <div>
              <p className="text-xs font-medium text-surface-500 mb-2.5">Top Performing Banners</p>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-xs">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-surface-500 font-semibold">Banner</th>
                      <th className="px-4 py-2 text-left text-surface-500 font-semibold">Page</th>
                      <th className="px-4 py-2 text-left text-surface-500 font-semibold">Position</th>
                      <th className="px-4 py-2 text-right text-surface-500 font-semibold">Clicks</th>
                      <th className="px-4 py-2 text-center text-surface-500 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {data.topBanners.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-6 rounded-md bg-surface-100 overflow-hidden shrink-0">
                              {b.imageUrl ? (
                                <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-3 h-3 text-surface-300" />
                                </div>
                              )}
                            </div>
                            <span className="text-surface-700 font-medium truncate max-w-[160px]">
                              {b.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-surface-500 capitalize">
                          {PAGE_LABELS[b.pageType] || b.pageType}
                        </td>
                        <td className="px-4 py-2.5 text-surface-500">
                          {POSITION_LABELS[b.position] || b.position}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-surface-900">
                          {b.clicks}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${
                              b.isActive
                                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                                : 'bg-surface-300'
                            }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
