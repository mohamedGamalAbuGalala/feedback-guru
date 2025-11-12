import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Security Headers
 *
 * This middleware adds security headers to all responses.
 * Runs on Edge Runtime for optimal performance.
 */

export function middleware(request: NextRequest) {
  // Clone response to modify headers
  const response = NextResponse.next();

  // Content Security Policy (CSP)
  // Prevents XSS, clickjacking, and other code injection attacks
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline/eval needed for Next.js
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled components
    "img-src 'self' data: https: blob:", // Allow images from HTTPS and data URIs
    "font-src 'self' data:",
    "connect-src 'self' https://api.resend.com", // API connections
    "frame-ancestors 'none'", // Prevent framing (clickjacking)
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  // X-Frame-Options: Prevent clickjacking
  // Redundant with CSP frame-ancestors but kept for older browsers
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Control browser features
  const permissionsPolicy = [
    'camera=()',        // Disable camera
    'microphone=()',    // Disable microphone
    'geolocation=()',   // Disable geolocation
    'interest-cohort=()', // Disable FLoC
  ].join(', ');

  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Strict-Transport-Security (HSTS)
  // Only set in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-DNS-Prefetch-Control: Control DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // X-XSS-Protection: Enable XSS filter (legacy browsers)
  // Modern browsers use CSP instead
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Middleware configuration
 * Apply to all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
