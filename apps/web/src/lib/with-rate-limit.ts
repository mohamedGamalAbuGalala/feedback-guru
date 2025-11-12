import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimiters } from "./rate-limiter";

/**
 * Rate limit wrapper for API routes
 *
 * Usage:
 * export const POST = withRateLimit(handler, 'auth');
 * export const GET = withRateLimit(handler, 'public');
 */

type RateLimitType = 'authenticated' | 'public' | 'auth' | 'upload';

type Handler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withRateLimit(
  handler: Handler,
  type: RateLimitType = 'public'
): Handler {
  return async (request: NextRequest, context?: any) => {
    // Get appropriate rate limiter
    const limiter = rateLimiters[type];

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(request, limiter);

    // Add rate limit headers to all responses
    const headers = {
      'X-RateLimit-Limit': limiter.getStats().config.maxTokens.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(
        Date.now() + limiter.getStats().config.windowMs
      ).toISOString(),
    };

    // If rate limited, return 429
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil(
            limiter.getStats().config.windowMs / 1000
          )} seconds.`,
          retryAfter: Math.ceil(limiter.getStats().config.windowMs / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil(
              limiter.getStats().config.windowMs / 1000
            ).toString(),
          },
        }
      );
    }

    // Execute handler
    const response = await handler(request, context);

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Check if user is authenticated (for selecting rate limiter)
 * This is a helper to use authenticated rate limits for logged-in users
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  // Check for session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  return !!sessionToken;
}

/**
 * Smart rate limiter that uses different limits for auth/unauth users
 */
export function withSmartRateLimit(handler: Handler): Handler {
  return async (request: NextRequest, context?: any) => {
    const authenticated = await isAuthenticated(request);
    const type: RateLimitType = authenticated ? 'authenticated' : 'public';

    return withRateLimit(handler, type)(request, context);
  };
}
