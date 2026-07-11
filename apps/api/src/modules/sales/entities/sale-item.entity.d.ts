import { Sale } from './sale.entity';
export declare class SaleItem {
    id: string;
    sale: Sale;
    saleId: string;
    itemId: string;
    accessoryId: string | null;
    quantity: number;
    imei: string;
    description: string;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    hsnCode: string | null;
}
//# sourceMappingURL=sale-item.entity.d.ts.map