import { headers } from 'next/headers';

/**
 * Get the nonce value from request headers for CSP compliance
 * Use this in Server Components when you need to add inline scripts or styles
 */
export async function getNonce(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-nonce');
}

/**
 * Generate nonce attribute for elements that require it
 * Returns an object that can be spread into JSX props
 */
export async function getNonceProps(): Promise<{ nonce?: string }> {
  const nonce = await getNonce();
  return nonce ? { nonce } : {};
} 