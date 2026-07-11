import { type ReactNode } from 'react';
interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    /** Delay in ms before animation starts */
    delay?: number;
    /** Slide up from below (default true) */
    slideUp?: boolean;
    /** Fade in from left */
    slideLeft?: boolean;
    /** Fade in from right */
    slideRight?: boolean;
    /** Scale in */
    scale?: boolean;
    /** Only animate on desktop (lg+) */
    desktopOnly?: boolean;
}
export declare function ScrollReveal({ children, className, delay, slideUp, slideLeft, slideRight, scale, }: ScrollRevealProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ScrollReveal.d.ts.map