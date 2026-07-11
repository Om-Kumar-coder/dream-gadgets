import { Response } from 'express';
import { ReturnService } from './return.service';
import { CreateSaleReturnDto, CreatePurchaseReturnDto } from './dto/create-return.dto';
export declare class ReturnController {
    private readonly returnService;
    constructor(returnService: ReturnService);
    createSaleReturn(saleId: string, dto: CreateSaleReturnDto, user: any): Promise<import("./entities/return.entity").Return>;
    createPurchaseReturn(purchaseId: string, dto: CreatePurchaseReturnDto, user: any): Promise<import("./entities/return.entity").Return>;
    findAll(page?: number, limit?: number, returnType?: string, originalId?: string): Promise<{
        data: import("./entities/return.entity").Return[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/return.entity").Return>;
    getReturnPdf(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=return.controller.d.ts.map