"use client";

import React, { useEffect } from 'react';
import { motion as framerMotion, AnimatePresence as FramerAnimatePresence } from 'framer-motion';

/**
 * CSP-compatible Framer Motion configuration
 * Following the blog post approach for nonce-based CSP compliance
 */

// Configure Framer Motion to use nonces by setting up the global nonce
function configureFramerMotionCSP() {
  if (typeof window !== 'undefined') {
    // Check if webpack nonce is available (set by our layout)
    const nonce = window.__webpack_nonce__;
    
    if (nonce) {
      // Configure Framer Motion's internal style injection to use nonce
      // This follows the same pattern as the blog post's styled-components setup
      const originalCreateElement = document.createElement;
      
      document.createElement = function(tagName: string, options?: ElementCreationOptions) {
        const element = originalCreateElement.call(this, tagName, options);
        
        // Add nonce to any style elements created by Framer Motion
        if (tagName.toLowerCase() === 'style' && nonce) {
          element.setAttribute('nonce', nonce);
        }
        
        return element;
      };
    }
  }
}

// Component to initialize CSP configuration
export function MotionCSPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureFramerMotionCSP();
  }, []);
  
  return <>{children}</>;
}

// Type augmentation for window.__webpack_nonce__
declare global {
  interface Window {
    __webpack_nonce__?: string;
  }
}

// Re-export motion components with CSP initialization
export const motion = framerMotion;
export const AnimatePresence = FramerAnimatePresence;

// Hook to check if animations should be used
export function useMotionSafe(): boolean {
  // In development, always allow animations
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, check if nonce is available
  if (typeof window !== 'undefined') {
    return !!window.__webpack_nonce__;
  }
  
  return false;
}

export default motion; 