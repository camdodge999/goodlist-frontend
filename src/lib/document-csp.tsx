/**
 * Simple CSP Utilities
 * Basic CSP helper functions for client-side operations
 */

import { headers } from 'next/headers';
import { getAllStyleHashes, getAllScriptHashes } from './sha256-utils';

/**
 * Hook for getting basic CSP information in Client Components
 */
export function useCSP() {
  const hasNonce = typeof window !== 'undefined' && 
    document.querySelector('script[nonce]') !== null;
  
  const webpackNonce = typeof window !== 'undefined' && 
    (window as any).__webpack_nonce__;

  const cspMetaTag = typeof window !== 'undefined' &&
    document.querySelector('meta[http-equiv="Content-Security-Policy"]');

  return {
    hasNonce,
    webpackNonce,
    hasCspMetaTag: !!cspMetaTag,
    cspPolicy: cspMetaTag ? (cspMetaTag as HTMLMetaElement).content : null
  };
}

/**
 * Utility to inject CSP hashes into existing styles
 */
export function injectCSPHashes(
  styleElement: HTMLStyleElement, 
  hashes: string[]
): void {
  if (typeof window === 'undefined') return;

  // Add hash information as data attributes
  styleElement.setAttribute('data-csp-hashes', hashes.join(','));
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Injected CSP hashes:', {
      element: styleElement,
      hashes: hashes.length,
      content: styleElement.textContent?.substring(0, 50) + '...'
    });
  }
}

/**
 * Basic CSP Status Checker
 */
export async function getCSPStatus() {
  // Get nonce from middleware headers
  let nonce: string | null = null;
  try {
    const headersList = await headers();
    nonce = headersList.get('x-nonce');
  } catch (error) {
    console.warn('Could not get nonce from headers:', error);
  }

  // Get available hashes
  const styleHashes = getAllStyleHashes();
  const scriptHashes = getAllScriptHashes();

  return {
    middleware: {
      hasNonce: !!nonce,
      nonceValue: nonce?.substring(0, 8) + '...' || null
    },
    hashes: {
      styleCount: styleHashes.length,
      scriptCount: scriptHashes.length,
      total: styleHashes.length + scriptHashes.length
    },
    security: {
      noncesEnabled: !!nonce,
      hashesEnabled: styleHashes.length > 0,
      hybridApproach: !!nonce && styleHashes.length > 0
    }
  };
}

/**
 * Simple CSP Meta Tag Component (backup for when headers aren't available)
 */
export async function CSPMetaTag({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) return null;

  // Get nonce from middleware
  let nonce: string | null = null;
  try {
    const headersList = await headers();
    nonce = headersList.get('x-nonce');
  } catch (error) {
    return null;
  }

  if (!nonce) return null;

  // Get hashes
  const styleHashes = getAllStyleHashes();
  const scriptHashes = getAllScriptHashes();

  // Build basic CSP policy
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${scriptHashes.join(' ')}`,
    `style-src 'self' 'nonce-${nonce}' ${styleHashes.join(' ')}`,
    "img-src 'self' blob: data: https://images.unsplash.com https://api.goodlist2.chaninkrew.com",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "connect-src 'self' https://api.goodlist.chaninkrew.com https://api.goodlist2.chaninkrew.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  const cspContent = cspDirectives.join('; ');

  return (
    <meta 
      httpEquiv="Content-Security-Policy" 
      content={cspContent}
    />
  );
} 