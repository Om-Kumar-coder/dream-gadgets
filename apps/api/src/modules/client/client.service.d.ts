import { Repository, DataSource } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { NotificationService } from '../notification/notification.service';
export declare class ClientService {
    private clientRepo;
    private dataSource;
    private notificationService;
    private readonly logger;
    constructor(clientRepo: Repository<Client>, dataSource: DataSource, notificationService: NotificationService);
    create(dto: CreateClientDto, userId: string): Promise<Client>;
    findAll(query: QueryClientDto): Promise<{
        data: Client[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Client>;
    update(id: string, dto: UpdateClientDto): Promise<Client>;
    getHistory(id: string): Promise<{
        purchases: any[];
        sales: any[];
        exchanges: any[];
        returns: any[];
    }>;
    uploadEkycDocuments(id: string, documents: object): Promise<Client>;
    verifyEkyc(id: string, userId: string): Promise<Client>;
    sendEmail(id: string, payload: {
        subject: string;
        body: string;
    }): Promise<{
        message: string;
    }>;
    sendWhatsapp(id: string, payload: {
        message: string;
    }): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=client.service.d.ts.map