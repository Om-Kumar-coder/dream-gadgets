import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/session';

// With basePath: '/admin', Next.js strips the basePath from pathname
// So pathname here is relative — e.g. '/', '/dashboard', '/login'
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for the session presence cookie (the JWT itself lives in localStorage;
  // it is far too large to store in a cookie and was silently dropped before).
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    // Redirect to /login (relative to basePath — Next.js prepends basePath automatically)
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
