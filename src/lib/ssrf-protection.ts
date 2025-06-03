import { URL } from 'url';

// Define allowed domains and IP ranges
const ALLOWED_DOMAINS = [
  'api.goodlist.chaninkrew.com',
  'api.goodlist2.chaninkrew.com',
  'images.unsplash.com',
  // Add your trusted domains here
];

const ALLOWED_LOCALHOST_PORTS = [3000, 4200]; // Only specific localhost ports

// Private IP ranges to block (RFC 1918, RFC 3927, etc.)
const PRIVATE_IP_RANGES = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^127\./,                   // 127.0.0.0/8 (loopback)
  /^169\.254\./,              // 169.254.0.0/16 (link-local)
  /^0\./,                     // 0.0.0.0/8
  /^224\./,                   // 224.0.0.0/4 (multicast)
  /^240\./,                   // 240.0.0.0/4 (reserved)
];

// Blocked protocols
const BLOCKED_PROTOCOLS = ['file:', 'ftp:', 'gopher:', 'ldap:', 'dict:'];

export interface SSRFValidationOptions {
  allowLocalhost?: boolean;
  allowPrivateIPs?: boolean;
  maxRedirects?: number;
  timeout?: number;
  customAllowedDomains?: string[];
}

export class SSRFProtectionError extends Error {
  constructor(message: string, public readonly reason: string) {
    super(message);
    this.name = 'SSRFProtectionError';
  }
}

/**
 * Validates if a URL is safe from SSRF attacks
 */
export function validateURL(
  urlString: string, 
  options: SSRFValidationOptions = {}
): { isValid: boolean; error?: string; normalizedUrl?: string } {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
      return {
        isValid: false,
        error: `Blocked protocol: ${url.protocol}`
      };
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: `Invalid protocol: ${url.protocol}. Only HTTP/HTTPS allowed.`
      };
    }
    
    // Check for localhost
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      if (!options.allowLocalhost) {
        return {
          isValid: false,
          error: 'Localhost access is not allowed'
        };
      }
      
      // If localhost is allowed, check port restrictions
      const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      if (!ALLOWED_LOCALHOST_PORTS.includes(port)) {
        return {
          isValid: false,
          error: `Localhost port ${port} is not allowed`
        };
      }
    }
    
    // Check for private IP ranges
    if (!options.allowPrivateIPs) {
      for (const range of PRIVATE_IP_RANGES) {
        if (range.test(url.hostname)) {
          return {
            isValid: false,
            error: `Private IP address not allowed: ${url.hostname}`
          };
        }
      }
    }
    
    // Check domain allowlist
    const allowedDomains = [...ALLOWED_DOMAINS, ...(options.customAllowedDomains || [])];
    const isAllowedDomain = allowedDomains.some(domain => {
      return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
    });
    
    if (!isAllowedDomain && !options.allowLocalhost) {
      return {
        isValid: false,
        error: `Domain not in allowlist: ${url.hostname}`
      };
    }
    
    return {
      isValid: true,
      normalizedUrl: url.toString()
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates and sanitizes a path parameter to prevent directory traversal and SSRF
 */
export function validatePath(path: string): { isValid: boolean; error?: string; sanitizedPath?: string } {
  // Remove any null bytes
  const cleanPath = path.replace(/\0/g, '');
  
  // Check for directory traversal attempts
  if (cleanPath.includes('..') || cleanPath.includes('//')) {
    return {
      isValid: false,
      error: 'Path traversal detected'
    };
  }
  
  // Check for absolute paths or protocol schemes
  if (cleanPath.startsWith('/') || cleanPath.includes('://')) {
    return {
      isValid: false,
      error: 'Absolute paths and URLs not allowed in path parameter'
    };
  }
  
  // Only allow alphanumeric, hyphens, underscores, dots, and forward slashes and backslashes
  if (!/^[a-zA-Z0-9._/\\-]+$/.test(cleanPath)) { 
    return {
      isValid: false,
      error: 'Invalid characters in path'
    };
  }
  
  return {
    isValid: true,
    sanitizedPath: cleanPath
  };
}

/**
 * Creates a secure fetch wrapper with SSRF protection
 */
export async function secureFetch(
  url: string,
  options: RequestInit & SSRFValidationOptions = {}
): Promise<Response> {
  const { allowLocalhost, allowPrivateIPs, maxRedirects = 0, timeout = 10000, customAllowedDomains, ...fetchOptions } = options;
  
  // Validate URL
  const validation = validateURL(url, { allowLocalhost, allowPrivateIPs, customAllowedDomains });
  if (!validation.isValid) {
    throw new SSRFProtectionError(`SSRF Protection: ${validation.error}`, 'URL_VALIDATION_FAILED');
  }
  
  // Set timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(validation.normalizedUrl!, {
      ...fetchOptions,
      signal: controller.signal,
      redirect: maxRedirects > 0 ? 'follow' : 'manual'
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SSRFProtectionError('Request timeout', 'TIMEOUT');
    }
    throw error;
  }
}

/**
 * Validates environment variable URLs at startup
 */
export function validateEnvironmentURLs(): void {
  const urlsToCheck = [
    { name: 'NEXTAUTH_URL ', value: process.env.NEXTAUTH_URL  },
    { name: 'NEXTAUTH_BACKEND_URL', value: process.env.NEXTAUTH_BACKEND_URL },
  ];
  
  for (const { name, value } of urlsToCheck) {
    if (value) {
      const validation = validateURL(value, { allowLocalhost: true });
      if (!validation.isValid) {
        console.warn(`⚠️  Environment variable ${name} contains potentially unsafe URL: ${validation.error}`);
      }
    }
  }
} 