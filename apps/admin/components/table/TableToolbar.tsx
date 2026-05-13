'use client';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0A0A0A] rounded-xl border border-[#2a2a2a]">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {enableSearch && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              value={globalFilter ?? ''}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 h-9 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600
                         focus:outline-none focus:border-[#00FF9C] focus:ring-1 focus:ring-[#00FF9C] transition-all duration-200"
              style={{ boxShadow: globalFilter ? '0 0 6px rgba(0,255,156,0.2)' : undefined }}
            />
            {globalFilter && (
              <button onClick={() => onGlobalFilterChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#FF2D2D] transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {enableFilters && table.getState().columnFilters.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#FF2D2D] text-xs font-medium">Filters:</span>
            {table.getState().columnFilters.map((filter) => (
              <span key={filter.id} className="bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 text-[#FF2D2D] px-2 py-0.5 rounded text-xs">
                {filter.id}: {String(filter.value)}
              </span>
            ))}
            <button onClick={() => table.resetColumnFilters()}
              className="text-gray-600 hover:text-[#00FF9C] text-xs transition-colors">
              Clear
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
