import { StockTransfer } from './stock-transfer.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
export declare class StockTransferItem {
    id: string;
    transfer: StockTransfer;
    transferId: string;
    item: InventoryItem;
    itemId: string;
    imei: string;
    status: string;
    notes: string | null;
}
//# sourceMappingURL=stock-transfer-item.entity.d.ts.map