/**
 * Rate Limiter using Token Bucket Algorithm
 *
 * In production, this should use Redis for distributed rate limiting.
 * For development/small deployments, in-memory storage is acceptable.
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterConfig {
  maxTokens: number;      // Maximum tokens in bucket
  refillRate: number;     // Tokens added per second
  windowMs: number;       // Time window in milliseconds
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;

    // Cleanup old buckets every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (usually IP address)
   * @returns true if allowed, false if rate limited
   */
  async check(key: string): Promise<boolean> {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      // Create new bucket for first-time user
      bucket = {
        tokens: this.config.maxTokens - 1, // Consume one token for this request
        lastRefill: now,
      };
      this.buckets.set(key, bucket);
      return true;
    }

    // Calculate tokens to add based on time elapsed
    const timePassed = (now - bucket.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.config.refillRate;

    // Refill bucket (up to max)
    bucket.tokens = Math.min(
      this.config.maxTokens,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;

    // Check if we have tokens available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1; // Consume one token
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining tokens for a key
   * @param key - Unique identifier
   * @returns number of tokens remaining
   */
  async getRemaining(key: string): Promise<number> {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      return this.config.maxTokens;
    }

    // Calculate current tokens
    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.config.refillRate;
    const currentTokens = Math.min(
      this.config.maxTokens,
      bucket.tokens + tokensToAdd
    );

    return Math.floor(currentTokens);
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier
   */
  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  /**
   * Cleanup old buckets (memory management)
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = this.config.windowMs * 2; // Keep buckets for 2x window

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Get statistics about rate limiter
   */
  getStats() {
    return {
      activeBuckets: this.buckets.size,
      config: this.config,
    };
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // Authenticated API endpoints: 100 requests per minute
  authenticated: new RateLimiter({
    maxTokens: 100,
    refillRate: 100 / 60, // 100 tokens per 60 seconds
    windowMs: 60 * 1000,  // 1 minute window
  }),

  // Public API endpoints: 20 requests per minute
  public: new RateLimiter({
    maxTokens: 20,
    refillRate: 20 / 60,
    windowMs: 60 * 1000,
  }),

  // Authentication endpoints: 5 requests per minute (prevent brute force)
  auth: new RateLimiter({
    maxTokens: 5,
    refillRate: 5 / 60,
    windowMs: 60 * 1000,
  }),

  // File upload: 10 requests per minute
  upload: new RateLimiter({
    maxTokens: 10,
    refillRate: 10 / 60,
    windowMs: 60 * 1000,
  }),
};

/**
 * Helper function to get client IP address
 */
export function getClientIp(request: Request): string {
  // Check common headers for real IP (behind proxies)
  const headers = request.headers;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (won't work behind proxies)
  return 'unknown';
}

/**
 * Rate limit middleware helper
 */
export async function checkRateLimit(
  request: Request,
  limiter: RateLimiter
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = getClientIp(request);
  const allowed = await limiter.check(ip);
  const remaining = await limiter.getRemaining(ip);

  return { allowed, remaining };
}
