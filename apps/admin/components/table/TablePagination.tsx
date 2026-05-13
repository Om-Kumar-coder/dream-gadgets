import { Table } from '@tanstack/react-table';

interface TablePaginationProps {
  table: Table<any>;
  total: number;
}

export function TablePagination({ table, total }: TablePaginationProps) {
  const page = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const btnClass = 'px-3 py-1 rounded border border-[#2a2a2a] text-xs text-gray-500 hover:border-[#00FF9C] hover:text-[#00FF9C] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#2a2a2a] disabled:hover:text-gray-500';

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span className="text-xs">
          Showing <span className="text-white font-medium">{start}</span>–
          <span className="text-white font-medium">{end}</span> of{' '}
          <span className="text-[#00FF9C] font-medium">{total}</span>
        </span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-[#00FF9C] transition-colors"
        >
          {[10, 20, 50, 100].map(n => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className={btnClass}>« First</button>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={btnClass}>← Prev</button>
        <span className="px-3 py-1 text-xs text-gray-400">
          Page <span className="text-white font-medium">{page}</span> of{' '}
          <span className="text-white font-medium">{table.getPageCount()}</span>
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={btnClass}>Next →</button>
        <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className={btnClass}>Last »</button>
      </div>
    </div>
  );
}
