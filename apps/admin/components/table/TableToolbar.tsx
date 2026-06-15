import { Input } from '@dream-gadgets/ui';
import { Search, X } from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  enableFilters?: boolean;
  enableSearch?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function TableToolbar<TData>({
  table,
  enableFilters = true,
  enableSearch = true,
  globalFilter,
  onGlobalFilterChange,
  children,
}: TableToolbarProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-surface-100 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {enableSearch && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={globalFilter ?? ''}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              placeholder="Search..."
              className="input pl-9 py-2 text-sm"
            />
            {globalFilter && (
              <button
                onClick={() => onGlobalFilterChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {enableFilters && table.getState().columnFilters.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <span className="font-medium">Filters:</span>
            {table.getState().columnFilters.map((filter) => (
              <span key={filter.id} className="badge-neutral text-[10px]">
                {filter.id}: {String(filter.value)}
              </span>
            ))}
            <button
              onClick={() => table.resetColumnFilters()}
              className="text-primary hover:underline text-xs ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
