import { NextRequest, NextResponse } from "next/server";
import { validateEnvironmentURLs } from './lib/ssrf-protection';
import { handleCSRFProtection } from './lib/csrf-utils';

// Validate environment URLs on startup
validateEnvironmentURLs();


// Pre-computed SHA256 hashes for static inline content
const STATIC_STYLE_HASHES = [
  "'sha256-ZDrxqUOB4m/L0JWL/+gS52g1CRH0l/qwMhjTw5Z/Fsc='", // display: none;
  "'sha256-8ilcya6PJ2mDcuNFfcZaaOL85o/T7b8cPlsalzaJVOs='", // empty style
  "'sha256-t4I2teZN5ZH+VM+XOiWlaPbsjQHe+k9d6viXPpKpNWA='", // common utility styles
  "'sha256-PhrR5O1xWiklTp5YfH8xWeig83Y/rhbrdb5whLn1pSg='", // additional utility styles
  "'sha256-MtxTLcyxVEJFNLEIqbVTaqR4WWr0+lYSZ78AzGmNsuA='", // additional utility styles
  "'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU='", // additional utility styles
  "'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk='", // additional utility styles 
  "'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg='", // additional utility styles 
  "'sha256-dz0IlE6Ej+Pf9WeZ57sEyXgzZOvzM4Agzl2f0gpN7fs='", // additional utility styles 
  "'sha256-F2FphXOLeRXcUSI4c0ybgkNqofQaEHWI1kHbjr9RHxw='", // critical CSS from document head
  "'sha256-fFiwGJFfGZ3i0Vt+xXYQgf88NKsgAfBwvY2aBowdoj4='", // critical CSS from document head
  "'sha256-sHwQzC2ZsVrt1faUYCjF/eo8aIoBlQbGjVstzanL9CU='", // critical CSS from document head
];

const STATIC_SCRIPT_HASHES = [
  "'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='", // webpack nonce script pattern
];

/**
 * Generate a secure nonce using Web Crypto API (Edge Runtime compatible)
 */
function generateNonce(): string {
  // Use crypto.randomUUID() which is supported in Edge Runtime
  const uuid = crypto.randomUUID();
  
  // Convert UUID to base64 for nonce
  // Edge Runtime compatible approach
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  
  // Convert to base64 manually since Buffer is not available in Edge Runtime
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }

  const convert = btoa(binary)
  
  return convert;
}

export async function middleware(request: NextRequest) {
  // Handle CSRF protection first for API routes and form submissions
  if (request.nextUrl.pathname.startsWith('/api/') || 
      (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS')) {
    
    // Skip CSRF for certain API routes that don't need it
    const skipCSRFPaths = [
      '/api/csrf-token',
      '/api/auth/session',
      '/api/auth/providers',
      '/api/auth/csrf',
      '/api/csp-report'
    ];
    
    const shouldSkipCSRF = skipCSRFPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    
    if (!shouldSkipCSRF) {
      const csrfResponse = await handleCSRFProtection(request);
      if (csrfResponse && csrfResponse.status === 403) {
        return csrfResponse;
      }
    }
  }

  // Generate nonce using Edge Runtime compatible method
  const nonce = generateNonce();
  
  // Build CSP header with both nonces and SHA256 hashes
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === 'development' ? "'unsafe-inline' 'unsafe-eval'" : ""} ${STATIC_SCRIPT_HASHES.join(' ')};
    style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} ${STATIC_STYLE_HASHES.join(' ')};
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'none';
    worker-src 'self' blob:;
    child-src 'self' blob:;
    manifest-src 'self';
    upgrade-insecure-requests;
  `;
  
  // Replace newline characters and spaces (Next.js docs approach)
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Create request headers with nonce (exactly as in docs)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  // Create response with updated request headers (Next.js pattern)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header on response (Next.js docs approach)
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  // Additional security headers (enhanced from your existing setup)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP Reporting (enhanced)
  response.headers.set('Report-To', JSON.stringify({
    group: 'csp-endpoint',
    max_age: 86400,
    endpoints: [{ url: '/api/csp-report' }]
  }));
  
  // Development logging with hash information
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 CSP Policy Applied (Edge Runtime Compatible):', {
      nonce: nonce.substring(0, 8) + '...',
      styleHashCount: STATIC_STYLE_HASHES.length,
      scriptHashCount: STATIC_SCRIPT_HASHES.length,
      policy: contentSecurityPolicyHeaderValue.substring(0, 150) + '...'
    });
  }

  // API security monitoring (kept from your existing implementation)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const suspiciousPatterns = [/curl/i, /wget/i, /python/i, /scanner/i, /bot/i];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious && !referer.includes(request.nextUrl.origin)) {
      console.warn(`🚨 Suspicious API request detected: ${request.nextUrl.pathname} from ${clientIP} - User-Agent: ${userAgent}`);
    }

    if (request.nextUrl.pathname === '/api/images/uploads') {
      const path = request.nextUrl.searchParams.get('path');
      if (path && (path.includes('..') || path.includes('://') || path.startsWith('/'))) {
        console.warn(`🚨 Potential path traversal attempt blocked: ${path}`);
        return new NextResponse('Invalid path parameter', { status: 400 });
      }
    }
  }

  return response;
}

// Matcher configuration (exactly as in Next.js docs)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};