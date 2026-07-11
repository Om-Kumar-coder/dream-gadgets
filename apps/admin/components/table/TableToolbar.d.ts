import { Table } from '@tanstack/react-table';
interface TableToolbarProps<TData> {
    table: Table<TData>;
    enableFilters?: boolean;
    enableSearch?: boolean;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    children?: React.ReactNode;
}
export declare function TableToolbar<TData>({ table, enableFilters, enableSearch, globalFilter, onGlobalFilterChange, children, }: TableToolbarProps<TData>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TableToolbar.d.ts.map