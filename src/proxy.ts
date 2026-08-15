import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware({
  locales: ['en', 'id'],
  defaultLocale: 'id',
});

export default async function middleware(req: NextRequest) {
  // Jalankan next-intl middleware terlebih dahulu
  const res = intlMiddleware(req);

  const path = req.nextUrl.pathname;
  
  const isDashboardRoute = path.includes('/dashboard');
  const isAdminRoute = path.includes('/admin');
  const isAuthRoute = path.includes('/auth');

  if (isDashboardRoute || isAdminRoute || isAuthRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_URL });

    // Gunakan locale dari path atau fallback ke id
    const localeMatch = path.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'id';

    if (token && isAuthRoute) {
      if (token.role === 'SUPERADMIN') {
        return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }

    if (!token && (isDashboardRoute || isAdminRoute)) {
      const url = new URL(`/${locale}/auth`, req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    if (token && isDashboardRoute && token.role === 'SUPERADMIN') {
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }

    if (token && isAdminRoute && token.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return res;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
