'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
export function ScrollReveal({ children, className = '', delay = 0, slideUp = true, slideLeft = false, slideRight = false, scale = false, }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        // Already in view? Show immediately
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.unobserve(el);
            }
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    // Start hidden on mount, animate when scrolled into view.
    // SSR renders the initial state, JS adds the visible class on scroll.
    let directionClass = '';
    if (slideUp)
        directionClass += 'translate-y-8 ';
    if (slideLeft)
        directionClass += '-translate-x-8 ';
    if (slideRight)
        directionClass += 'translate-x-8 ';
    if (scale)
        directionClass += 'scale-95 ';
    if (directionClass)
        directionClass += 'opacity-0';
    return (_jsx("div", { ref: ref, className: `transition-all duration-700 ease-out ${visible ? 'translate-y-0 !translate-x-0 scale-100 opacity-100' : directionClass} ${className}`, style: {
            transitionDelay: `${delay}ms`,
            willChange: directionClass ? 'transform, opacity' : undefined,
        }, children: children }));
}
//# sourceMappingURL=ScrollReveal.js.map