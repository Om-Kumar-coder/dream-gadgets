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
  renderEmptyState?: (table: ReactTable<TData>) => React.ReactNode;
  renderNoResults?: (table: ReactTable<TData>) => React.ReactNode;
  pageSize?: number;
  className?: string;
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
}: DataTableProps<TData, TFilter>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const { data, isLoading, isError, error } = useQuery({
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

  const tableData = useMemo(() => data?.data?.items ?? [], [data]);
  const total = data?.data?.total ?? 0;

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900">Failed to load data</h3>
        <p className="text-gray-500 text-sm mt-1">
          {error instanceof Error ? error.message : 'Please try again'}
        </p>
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {enableRowSelection && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {enableSorting && header.column.getIsSorted() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'desc'
                              ? '▼'
                              : '▲'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-left w-32">Actions</th>
                  )}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (enableRowSelection ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Loading...
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
                        <div className="text-gray-400 text-4xl mb-2">🔍</div>
                        <p className="text-gray-500">No results found</p>
                        <button
                          onClick={() => {
                            table.resetGlobalFilter();
                            table.resetColumnFilters();
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {enableRowSelection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {actions.map((action, idx) => {
                            const isVisible = action.visible
                              ? action.visible(row.original)
                              : true;
                            if (!isVisible) return null;
                            return (
                              <button
                                key={idx}
                                onClick={() => action.onClick(row.original)}
                                className="text-gray-600 hover:text-blue-600 transition-colors"
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
          <div className="p-4 border-t border-gray-100">
            <TablePagination table={table} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}
