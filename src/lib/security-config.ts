import crypto from 'crypto';

/**
 * Centralized Security Configuration for SSRF Protection
 * and other security measures
 */

export const SECURITY_CONFIG = {
  // SSRF Protection Settings
  ssrf: {
    // Allowed domains for external requests
    allowedDomains: [
      'api.goodlist2.chaninkrew.com',
      'images.unsplash.com',
    ],
    
    // Allowed localhost ports (only in development)
    allowedLocalhostPorts: [3000, 4200],
    
    // Request timeout in milliseconds
    requestTimeout: 30000,
    
    // Maximum redirects allowed
    maxRedirects: 3,
    
    // Block private IP ranges
    blockPrivateIPs: true,
    
    // Block localhost in production
    blockLocalhostInProduction: true,
  },
  
  // Content Security Policy - Enhanced Security Configuration
  csp: {
    // Development CSP (more permissive for hot reload)
    development: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Development only
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'img-src': [
        "'self'", 
        'data:', 
        'blob:',
        'https://images.unsplash.com',
        'https://api.goodlist2.chaninkrew.com'
         
      ],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'connect-src': [
        "'self'",
        'https://api.goodlist2.chaninkrew.com',
        "ws://localhost:*",
        "http://localhost:*",
        "https://localhost:*",
        "ws://127.0.0.1:*",
        "http://127.0.0.1:*",
        "https://127.0.0.1:*"
      ],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"], // Fix: Added missing form-action directive
      'frame-ancestors': ["'none'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'", "blob:"],
      'child-src': ["'self'", "blob:"],
      'manifest-src': ["'self'"],
    },
    
    // Production CSP (strict security)
    production: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'strict-dynamic'"], // Nonce will be added dynamically
      'style-src': [
        "'self'", 
        "https://fonts.googleapis.com",
        "'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk='", // Known inline style hash
        "'sha256-1OjyRYLAOH1vhXLUN4bBHal0rWxuwBDBP220NNc0CNU='" // Another inline style hash
      ], // Hash will be added dynamically
      'img-src': [
        "'self'", 
        'data:', 
        'blob:',
        'https://images.unsplash.com',
        'https://api.goodlist2.chaninkrew.com'
      ],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'connect-src': [
        "'self'",
        'https://api.goodlist.chaninkrew.com',
        'https://api.goodlist2.chaninkrew.com'
      ],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"], // Fix: Added missing form-action directive
      'frame-ancestors': ["'none'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'", "blob:"],
      'child-src': ["'self'", "blob:"],
      'manifest-src': ["'self'"],
    }
  },
  
  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  
  // Suspicious User Agent patterns
  suspiciousPatterns: [
    /curl/i,
    /wget/i,
    /python/i,
    /scanner/i,
    /bot/i,
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
  ],
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CSRF Protection
  csrf: {
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    cookieName: '__Host-csrf-token',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    },
  },
  
  // File upload restrictions
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
  },
  
  // Path validation rules
  pathValidation: {
    // Blocked path patterns
    blockedPatterns: [
      /\.\./,           // Directory traversal
      /\/\//,           // Double slashes
      /^\/[^a-zA-Z]/,   // Absolute paths starting with non-letter
      /:\/\//,          // Protocol schemes
      /\0/,             // Null bytes
      /[<>"|*?]/,       // Invalid filename characters
    ],
    
    // Allowed path pattern
    allowedPattern: /^[a-zA-Z0-9._/-]+$/,
    
    // Maximum path length
    maxLength: 255,
  },
};

// Helper function to generate CSP string from directives
export const generateCSPString = (directives: Record<string, string[]>): string => {
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Helper function to get environment-appropriate CSP
export const getCSPDirectives = (isDevelopment: boolean = false): Record<string, string[]> => {
  return isDevelopment ? SECURITY_CONFIG.csp.development : SECURITY_CONFIG.csp.production;
};

// Enhanced nonce generator
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Check if a user agent is suspicious
 */
export function isSuspiciousUserAgent(userAgent: string): boolean {
  return SECURITY_CONFIG.suspiciousPatterns.some(pattern => 
    pattern.test(userAgent)
  );
}

/**
 * Validate if a domain is allowed
 */
export function isDomainAllowed(domain: string): boolean {
  return SECURITY_CONFIG.ssrf.allowedDomains.some(allowedDomain => 
    domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );
}

/**
 * Get environment-specific security settings
 */
export function getEnvironmentSecuritySettings() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    allowLocalhost: isDevelopment,
    allowPrivateIPs: isDevelopment,
    strictCSP: !isDevelopment,
    enableDetailedLogging: isDevelopment,
  };
} 