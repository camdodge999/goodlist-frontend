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
export function formatDate(dateString: string, locale: string = 'en-US'): string {
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



