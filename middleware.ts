import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'eo_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/eo/login' || pathname === '/eo/signup' || pathname === '/eo/forgot-password' || pathname === '/eo/reset-password' || pathname === '/eo/verify' || pathname === '/eo/verification-pending') {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = new URL('/eo/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/eo/:path*'],
};
