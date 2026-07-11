interface CouponInputProps {
    subtotal: number;
    onCouponApplied: (code: string, discount: number) => void;
    onCouponRemoved: () => void;
    disabled?: boolean;
}
export declare function CouponInput({ subtotal, onCouponApplied, onCouponRemoved, disabled }: CouponInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CouponInput.d.ts.map