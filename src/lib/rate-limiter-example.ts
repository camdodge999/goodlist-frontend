import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from './rate-limiter';

/**
 * Example: Using the rate limiter in a Next.js API route
 * This shows how to use the express-rate-limit based rate limiter
 */

// Example 1: Basic API route with rate limiting
export async function handleLoginAPI(request: NextRequest) {
  // Check rate limit for login attempts
  const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.LOGIN, 'login');
  
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: rateLimitResult.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    );
  }

  // Process login logic here
  return NextResponse.json({ 
    message: 'Login successful',
    remaining: rateLimitResult.remaining 
  });
}

// Example 2: API route with custom rate limiting
export async function handleCustomAPI(request: NextRequest) {
  // Custom rate limit: 10 requests per minute
  const customConfig = { tokensPerInterval: 10, interval: 'minute' as const };
  const rateLimitResult = await checkRateLimit(request, customConfig, 'custom-api');
  
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Your API logic here
  return NextResponse.json({ message: 'Success' });
}

// Example 3: Middleware usage
export async function rateLimitMiddleware(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.API_GENERAL);
  
  if (rateLimitResult.limited) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        },
      }
    );
  }

  // Continue to next middleware or route
  return NextResponse.next();
}

/**
 * Example usage in an actual API route file:
 * 
 * // pages/api/auth/login.ts or app/api/auth/login/route.ts
 * import { NextRequest } from 'next/server';
 * import { handleLoginAPI } from '@/lib/rate-limiter-example';
 * 
 * export async function POST(request: NextRequest) {
 *   return handleLoginAPI(request);
 * }
 */

/**
 * Example usage in middleware:
 * 
 * // middleware.ts
 * import { NextRequest } from 'next/server';
 * import { rateLimitMiddleware } from '@/lib/rate-limiter-example';
 * 
 * export async function middleware(request: NextRequest) {
 *   return rateLimitMiddleware(request);
 * }
 * 
 * export const config = {
 *   matcher: '/api/:path*',
 * };
 */ 