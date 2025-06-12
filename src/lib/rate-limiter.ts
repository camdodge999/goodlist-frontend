import { NextRequest } from 'next/server';
import rateLimit from 'express-rate-limit';

/**
 * Professional Rate Limiter using express-rate-limit
 * Provides configurable rate limiting with memory store
 */

export interface RateLimitConfig {
  tokensPerInterval: number;
  interval: 'second' | 'minute' | 'hour' | 'day' | number;
  fireImmediately?: boolean;
}

interface MockExpressRequest {
  ip: string;
  headers: Record<string, string>;
  method: string;
  url: string;
}

interface MockExpressResponse {
  status: () => MockExpressResponse;
  json: () => MockExpressResponse;
  send: () => MockExpressResponse;
  set: () => MockExpressResponse;
  header: () => MockExpressResponse;
  locals: {
    rateLimit?: {
      remaining: number;
    };
  };
}

interface SyncRateLimitRecord {
  count: number;
  resetTime: number;
}

// Rate limiter instances store
const rateLimiters = new Map<string, ReturnType<typeof rateLimit>>();

// Extend globalThis to include our sync store
declare global {
  // eslint-disable-next-line no-var
  var __rateLimitSyncStore: Map<string, SyncRateLimitRecord> | undefined;
}

// Default configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication forms
  LOGIN: { tokensPerInterval: 10, interval: 'minute' as const }, // 5 attempts per minute
  REGISTRATION: { tokensPerInterval: 5, interval: 'hour' as const }, // 3 attempts per hour
  PASSWORD_RESET: { tokensPerInterval: 5, interval: 'hour' as const }, // 3 attempts per hour
  
  // Form submissions
  VERIFICATION: { tokensPerInterval: 5, interval: 'hour' as const }, // 2 attempts per hour
  REPORT: { tokensPerInterval: 10, interval: 'hour' as const }, // 5 attempts per hour
  PROFILE_UPDATE: { tokensPerInterval: 20, interval: 'hour' as const }, // 10 attempts per hour
  
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
 * Convert interval to milliseconds for express-rate-limit
 */
function getWindowMs(interval: 'second' | 'minute' | 'hour' | 'day' | number): number {
  if (typeof interval === 'number') {
    return interval;
  }
  
  switch (interval) {
    case 'second': return 1000;
    case 'minute': return 60 * 1000;
    case 'hour': return 60 * 60 * 1000;
    case 'day': return 24 * 60 * 60 * 1000;
    default: return 60 * 1000; // Default to 1 minute
  }
}

/**
 * Get or create a rate limiter for a specific key
 */
function getRateLimiter(key: string, config: RateLimitConfig) {
  if (!rateLimiters.has(key)) {
    const limiter = rateLimit({
      windowMs: getWindowMs(config.interval),
      max: config.tokensPerInterval,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      // Custom key generator to use our IP detection
      keyGenerator: () => key,
      // Skip successful requests for some endpoints
      skipSuccessfulRequests: false,
      // Skip failed requests
      skipFailedRequests: false,
    });
    rateLimiters.set(key, limiter);
  }
  
  return rateLimiters.get(key)!;
}

/**
 * Check if request should be rate limited using express-rate-limit
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
  
  return new Promise((resolve) => {
    // Create mock Express req/res objects for express-rate-limit
    const mockReq: MockExpressRequest = {
      ip: clientIP,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      url: request.url,
    };
    
    const mockRes: MockExpressResponse = {
      status: () => mockRes,
      json: () => mockRes,
      send: () => mockRes,
      set: () => mockRes,
      header: () => mockRes,
      locals: {},
    };
    
    // Apply rate limiter
    limiter(mockReq as never, mockRes as never, (error?: Error) => {
      if (error) {
        // Rate limit exceeded
        resolve({
          limited: true,
          remaining: 0,
          retryAfter: getRetryAfterSeconds(config),
        });
      } else {
        // Request allowed
        const remaining = mockRes.locals?.rateLimit?.remaining || config.tokensPerInterval - 1;
        resolve({
          limited: false,
          remaining: Math.max(0, remaining),
        });
      }
    });
  });
}

/**
 * Synchronous rate limit check (simplified version)
 */
export function checkRateLimitSync(
  request: NextRequest, 
  config: RateLimitConfig,
  identifier?: string
): { 
  limited: boolean; 
  remaining: number; 
} {
  // For sync version, we'll use a simplified in-memory counter
  const clientIP = getClientIP(request);
  const key = identifier ? `${clientIP}:${identifier}` : clientIP;
  const now = Date.now();
  const windowMs = getWindowMs(config.interval);
  
  // Simple in-memory tracking for sync calls
  const syncStore = globalThis.__rateLimitSyncStore || new Map<string, SyncRateLimitRecord>();
  globalThis.__rateLimitSyncStore = syncStore;
  
  const record = syncStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  const limited = record.count >= config.tokensPerInterval;
  
  if (!limited) {
    record.count++;
    syncStore.set(key, record);
  }
  
  return {
    limited,
    remaining: Math.max(0, config.tokensPerInterval - record.count),
  };
}

/**
 * Get remaining tokens for a specific request (simplified)
 */
export function getRemainingTokens(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): number {
  const result = checkRateLimitSync(request, config, identifier);
  return result.remaining;
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
  
  // Also clear sync store
  const syncStore = globalThis.__rateLimitSyncStore;
  if (syncStore) {
    syncStore.delete(key);
  }
}

/**
 * Get all active rate limiters (for monitoring)
 */
export function getActiveLimiters(): Array<{
  key: string;
  remaining: number;
}> {
  const limiters: Array<{ key: string; remaining: number }> = [];
  
  // This is simplified since express-rate-limit doesn't expose internal state easily
  const syncStore = globalThis.__rateLimitSyncStore;
  if (syncStore) {
    for (const [key, record] of syncStore.entries()) {
      limiters.push({
        key,
        remaining: Math.max(0, record.count || 0),
      });
    }
  }
  
  return limiters;
}

/**
 * Clean up unused rate limiters (call periodically)
 */
export function cleanupInactiveLimiters(): void {
  const now = Date.now();
  const syncStore = globalThis.__rateLimitSyncStore;
  
  if (syncStore) {
    for (const [key, record] of syncStore.entries()) {
      if (now > record.resetTime) {
        syncStore.delete(key);
      }
    }
  }
  
  // Clean up express-rate-limit instances if too many
  if (rateLimiters.size > 100) {
    const keys = Array.from(rateLimiters.keys());
    keys.slice(0, 50).forEach(key => rateLimiters.delete(key));
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
    
    // Check burst limit first (short-term protection)
    const burstResult = await checkRateLimit(request, burstRate, burstKey);
    if (burstResult.limited) {
      return burstResult;
    }
    
    // Then check sustained limit (long-term protection)
    const sustainedResult = await checkRateLimit(request, sustainedRate, sustainedKey);
    if (sustainedResult.limited) {
      return sustainedResult;
    }
    
    return {
      limited: false,
      remaining: Math.min(burstResult.remaining, sustainedResult.remaining),
    };
  };
} 