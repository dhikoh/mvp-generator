export class RateLimiter {
  private map = new Map<string, { count: number; expiresAt: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number; reset: Date } {
    const now = Date.now();
    const record = this.map.get(identifier);

    if (!record || record.expiresAt < now) {
      // Create new record or reset expired one
      this.map.set(identifier, {
        count: 1,
        expiresAt: now + this.windowMs,
      });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: new Date(now + this.windowMs),
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: new Date(record.expiresAt),
      };
    }

    // Increment existing record
    record.count += 1;
    this.map.set(identifier, record);
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: new Date(record.expiresAt),
    };
  }
}

// Global instance for general API rate limiting (e.g., 5 requests per minute)
export const globalRateLimiter = new RateLimiter(5, 60 * 1000);

// Specific limiters for security-sensitive endpoints
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // Max 5 attempts per 15 minutes per IP/Identifier for Auth
export const productRateLimiter = new RateLimiter(10, 60 * 1000); // Max 10 requests per minute for Product Creation
