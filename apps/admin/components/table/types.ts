export interface TableMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortOption {
  id: string;
  desc: boolean;
}

export interface FilterOption {
  id: string;
  value: unknown;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<TData, TFilter> {
  columns: any[];
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
  renderEmptyState?: (table: any) => React.ReactNode;
  renderNoResults?: (table: any) => React.ReactNode;
  pageSize?: number;
  className?: string;
}
