import { Input } from '@dream-gadgets/ui';
import { Search } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {enableSearch && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={globalFilter ?? ''}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              placeholder="Search..."
              className="pl-9"
            />
          </div>
        )}

        {enableFilters && table.getColumnFilters().length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Filters applied:</span>
            {table.getColumnFilters().map((filter) => (
              <span key={filter.id} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                {filter.id}: {String(filter.value)}
              </span>
            ))}
            <button
              onClick={() => table.resetColumnFilters()}
              className="text-blue-600 hover:underline text-xs ml-2"
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
