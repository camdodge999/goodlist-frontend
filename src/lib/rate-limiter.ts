import { NextRequest } from 'next/server';
import { RateLimiter } from 'limiter';

/**
 * Professional Rate Limiter using the 'limiter' npm package
 * Provides token bucket algorithm with configurable burst and sustained rates
 */

export interface RateLimitConfig {
  tokensPerInterval: number;
  interval: 'second' | 'minute' | 'hour' | 'day' | number; // Limiter package types
  fireImmediately?: boolean;
}

// Rate limiter instances store
const rateLimiters = new Map<string, RateLimiter>();

// Default configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication forms
  LOGIN: { tokensPerInterval: 5, interval: 'minute' as const }, // 5 attempts per minute
  REGISTRATION: { tokensPerInterval: 3, interval: 'hour' as const }, // 3 attempts per hour
  PASSWORD_RESET: { tokensPerInterval: 3, interval: 'hour' as const }, // 3 attempts per hour
  
  // Form submissions
  VERIFICATION: { tokensPerInterval: 2, interval: 'hour' as const }, // 2 attempts per hour
  REPORT: { tokensPerInterval: 5, interval: 'hour' as const }, // 5 attempts per hour
  PROFILE_UPDATE: { tokensPerInterval: 10, interval: 'hour' as const }, // 10 attempts per hour
  
  // General API
  API_GENERAL: { tokensPerInterval: 100, interval: 'minute' as const }, // 100 requests per minute
  
  // Strict limits for sensitive operations
  OTP_SEND: { tokensPerInterval: 3, interval: 'hour' as const }, // 3 OTP sends per hour
  PASSWORD_CHANGE: { tokensPerInterval: 5, interval: 'hour' as const }, // 5 password changes per hour
} as const;

/**
 * Get client IP address from request with better fallback handling
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (clientIP) {
    return clientIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback for development or when IP can't be determined
  return 'unknown-ip';
}

/**
 * Get or create a rate limiter for a specific key
 */
function getRateLimiter(key: string, config: RateLimitConfig): RateLimiter {
  if (!rateLimiters.has(key)) {
    const limiter = new RateLimiter({
      tokensPerInterval: config.tokensPerInterval,
      interval: config.interval,
      fireImmediately: config.fireImmediately || false,
    });
    rateLimiters.set(key, limiter);
  }
  
  return rateLimiters.get(key)!;
}

/**
 * Check if request should be rate limited using the limiter package
 */
export async function checkRateLimit(
  request: NextRequest, 
  config: RateLimitConfig,
  identifier?: string
): Promise<{ 
  limited: boolean; 
  remaining: number; 
  retryAfter?: number;
}> {
  const clientIP = getClientIP(request);
  const key = identifier ? `${clientIP}:${identifier}` : clientIP;
  
  const limiter = getRateLimiter(key, config);
  
  try {
    // Try to remove 1 token
    const remainingRequests = await limiter.removeTokens(1);
    
    return {
      limited: false,
      remaining: Math.max(0, remainingRequests),
    };
  } catch {
    // Rate limit exceeded - limiter throws when no tokens available
    return {
      limited: true,
      remaining: 0,
      retryAfter: getRetryAfterSeconds(config),
    };
  }
}

/**
 * Synchronous rate limit check (non-blocking)
 */
export function checkRateLimitSync(
  request: NextRequest, 
  config: RateLimitConfig,
  identifier?: string
): { 
  limited: boolean; 
  remaining: number; 
} {
  const clientIP = getClientIP(request);
  const key = identifier ? `${clientIP}:${identifier}` : clientIP;
  
  const limiter = getRateLimiter(key, config);
  
  // Use tryRemoveTokens for synchronous check
  const success = limiter.tryRemoveTokens(1);
  
  return {
    limited: !success,
    remaining: success ? limiter.getTokensRemaining() : 0,
  };
}

/**
 * Get remaining tokens for a specific request
 */
