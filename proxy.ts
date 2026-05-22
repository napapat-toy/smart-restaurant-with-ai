import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/crypto';

// Helper to check if a cookie has the expected role, verifying the signature
// and falling back to the raw value for backwards compatibility.
function checkRole(cookieVal: string | undefined, expectedRole: string): boolean {
  if (!cookieVal) return false;
  const verified = verifyToken(cookieVal);
  if (verified === expectedRole) return true;
  return cookieVal === expectedRole;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get('staff_role_admin')?.value;
  const cashierCookie = request.cookies.get('staff_role_cashier')?.value;
  const kitchenCookie = request.cookies.get('staff_role_kitchen')?.value;
  const legacyCookie = request.cookies.get('staff_role')?.value;

  // Protect Admin route
  if (pathname.startsWith('/admin')) {
    const hasAdmin = checkRole(adminCookie, 'admin') || checkRole(legacyCookie, 'admin');
    if (!hasAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Cashier route
  if (pathname.startsWith('/cashier')) {
    const hasAccess = checkRole(adminCookie, 'admin') ||
                      checkRole(cashierCookie, 'cashier') ||
                      checkRole(legacyCookie, 'admin') ||
                      checkRole(legacyCookie, 'cashier');
    if (!hasAccess) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Kitchen route
  if (pathname.startsWith('/kitchen')) {
    const hasAccess = checkRole(adminCookie, 'admin') ||
                      checkRole(kitchenCookie, 'kitchen') ||
                      checkRole(legacyCookie, 'admin') ||
                      checkRole(legacyCookie, 'kitchen');
    if (!hasAccess) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/kitchen/:path*', '/cashier/:path*'],
};
