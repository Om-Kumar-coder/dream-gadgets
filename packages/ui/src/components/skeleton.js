import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
const Skeleton = React.forwardRef(({ className, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: `animate-pulse rounded-md bg-gray-200 ${className}`, ...props }));
});
Skeleton.displayName = 'Skeleton';
export { Skeleton };
//# sourceMappingURL=skeleton.js.map