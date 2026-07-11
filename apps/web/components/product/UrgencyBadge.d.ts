interface UrgencyBadgeProps {
    stockLevel?: 'low' | 'medium' | 'high' | 'out';
    salesVelocity?: 'fast' | 'normal' | 'slow';
    customMessage?: string;
}
export declare function UrgencyBadge({ stockLevel, salesVelocity, customMessage }: UrgencyBadgeProps): import("react/jsx-runtime").JSX.Element;
export declare function StockCounter({ count }: {
    count?: number;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=UrgencyBadge.d.ts.map