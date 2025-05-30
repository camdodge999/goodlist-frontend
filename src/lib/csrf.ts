import { headers } from 'next/headers';
import { randomBytes, createHmac } from 'crypto';

/**
 * CSRF Token utility for form protection
 * Protects against Cross-Site Request Forgery attacks
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export interface CSRFToken {
  token: string;
  timestamp: number;
}

/**
 * Generate a CSRF token for forms
 */
export function generateCSRFToken(): string {
  const timestamp = Date.now();
  const randomData = randomBytes(32).toString('hex');
  const payload = `${timestamp}:${randomData}`;
  
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
    
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Validate CSRF token from form submission
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [timestamp, randomData, signature] = decoded.split(':');
    
    if (!timestamp || !randomData || !signature) {
      return false;
    }
    
    // Check if token has expired
    const tokenTime = parseInt(timestamp);
    if (Date.now() - tokenTime > TOKEN_EXPIRY) {
      return false;
    }
    
    // Verify signature
    const payload = `${timestamp}:${randomData}`;
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');
      
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Get CSRF token from request headers (for API routes)
 */
export async function getCSRFTokenFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-csrf-token');
}

/**
 * Middleware helper to validate CSRF tokens in API routes
 */
export function validateCSRFMiddleware(token: string | null): boolean {
  if (!token) {
    return false;
  }
  
  return validateCSRFToken(token);
} 