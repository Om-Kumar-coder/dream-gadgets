import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
interface HealthStatus {
    status: 'ok' | 'degraded' | 'down';
    timestamp: string;
    uptime: number;
    services: {
        api: {
            status: 'ok';
            version: string;
        };
        database: {
            status: 'ok' | 'down';
            latencyMs?: number;
            error?: string;
        };
        redis: {
            status: 'ok' | 'down';
            latencyMs?: number;
            error?: string;
        };
        memory: {
            status: 'ok' | 'warn';
            heapUsedMb: number;
            heapTotalMb: number;
            rssMb: number;
        };
    };
}
export declare class HealthController {
    private readonly dataSource;
    private readonly configService;
    private readonly logger;
    private readonly startTime;
    constructor(dataSource: DataSource, configService: ConfigService);
    check(): Promise<HealthStatus>;
    liveness(): {
        status: string;
    };
    readiness(): Promise<{
        status: string;
        database: string;
    }>;
}
export {};
//# sourceMappingURL=health.controller.d.ts.map