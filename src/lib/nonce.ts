/**
 * Nonce utilities for CSP implementation
 * Following Next.js CSP documentation exactly:
 * https://nextjs.org/docs/app/guides/content-security-policy
 */

import { headers } from 'next/headers';

/**
 * Get the nonce from request headers in Server Components
 * This follows the exact Next.js CSP documentation pattern
 */
export async function getNonce(): Promise<string | null> {
  try {
    const headersList = await headers();
    const nonce = headersList.get('x-nonce');
    return nonce;
  } catch (error) {
    // During static generation, headers() is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to get nonce from headers (likely static generation):', error);
    }
    return null;
  }
}

/**
 * Get nonce props for Next.js Script components
 * Usage: <Script {...await getNonceProps()} src="..." />
 * Follows the official documentation pattern
 */
export async function getNonceProps(): Promise<{ nonce?: string }> {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
}

/**
 * Get nonce for inline scripts
 * Usage: <script {...await getScriptProps()}>...</script>
 */
export async function getScriptProps(): Promise<{ nonce?: string }> {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
}

/**
 * Get nonce for inline styles
 * Usage: <style {...await getStyleProps()}>...</style>
 */
export async function getStyleProps(): Promise<{ nonce?: string }> {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
}

/**
 * Check if nonce is available
 */
export async function hasNonce(): Promise<boolean> {
  const nonce = await getNonce();
  return !!nonce;
}

/**
 * Client-side hook to check if nonces are available in DOM
 */
export function useNonceAvailable(): boolean {
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[nonce]');
    const styles = document.querySelectorAll('style[nonce]');
    return scripts.length > 0 || styles.length > 0;
  }
  return false;
}

/**
 * Debug utility following Next.js patterns
 */
export async function debugNonce(): Promise<void> {
  const nonce = await getNonce();
  
  console.log('🔍 CSP Nonce Debug (Next.js Pattern):');
  console.log('====================================');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Nonce available: ${!!nonce}`);
  
  if (nonce) {
    console.log(`Nonce value: ${nonce.substring(0, 8)}...`);
    console.log(`Nonce length: ${nonce.length}`);
  } else {
    console.log('❌ No nonce found');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check if middleware is running');
    console.log('   2. Ensure you\'re using Server Components');
    console.log('   3. Check x-nonce header in network tab');
  }
  
  console.log('====================================');
} 