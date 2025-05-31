/**
 * Nonce utilities for CSP implementation
 * Following Next.js CSP documentation recommendations
 */

import { headers } from 'next/headers';

/**
 * Get the nonce from request headers in Server Components
 * This follows the Next.js CSP documentation pattern
 */
export async function getNonce(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('x-nonce');
  } catch (error) {
    console.warn('Failed to get nonce from headers:', error);
    return null;
  }
}

/**
 * Get nonce props for Script components
 * Usage: <Script {...await getNonceProps()} src="..." />
 */
export async function getNonceProps() {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
}

/**
 * Get nonce for inline scripts/styles
 * Usage: <script {...await getInlineProps()}>...</script>
 */
export async function getInlineProps() {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
} 