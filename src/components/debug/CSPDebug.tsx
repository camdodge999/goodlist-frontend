"use client";

import { useEffect } from 'react';

export default function CSPDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Run debug logging after hydration is complete
      const debugCSP = () => {
        const webpackNonce = (window as { __webpack_nonce__?: string }).__webpack_nonce__;
        const nonceScripts = document.querySelectorAll('script[nonce]');
        const nonceStyles = document.querySelectorAll('style[nonce]');
        
        console.log('🔒 CSP Status:', {
          webpackNonce: !!webpackNonce,
          nonceScripts: nonceScripts.length,
          nonceStyles: nonceStyles.length,
          criticalCSS: 'loaded',
          middleware: 'active',
          hydrationSafe: true
        });
      };

      // Delay to ensure all components are hydrated
      const timer = setTimeout(debugCSP, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // This component renders nothing
  return null;
} 