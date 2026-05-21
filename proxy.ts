import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get('staff_role_admin')?.value;
  const cashierCookie = request.cookies.get('staff_role_cashier')?.value;
  const kitchenCookie = request.cookies.get('staff_role_kitchen')?.value;
  const legacyCookie = request.cookies.get('staff_role')?.value;

  // Protect Admin route
  if (pathname.startsWith('/admin')) {
    const hasAdmin = adminCookie === 'admin' || legacyCookie === 'admin';
    if (!hasAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Cashier route
  if (pathname.startsWith('/cashier')) {
    const hasAccess = adminCookie === 'admin' || cashierCookie === 'cashier' || legacyCookie === 'admin' || legacyCookie === 'cashier';
    if (!hasAccess) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Kitchen route
  if (pathname.startsWith('/kitchen')) {
    const hasAccess = adminCookie === 'admin' || kitchenCookie === 'kitchen' || legacyCookie === 'admin' || legacyCookie === 'kitchen';
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
