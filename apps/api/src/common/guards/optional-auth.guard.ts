import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT authentication.
 *
 * Authenticates the request when a valid Bearer token is present, but never
 * rejects — anonymous requests proceed with `req.user = null` (and a present
 * but invalid/expired token is treated the same way rather than 401ing).
 *
 * Needed because `POST /public/orders` is a guest-or-authenticated endpoint
 * and had no guard at all, so `req.user` was always undefined and checkout
 * orders could never be linked to the customer (BUG-08).
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Returning a value (instead of throwing) is what makes the guard optional:
  // NestJS only 401s when handleRequest throws.
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return (user ?? null) as TUser;
  }
}
