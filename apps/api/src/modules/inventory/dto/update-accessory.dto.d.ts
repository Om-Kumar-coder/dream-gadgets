import { AccessoryCategory } from './create-accessory.dto';
export declare class UpdateAccessoryDto {
    sku?: string;
    name?: string;
    description?: string;
    brandId?: string;
    modelId?: string;
    category?: AccessoryCategory;
    purchasePrice?: number;
    sellingPrice?: number;
    wholesalePrice?: number;
    stockQuantity?: number;
    reorderLevel?: number;
    status?: string;
    isOnline?: boolean;
    hsnCode?: string;
    taxRate?: number;
    notes?: string;
    branchId?: string;
    specs?: object;
    photos?: object;
}
//# sourceMappingURL=update-accessory.dto.d.ts.map