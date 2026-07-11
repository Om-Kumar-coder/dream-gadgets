import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
export declare class ClientController {
    private readonly clientService;
    constructor(clientService: ClientService);
    create(dto: CreateClientDto, user: any): Promise<import("./entities/client.entity").Client>;
    findAll(query: QueryClientDto): Promise<{
        data: import("./entities/client.entity").Client[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("./entities/client.entity").Client>;
    update(id: string, dto: UpdateClientDto): Promise<import("./entities/client.entity").Client>;
    getHistory(id: string): Promise<{
        purchases: any[];
        sales: any[];
        exchanges: any[];
        returns: any[];
    }>;
    uploadEkyc(id: string, body: {
        documents: object;
    }): Promise<import("./entities/client.entity").Client>;
    verifyEkyc(id: string, user: any): Promise<import("./entities/client.entity").Client>;
    sendEmail(id: string, body: {
        subject: string;
        body: string;
    }): Promise<{
        message: string;
    }>;
    sendWhatsapp(id: string, body: {
        message: string;
    }): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=client.controller.d.ts.map