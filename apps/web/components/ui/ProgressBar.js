'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
export function ProgressBar() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const mountedRef = useRef(true);
    const complete = useCallback(() => {
        if (!mountedRef.current)
            return;
        setProgress(100);
        setTimeout(() => {
            if (!mountedRef.current)
                return;
            setVisible(false);
            setProgress(0);
        }, 400);
    }, []);
    useEffect(() => {
        mountedRef.current = true;
        setVisible(true);
        setProgress(0);
        const timers = [];
        timers.push(setTimeout(() => mountedRef.current && setProgress(20), 50));
        timers.push(setTimeout(() => mountedRef.current && setProgress(50), 200));
        timers.push(setTimeout(() => mountedRef.current && setProgress(80), 500));
        timers.push(setTimeout(complete, 800));
        const onLoad = () => complete();
        if (document.readyState === 'complete') {
            timers.push(setTimeout(complete, 100));
        }
        else {
            window.addEventListener('load', onLoad);
        }
        return () => {
            mountedRef.current = false;
            timers.forEach(clearTimeout);
            window.removeEventListener('load', onLoad);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
    if (!visible)
        return null;
    return (_jsx("div", { className: "fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none", children: _jsx("div", { className: "h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-300 ease-out rounded-full shadow-[0_0_6px_rgba(229,9,20,0.4)]", style: {
                width: `${Math.max(progress, 3)}%`,
                transitionTimingFunction: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
            } }) }));
}
//# sourceMappingURL=ProgressBar.js.map