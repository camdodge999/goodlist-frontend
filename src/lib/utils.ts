import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs";
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a readable format
 */
export function formatDate(dateString: string): string {
  return dayjs(dateString).locale('th').format('DD/MM/BBBB HH:mm');
}

/**
* Generates a proper image URL for authentication handling
* 
* @param imageUrl The original image URL/path
* @returns Proper formatted URL to fetch the image with authentication
*/
export function getAuthenticatedImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';

  return `/api/images/uploads?path=${encodeURIComponent(imageUrl)}`;
}

/**
* Fetches an authenticated image and returns a blob URL
* 
* @param imageUrl The original image URL/path
* @param bearerToken The Bearer token for authentication
* @returns Promise that resolves to a blob URL for the authenticated image
*/
export async function fetchAuthenticatedImageBlob(
  imageUrl: string | null | undefined, 
  bearerToken?: string
): Promise<string> {
  if (!imageUrl) return '';

  try {
    const response = await fetch(`/api/images/uploads?path=${encodeURIComponent(imageUrl)}`, {
      headers: bearerToken ? {
        'Authorization': `Bearer ${bearerToken}`
      } : {}
    });

    if (!response.ok) {
      return '';
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

/**
 * CSP and Route Type Utilities
 */

/**
 * Creates safe CSS custom properties for dynamic styling in static routes
 * Usage: <div style={createSafeCSSProps({ color: '#ff0000', size: '16px' })}>
 */
export function createSafeCSSProps(properties: Record<string, string>): React.CSSProperties {
  const cssProps: React.CSSProperties = {};
  
  Object.entries(properties).forEach(([key, value]) => {
    // Convert camelCase to CSS custom property format
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    (cssProps as Record<string, string>)[cssVar] = value;
  });
  
  return cssProps;
}

/**
 * Generates a CSS class name based on dynamic values (safe for static routes)
 * Usage: <div className={generateSafeClassName('btn', { variant: 'primary', size: 'lg' })}>
 */
export function generateSafeClassName(base: string, modifiers: Record<string, string | boolean>): string {
  const classes = [base];
  
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value === true) {
      classes.push(`${base}--${key}`);
    } else if (typeof value === 'string' && value !== '') {
      classes.push(`${base}--${key}-${value}`);
    }
  });
  
  return classes.join(' ');
}

/**
 * Creates responsive breakpoint utilities that work with CSP
 * Usage: const breakpoints = createResponsiveCSS({ sm: '640px', md: '768px' });
 */
export function createResponsiveCSS(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([name, width]) => `@media (min-width: ${width}) { .responsive-${name} { display: block; } }`)
    .join('\n');
}

/**
 * Safe inline style generator that falls back to CSS classes
 * Usage: const styles = createConditionalStyles(canUseInline, { color: 'red' });
 */
export function createConditionalStyles(
  canUseInline: boolean, 
  styles: Record<string, string>
): { 
  inlineStyles?: React.CSSProperties; 
  cssVars?: React.CSSProperties; 
  className?: string; 
} {
  if (canUseInline) {
    return { 
      inlineStyles: styles as React.CSSProperties 
    };
  }
  
  // For static routes, use CSS custom properties
  return {
    cssVars: createSafeCSSProps(styles),
    className: 'dynamic-styles-fallback'
  };
}

/**
 * Validates if a string is safe for CSS injection (basic security check)
 */
export function isSafeCSS(css: string): boolean {
  // Basic checks for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /expression\(/i,
    /import\s+/i,
    /@import/i,
    /behavior:/i,
    /binding:/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(css));
}

/**
 * Sanitizes CSS content for safe inline usage
 */
export function sanitizeCSS(css: string): string {
  // Remove potentially dangerous content
  return css
    .replace(/<script.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\([^)]*\)/gi, '')
    .replace(/@import[^;]+;/gi, '')
    .replace(/behavior:[^;]+;/gi, '')
    .replace(/binding:[^;]+;/gi, '')
    .trim();
}



