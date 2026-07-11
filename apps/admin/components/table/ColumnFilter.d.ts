interface ColumnFilterProps {
    columnId: string;
    columnType: 'text' | 'select' | 'date' | 'number';
    options?: {
        label: string;
        value: string;
    }[];
    placeholder?: string;
    value?: string;
    onChange: (value: string) => void;
}
export declare function ColumnFilter({ columnId, columnType, options, placeholder, value, onChange, }: ColumnFilterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ColumnFilter.d.ts.map