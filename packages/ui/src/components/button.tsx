import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-[#0A0A0A] border border-[#FF2D2D] text-white hover:border-[#00FF9C] hover:text-[#00FF9C] hover:shadow-[0_0_12px_rgba(0,255,156,0.4)]',
        outline: 'border border-[#2a2a2a] bg-transparent text-gray-300 hover:border-[#00FF9C] hover:text-[#00FF9C] hover:shadow-[0_0_8px_rgba(0,255,156,0.3)]',
        ghost: 'text-gray-400 hover:text-[#00FF9C] hover:bg-[#00FF9C]/5',
        destructive: 'bg-[#FF2D2D]/10 border border-[#FF2D2D] text-[#FF2D2D] hover:bg-[#FF2D2D] hover:text-white hover:shadow-[0_0_12px_rgba(255,45,45,0.4)]',
        success: 'bg-[#00FF9C]/10 border border-[#00FF9C] text-[#00FF9C] hover:bg-[#00FF9C] hover:text-black hover:shadow-[0_0_12px_rgba(0,255,156,0.4)]',
        solid: 'bg-[#FF2D2D] text-white hover:bg-[#FF2D2D]/80 hover:shadow-[0_0_12px_rgba(255,45,45,0.5)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && icon && <span>{icon}</span>}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
