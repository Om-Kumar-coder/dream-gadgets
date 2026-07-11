'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function RootLoading() {
    const [show, setShow] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const enterTimer = setTimeout(() => setShow(true), 50);
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                if (prev < 30)
                    return prev + 3;
                if (prev < 60)
                    return prev + 2;
                return prev + 0.5;
            });
        }, 100);
        return () => {
            clearTimeout(enterTimer);
            clearInterval(progressInterval);
        };
    }, []);
    if (!show)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-surface-950 transition-opacity duration-500", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white via-surface-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" }), _jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/[0.03] animate-float" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/[0.02] animate-float-slow" })] }), _jsxs("div", { className: "relative flex flex-col items-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-red animate-scale-in-bounce", children: _jsxs("svg", { className: "w-10 h-10 md:w-12 md:h-12 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "2", width: "20", height: "20", rx: "5" }), _jsx("path", { d: "M12 8v8" }), _jsx("path", { d: "M8 12h8" })] }) }), _jsx("div", { className: "absolute -inset-4 rounded-3xl bg-primary/5 animate-pulse-glow" })] }), _jsxs("div", { className: "flex flex-col items-center gap-1 mb-8", children: [_jsxs("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight text-surface-900 dark:text-white", children: ["Dream", _jsx("span", { className: "text-primary", children: "Gadgets" })] }), _jsx("p", { className: "text-xs text-surface-400 dark:text-surface-500 font-medium tracking-wide uppercase", children: "Premium Certified Devices" })] }), _jsxs("div", { className: "w-48 md:w-56", children: [_jsx("div", { className: "h-1 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out", style: { width: `${progress}%` } }) }), _jsx("p", { className: "text-[10px] text-surface-400 dark:text-surface-500 text-center mt-2 font-medium", children: progress < 30 ? 'Loading...' : progress < 60 ? 'Almost there...' : 'Preparing experience...' })] })] }), _jsx("p", { className: "absolute bottom-8 text-[10px] text-surface-300 dark:text-surface-600 font-medium tracking-wider uppercase", children: "Dream Gadgets \u2014 Since 2020" })] }));
}
//# sourceMappingURL=loading.js.map