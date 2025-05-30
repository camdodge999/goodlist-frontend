// Utility functions for markdown processing

export interface MarkdownImage {
  src: string;
  alt: string;
  title?: string;
}

/**
 * Extract images from markdown content
 * Supports both ![alt](src) and ![alt](src "title") formats
 */
export function extractImagesFromMarkdown(content: string): MarkdownImage[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
  const images: MarkdownImage[] = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2],
      title: match[3] || undefined
    });
  }

  return images;
}

/**
 * Get the first image from markdown content (typically the hero image)
 */
export function getFirstImageFromMarkdown(content: string): MarkdownImage | null {
  const images = extractImagesFromMarkdown(content);
  return images.length > 0 ? images[0] : null;
}

/**
 * Remove markdown images from content (useful for excerpts)
 */
export function removeImagesFromMarkdown(content: string): string {
  return content.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g, '');
}

/**
 * Extract plain text from markdown (remove all markdown formatting)
 */
export function extractPlainTextFromMarkdown(content: string): string {
  return content
    // Remove images
    .replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Generate a clean excerpt from markdown content
 */
export function generateExcerptFromMarkdown(content: string, maxLength: number = 200): string {
  const plainText = extractPlainTextFromMarkdown(content);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last complete sentence within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // If no good sentence break, find last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
} 