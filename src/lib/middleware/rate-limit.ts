import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    interval: number; // Time window in ms
    uniqueTokenPerInterval: number; // Max number of unique tokens
};

/**
 * Simple in-memory rate limiter using LRU cache
 * For production with multiple instances, use Redis or similar
 */
export function createRateLimiter(options: RateLimitOptions) {
    const tokenCache = new LRUCache<string, number[]>({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000, // Default 1 minute
    });

    return {
        /**
         * Check if request exceeds rate limit
         * @param limit Maximum number of requests allowed in the time window
         * @param token Unique identifier (usually IP address)
         * @returns Promise that resolves if under limit, rejects if over
         */
        check: (limit: number, token: string): Promise<void> =>
            new Promise((resolve, reject) => {
                const tokenCount = tokenCache.get(token) || [0];

                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }

                tokenCount[0] += 1;

                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage >= limit;

                if (isRateLimited) {
                    reject(new Error('Rate limit exceeded'));
                } else {
                    resolve();
                }
            }),

        /**
         * Get current usage for a token
         */
        getUsage: (token: string): number => {
            const tokenCount = tokenCache.get(token);
            return tokenCount ? tokenCount[0] : 0;
        },

        /**
         * Reset count for a specific token
         */
        reset: (token: string): void => {
            tokenCache.delete(token);
        },
    };
}

// ===========================================
// Pre-configured Rate Limiters
// ===========================================

/**
 * Strict rate limiter for sensitive endpoints
 * 5 requests per minute
 */
export const strictLimiter = createRateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

/**
 * Standard rate limiter for API endpoints
 * 30 requests per minute
 */
export const apiLimiter = createRateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000,
});

/**
 * Generous rate limiter for public endpoints
 * 100 requests per minute
 */
export const publicLimiter = createRateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 2000,
});

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get client IP address from request
 * Works with various proxy configurations
 */
export function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip'); // Cloudflare

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    if (cfIP) {
        return cfIP;
    }

    return 'unknown';
}

/**
 * Rate limit middleware wrapper
 * Usage:
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const check = await checkRateLimit(req, strictLimiter, 5);
 *   if (!check.success) return check.response;
 *   
 *   // Continue with request
 * }
 * ```
 */
export async function checkRateLimit(
    req: NextRequest,
    limiter: ReturnType<typeof createRateLimiter>,
    limit: number
): Promise<{ success: boolean; response?: Response }> {
    const ip = getClientIP(req);

    try {
        await limiter.check(limit, ip);
        return { success: true };
    } catch {
        return {
            success: false,
            response: new Response(
                JSON.stringify({
                    success: false,
                    error: 'Too many requests. Please try again later.',
                    retryAfter: 60, // seconds
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                    },
                }
            ),
        };
    }
}

/**
 * Get rate limit status for a request
 * Useful for including remaining requests in response headers
 */
export function getRateLimitStatus(
    req: NextRequest,
    limiter: ReturnType<typeof createRateLimiter>,
    limit: number
) {
    const ip = getClientIP(req);
    const usage = limiter.getUsage(ip);

    return {
        limit,
        remaining: Math.max(0, limit - usage),
        used: usage,
        reset: Date.now() + 60000, // 1 minute from now
    };
}
