import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const FINANCIAL_SCOPE_KEY = 'financialScope';

/**
 * Validates that the authenticated user has access to financial data.
 *
 * - Owner (financialScope='all'): full access to all financial data
 * - Branch financial user (financialScope='branch'): access to their branch's financial data
 * - Others (financialScope='none'): denied
 *
 * Usage: @UseGuards(FinancialScopeGuard) + @RequireFinancialAccess()
 */
@Injectable()
export class FinancialScopeGuard implements CanActivate {
  private readonly logger = new Logger(FinancialScopeGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isRequired = this.reflector.getAllAndOverride<boolean>(FINANCIAL_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isRequired) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const { method, path } = request;
    const financialScope = user.financialScope ?? 'none';

    if (financialScope === 'none') {
      this.logger.warn(
        `Financial access denied: ${method} ${path} | user=${user.sub ?? 'unknown'} role=${user.role ?? 'none'}`,
      );
      throw new ForbiddenException({
        code: 'FINANCIAL_ACCESS_DENIED',
        message: 'You do not have permission to access financial information',
      });
    }

    // Branch-scoped financial user: enforce branchId on the request
    if (financialScope === 'branch') {
      // Ensure the query is scoped to the user's branch
      if (user.branchId) {
        request.query = { ...request.query, branchId: user.branchId };
      }
    }

    return true;
  }
}
