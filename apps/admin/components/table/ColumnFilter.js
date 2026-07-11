import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from '@dream-gadgets/ui';
import { Select } from '@dream-gadgets/ui';
import { Search } from 'lucide-react';
export function ColumnFilter({ columnId, columnType = 'text', options = [], placeholder, value, onChange, }) {
    const renderInput = () => {
        switch (columnType) {
            case 'select':
                return (_jsxs(Select, { value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? `Filter ${columnId}`, className: "w-full text-sm", children: [_jsx("option", { value: "", children: "All" }), options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] }));
            case 'number':
                return (_jsx(Input, { type: "number", value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? `Filter ${columnId}`, className: "w-full" }));
            case 'date':
                return (_jsx(Input, { type: "date", value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? `Filter ${columnId}`, className: "w-full" }));
            case 'text':
            default:
                return (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" }), _jsx(Input, { type: "text", value: value ?? '', onChange: (e) => onChange(e.target.value), placeholder: placeholder ?? `Filter ${columnId}`, className: "pl-9" })] }));
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-medium text-surface-500 w-24 truncate", children: columnId }), _jsx("div", { className: "flex-1 min-w-[120px]", children: renderInput() })] }));
}
//# sourceMappingURL=ColumnFilter.js.map