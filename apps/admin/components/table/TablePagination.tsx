import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  table: Table<any>;
  total: number;
}

export function TablePagination({ table, total }: TablePaginationProps) {
  const page = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-surface-500">
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-medium text-surface-900">{start}</span>–
          <span className="font-medium text-surface-900">{end}</span> of{' '}
          <span className="font-medium text-surface-900">{total}</span>
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="select text-xs py-1.5 px-2 rounded-lg w-auto"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 text-xs text-surface-500">
          Page <span className="font-semibold text-surface-900">{page}</span> of{' '}
          <span className="font-semibold text-surface-900">{table.getPageCount()}</span>
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
