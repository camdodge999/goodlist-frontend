import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CSRF Configuration
export const CSRF_CONFIG = {
  tokenName: 'next-auth.csrf-token',
  headerName: 'X-CSRF-Token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  tokenLength: 32,
} as const;

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Get CSRF token from cookies (server-side) - for server components
 * This function should only be used in server components, not in middleware
 */
export async function getCSRFTokenFromCookies(): Promise<string | undefined> {
  try {
    // Dynamic import to avoid Edge Runtime issues
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(CSRF_CONFIG.tokenName);
    return token?.value;
  } catch {
    return undefined;
  }
}

/**
 * Get CSRF token from request cookies (middleware-compatible)
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | undefined {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return undefined;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
    
    return cookies[CSRF_CONFIG.tokenName];
  } catch {
    return undefined;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequestData(request: NextRequest): string | undefined {
  // Try header first
  const headerToken = request.headers.get(CSRF_CONFIG.headerName);
  if (headerToken) return headerToken;

  // For form submissions and JSON, the token will be extracted in the validation function
  return undefined;
}

/**
 * Set CSRF token in response cookies
 */
export function setCSRFTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_CONFIG.tokenName, token, CSRF_CONFIG.cookieOptions);
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(cookieToken: string | undefined, requestToken: string | undefined): boolean {
  if (!cookieToken || !requestToken) {
    return false;
  }

  // Ensure both tokens are the same length
  if (cookieToken.length !== requestToken.length) {
    return false;
  }

  try {
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(requestToken, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !safeMethods.includes(method.toUpperCase());
}

/**
 * Generate or retrieve existing CSRF token for response
 */
export function ensureCSRFToken(request: NextRequest, response: NextResponse): string {
  // Try to get existing token from cookies
  let token = getCSRFTokenFromRequest(request);

  // Generate new token if none exists or invalid
  if (!token || token.length !== CSRF_CONFIG.tokenLength * 2) {
    token = generateCSRFToken();
  }

  // Set token in response cookies
  setCSRFTokenCookie(response, token);
  
  return token;
}

/**
 * Middleware function to handle CSRF protection
 */
export async function handleCSRFProtection(request: NextRequest): Promise<NextResponse | null> {
  const response = NextResponse.next();
  
  // Always ensure CSRF token exists (for both GET and POST requests)
  const token = ensureCSRFToken(request, response);
  
  // For state-changing methods, validate the token
  if (requiresCSRFProtection(request.method)) {
    const cookieToken = token;
    let requestToken: string | undefined;

    // Get token from header
    requestToken = request.headers.get(CSRF_CONFIG.headerName) ?? undefined;

    // If not in header, try to get from form data
    if (!requestToken && request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await request.clone().formData();
        requestToken = formData.get('csrfToken') as string ?? undefined;
      } catch {
        // Ignore form parsing errors
      }
    }

    // If not in form data, try JSON body
    if (!requestToken && request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.clone().json();
        requestToken = body.csrfToken ?? undefined;
      } catch {
        // Ignore JSON parsing errors
      }
    }

    // Validate token
    if (!validateCSRFToken(cookieToken, requestToken)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'CSRF token validation failed',
          statusCode: 403 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return response;
}

/**
 * Client-side utility to get CSRF token from cookies
 */
export function getCSRFTokenFromBrowser(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[CSRF_CONFIG.tokenName];
} 