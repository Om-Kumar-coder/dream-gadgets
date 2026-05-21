import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSION_KEY = 'permission';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    // DEBUG bypass — allow all requests when DEBUG=true
    if (process.env.DEBUG === 'true') {
      return true;
    }

    const { user, method, path } = context.switchToHttp().getRequest();
    const hasPermission = user?.permissions?.includes(required) ?? false;

    if (!hasPermission) {
      this.logger.warn(
        `Permission denied: ${method} ${path} | user=${user?.sub ?? 'unknown'} role=${user?.role ?? 'none'} missing=${required}`,
      );
      throw new ForbiddenException({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: `Missing required permission: ${required}`,
        },
      });
    }
    return true;
  }
}
