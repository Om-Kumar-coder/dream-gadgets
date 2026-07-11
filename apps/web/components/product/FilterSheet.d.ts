interface FilterSheetProps {
    open: boolean;
    onClose: () => void;
    activeBrand?: string;
    activeCondition?: string;
    activeMinPrice?: string;
    activeMaxPrice?: string;
    brands: string[];
    onApply: (filters: {
        brand?: string;
        condition?: string;
        minPrice?: string;
        maxPrice?: string;
    }) => void;
}
export declare function FilterSheet({ open, onClose, activeBrand, activeCondition, activeMinPrice, activeMaxPrice, brands, onApply }: FilterSheetProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=FilterSheet.d.ts.map