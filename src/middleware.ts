import { NextRequest, NextResponse } from "next/server";
// import {  getToken } from "next-auth/jwt";
// import NextAuth, { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { validateEnvironmentURLs } from './lib/ssrf-protection';

// const PATH_CONFIG = {
//   publicPaths: ["/login", "/logout", "/signup", "/forgot-password", "/stores", "/report", "/api/auth/error", "/", "/reset-password", "/api/user/register"],
//   protectedPaths: ["/admin", "/verify", "/profile"],
//   protectedBasePath: "/admin",
//   unauthorizedPath: "/unauthorized",
//   accessDeniedPath: "/access-denied",
//   loginPath: "/login",
// } as const;

// const isPublicPath = (pathname: string): boolean =>
//   PATH_CONFIG.publicPaths.includes(pathname as typeof PATH_CONFIG.publicPaths[number]) ||
//   pathname === PATH_CONFIG.unauthorizedPath ||
//   pathname === PATH_CONFIG.accessDeniedPath;

// Validate environment URLs on startup
validateEnvironmentURLs();

export function middleware(request: NextRequest) {
  // Generate a fresh nonce for each request (following Next.js best practices)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Determine if we're in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Build CSP header following Next.js recommendations
  const cspHeader = `
    default-src 'self';
    script-src 'self' ${isDevelopment ? "'unsafe-inline' 'unsafe-eval'" : `'nonce-${nonce}' 'strict-dynamic'`};
    style-src 'self' ${isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://fonts.googleapis.com;
    img-src 'self' data: blob: https://images.unsplash.com https://api.goodlist.chaninkrew.com https://api.goodlist2.chaninkrew.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.goodlist.chaninkrew.com https://api.goodlist2.chaninkrew.com ${isDevelopment ? 'ws://localhost:* http://localhost:* https://localhost:* ws://127.0.0.1:* http://127.0.0.1:* https://127.0.0.1:*' : ''};
    media-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'none';
    worker-src 'self' blob:;
    child-src 'self' blob:;
    manifest-src 'self';
    report-to csp-endpoint;
    ${isDevelopment ? '' : 'upgrade-insecure-requests;'}
  `;

  // Clean up the CSP header (remove extra whitespace and newlines)
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Create request headers with nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with updated request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers on response
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Report-To header for modern CSP reporting
  response.headers.set('Report-To', JSON.stringify({
    group: 'csp-endpoint',
    max_age: 86400, // 24 hours
    endpoints: [
      {
        url: '/api/csp-report'
      }
    ]
  }));
  
  // Security headers to prevent information leakage in redirects
  response.headers.set('X-Redirect-Security', 'minimal-response');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  
  // Set CSP header (enforce in production, report-only in development)
  const cspHeaderName = isDevelopment ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  response.headers.set(cspHeaderName, contentSecurityPolicyHeaderValue);

  // Additional validation for API routes that might be vulnerable
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Log suspicious requests
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Get client IP from headers
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /scanner/i,
      /bot/i,
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious && !referer.includes(request.nextUrl.origin)) {
      console.warn(`🚨 Suspicious API request detected: ${request.nextUrl.pathname} from ${clientIP} - User-Agent: ${userAgent}`);
      // You might want to implement rate limiting here
    }

    // Validate specific vulnerable endpoints
    if (request.nextUrl.pathname === '/api/images/uploads') {
      const path = request.nextUrl.searchParams.get('path');
      if (path) {
        // Basic validation in middleware
        if (path.includes('..') || path.includes('://') || path.startsWith('/')) {
          console.warn(`🚨 Potential path traversal attempt blocked in middleware: ${path}`);
          return new NextResponse('Invalid path parameter', { status: 400 });
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But include API routes to ensure CSP headers are set everywhere
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};