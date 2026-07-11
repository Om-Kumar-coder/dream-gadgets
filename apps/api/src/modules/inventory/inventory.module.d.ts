import { OnModuleInit } from '@nestjs/common';
import { InventoryService } from './inventory.service';
export declare class InventoryModule implements OnModuleInit {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    onModuleInit(): Promise<void>;
}
//# sourceMappingURL=inventory.module.d.ts.map