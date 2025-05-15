import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a readable format
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
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