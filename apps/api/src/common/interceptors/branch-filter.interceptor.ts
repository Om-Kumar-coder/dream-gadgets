import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '@dream-gadgets/shared-types';

/**
 * Injects branchId filter on list queries for non-owner roles.
 * Owners (branchId === null) see all branches.
 */
@Injectable()
export class BranchFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    if (user && user.branchId !== null && user.branchId !== undefined) {
      // Non-owner: inject branchId into query params so service layer can filter
      request.query = { ...request.query, branchId: user.branchId };
    }

    return next.handle();
  }
}
