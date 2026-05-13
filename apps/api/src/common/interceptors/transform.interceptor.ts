import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@dream-gadgets/shared-types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If service already returned { status, data } shape, pass through
        if (data && typeof data === 'object' && 'status' in data && 'data' in data) {
          return data;
        }
        // If service returned { data: [...], total, page, limit } (list response), wrap preserving meta
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          return {
            status: 'success' as const,
            data: data.data,
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: data.limit ? Math.ceil(data.total / data.limit) : 1,
            },
          };
        }
        // Default: wrap as-is
        return {
          status: 'success' as const,
          data,
        };
      }),
    );
  }
}
