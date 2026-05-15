import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('staff_role')?.value;

  // Protect Admin route
  if (pathname.startsWith('/admin')) {
    if (roleCookie !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Cashier route
  if (pathname.startsWith('/cashier')) {
    if (roleCookie !== 'admin' && roleCookie !== 'cashier') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Kitchen route
  if (pathname.startsWith('/kitchen')) {
    if (roleCookie !== 'admin' && roleCookie !== 'kitchen') {
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
