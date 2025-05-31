/**
 * CSP Utilities for implementing secure Content Security Policy
 * without unsafe-inline and unsafe-eval directives
 */

import crypto from 'crypto';

// Generate a cryptographically secure nonce
export const generateSecureNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

// Generate SHA-256 hash for inline content
export const generateContentHash = (content: string): string => {
  const hash = crypto.createHash('sha256').update(content, 'utf8').digest('base64');
  return `'sha256-${hash}'`;
};

// Common inline styles that need to be hashed for CSP
export const COMMON_INLINE_STYLES = {
  // Tailwind CSS utilities that might be inlined
  hiddenStyle: 'display: none;',
  loadingSpinner: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `,
  // Add more common styles as needed
};

// Generate hashes for common inline styles
export const getCommonStyleHashes = (): string[] => {
  return Object.values(COMMON_INLINE_STYLES).map(style => 
    generateContentHash(style.trim())
  );
};

// CSP directive builder with nonce and hash support
export interface CSPConfig {
  nonce?: string;
  additionalScriptHashes?: string[];
  additionalStyleHashes?: string[];
  isDevelopment?: boolean;
}

export const buildCSPDirectives = (config: CSPConfig = {}): Record<string, string[]> => {
  const { nonce, additionalScriptHashes = [], additionalStyleHashes = [], isDevelopment = false } = config;
  
  const baseDirectives = {
    'default-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'frame-src': ["'none'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'", "blob:"],
    'child-src': ["'self'", "blob:"],
    'manifest-src': ["'self'"],
  };

  // Script sources
  const scriptSrc = ["'self'"];
  if (isDevelopment) {
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
  } else {
    if (nonce) {
      scriptSrc.push(`'nonce-${nonce}'`);
    }
    scriptSrc.push("'strict-dynamic'");
    scriptSrc.push(...additionalScriptHashes);
  }

  // Style sources
  const styleSrc = ["'self'", "https://fonts.googleapis.com"];
  if (isDevelopment) {
    styleSrc.push("'unsafe-inline'");
  } else {
    // Add common style hashes
    styleSrc.push(...getCommonStyleHashes());
    styleSrc.push(...additionalStyleHashes);
  }

  // Image sources
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://api.goodlist.chaninkrew.com",
    "https://api.goodlist2.chaninkrew.com"
  ];

  // Font sources
  const fontSrc = ["'self'", "https://fonts.gstatic.com"];

  // Connect sources
  const connectSrc = [
    "'self'",
    "https://api.goodlist.chaninkrew.com",
    "https://api.goodlist2.chaninkrew.com"
  ];

  // Add development-specific sources
  if (isDevelopment) {
    connectSrc.push(
      "ws://localhost:*",
      "http://localhost:*",
      "https://localhost:*",
      "ws://127.0.0.1:*",
      "http://127.0.0.1:*",
      "https://127.0.0.1:*"
    );
  }

  return {
    ...baseDirectives,
    'script-src': scriptSrc,
    'style-src': styleSrc,
    'img-src': imgSrc,
    'font-src': fontSrc,
    'connect-src': connectSrc,
  };
};

// Convert CSP directives to header string
export const directivesToString = (directives: Record<string, string[]>): string => {
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// React component helper for adding nonce to scripts
export const withNonce = (nonce: string) => ({
  nonce,
  // Helper for inline script tags
  scriptProps: { nonce },
  // Helper for style tags
  styleProps: { nonce },
});

// Validate CSP directive
export const validateCSPDirective = (directive: string): boolean => {
  const validDirectives = [
    'default-src', 'script-src', 'style-src', 'img-src', 'font-src',
    'connect-src', 'media-src', 'object-src', 'base-uri', 'form-action',
    'frame-ancestors', 'frame-src', 'worker-src', 'child-src', 'manifest-src'
  ];
  
  return validDirectives.includes(directive);
};

// CSP violation report handler type
export interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': 'enforce' | 'report';
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
  };
}

// Helper to log CSP violations for debugging
export const logCSPViolation = (report: CSPViolationReport): void => {
  const violation = report['csp-report'];
  console.warn('CSP Violation:', {
    directive: violation['violated-directive'],
    blockedUri: violation['blocked-uri'],
    documentUri: violation['document-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number'],
  });
}; 