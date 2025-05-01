import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { jwtDecode } from "jwt-decode";
import { withAuth } from "next-auth/middleware";
// import { Permission } from "@/types/permission";

// Configuration object for paths and rules
const PATH_CONFIG = {
  publicPaths: ["/login", "/signup", "/forgot-password", "/api/auth/error", "/"],
  protectedPaths: ["/admin", "/verify"],
  protectedBasePath: "/admin",
  unauthorizedPath: "/unauthorized",
  accessDeniedPath: "/access-denied",
  loginPath: "/login",
} as const;


const fetchSession = async (pathname: string, token: string) => {
  try {
    const prependPath = pathname.split("/")[1] || '';
    const response = await fetch(`${process.env.NEXTAUTH_BACKEND_URL!}/auth/session/${prependPath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if(response.status === 400) {
      return {
        status: 400,
        role: null
      }
    }

    if(response.status === 401) {
      return {
        status: 401,
        role: null
      }
    } else if (response.status === 403) {
      return {
        status: 403,
        role: null
      }
    }

    const { role } = await response.json();

    return {
      status:response.status,
      role: role
    }
  } catch (error: any) {
    console.log("Error fetching session:", error.status);
    return {
      status: error.status || 500, // Get the status code from error, default to 500
      role: null
    }; 
  }
}


// Utility function to check if a path is public
const isPublicPath = (pathname: string): boolean =>
  PATH_CONFIG.publicPaths.includes(
    pathname as typeof PATH_CONFIG.publicPaths[number]
  ) ||
  pathname === PATH_CONFIG.unauthorizedPath ||
  pathname === PATH_CONFIG.accessDeniedPath;

// Check if the current path is an API route
const isApiRoute = (pathname: string): boolean => {
  return pathname.startsWith("/api/");
};

// Check if the path is a dashboard monitor API route
const isDashboardMonitorApi = (pathname: string): boolean => {
  return pathname.startsWith("/api/dashboard/") || pathname.startsWith("/api/auth/monitor-token");
};

// Main middleware function
export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // Skip middleware for dashboard API routes - they use their own auth mechanism
    if (isDashboardMonitorApi(pathname)) {
      return NextResponse.next();
    }
    
    // Skip middleware for auth API routes
    if (pathname.startsWith("/api/auth/") && pathname !== "/api/auth/monitor-token") {
      return NextResponse.next();
    }
    
    // For other API routes, check authentication but don't redirect
    if (isApiRoute(pathname)) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      if (!token) {
        return NextResponse.json(
          { status: "error", message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    }

    // Continue with authentication checks for non-API routes
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuth = !!token;
    // const headerToken = token?.token as string | null;


    // Handle public paths
    if (typeof pathname === "string" && isPublicPath(pathname)) {
      if (
        isAuth &&
        pathname !== PATH_CONFIG.unauthorizedPath &&
        pathname !== PATH_CONFIG.accessDeniedPath
      ) {
        return NextResponse.redirect(
          new URL(PATH_CONFIG.protectedBasePath as string, req.url)
        );
      }
      return NextResponse.next();
    }

    // Handle protected paths - require authentication
    if (!isAuth) {
      const loginUrl = new URL(PATH_CONFIG.loginPath, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      return response;
    }

    // Check token expiration
    if (token && typeof token.exp === 'number') {
      const expiresAt = token.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // If token is expired or about to expire (within 5 seconds)
      if (expiresAt - now < 5000) {
        const loginUrl = new URL(PATH_CONFIG.loginPath, req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    if(pathname.startsWith("/fonts")){
      return NextResponse.next();
    }
    
    
    const {status} = await fetchSession(pathname, token?.token as string);

    if (status === 401) {
      const loginUrl = new URL(PATH_CONFIG.loginPath, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    } else if (status === 403) {
      return NextResponse.redirect(new URL(PATH_CONFIG.unauthorizedPath, req.url));
    } else if (status === 400) {
      // Clear the NextAuth session cookie
      const response = NextResponse.redirect(new URL(PATH_CONFIG.loginPath, req.url));
      response.cookies.set({
        name: `__Secure-next-auth.session-token`,
        value: '',
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: '/',
      });
      response.cookies.set({
        name: `__Secure-next-auth.callback-url`,
        value: '',
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: '/',
      });
      response.cookies.set({
        name: 'next-auth.csrf-token',
        value: '',
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: '/',
      });
      response.cookies.set({
        name: 'next-auth.callback-url',
        value: '',
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: '/',
      });
      
      // Add the callback URL for after login
      const url = new URL(PATH_CONFIG.loginPath, req.url);
      url.searchParams.set("callbackUrl", pathname);
      response.headers.set("Location", url.toString());
      
      return response;
    }


    // Proceed with the request
    const response = NextResponse.next();
    return response;
  },
  {
    callbacks: {
      authorized: () => true, // Middleware handles all authorization logic
    },
  }
);

// Optional: Middleware matcher for performance (Next.js 15+)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Apply to all routes except static assets
  ],
};
