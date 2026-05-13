import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

const SENSITIVE_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const SENSITIVE_PATHS = ['/sales', '/purchases', '/returns', '/admin/users', '/admin/roles', '/inventory'];

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!SENSITIVE_METHODS.includes(req.method)) return next();
    if (!SENSITIVE_PATHS.some(p => req.path.includes(p))) return next();

    const user = (req as any).user;
    if (!user) return next();

    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      if (res.statusCode < 400) {
        // Fire-and-forget audit log
        this.dataSource.query(
          `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by_id, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT DO NOTHING`,
          [
            req.path.split('/')[2] ?? 'unknown',
            null,
            `${req.method} ${req.path}`,
            user.sub,
            req.ip,
            req.headers['user-agent'] ?? '',
          ],
        ).catch(() => {
          // audit_logs table may not exist yet — ignore
        });
      }
      return originalSend(body);
    };

    next();
  }
}
