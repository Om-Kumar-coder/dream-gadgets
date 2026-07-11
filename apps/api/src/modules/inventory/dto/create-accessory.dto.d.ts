export declare const ACCESSORY_CATEGORIES: readonly ["charger", "case", "screen_guard", "earphones", "cable", "power_bank", "stand", "cleaning_kit", "tempered_glass", "adapter"];
export type AccessoryCategory = typeof ACCESSORY_CATEGORIES[number];
export declare class CreateAccessoryDto {
    sku: string;
    name: string;
    description?: string;
    brandId?: string;
    modelId?: string;
    category: AccessoryCategory;
    purchasePrice: number;
    sellingPrice?: number;
    wholesalePrice?: number;
    stockQuantity?: number;
    reorderLevel?: number;
    hsnCode?: string;
    taxRate?: number;
    notes?: string;
    branchId?: string;
    specs?: object;
    photos?: object;
}
//# sourceMappingURL=create-accessory.dto.d.ts.map