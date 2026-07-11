import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
export declare class AuditLogMiddleware implements NestMiddleware {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    use(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=audit-log.middleware.d.ts.map