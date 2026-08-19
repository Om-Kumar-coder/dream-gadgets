import { SetMetadata } from '@nestjs/common';
import { BRANCH_SCOPED_KEY } from '../guards/branch-scope.guard';

/**
 * Marks an endpoint as branch-scoped.
 * When combined with BranchScopeGuard:
 * - GET: injects branchId into query params
 * - POST/PATCH/PUT/DELETE: validates branchId in body/params
 * - Owners (branchId=null) bypass this check
 */
export const BranchScoped = () => SetMetadata(BRANCH_SCOPED_KEY, true);
