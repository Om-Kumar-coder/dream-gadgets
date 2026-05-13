import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <select
        className={[
          'flex h-9 w-full rounded-lg px-3 py-1 text-sm transition-all duration-200',
          'bg-[#0f0f0f] border border-[#2a2a2a] text-white',
          'focus-visible:outline-none focus-visible:border-[#00FF9C] focus-visible:ring-1 focus-visible:ring-[#00FF9C]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className,
        ].filter(Boolean).join(' ')}
        ref={ref}
        {...props}
      >
        {placeholder && <option value="" className="bg-[#0f0f0f]">{placeholder}</option>}
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
