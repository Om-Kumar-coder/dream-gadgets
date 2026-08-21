import { SetMetadata } from '@nestjs/common';
import { FINANCIAL_SCOPE_KEY } from '../guards/financial-scope.guard';

/**
 * Marks an endpoint as requiring financial access.
 * Combined with FinancialScopeGuard, this ensures only users with
 * financial.view permission and appropriate scope can access the endpoint.
 */
export const RequireFinancialAccess = () => SetMetadata(FINANCIAL_SCOPE_KEY, true);
