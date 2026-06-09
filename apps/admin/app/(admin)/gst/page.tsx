'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Receipt,
  RotateCcw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface B2bEntry {
  invoiceNumber: string;
  invoiceDate: string;
  customerGstin: string;
  customerName: string;
  placeOfSupply: string;
  supplyType: 'Inter-State' | 'Intra-State';
  items: Array<{
    hsnCode: string;
    taxableValue: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  }>;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalAmount: number;
}

interface B2clEntry {
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  taxableValue: number;
  taxRate: number;
  igst: number;
  totalAmount: number;
}

interface B2csEntry {
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

interface CdnrEntry {
  returnNumber: string;
  returnDate: string;
  originalInvoiceNumber: string | null;
  reason: string;
  placeOfSupply: string;
  taxableValue: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  refundAmount: number;
  noteType: string;
}

interface GstSummary {
  totalB2bInvoices: number;
  totalB2bValue: number;
  totalB2clInvoices: number;
  totalB2clValue: number;
  totalB2csValue: number;
  totalCdnrNotes: number;
  totalCdnrValue: number;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
}

interface Gstr1Response {
  status: string;
  data: {
    b2b: B2bEntry[];
    b2cl: B2clEntry[];
    b2cs: B2csEntry[];
    cdnr: CdnrEntry[];
  };
  summary: GstSummary;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  return `₹${Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function thirtyDaysAgoISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  count,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  count: string | number;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{count} {typeof count === 'number' ? 'entries' : ''}</p>
      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  count,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-400">{count} {count === 1 ? 'entry' : 'entries'}</p>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Table wrapper ───────────────────────────────────────────────────────────

function DataTable({
  headers,
  rows,
  renderRow,
}: {
  headers: string[];
  rows: any[];
  renderRow: (row: any, i: number) => React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GstReportPage() {
  const [fromDate, setFromDate] = useState(thirtyDaysAgoISO);
  const [toDate, setToDate] = useState(todayISO);
  const [branchId, setBranchId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Fetch branches for the selector
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => apiClient.get('/admin/branches').then((r) => r.data?.data ?? r.data ?? []),
  });

  const branches: Branch[] = Array.isArray(branchesData)
    ? branchesData
    : Array.isArray((branchesData as any)?.data)
      ? (branchesData as any).data
      : [];

  // Fetch GSTR-1 data
  const {
    data: gstResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Gstr1Response>({
    queryKey: ['gstr1', fromDate, toDate, branchId],
    queryFn: () =>
      apiClient
        .get('/gst/gstr1', {
          params: { from: fromDate, to: toDate, ...(branchId && { branchId }) },
          timeout: 30000,
        })
        .then((r) => r.data),
    enabled: true,
  });

  const summary = gstResponse?.summary;
  const data = gstResponse?.data;

  // Export handler
  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await apiClient.get('/gst/gstr1/export', {
        params: { from: fromDate, to: toDate, ...(branchId && { branchId }) },
        responseType: 'blob',
        timeout: 60000,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `gstr1-${fromDate}-to-${toDate}${branchId ? `-branch-${branchId.slice(0, 8)}` : ''}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">GSTR-1 Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monthly GST return — B2B, B2CL, B2CS &amp; CDNR classification
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || isLoading || !data}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
            'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          )}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Excel
            </>
          )}
        </button>
      </div>

      {exportError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>Export failed: {exportError}</span>
        </div>
      )}

      {/* Filters: Date Range + Branch */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Generating GSTR-1 data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-semibold mb-1">Failed to load GSTR-1 data</p>
          <p className="text-sm text-red-500 mb-4">{(error as any)?.message || 'Please check your date range and try again.'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && !isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="B2B"
            count={summary.totalB2bInvoices}
            value={formatINR(summary.totalB2bValue)}
            icon={Building2}
            color="bg-blue-500"
          />
          <KpiCard
            title="B2CL (Large)"
            count={summary.totalB2clInvoices}
            value={formatINR(summary.totalB2clValue)}
            icon={Users}
            color="bg-violet-500"
          />
          <KpiCard
            title="B2CS (Small)"
            count="Aggregated"
            value={formatINR(summary.totalB2csValue)}
            icon={Receipt}
            color="bg-emerald-500"
          />
          <KpiCard
            title="CDNR (Credit Notes)"
            count={summary.totalCdnrNotes}
            value={formatINR(summary.totalCdnrValue)}
            icon={RotateCcw}
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Tax Totals Row */}
      {summary && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tax Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Total Taxable Value</p>
              <p className="text-lg font-bold text-gray-900">{formatINR(summary.totalTaxableValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total CGST</p>
              <p className="text-lg font-bold text-blue-600">{formatINR(summary.totalCgst)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total SGST</p>
              <p className="text-lg font-bold text-emerald-600">{formatINR(summary.totalSgst)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total IGST</p>
              <p className="text-lg font-bold text-violet-600">{formatINR(summary.totalIgst)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Tables */}
      {data && !isLoading && (
        <div className="space-y-4">
          {/* ── B2B ── */}
          <CollapsibleSection title="B2B — Business to Business (Registered)" count={data.b2b.length} icon={Building2} defaultOpen>
            <DataTable
              headers={['Invoice No', 'Date', 'Customer GSTIN', 'Customer', 'Place of Supply', 'Type', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total']}
              rows={data.b2b}
              renderRow={(row: B2bEntry) => (
                <>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.invoiceDate}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{row.customerGstin}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{row.customerName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.placeOfSupply}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      row.supplyType === 'Inter-State' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600',
                    )}>
                      {row.supplyType === 'Inter-State' ? 'Inter' : 'Intra'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">{formatINR(row.totalTaxableValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600 whitespace-nowrap">{formatINR(row.totalCgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 whitespace-nowrap">{formatINR(row.totalSgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap">{formatINR(row.totalIgst)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatINR(row.totalAmount)}</td>
                </>
              )}
            />
          </CollapsibleSection>

          {/* ── B2CL ── */}
          <CollapsibleSection title="B2CL — B2C Large (Inter-state > ₹2.5L)" count={data.b2cl.length} icon={Users}>
            <DataTable
              headers={['Invoice No', 'Date', 'Place of Supply', 'Taxable Value', 'Rate', 'IGST', 'Total']}
              rows={data.b2cl}
              renderRow={(row: B2clEntry) => (
                <>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.placeOfSupply}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">{formatINR(row.taxableValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{row.taxRate}%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap">{formatINR(row.igst)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatINR(row.totalAmount)}</td>
                </>
              )}
            />
          </CollapsibleSection>

          {/* ── B2CS ── */}
          <CollapsibleSection title="B2CS — B2C Small (Aggregated by Rate)" count={data.b2cs.length} icon={Receipt}>
            <DataTable
              headers={['Tax Rate', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total']}
              rows={data.b2cs}
              renderRow={(row: B2csEntry) => (
                <>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.rate}%</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">{formatINR(row.taxableValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600 whitespace-nowrap">{formatINR(row.cgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 whitespace-nowrap">{formatINR(row.sgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap">{formatINR(row.igst)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">{formatINR(row.totalAmount)}</td>
                </>
              )}
            />
          </CollapsibleSection>

          {/* ── CDNR ── */}
          <CollapsibleSection title="CDNR — Credit/Debit Notes" count={data.cdnr.length} icon={RotateCcw}>
            <DataTable
              headers={['Return No', 'Date', 'Original Invoice', 'Reason', 'Place of Supply', 'Taxable Value', 'Rate', 'CGST', 'SGST', 'IGST', 'Refund', 'Type']}
              rows={data.cdnr}
              renderRow={(row: CdnrEntry) => (
                <>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.returnNumber}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.returnDate}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{row.originalInvoiceNumber || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={row.reason}>{row.reason}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.placeOfSupply}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-red-600 whitespace-nowrap">{formatINR(row.taxableValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{row.taxRate}%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap">{formatINR(row.cgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap">{formatINR(row.sgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap">{formatINR(row.igst)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-red-600 whitespace-nowrap">{formatINR(row.refundAmount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      row.noteType === 'Credit' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600',
                    )}>
                      {row.noteType}
                    </span>
                  </td>
                </>
              )}
            />
          </CollapsibleSection>
        </div>
      )}

      {/* Empty state when loaded but no data */}
      {!isLoading && !isError && data && (
        data.b2b.length === 0 && data.b2cl.length === 0 && data.b2cs.length === 0 && data.cdnr.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No GSTR-1 Data</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              No sales or returns found in the selected period{branchId ? ' for this branch' : ''}. Try a different date range.
            </p>
          </div>
        )
      )}
    </div>
  );
}
