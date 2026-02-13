import { NextResponse, type NextRequest } from 'next/server';
import { i18n } from '@/i18n.config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: string[] = [...i18n.locales];
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    const locale = matchLocale(languages, locales, i18n.defaultLocale);
    return locale;
  } catch (e) {
    return i18n.defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  const host = request.headers.get('host');
  
  // Extract subdomain
  let subdomain = null;
  if (host) {
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  }
  
  // Pass subdomain to the request headers so it can be accessed in server components
  if (subdomain) {
    requestHeaders.set('x-subdomain', subdomain);
  }

  // Check for maintenance mode cookie
  const isInMaintenanceMode = request.cookies.get('amigoal_maintenance_mode')?.value === 'true';

  // Allow access to the maintenance page itself
  if (pathname.includes('/maintenance')) {
      return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isInMaintenanceMode && !request.nextUrl.pathname.includes('/api')) {
      const locale = getLocale(request) || i18n.defaultLocale;
      const maintenanceUrl = new URL(`/${locale}/maintenance`, request.url);
      return NextResponse.rewrite(maintenanceUrl, { request: { headers: requestHeaders } });
  }

  // // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static files.
  // This will apply the middleware to all other routes.
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|manifest.json|sw.js|workbox-.*\\.js).*)',
  ],
};