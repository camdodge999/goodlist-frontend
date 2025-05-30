import { NextRequest, NextResponse } from "next/server";
// import {  getToken } from "next-auth/jwt";
// import NextAuth, { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { withAuth } from "next-auth/middleware";

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

const isApiRoute = (pathname: string): boolean => pathname.startsWith("/api/");

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Generate nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    // Define Content Security Policy
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
      style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://images.unsplash.com https://api.goodlist2.chaninkrew.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.goodlist2.chaninkrew.com ${process.env.NEXT_PUBLIC_BACKEND_URL};
      media-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'none';
      upgrade-insecure-requests;
    `;

    // Clean up CSP header (remove newlines and extra spaces)
    const contentSecurityPolicyHeaderValue = cspHeader
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Skip middleware for static assets and images
    if (pathname.includes("/images")) {
      return NextResponse.next();
    }

    // Skip middleware for auth API routes
    if (pathname.startsWith("/api/auth/") || pathname === "/api/user/register" || pathname === "/api/user/register/verify") {
      return NextResponse.next();
    }

    // For other API routes, check authentication
    if (isApiRoute(pathname)) {
      // console.log(`API Route Session:`, session);
      // if (!session) {
      //   return NextResponse.json(
      //     { status: "error", message: "Unauthorized" },
      //     { status: 401 }
      //   );
      // }
      return NextResponse.next();
    }

    // Create response with CSP and security headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set security headers on response
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Get authentication token
    // console.log(`Session:`, session, `isAuth: ${isAuth}`);

    // // Handle public paths
    // if (isPublicPath(pathname)) {
    //   if (
    //     isAuth &&
    //     pathname !== PATH_CONFIG.unauthorizedPath &&
    //     pathname !== PATH_CONFIG.accessDeniedPath
    //   ) {
    //     console.log(`Authenticated user accessing public path, redirecting to ${PATH_CONFIG.protectedBasePath}`);
    //     return NextResponse.redirect(new URL(PATH_CONFIG.protectedBasePath, req.url));
    //   }
    //   return NextResponse.next();
    // }

    // // Handle protected paths
    // if (PATH_CONFIG.protectedPaths.includes(pathname as typeof PATH_CONFIG.protectedPaths[number])) {
    //   console.log(`Accessing protected path: ${pathname}, isAuth: ${isAuth}`);
    //   if (!isAuth) {
    //     const loginUrl = new URL(PATH_CONFIG.loginPath, req.url);
    //     loginUrl.searchParams.set("callbackUrl", pathname);
    //     console.log(`Unauthenticated, redirecting to ${loginUrl}`);
    //     return NextResponse.redirect(loginUrl);
    //   }
    // }

    // Allow access to authenticated users
    return response;
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

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