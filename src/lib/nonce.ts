import React from 'react';

/**
 * Get the nonce value from a request object (for Pages Router)
 * Use this in getServerSideProps or API routes
 */
export function getNonceFromRequest(req?: { headers?: Record<string, string | string[] | undefined> }): string | null {
  if (!req?.headers) return null;
  const nonce = req.headers['x-nonce'];
  return typeof nonce === 'string' ? nonce : null;
}

/**
 * Generate nonce attribute for elements that require it
 * Returns an object that can be spread into JSX props
 */
export function getNonceProps(nonce: string | null): { nonce?: string } {
  return nonce ? { nonce } : {};
}

/**
 * Client-side hook to get nonce from meta tag
 * Use this in Client Components when you need nonce
 */
export function useNonce(): string | null {
  if (typeof window === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  return metaTag?.getAttribute('content') || null;
}

/**
 * Create a CSP-compliant style tag with nonce
 * Use this for any inline styles that need to be added dynamically
 */
export function createNonceStyle(css: string, nonce: string | null): React.ReactElement {
  return React.createElement('style', { 
    nonce: nonce || undefined, 
    dangerouslySetInnerHTML: { __html: css } 
  });
}

/**
 * Create a CSP-compliant script tag with nonce
 * Use this for any inline scripts that need to be added
 */
export function createNonceScript(script: string, nonce: string | null): React.ReactElement {
  return React.createElement('script', { 
    nonce: nonce || undefined, 
    dangerouslySetInnerHTML: { __html: script } 
  });
}

/**
 * Client-side utility to add nonce to dynamically created elements
 * Call this function and pass the nonce value explicitly
 */
export function addNonceToElement(element: HTMLElement, nonce: string | null): void {
  if (nonce && (element.tagName === 'STYLE' || element.tagName === 'SCRIPT')) {
    element.setAttribute('nonce', nonce);
  }
}

/**
 * Client-side utility to add nonce to dynamically created elements
 * This version gets the nonce from the meta tag automatically
 */
export function addNonceToElementFromMeta(element: HTMLElement): void {
  if (typeof window === 'undefined') return;
  
  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  const nonce = metaTag?.getAttribute('content');
  
  if (nonce && (element.tagName === 'STYLE' || element.tagName === 'SCRIPT')) {
    element.setAttribute('nonce', nonce);
  }
} 