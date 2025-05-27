/**
 * Formats a date string into a more readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
} 