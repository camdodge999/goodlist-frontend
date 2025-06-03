/**
 * Edge Runtime Compatible Crypto Utilities
 * For use in Next.js middleware and Edge Runtime contexts
 */

/**
 * Generate SHA256 hash using Web Crypto API (Edge Runtime compatible)
 */
export async function generateSHA256HashEdge(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert to base64 manually (Edge Runtime compatible)
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  
  return `'sha256-${btoa(binary)}'`;
}

/**
 * Generate multiple hashes from content array (Edge Runtime compatible)
 */
export async function generateHashBatchEdge(contents: string[]): Promise<string[]> {
  const hashPromises = contents.map(content => generateSHA256HashEdge(content));
  return Promise.all(hashPromises);
}

/**
 * Generate a secure nonce using Web Crypto API (Edge Runtime compatible)
 */
export function generateSecureNonce(): string {
  // Use crypto.randomUUID() which is supported in Edge Runtime
  const uuid = crypto.randomUUID();
  
  // Convert UUID to base64 for nonce
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  
  // Convert to base64 manually since Buffer is not available in Edge Runtime
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  
  return btoa(binary);
}

/**
 * Alternative nonce generation using crypto.getRandomValues (Edge Runtime compatible)
 */
export function generateRandomNonce(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  
  return btoa(binary);
}

/**
 * Validate if a hash string is properly formatted for CSP
 */
export function isValidCSPHashEdge(hash: string): boolean {
  return /^'sha256-[A-Za-z0-9+/]+=*'$/.test(hash);
}

/**
 * Common inline styles with their pre-computed hashes (Edge Runtime safe)
 */
export const EDGE_COMMON_STYLE_HASHES = {
  'display: none;': "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='",
  'visibility: hidden;': "'sha256-rjdJTqrI9oFgdx8VlcAg2+y2DwD1/Wx8mE4RIg+l8Jw='",
  'opacity: 0;': "'sha256-hcUjSVUy038f+0X6P07svdIrF4humQP+99vTrfpW7yw='",
  'opacity: 1;': "'sha256-HR9xQdgQEoSMsYaCHDewSoyTIrWmPuiSgpMBPMlO+8E='",
  'position: relative;': "'sha256-T6AAKdWxO6p6GZVyzGAJDSLhOoPuuoZ6LlqMX153CvM='",
  'position: absolute;': "'sha256-32t0bJPIyxns/QqsW8RE3JGUERKnHL5RygHBgJvEanc='",
  'position: fixed;': "'sha256-QQbvDjE4VdjOZYlTWvpajiA6KvtJa/iamZxMiURfg+w='",
  '': "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // empty style
} as const;

/**
 * Get all edge-compatible style hashes as an array
 */
export function getAllEdgeStyleHashes(): string[] {
  return Object.values(EDGE_COMMON_STYLE_HASHES);
}

/**
 * Find hash for known content (Edge Runtime compatible)
 */
export function findKnownHashEdge(content: string): string | null {
  const trimmedContent = content.trim();
  return EDGE_COMMON_STYLE_HASHES[trimmedContent as keyof typeof EDGE_COMMON_STYLE_HASHES] || null;
}

/**
 * Batch validate CSP hashes
 */
export function validateCSPHashesEdge(hashes: string[]): boolean {
  return hashes.every(hash => isValidCSPHashEdge(hash));
}

/**
 * Create CSP directive with nonce and hashes (Edge Runtime compatible)
 */
export function createCSPDirective(
  directive: string,
  nonce: string,
  hashes: string[] = [],
  additionalSources: string[] = []
): string {
  const sources = [
    "'self'",
    `'nonce-${nonce}'`,
    ...hashes,
    ...additionalSources
  ];
  
  return `${directive} ${sources.join(' ')};`;
}

/**
 * Build complete CSP header (Edge Runtime compatible)
 */
export function buildCSPHeader(options: {
  nonce: string;
  styleHashes?: string[];
  scriptHashes?: string[];
  additionalDirectives?: Record<string, string[]>;
}): string {
  const { nonce, styleHashes = [], scriptHashes = [], additionalDirectives = {} } = options;
  
  const directives = [
    "default-src 'self'",
    createCSPDirective('script-src', nonce, scriptHashes, ["'strict-dynamic'"]),
    createCSPDirective('style-src', nonce, styleHashes),
    "img-src 'self' blob: data: https://images.unsplash.com https://api.goodlist2.chaninkrew.com",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "connect-src 'self' https://api.goodlist.chaninkrew.com https://api.goodlist2.chaninkrew.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  // Add any additional directives
  Object.entries(additionalDirectives).forEach(([directive, sources]) => {
    directives.push(`${directive} ${sources.join(' ')}`);
  });
  
  return directives.join('; ');
}

/**
 * Development logging helper (Edge Runtime compatible)
 */
export function logCSPInfoEdge(options: {
  nonce: string;
  styleHashCount: number;
  scriptHashCount: number;
  policy: string;
}): void {
  if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔒 Edge CSP Policy Applied:', {
      nonce: options.nonce.substring(0, 8) + '...',
      styleHashes: options.styleHashCount,
      scriptHashes: options.scriptHashCount,
      policy: options.policy.substring(0, 150) + '...',
      runtime: 'Edge Runtime Compatible'
    });
  }
} 