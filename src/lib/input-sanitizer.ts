/**
 * Input sanitization utilities for form security
 * Prevents XSS, SQL injection, and other malicious input
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Remove potentially dangerous characters from input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, ''); // Keep only valid email characters
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+()-\s]/g, '').trim();
}

/**
 * Sanitize filename for uploads
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .slice(0, 255); // Limit length
}

/**
 * Check for SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/i,
    /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
    /'/,
    /;/,
    /--/,
    /\/\*/,
    /\*\//,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[^>]*=.*?>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation and sanitization
 */
export function validateAndSanitizeInput(
  input: string, 
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    type?: 'text' | 'email' | 'phone' | 'filename';
  } = {}
): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = input;
  
  // Check length
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength} characters`);
  }
  
  // Check for malicious patterns
  if (detectSQLInjection(input)) {
    errors.push('Potential SQL injection detected');
  }
  
  if (!options.allowHtml && detectXSS(input)) {
    errors.push('Potential XSS attack detected');
  }
  
  // Type-specific sanitization
  switch (options.type) {
    case 'email':
      sanitized = sanitizeEmail(input);
      break;
    case 'phone':
      sanitized = sanitizePhoneNumber(input);
      break;
    case 'filename':
      sanitized = sanitizeFilename(input);
      break;
    default:
      sanitized = options.allowHtml ? input : sanitizeInput(input);
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData(
  formData: Record<string, any>, 
  fieldConfig: Record<string, {
    maxLength?: number;
    allowHtml?: boolean;
    type?: 'text' | 'email' | 'phone' | 'filename';
    required?: boolean;
  }> = {}
): {
  isValid: boolean;
  sanitized: Record<string, any>;
  errors: Record<string, string[]>;
} {
  const sanitized: Record<string, any> = {};
  const errors: Record<string, string[]> = {};
  let isValid = true;
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      const config = fieldConfig[key] || {};
      const result = validateAndSanitizeInput(value, config);
      
      sanitized[key] = result.sanitized;
      
      if (!result.isValid) {
        errors[key] = result.errors;
        isValid = false;
      }
      
      // Check required fields
      if (config.required && !result.sanitized.trim()) {
        errors[key] = errors[key] || [];
        errors[key].push('This field is required');
        isValid = false;
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return {
    isValid,
    sanitized,
    errors
  };
} 