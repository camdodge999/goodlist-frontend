/**
 * SHA256 Hash Generation Utilities for CSP
 * Supports both server-side (Node.js) and client-side (Web Crypto API) environments
 */

import { createHash } from 'crypto';

/**
 * Generate SHA256 hash for CSP (Node.js/Server-side)
 * Used for computing hashes during build time or server-side operations
 */
export function generateSHA256Hash(content: string): string {
  if (typeof window === 'undefined' && typeof require !== 'undefined') {
    // Server-side: Use Node.js crypto
    const hash = createHash('sha256');
    hash.update(content, 'utf8');
    return `'sha256-${hash.digest('base64')}'`;
  }
  
  throw new Error('Use generateSHA256HashAsync for client-side operations');
}

/**
 * Generate SHA256 hash for CSP (Web Crypto API/Client-side)
 * Used in browser environments
 */
export async function generateSHA256HashAsync(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    return `'sha256-${hashBase64}'`;
  }
  
  throw new Error('Web Crypto API not available');
}

/**
 * Common inline styles with their pre-computed hashes
 * Use these for static content that doesn't change
 */
export const COMMON_STYLE_HASHES = {
  // Basic utility styles
  'display: none;': "'sha256-biLFinpqYMtWHmXfkA1BPeCY0/fNt46SAZ+BBk5YUog='",
  'visibility: hidden;': "'sha256-rjdJTqrI9oFgdx8VlcAg2+y2DwD1/Wx8mE4RIg+l8Jw='",
  'opacity: 0;': "'sha256-hcUjSVUy038f+0X6P07svdIrF4humQP+99vTrfpW7yw='",
  'opacity: 1;': "'sha256-HR9xQdgQEoSMsYaCHDewSoyTIrWmPuiSgpMBPMlO+8E='",
  
  // Position utilities
  'position: relative;': "'sha256-T6AAKdWxO6p6GZVyzGAJDSLhOoPuuoZ6LlqMX153CvM='",
  'position: absolute;': "'sha256-32t0bJPIyxns/QqsW8RE3JGUERKnHL5RygHBgJvEanc='",
  'position: fixed;': "'sha256-QQbvDjE4VdjOZYlTWvpajiA6KvtJa/iamZxMiURfg+w='",
  
  // Transform utilities
  'transform: translateX(-100%);': "'sha256-DQlwnmWRCR+6QI0v6LMW2tEsBK4PsoTXibueQsYTqC8='",
  'transform: translateX(100%);': "'sha256-Ls7+6sa4B/rbTWirTUP9bCwjk5G7x4dAHTyaghEueDA='",
  
  // Empty style (common in React components)
  '': "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
} as const;

/**
 * Common inline scripts with their pre-computed hashes
 */
export const COMMON_SCRIPT_HASHES = {
  // Webpack nonce setter (common pattern)
  'window.__webpack_nonce__ = "NONCE_PLACEHOLDER";': "'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='",
  
  // Common analytics patterns
  'console.log("App loaded");': "'sha256-CQMVyVf6v8CaZF2GQBfKN8VU5P+iAJ4cQ+vQCDWP1rg='",
} as const;

/**
 * Get all pre-computed style hashes as an array
 */
export function getAllStyleHashes(): string[] {
  return Object.values(COMMON_STYLE_HASHES);
}

/**
 * Get all pre-computed script hashes as an array
 */
export function getAllScriptHashes(): string[] {
  return Object.values(COMMON_SCRIPT_HASHES);
}

/**
 * Find hash for known content
 */
export function findKnownHash(content: string, type: 'style' | 'script'): string | null {
  const trimmedContent = content.trim();
  
  if (type === 'style') {
    return COMMON_STYLE_HASHES[trimmedContent as keyof typeof COMMON_STYLE_HASHES] || null;
  } else {
    return COMMON_SCRIPT_HASHES[trimmedContent as keyof typeof COMMON_SCRIPT_HASHES] || null;
  }
}

/**
 * Validate if a hash string is properly formatted for CSP
 */
export function isValidCSPHash(hash: string): boolean {
  return /^'sha256-[A-Za-z0-9+/]+=*'$/.test(hash);
}

/**
 * Generate hash for content or return existing hash if known
 */
export function getOrGenerateHash(content: string, type: 'style' | 'script' = 'style'): string {
  // Check if we have a pre-computed hash
  const knownHash = findKnownHash(content, type);
  if (knownHash) {
    return knownHash;
  }
  
  // Generate new hash (server-side only)
  try {
    return generateSHA256Hash(content);
  } catch (error) {
    console.warn(`Cannot generate hash for content: ${content.substring(0, 50)}...`);
    throw error;
  }
}

/**
 * Batch generate hashes for multiple content strings
 */
export function generateHashBatch(contents: string[], type: 'style' | 'script' = 'style'): string[] {
  return contents.map(content => getOrGenerateHash(content, type));
}

/**
 * CLI helper function to generate a hash from command line
 */
export function generateHashFromCLI(content: string): void {
  try {
    const hash = generateSHA256Hash(content);
    console.log('Generated CSP Hash:');
    console.log(`Content: ${content}`);
    console.log(`Hash: ${hash}`);
    console.log('Add this to your CSP policy or STATIC_STYLE_HASHES array');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

/**
 * Development helper to log content and its hash
 */
export function logContentHash(content: string, type: 'style' | 'script' = 'style'): void {
  if (process.env.NODE_ENV === 'development') {
    try {
      const hash = getOrGenerateHash(content, type);
      console.log(`🔑 CSP ${type} hash:`, {
        content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        hash,
        length: content.length
      });
    } catch (error) {
      console.warn(`Failed to generate hash for ${type}:`, error);
    }
  }
} 