import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
// import { jwtDecode } from "jwt-decode";
// import { Permission } from "@/types/permission";

// Configuration object for paths and rules
const PATH_CONFIG = {
  publicPaths: ["/login", "/logout", "/signup", "/forgot-password", "/stores", "/report", "/api/auth/error", "/", "/reset-password", "api/user/register"],
  protectedPaths: ["/admin", "/verify", "/profile"],
  protectedBasePath: "/admin",
  unauthorizedPath: "/unauthorized",
  accessDeniedPath: "/access-denied",
  loginPath: "/login",
} as const;

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

// Main middleware function
export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // Skip middleware for static assets and images
    if (pathname.includes("/images")) {
      return NextResponse.next();
    }

    // Skip middleware for auth API routes
    if (pathname.startsWith("/api/auth/") || pathname === "/api/user/register" || pathname === "/api/user/register/verify") {
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

    // Get authentication token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuth = !!token;

    // Handle public paths
    if (typeof pathname === "string" && isPublicPath(pathname)) {
      // If user is authenticated and trying to access public pages like login,
      // redirect them to the protected base path
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
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated and accessing a protected path
    return NextResponse.next();
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
