import { User } from '../../auth/entities/user.entity';
export declare class ExchangeDevice {
    id: string;
    clientId: string | null;
    saleId: string | null;
    brandId: string | null;
    modelId: string | null;
    imei: string | null;
    colour: string | null;
    storage: string | null;
    condition: string | null;
    batteryHealth: number | null;
    conditionNotes: object | null;
    exchangePrice: number;
    photos: object | null;
    kycVerified: boolean;
    addedToInventory: boolean;
    inventoryItemId: string | null;
    createdBy: User;
    createdById: string;
    createdAt: Date;
}
//# sourceMappingURL=exchange-device.entity.d.ts.map