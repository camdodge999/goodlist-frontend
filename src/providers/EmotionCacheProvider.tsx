"use client";

import { ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

interface EmotionCacheProviderProps {
  children: ReactNode;
  nonce?: string | null;
}

/**
 * Emotion CacheProvider with CSP nonce support
 * Based on: https://centralcsp.com/articles/how-to-setup-nonce-with-nextjs
 * 
 * This provider ensures all Emotion-generated styles are properly nonced
 * for Content Security Policy compliance.
 */
export function EmotionCacheProvider({ children, nonce }: EmotionCacheProviderProps) {
  // Create Emotion cache with nonce for CSP compliance
  // Only include nonce if it's available and truthy
  const cache = createCache({ 
    key: 'css',
    // Only add nonce if it exists - this prevents undefined from being passed
    ...(nonce ? { nonce } : {})
  });

  // Log cache configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 Emotion Cache Configuration:', {
      hasNonce: !!nonce,
      noncePreview: nonce ? `${nonce.substring(0, 8)}...` : 'none',
      cacheKey: cache.key,
    });
  }

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
} 