import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import NextAuth, { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withAuth } from "next-auth/middleware";

const PATH_CONFIG = {
  publicPaths: ["/login", "/logout", "/signup", "/forgot-password", "/stores", "/report", "/api/auth/error", "/", "/reset-password", "/api/user/register"],
  protectedPaths: ["/admin", "/verify", "/profile"],
  protectedBasePath: "/admin",
  unauthorizedPath: "/unauthorized",
  accessDeniedPath: "/access-denied",
  loginPath: "/login",
} as const;

const isPublicPath = (pathname: string): boolean =>
  PATH_CONFIG.publicPaths.includes(pathname as typeof PATH_CONFIG.publicPaths[number]) ||
  pathname === PATH_CONFIG.unauthorizedPath ||
  pathname === PATH_CONFIG.accessDeniedPath;

const isApiRoute = (pathname: string): boolean => pathname.startsWith("/api/");


export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    console.log(`Processing path: ${pathname}`);

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
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};