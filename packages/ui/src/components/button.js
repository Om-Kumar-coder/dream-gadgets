import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { cva } from 'class-variance-authority';
const buttonVariants = cva('inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', {
    variants: {
        variant: {
            default: 'bg-blue-600 text-white hover:bg-blue-700',
            outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
            ghost: 'hover:bg-gray-100 text-gray-700',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
            success: 'bg-green-600 text-white hover:bg-green-700',
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
});
const Button = React.forwardRef(({ className, variant, size, isLoading, icon, children, ...props }, ref) => {
    return (_jsxs("button", { ref: ref, className: buttonVariants({ variant, size, className }), disabled: isLoading || props.disabled, ...props, children: [isLoading && (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-current", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), !isLoading && icon && _jsx("span", { className: "mr-2", children: icon }), children] }));
});
Button.displayName = 'Button';
export { Button, buttonVariants };
//# sourceMappingURL=button.js.map