import { Brand } from './brand.entity';
import { Model } from './model.entity';
import { Branch } from '../../auth/entities/user.entity';
import { User } from '../../auth/entities/user.entity';
export declare class Accessory {
    id: string;
    sku: string;
    name: string;
    description: string;
    brand: Brand;
    brandId: string;
    model: Model;
    modelId: string;
    category: string;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    stockQuantity: number;
    reorderLevel: number;
    status: string;
    isOnline: boolean;
    hsnCode: string;
    taxRate: number;
    notes: string;
    branch: Branch;
    branchId: string;
    specs: object;
    photos: object;
    createdBy: User;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=accessory.entity.d.ts.map