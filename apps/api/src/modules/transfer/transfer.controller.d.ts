import { Response } from 'express';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { QueryTransferDto } from './dto/query-transfer.dto';
export declare class TransferController {
    private readonly transferService;
    constructor(transferService: TransferService);
    create(dto: CreateTransferDto, user: any): Promise<import("./entities/stock-transfer.entity").StockTransfer>;
    findAll(query: QueryTransferDto): Promise<{
        data: import("./entities/stock-transfer.entity").StockTransfer[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/stock-transfer.entity").StockTransfer>;
    receive(id: string, body: {
        itemIds: string[];
    }, user: any): Promise<import("./entities/stock-transfer.entity").StockTransfer>;
    reject(id: string, body: {
        reason: string;
    }): Promise<import("./entities/stock-transfer.entity").StockTransfer>;
    getManifest(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=transfer.controller.d.ts.map