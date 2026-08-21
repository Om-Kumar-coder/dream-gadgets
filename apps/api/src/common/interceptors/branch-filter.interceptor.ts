import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '@dream-gadgets/shared-types';

/**
 * Roles that can see ALL branches (not forced to their own branch).
 */
const CROSS_BRANCH_ROLES = new Set([
  'shop_owner',
  'multi_store_manager',
  'store_manager',
]);

/**
 * Injects branchId filter on list queries for store-level staff.
 * Owners, multi-store managers, and store managers see all branches.
 * Store staff (shop_sales, store_sales, calling_staff) are forced to their own branch.
 */
@Injectable()
export class BranchFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    if (user && user.branchId !== null && user.branchId !== undefined) {
      // Only force branchId for store-level staff (not owner/manager roles)
      if (!CROSS_BRANCH_ROLES.has(user.role)) {
        request.query = { ...request.query, branchId: user.branchId };
      }
    }

    return next.handle();
  }
}
