import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * Injects branchId filter on list queries for non-owner roles.
 * Owners (branchId === null) see all branches.
 */
export declare class BranchFilterInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
//# sourceMappingURL=branch-filter.interceptor.d.ts.map