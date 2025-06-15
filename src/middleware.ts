import { NextRequest, NextResponse } from "next/server";
import { validateEnvironmentURLs } from './lib/ssrf-protection';
import { handleCSRFProtection } from './lib/csrf-utils';

// Validate environment URLs on startup
validateEnvironmentURLs();


// Pre-computed SHA256 hashes for static inline content
const STATIC_STYLE_HASHES = [
  "'sha256-Ylx4sWaDgn6RRamxe7jevX4yDhNtiSG3CQWrPAdPh6A='", // display: none;
  "'sha256-TkUgajJ946/xb1R0Vfeuzb73k2VAKoEIF3sRGeX4aBU='",
  "'sha256-rZot9UVcdtXL99KiVSLfpDfxS3VtOsOY1PXjNX1ntxg='",
  "'sha256-k1m9MgjuV56OVgoQq43A5vLIpdJFJrlq/3ANCGJD4es='",
  "'sha256-m8dEh7VmKFRCO8jEWPbmkeO1mq4SIx8omtyx50rrS/M='",
  "'sha256-fNQvmabDUct/Q8bVROR2oAMzjWD2CYHGuJj7V7Sxgfc='",
  "'sha256-t4I2teZN5ZH+VM+XOiWlaPbsjQHe+k9d6viXPpKpNWA='",
  "'sha256-sHwQzC2ZsVrt1faUYCjF/eo8aIoBlQbGjVstzanL9CU='",
  "'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg='",
  "'sha256-uHMRMH/uk4ERGIkgk2bUAqw+i1tFFbeiOQTApmnK3t4='", // critical CSS from document head
  "'sha256-2cnE1GtP/E924RqY1dke4GjgMTwo242VoJSnZn4Jdcw='", // critical CSS from document head
  "'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU='",
  "'sha256-8ilcya6PJ2mDcuNFfcZaaOL85o/T7b8cPlsalzaJVOs='",
  "'sha256-MtxTLcyxVEJFNLEIqbVTaqR4WWr0+lYSZ78AzGmNsuA='",
  "'sha256-fFiwGJFfGZ3i0Vt+xXYQgf88NKsgAfBwvY2aBowdoj4='",
  "'sha256-PhrR5O1xWiklTp5YfH8xWeig83Y/rhbrdb5whLn1pSg='",
  "'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='",
  "'sha256-4/2nIlfwIVTJ1+JcNQ6LkeVWzNS148LKAJeL5yofdN4='"
];

const STATIC_SCRIPT_HASHES = [
  "'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='", // webpack nonce script pattern
];

const authPages = ['/login', '/register', '/logout', '/verify', '/blog-management', '/blog-management/new', '/blog-management/edit', '/profile'];

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
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'  ${process.env.NODE_ENV === 'development' ? "'unsafe-inline' 'unsafe-eval'" : ""} ${STATIC_SCRIPT_HASHES.join(' ')};
    style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} ${STATIC_STYLE_HASHES.join(' ')};
    img-src 'self' blob: data:;
    script-src-elem 'self' 'nonce-${nonce}' 'strict-dynamic'  ${process.env.NODE_ENV === 'development' ? "'unsafe-inline' 'unsafe-eval'" : ""} ${STATIC_SCRIPT_HASHES.join(' ')};
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

  const isAuthPage = authPages.some(page => request.nextUrl.pathname.startsWith(page));

  if (isAuthPage) {
    // Additional security for auth pages to prevent information leakage
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Redirect-Security', 'minimal-response');
    response.headers.set('X-Auth-Page', 'true');
  }

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

    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /scanner/i,
      /bot/i,
      /postman/i, 
      /insomnia/i, 
      /insomnia-rest-client/i, 
      /insomnia-rest-client-app/i, 
      /insomnia-rest-client-app-mac/i, 
      /insomnia-rest-client-app-linux/i, 
      /insomnia-rest-client-app-windows/i,
      /selenium/i,
      /phantomjs/i,
      /puppeteer/i,
      /headless/i,
      /mechanize/i,
      /scrapy/i,
      /playwright/i,
      /node-fetch/i,
      /http-client/i,
      /masscan/i,
      /cfnetwork/i, // Often used by Apple tools/scripts
    ];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

    if (isSuspicious && !referer.includes(request.nextUrl.origin)) {
      console.warn(`🚨 Suspicious API request detected: ${request.nextUrl.pathname} from ${clientIP} - User-Agent: ${userAgent}`);
      return new NextResponse('Invalid request', { status: 403 });
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