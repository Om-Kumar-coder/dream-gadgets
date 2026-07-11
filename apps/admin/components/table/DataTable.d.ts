import { ColumnDef, Table as ReactTable } from '@tanstack/react-table';
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
export declare function DataTable<TData, TFilter>({ columns, queryKey, apiEndpoint, filterSchema, defaultFilters, enableSorting, enableFilters, enablePagination, enableRowSelection, actions, renderEmptyState, renderNoResults, pageSize, className, queryParams, }: DataTableProps<TData, TFilter>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DataTable.d.ts.map