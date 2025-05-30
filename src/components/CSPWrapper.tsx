'use client';

import React, { useEffect } from 'react';
import { useNonce } from '@/lib/nonce';

interface CSPWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CSP Wrapper component that ensures all dynamically created style and script elements
 * have the proper nonce attribute for CSP compliance
 */
export function CSPWrapper({ children, className }: CSPWrapperProps) {
  const nonce = useNonce();

  useEffect(() => {
    if (!nonce) return;

    // Function to add nonce to dynamically created elements
    const addNonceToElements = () => {
      // Add nonce to any style elements without it
      const styleElements = document.querySelectorAll('style:not([nonce])');
      styleElements.forEach((element) => {
        element.setAttribute('nonce', nonce);
      });

      // Add nonce to any script elements without it (excluding external scripts)
      const scriptElements = document.querySelectorAll('script:not([nonce]):not([src])');
      scriptElements.forEach((element) => {
        element.setAttribute('nonce', nonce);
      });
    };

    // Run immediately
    addNonceToElements();

    // Set up a MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is a style or script tag
            if (element.tagName === 'STYLE' && !element.hasAttribute('nonce')) {
              element.setAttribute('nonce', nonce);
            } else if (element.tagName === 'SCRIPT' && !element.hasAttribute('nonce') && !element.hasAttribute('src')) {
              element.setAttribute('nonce', nonce);
            }
            
            // Check for style or script elements within the added element
            const styleElements = element.querySelectorAll?.('style:not([nonce])');
            styleElements?.forEach((styleEl) => {
              styleEl.setAttribute('nonce', nonce);
            });
            
            const scriptElements = element.querySelectorAll?.('script:not([nonce]):not([src])');
            scriptElements?.forEach((scriptEl) => {
              scriptEl.setAttribute('nonce', nonce);
            });
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [nonce]);

  return (
    <div className={className}>
      {children}
    </div>
  );
} 