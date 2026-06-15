import { Input } from '@dream-gadgets/ui';
import { Select } from '@dream-gadgets/ui';
import { Search } from 'lucide-react';

interface ColumnFilterProps {
  columnId: string;
  columnType: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColumnFilter({
  columnId,
  columnType = 'text',
  options = [],
  placeholder,
  value,
  onChange,
}: ColumnFilterProps) {
  const renderInput = () => {
    switch (columnType) {
      case 'select':
        return (
          <Select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Filter ${columnId}`}
            className="w-full text-sm"
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Filter ${columnId}`}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Filter ${columnId}`}
            className="w-full"
          />
        );

      case 'text':
      default:
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder ?? `Filter ${columnId}`}
              className="pl-9"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-surface-500 w-24 truncate">{columnId}</span>
      <div className="flex-1 min-w-[120px]">{renderInput()}</div>
    </div>
  );
}
