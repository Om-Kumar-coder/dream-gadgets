'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  Table as ReactTable,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { TableToolbar } from './TableToolbar';
import { TablePagination } from './TablePagination';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';

interface DataTableProps<TData, TFilter> {
  columns: ColumnDef<TData, any>[];
  queryKey: string[];
  apiEndpoint: string;
  filterSchema?: (filters: TFilter) => Record<string, unknown>;
  defaultFilters?: TFilter;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: TData) => void;
    visible?: (row: TData) => boolean;
  }[];
  renderEmptyState?: (table?: ReactTable<TData>) => React.ReactNode;
  renderNoResults?: (table?: ReactTable<TData>) => React.ReactNode;
  pageSize?: number;
  className?: string;
  queryParams?: Record<string, unknown>;
}

export function DataTable<TData, TFilter>({
  columns,
  queryKey,
  apiEndpoint,
  filterSchema,
  defaultFilters = {} as TFilter,
  enableSorting = true,
  enableFilters = true,
  enablePagination = true,
  enableRowSelection = false,
  actions = [],
  renderEmptyState,
  renderNoResults,
  pageSize = 20,
  className,
  queryParams,
}: DataTableProps<TData, TFilter>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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
      const params: Record<string, unknown> = {
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
        const filters: Record<string, unknown> = {};
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
    if (!payload) return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
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
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-surface-900">Failed to load data</h3>
          <p className="text-surface-500 text-sm mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button onClick={() => refetch()} className="btn-outline btn-sm mt-4">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <TableToolbar
        table={table}
        enableFilters={enableFilters}
        enableSearch={true}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {enableRowSelection && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="rounded border-surface-300 text-primary focus:ring-primary/30"
                      />
                    </th>
                  )}
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-surface-100 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {enableSorting && header.column.getIsSorted() && (
                          <span className="text-surface-400 text-[10px]">
                            {header.column.getIsSorted() === 'desc' ? '▼' : '▲'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-left w-24">
                      <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</span>
                    </th>
                  )}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-surface-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (enableRowSelection ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-surface-400">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (enableRowSelection ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    className="px-4 py-12 text-center"
                  >
                    {renderNoResults ? renderNoResults(table) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mx-auto mb-2">
                          <Search className="w-6 h-6 text-surface-400" />
                        </div>
                        <p className="text-surface-500 font-medium">No results found</p>
                        <button
                          onClick={() => {
                            table.resetGlobalFilter();
                            table.resetColumnFilters();
                          }}
                          className="text-primary hover:underline text-sm"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="table-row">
                    {enableRowSelection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                          className="rounded border-surface-300 text-primary focus:ring-primary/30"
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="table-cell">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {actions.map((action, idx) => {
                            const isVisible = action.visible
                              ? action.visible(row.original)
                              : true;
                            if (!isVisible) return null;
                            return (
                              <button
                                key={idx}
                                onClick={() => action.onClick(row.original)}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-primary hover:bg-primary/5 transition-all"
                                title={action.label}
                              >
                                {action.icon ?? '•••'}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {enablePagination && total > 0 && (
          <div className="p-4 border-t border-surface-100">
            <TablePagination table={table} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}
