'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { FileText, Download, ChevronDown, ChevronRight, Building2, Users, Receipt, RotateCcw, } from 'lucide-react';
// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatINR(val) {
    return `₹${Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
function todayISO() {
    return new Date().toISOString().split('T')[0];
}
function thirtyDaysAgoISO() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
}
// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, count, value, icon: Icon, color, }) {
    return (_jsxs("div", { className: "bg-white rounded-xl border border-surface-200 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow", children: [_jsx("div", { className: `p-2.5 rounded-lg ${color}`, children: _jsx(Icon, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-surface-500 font-medium uppercase tracking-wide truncate", children: title }), _jsx("p", { className: "text-2xl font-bold text-surface-900 mt-0.5", children: value }), _jsxs("p", { className: "text-xs text-surface-400 mt-0.5", children: [count, " ", typeof count === 'number' ? 'entries' : ''] })] })] }));
}
// ─── Collapsible Section ─────────────────────────────────────────────────────
function CollapsibleSection({ title, count, icon: Icon, defaultOpen = false, children, }) {
    const [open, setOpen] = useState(defaultOpen);
    return (_jsxs("div", { className: "card overflow-hidden", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Icon, { className: "w-5 h-5 text-surface-500" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold text-surface-900", children: title }), _jsxs("p", { className: "text-xs text-surface-400", children: [count, " ", count === 1 ? 'entry' : 'entries'] })] })] }), open ? (_jsx(ChevronDown, { className: "w-4 h-4 text-surface-400" })) : (_jsx(ChevronRight, { className: "w-4 h-4 text-surface-400" }))] }), open && _jsx("div", { className: "border-t border-surface-100", children: children })] }));
}
// ─── Table wrapper ───────────────────────────────────────────────────────────
function DataTable({ headers, rows, renderRow, }) {
    if (rows.length === 0) {
        return (_jsx("div", { className: "px-5 py-8 text-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "No entries found" }) }));
    }
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-surface-100 bg-surface-50/50", children: headers.map((h) => (_jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap", children: h }, h))) }) }), _jsx("tbody", { children: rows.map((row, i) => (_jsx("tr", { className: "border-b border-surface-50 hover:bg-surface-50/50 transition-colors", children: renderRow(row, i) }, i))) })] }) }));
}
// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GstReportPage() {
    const [fromDate, setFromDate] = useState(thirtyDaysAgoISO);
    const [toDate, setToDate] = useState(todayISO);
    const [branchId, setBranchId] = useState('');
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    // Fetch branches for the selector
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: () => apiClient.get('/admin/branches').then((r) => r.data?.data ?? r.data ?? []),
    });
    const branches = Array.isArray(branchesData)
        ? branchesData
        : Array.isArray(branchesData?.data)
            ? branchesData.data
            : [];
    // Fetch GSTR-1 data
    const { data: gstResponse, isLoading, isError, error, refetch, } = useQuery({
        queryKey: ['gstr1', fromDate, toDate, branchId],
        queryFn: () => apiClient
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
        }
        catch (err) {
            setExportError(err instanceof Error ? err.message : 'Export failed');
        }
        finally {
            setExporting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "heading-sm text-surface-900", children: "GSTR-1 Report" }), _jsx("p", { className: "text-sm text-surface-500 mt-0.5", children: "Monthly GST return \u2014 B2B, B2CL, B2CS & CDNR classification" })] }), _jsx("button", { onClick: handleExport, disabled: exporting || isLoading || !data, className: cn('btn-primary btn-md'), children: exporting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Generating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "w-4 h-4" }), "Download Excel"] })) })] }), exportError && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsxs("span", { children: ["Export failed: ", exportError] })] })), _jsx("div", { className: "card p-5", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1.5", children: "From Date" }), _jsx("input", { type: "date", value: fromDate, onChange: (e) => setFromDate(e.target.value), max: toDate, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1.5", children: "To Date" }), _jsx("input", { type: "date", value: toDate, onChange: (e) => setToDate(e.target.value), min: fromDate, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-surface-600 mb-1.5", children: "Branch" }), _jsxs("select", { value: branchId, onChange: (e) => setBranchId(e.target.value), className: "select", children: [_jsx("option", { value: "", children: "All Branches" }), branches.map((b) => (_jsxs("option", { value: b.id, children: [b.name, " (", b.code, ")"] }, b.id)))] })] })] }) }), isLoading && (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-sm text-gray-500", children: "Generating GSTR-1 data..." })] }) })), isError && !isLoading && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center", children: [_jsx("p", { className: "font-semibold mb-1", children: "Failed to load GSTR-1 data" }), _jsx("p", { className: "text-sm text-red-500 mb-4", children: error?.message || 'Please check your date range and try again.' }), _jsx("button", { onClick: () => refetch(), className: "px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors", children: "Retry" })] })), summary && !isLoading && (_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KpiCard, { title: "B2B", count: summary.totalB2bInvoices, value: formatINR(summary.totalB2bValue), icon: Building2, color: "bg-blue-500" }), _jsx(KpiCard, { title: "B2CL (Large)", count: summary.totalB2clInvoices, value: formatINR(summary.totalB2clValue), icon: Users, color: "bg-violet-500" }), _jsx(KpiCard, { title: "B2CS (Small)", count: "Aggregated", value: formatINR(summary.totalB2csValue), icon: Receipt, color: "bg-emerald-500" }), _jsx(KpiCard, { title: "CDNR (Credit Notes)", count: summary.totalCdnrNotes, value: formatINR(summary.totalCdnrValue), icon: RotateCcw, color: "bg-amber-500" })] })), summary && !isLoading && (_jsxs("div", { className: "card p-5", children: [_jsx("p", { className: "text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3", children: "Tax Summary" }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Total Taxable Value" }), _jsx("p", { className: "text-lg font-bold text-surface-900", children: formatINR(summary.totalTaxableValue) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Total CGST" }), _jsx("p", { className: "text-lg font-bold text-blue-600", children: formatINR(summary.totalCgst) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Total SGST" }), _jsx("p", { className: "text-lg font-bold text-emerald-600", children: formatINR(summary.totalSgst) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-400", children: "Total IGST" }), _jsx("p", { className: "text-lg font-bold text-violet-600", children: formatINR(summary.totalIgst) })] })] })] })), data && !isLoading && (_jsxs("div", { className: "space-y-4", children: [_jsx(CollapsibleSection, { title: "B2B \u2014 Business to Business (Registered)", count: data.b2b.length, icon: Building2, defaultOpen: true, children: _jsx(DataTable, { headers: ['Invoice No', 'Date', 'Customer GSTIN', 'Customer', 'Place of Supply', 'Type', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total'], rows: data.b2b, renderRow: (row) => (_jsxs(_Fragment, { children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900 whitespace-nowrap", children: row.invoiceNumber }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.invoiceDate }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap", children: row.customerGstin }), _jsx("td", { className: "px-4 py-3 text-gray-700 max-w-[160px] truncate", children: row.customerName }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.placeOfSupply }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("span", { className: cn('text-xs font-medium px-2 py-0.5 rounded-full', row.supplyType === 'Inter-State' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'), children: row.supplyType === 'Inter-State' ? 'Inter' : 'Intra' }) }), _jsx("td", { className: "px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap", children: formatINR(row.totalTaxableValue) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-blue-600 whitespace-nowrap", children: formatINR(row.totalCgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-emerald-600 whitespace-nowrap", children: formatINR(row.totalSgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap", children: formatINR(row.totalIgst) }), _jsx("td", { className: "px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap", children: formatINR(row.totalAmount) })] })) }) }), _jsx(CollapsibleSection, { title: "B2CL \u2014 B2C Large (Inter-state > \u20B92.5L)", count: data.b2cl.length, icon: Users, children: _jsx(DataTable, { headers: ['Invoice No', 'Date', 'Place of Supply', 'Taxable Value', 'Rate', 'IGST', 'Total'], rows: data.b2cl, renderRow: (row) => (_jsxs(_Fragment, { children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900 whitespace-nowrap", children: row.invoiceNumber }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.invoiceDate }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.placeOfSupply }), _jsx("td", { className: "px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap", children: formatINR(row.taxableValue) }), _jsxs("td", { className: "px-4 py-3 text-right tabular-nums whitespace-nowrap", children: [row.taxRate, "%"] }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap", children: formatINR(row.igst) }), _jsx("td", { className: "px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap", children: formatINR(row.totalAmount) })] })) }) }), _jsx(CollapsibleSection, { title: "B2CS \u2014 B2C Small (Aggregated by Rate)", count: data.b2cs.length, icon: Receipt, children: _jsx(DataTable, { headers: ['Tax Rate', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total'], rows: data.b2cs, renderRow: (row) => (_jsxs(_Fragment, { children: [_jsxs("td", { className: "px-4 py-3 font-medium text-gray-900 whitespace-nowrap", children: [row.rate, "%"] }), _jsx("td", { className: "px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap", children: formatINR(row.taxableValue) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-blue-600 whitespace-nowrap", children: formatINR(row.cgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-emerald-600 whitespace-nowrap", children: formatINR(row.sgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-violet-600 whitespace-nowrap", children: formatINR(row.igst) }), _jsx("td", { className: "px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap", children: formatINR(row.totalAmount) })] })) }) }), _jsx(CollapsibleSection, { title: "CDNR \u2014 Credit/Debit Notes", count: data.cdnr.length, icon: RotateCcw, children: _jsx(DataTable, { headers: ['Return No', 'Date', 'Original Invoice', 'Reason', 'Place of Supply', 'Taxable Value', 'Rate', 'CGST', 'SGST', 'IGST', 'Refund', 'Type'], rows: data.cdnr, renderRow: (row) => (_jsxs(_Fragment, { children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900 whitespace-nowrap", children: row.returnNumber }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.returnDate }), _jsx("td", { className: "px-4 py-3 text-gray-600 max-w-[120px] truncate", children: row.originalInvoiceNumber || '—' }), _jsx("td", { className: "px-4 py-3 text-gray-600 max-w-[160px] truncate", title: row.reason, children: row.reason }), _jsx("td", { className: "px-4 py-3 text-gray-600 whitespace-nowrap", children: row.placeOfSupply }), _jsx("td", { className: "px-4 py-3 text-right font-medium tabular-nums text-red-600 whitespace-nowrap", children: formatINR(row.taxableValue) }), _jsxs("td", { className: "px-4 py-3 text-right tabular-nums whitespace-nowrap", children: [row.taxRate, "%"] }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap", children: formatINR(row.cgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap", children: formatINR(row.sgst) }), _jsx("td", { className: "px-4 py-3 text-right tabular-nums text-red-500 whitespace-nowrap", children: formatINR(row.igst) }), _jsx("td", { className: "px-4 py-3 text-right font-bold tabular-nums text-red-600 whitespace-nowrap", children: formatINR(row.refundAmount) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("span", { className: cn('text-xs font-medium px-2 py-0.5 rounded-full', row.noteType === 'Credit' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'), children: row.noteType }) })] })) }) })] })), !isLoading && !isError && data && (data.b2b.length === 0 && data.b2cl.length === 0 && data.b2cs.length === 0 && data.cdnr.length === 0 && (_jsxs("div", { className: "card p-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-surface-300 mx-auto mb-4" }), _jsx("h3", { className: "text-base font-semibold text-surface-900 mb-1", children: "No GSTR-1 Data" }), _jsxs("p", { className: "text-sm text-surface-500 max-w-sm mx-auto", children: ["No sales or returns found in the selected period", branchId ? ' for this branch' : '', ". Try a different date range."] })] })))] }));
}
//# sourceMappingURL=page.js.map