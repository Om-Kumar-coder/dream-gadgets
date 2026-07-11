import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { QueryExchangeDto } from './dto/query-exchange.dto';
export declare class ExchangeController {
    private readonly exchangeService;
    constructor(exchangeService: ExchangeService);
    create(dto: CreateExchangeDto, user: any): Promise<import("./entities/exchange-device.entity").ExchangeDevice>;
    getPriceGuide(modelId?: string): Promise<{
        modelId: string;
        condition: string;
        basePrice: number;
    }[]>;
    suggestPrice(basePrice: string, batteryHealth: string, monthsSinceFirstInvoice: string): Promise<{
        suggestedPrice: number;
        batteryHealth: number;
        monthsSinceFirstInvoice: number;
        basePrice: number;
    }>;
    findAll(query: QueryExchangeDto): Promise<{
        data: import("./entities/exchange-device.entity").ExchangeDevice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/exchange-device.entity").ExchangeDevice>;
    update(id: string, dto: Partial<CreateExchangeDto>): Promise<import("./entities/exchange-device.entity").ExchangeDevice>;
    addToInventory(id: string, body: {
        branchId: string;
        boxType?: string;
        purchasePrice?: number;
        taxRate?: number;
    }, user: any): Promise<import("./entities/exchange-device.entity").ExchangeDevice>;
}
//# sourceMappingURL=exchange.controller.d.ts.map