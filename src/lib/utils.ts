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
      console.error('Failed to fetch authenticated image:', response.statusText);
      return '';
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching authenticated image:', error);
    return '';
  }
} 



