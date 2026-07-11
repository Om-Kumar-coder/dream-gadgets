import { Response } from 'express';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(dto: CreateSaleDto, user: any): Promise<import("./entities/sale.entity").Sale>;
    findAll(query: QuerySaleDto): Promise<{
        data: import("./entities/sale.entity").Sale[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/sale.entity").Sale>;
    getInvoice(id: string, res: Response): Promise<void>;
    getThermalInvoice(id: string, res: Response): Promise<void>;
    emailInvoice(id: string, body: {
        email?: string;
    }): Promise<{
        message: string;
    }>;
    whatsappInvoice(id: string, body: {
        phone?: string;
    }): Promise<{
        message: string;
    }>;
    voidSale(id: string, user: any): Promise<import("./entities/sale.entity").Sale>;
    lockItem(body: {
        itemId: string;
    }): Promise<{
        message: string;
    }>;
    unlockItem(body: {
        itemId: string;
    }): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=sales.controller.d.ts.map