'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
export default function Template({ children }) {
    const [isEntering, setIsEntering] = useState(false);
    const pathname = usePathname();
    const isFirstMount = useRef(true);
    useEffect(() => {
        // Skip animation on initial page load to avoid flash
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        setIsEntering(true);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsEntering(false);
            });
        });
    }, [pathname]);
    return (_jsx("div", { className: `transition-all duration-300 ease-out ${isEntering ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`, children: children }));
}
//# sourceMappingURL=template.js.map