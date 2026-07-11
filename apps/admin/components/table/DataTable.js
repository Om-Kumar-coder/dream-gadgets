'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender, getFilteredRowModel, } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { TableToolbar } from './TableToolbar';
import { TablePagination } from './TablePagination';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';
export function DataTable({ columns, queryKey, apiEndpoint, filterSchema, defaultFilters = {}, enableSorting = true, enableFilters = true, enablePagination = true, enableRowSelection = false, actions = [], renderEmptyState, renderNoResults, pageSize = 20, className, queryParams, }) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize,
    });
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: [
            ...queryKey,
            pagination.pageIndex,
            pagination.pageSize,
            sorting,
            columnFilters,
            globalFilter,
        ],
        queryFn: async () => {
            const params = {
                ...queryParams,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: globalFilter,
            };
            if (enableSorting && sorting.length > 0) {
                const sort = sorting[0];
                params.sort = `${sort.id}:${sort.desc ? 'desc' : 'asc'}`;
            }
            if (enableFilters && columnFilters.length > 0) {
                const filters = {};
                for (const filter of columnFilters) {
                    filters[filter.id] = filter.value;
                }
                params.filters = filters;
            }
            const { data } = await apiClient.get(apiEndpoint, { params });
            return data;
        },
    });
    const tableData = useMemo(() => {
        const payload = data;
        if (!payload)
            return [];
        if (Array.isArray(payload.data))
            return payload.data;
        if (Array.isArray(payload))
            return payload;
        return [];
    }, [data]);
    const total = data?.meta?.total ?? (Array.isArray(data?.data) ? data.data.length : 0);
    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: enableFilters ? getFilteredRowModel() : undefined,
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
        rowCount: total,
    });
    if (isError) {
        return (_jsx("div", { className: "card p-8", children: _jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-red-500" }) }), _jsx("h3", { className: "text-base font-semibold text-surface-900", children: "Failed to load data" }), _jsx("p", { className: "text-surface-500 text-sm mt-1", children: error instanceof Error ? error.message : 'An unexpected error occurred' }), _jsxs("button", { onClick: () => refetch(), className: "btn-outline btn-sm mt-4", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5" }), "Try Again"] })] }) }));
    }
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [_jsx(TableToolbar, { table: table, enableFilters: enableFilters, enableSearch: true, globalFilter: globalFilter, onGlobalFilterChange: setGlobalFilter }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "table-header", children: table.getHeaderGroups().map((headerGroup) => (_jsxs("tr", { children: [enableRowSelection && (_jsx("th", { className: "px-4 py-3 w-10", children: _jsx("input", { type: "checkbox", checked: table.getIsAllRowsSelected(), onChange: table.getToggleAllRowsSelectedHandler(), className: "rounded border-surface-300 text-primary focus:ring-primary/30" }) })), headerGroup.headers.map((header) => (_jsx("th", { className: "px-4 py-3 text-left cursor-pointer hover:bg-surface-100 select-none", onClick: header.column.getToggleSortingHandler(), children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-surface-500", children: flexRender(header.column.columnDef.header, header.getContext()) }), enableSorting && header.column.getIsSorted() && (_jsx("span", { className: "text-surface-400 text-[10px]", children: header.column.getIsSorted() === 'desc' ? '▼' : '▲' }))] }) }, header.id))), actions.length > 0 && (_jsx("th", { className: "px-4 py-3 text-left w-24", children: _jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-surface-500", children: "Actions" }) }))] }, headerGroup.id))) }), _jsx("tbody", { className: "divide-y divide-surface-100", children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length +
                                                (enableRowSelection ? 1 : 0) +
                                                (actions.length > 0 ? 1 : 0), className: "px-4 py-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-surface-400", children: "Loading data..." })] }) }) })) : table.getRowModel().rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length +
                                                (enableRowSelection ? 1 : 0) +
                                                (actions.length > 0 ? 1 : 0), className: "px-4 py-12 text-center", children: renderNoResults ? renderNoResults(table) : (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-2", children: _jsx(Search, { className: "w-6 h-6 text-surface-400" }) }), _jsx("p", { className: "text-surface-500 font-medium", children: "No results found" }), _jsx("button", { onClick: () => {
                                                            table.resetGlobalFilter();
                                                            table.resetColumnFilters();
                                                        }, className: "text-primary hover:underline text-sm", children: "Clear filters" })] })) }) })) : (table.getRowModel().rows.map((row) => (_jsxs("tr", { className: "table-row", children: [enableRowSelection && (_jsx("td", { className: "px-4 py-3", children: _jsx("input", { type: "checkbox", checked: row.getIsSelected(), onChange: row.getToggleSelectedHandler(), className: "rounded border-surface-300 text-primary focus:ring-primary/30" }) })), row.getVisibleCells().map((cell) => (_jsx("td", { className: "table-cell", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))), actions.length > 0 && (_jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "flex items-center gap-1", children: actions.map((action, idx) => {
                                                        const isVisible = action.visible
                                                            ? action.visible(row.original)
                                                            : true;
                                                        if (!isVisible)
                                                            return null;
                                                        return (_jsx("button", { onClick: () => action.onClick(row.original), className: "p-1.5 rounded-lg text-surface-400 hover:text-primary hover:bg-primary/5 transition-all", title: action.label, children: action.icon ?? '•••' }, idx));
                                                    }) }) }))] }, row.id)))) })] }) }), enablePagination && total > 0 && (_jsx("div", { className: "p-4 border-t border-surface-100", children: _jsx(TablePagination, { table: table, total: total }) }))] })] }));
}
//# sourceMappingURL=DataTable.js.map