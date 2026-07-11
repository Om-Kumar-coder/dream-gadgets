interface BrandModelSelectorProps {
    brand: string;
    modelName: string;
    deviceType: string;
    onUpdate: (data: Partial<{
        brand: string;
        modelName: string;
        deviceType: string;
    }>) => void;
}
export declare function BrandModelSelector({ brand, modelName, deviceType, onUpdate }: BrandModelSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BrandModelSelector.d.ts.map