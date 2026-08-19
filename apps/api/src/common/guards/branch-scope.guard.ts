import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BRANCH_SCOPED_KEY = 'branchScoped';

/**
 * Validates that the authenticated user can only access resources
 * belonging to their assigned branch. Owners (branchId=null) have
 * global access and are always allowed.
 *
 * Usage: @UseGuards(BranchScopeGuard) + @BranchScoped()
 *
 * For GET list queries: injects branchId into query params
 * For mutations (POST/PATCH/PUT/DELETE): validates branchId in body/params
 */
@Injectable()
export class BranchScopeGuard implements CanActivate {
  private readonly logger = new Logger(BranchScopeGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isScoped = this.reflector.getAllAndOverride<boolean>(BRANCH_SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isScoped) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // Owners have global access
    if (!user.branchId) return true;

    const method = request.method;
    const path = request.path;

    // GET queries: inject branchId so service layer filters
    if (method === 'GET') {
      request.query = { ...request.query, branchId: user.branchId };
      return true;
    }

    // For mutations: check if request body or params contain branchId
    // and validate it matches the user's branch
    const bodyBranchId = request.body?.branchId;
    const paramBranchId = request.params?.branchId;

    if (bodyBranchId && bodyBranchId !== user.branchId) {
      this.logger.warn(
        `Branch scope violation: user=${user.sub} branch=${user.branchId} attempted body branchId=${bodyBranchId} on ${method} ${path}`,
      );
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_VIOLATION',
        message: 'You can only access resources in your assigned branch',
      });
    }

    if (paramBranchId && paramBranchId !== user.branchId) {
      this.logger.warn(
        `Branch scope violation: user=${user.sub} branch=${user.branchId} attempted param branchId=${paramBranchId} on ${method} ${path}`,
      );
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_VIOLATION',
        message: 'You can only access resources in your assigned branch',
      });
    }

    return true;
  }
}
