interface PriceEstimateCardProps {
    brand: string;
    modelName: string;
    condition: string;
    estimatedPrice: number | null;
    onUpdate: (data: Partial<{
        estimatedPrice: number;
    }>) => void;
}
export declare function PriceEstimateCard({ brand, modelName, condition, estimatedPrice, onUpdate }: PriceEstimateCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PriceEstimateCard.d.ts.map