export function getRemainingTokens(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): number {
  const clientIP = getClientIP(request);
  const key = identifier ? `${clientIP}:${identifier}` : clientIP;
  
  const limiter = getRateLimiter(key, config);
  return limiter.getTokensRemaining();
}

/**
 * Calculate retry-after seconds based on interval
 */
function getRetryAfterSeconds(config: RateLimitConfig): number {
  if (typeof config.interval === 'number') {
    return Math.ceil(config.interval / 1000);
  }
  
  switch (config.interval) {
    case 'second': return 1;
    case 'minute': return 60;
    case 'hour': return 3600;
    case 'day': return 86400;
    default: return 60; // Default to 1 minute
  }
}

/**
 * Create rate limiting middleware factory
 */
export function createRateLimitMiddleware(
  config: RateLimitConfig, 
  identifier?: string,
  options: {
    async?: boolean;
    onLimitExceeded?: (retryAfter?: number) => void;
  } = {}
) {
  if (options.async !== false) {
    // Async version (default)
    return async (request: NextRequest) => {
      const result = await checkRateLimit(request, config, identifier);
      
      if (result.limited && options.onLimitExceeded) {
        options.onLimitExceeded(result.retryAfter);
      }
      
      return result;
    };
  } else {
    // Sync version
    return (request: NextRequest) => {
      const result = checkRateLimitSync(request, config, identifier);
      
      if (result.limited && options.onLimitExceeded) {
        options.onLimitExceeded(getRetryAfterSeconds(config));
      }
      
      return result;
    };
  }
}

/**
 * Reset rate limit for a specific IP and identifier (admin function)
 */
export function resetRateLimit(ip: string, identifier?: string): void {
  const key = identifier ? `${ip}:${identifier}` : ip;
  rateLimiters.delete(key);
}

/**
 * Get all active rate limiters (for monitoring)
 */
export function getActiveLimiters(): Array<{
  key: string;
  remaining: number;
}> {
  const limiters: Array<{ key: string; remaining: number }> = [];
  
  for (const [key, limiter] of rateLimiters.entries()) {
    limiters.push({
      key,
      remaining: limiter.getTokensRemaining(),
    });
  }
  
  return limiters;
}

/**
 * Clean up unused rate limiters (call periodically)
 */
export function cleanupInactiveLimiters(): void {
  const inactiveLimiters: string[] = [];
  
  for (const [key, limiter] of rateLimiters.entries()) {
    // Remove limiters that have been at full capacity for a while
    // Note: Accessing private property tokensPerInterval may not be available
    const remaining = limiter.getTokensRemaining();
    if (remaining > 0) { // Simplified check for cleanup
      inactiveLimiters.push(key);
    }
  }
  
  // Remove inactive limiters after they've been idle
  if (inactiveLimiters.length > 100) { // Cleanup when too many limiters
    inactiveLimiters.slice(0, 50).forEach(key => rateLimiters.delete(key));
  }
}

/**
 * Advanced rate limiting with burst capacity
 */
export function createBurstRateLimiter(
  sustainedRate: RateLimitConfig,
  burstRate: RateLimitConfig,
  identifier?: string
) {
  return async (request: NextRequest) => {
    const clientIP = getClientIP(request);
    const sustainedKey = `sustained:${clientIP}:${identifier || 'default'}`;
    const burstKey = `burst:${clientIP}:${identifier || 'default'}`;
    
    const sustainedLimiter = getRateLimiter(sustainedKey, sustainedRate);
    const burstLimiter = getRateLimiter(burstKey, burstRate);
    
    try {
      // Check burst limit first (short-term protection)
      await burstLimiter.removeTokens(1);
      
      // Then check sustained limit (long-term protection)
      await sustainedLimiter.removeTokens(1);
      
      return {
        limited: false,
        remaining: Math.min(
          sustainedLimiter.getTokensRemaining(),
          burstLimiter.getTokensRemaining()
        ),
      };
    } catch {
      return {
        limited: true,
        remaining: 0,
        retryAfter: Math.max(
          getRetryAfterSeconds(sustainedRate),
          getRetryAfterSeconds(burstRate)
        ),
      };
    }
  };
} 