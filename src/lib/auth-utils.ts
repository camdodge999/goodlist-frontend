import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Server-side authentication utilities for page-level access control
 */

export interface AuthCheckOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  allowRoles?: string[];
}

/**
 * Check authentication and authorization for server components
 * Similar to login page pattern but with role-based access control
 */
export async function checkAuth(options: AuthCheckOptions = {}) {
  const {
    requireAuth = false,
    requireAdmin = false,
    redirectTo = "/login",
    allowRoles = []
  } = options;

  const session = await getServerSession(authOptions);

  // Check if authentication is required
  if (requireAuth && !session?.user) {
    redirect(redirectTo);
  }

  // Check if admin role is required
  if (requireAdmin && (!session?.user || session.user.role !== "admin")) {
    redirect(redirectTo);
  }

  // Check if user has one of the allowed roles
  if (allowRoles.length > 0 && session?.user) {
    const userRole = session.user.role;
    if (!userRole || !allowRoles.includes(userRole)) {
      redirect(redirectTo);
    }
  }

  return session;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(redirectTo: string = "/login") {
  return checkAuth({ requireAuth: true, redirectTo });
}

/**
 * Require admin role - redirect to login if not admin
 */
export async function requireAdmin(redirectTo: string = "/login") {
  return checkAuth({ requireAdmin: true, redirectTo });
}

/**
 * Require specific roles - redirect if user doesn't have required role
 */
export async function requireRoles(roles: string[], redirectTo: string = "/login") {
  return checkAuth({ requireAuth: true, allowRoles: roles, redirectTo });
}

/**
 * Check if user is authenticated (returns boolean, doesn't redirect)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Check if user is admin (returns boolean, doesn't redirect)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

/**
 * Get current user session (returns null if not authenticated)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
} 