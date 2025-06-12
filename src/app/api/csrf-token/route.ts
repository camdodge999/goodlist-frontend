import { NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFTokenCookie, getCSRFTokenFromCookies } from '@/lib/csrf-utils';

/**
 * GET /api/csrf-token
 * Generate or return existing CSRF token
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Try to get existing token from cookies
    let token = await getCSRFTokenFromCookies();
    
    // Generate new token if none exists
    token ??= generateCSRFToken();

    // Create response with token
    const response = NextResponse.json({ 
      token,
      success: true 
    });

    // Set token in cookies
    setCSRFTokenCookie(response, token);

    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate CSRF token',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/csrf-token
 * Refresh CSRF token (generate new one)
 */
export async function POST(): Promise<NextResponse> {
  try {
    // Always generate a new token for POST requests
    const token = generateCSRFToken();

    const response = NextResponse.json({ 
      token,
      success: true,
      refreshed: true
    });

    // Set new token in cookies
    setCSRFTokenCookie(response, token);

    return response;
  } catch (error) {
    console.error('Error refreshing CSRF token:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh CSRF token',
        success: false 
      },
      { status: 500 }
    );
  }
} 