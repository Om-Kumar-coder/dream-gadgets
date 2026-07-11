import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    private readonly configService;
    server: any;
    private readonly logger;
    constructor(realtimeService: RealtimeService, configService: ConfigService);
    afterInit(server: any): void;
    handleConnection(client: any): Promise<void>;
    handleDisconnect(client: any): void;
    private verifyToken;
    handlePing(client: any): void;
    handleJoinBranch(client: any, data: {
        branchId: string;
    }): Promise<void>;
}
//# sourceMappingURL=realtime.gateway.d.ts.map