import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'hi'],
  // Default fallback language
  defaultLocale: 'en',
  // Auto-detect and redirect based on Accept-Language headers
  localeDetection: true
});

export const config = {
  // Intercept all paths except static assets, internal files, and APIs
  matcher: ['/', '/(hi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
