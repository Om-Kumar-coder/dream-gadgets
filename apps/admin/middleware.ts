import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check cookie (set by login page) OR allow through (client-side auth handles redirect)
  const token =
    request.cookies.get('admin_access_token')?.value ||
    request.cookies.get('admin-auth-storage')?.value;

  // If no cookie at all, redirect to login
  // But allow _next assets and API routes through always
  if (!token) {
    // Check if this looks like a direct page navigation (not an asset)
    const isPageRequest =
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.includes('.');

    if (isPageRequest) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
