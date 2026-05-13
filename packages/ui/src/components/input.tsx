import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={[
          'flex h-9 w-full rounded-lg px-3 py-1 text-sm transition-all duration-200',
          'bg-[#0f0f0f] border border-[#2a2a2a] text-white',
          'placeholder:text-gray-600',
          'focus-visible:outline-none focus-visible:border-[#00FF9C] focus-visible:ring-1 focus-visible:ring-[#00FF9C]',
          'focus-visible:[box-shadow:0_0_8px_rgba(0,255,156,0.3)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-300',
          className,
        ].filter(Boolean).join(' ')}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
