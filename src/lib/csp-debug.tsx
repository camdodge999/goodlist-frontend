"use client";

import React from 'react';

/**
 * CSP Debug Component
 * Helps verify that nonce implementation is working correctly
 * Following the blog post's debugging approach
 */

interface CSPDebugProps {
  showInProduction?: boolean;
}

export function CSPDebugInfo({ showInProduction = false }: CSPDebugProps) {
  const [debugInfo, setDebugInfo] = React.useState<{
    hasWebpackNonce: boolean;
    webpackNonce?: string;
    hasScriptNonces: boolean;
    hasStyleNonces: boolean;
    cspPolicyPresent: boolean;
    cspViolations: string[];
  } | null>(null);

  React.useEffect(() => {
    // Check for webpack nonce
    const hasWebpackNonce = !!(window as any).__webpack_nonce__;
    const webpackNonce = (window as any).__webpack_nonce__;
    
    // Check for nonces in DOM
    const scriptsWithNonce = document.querySelectorAll('script[nonce]');
    const stylesWithNonce = document.querySelectorAll('style[nonce]');
    
    // Check for CSP header
    const cspPolicyPresent = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    
    // Track CSP violations
    const violations: string[] = [];
    
    const violationHandler = (event: SecurityPolicyViolationEvent) => {
      violations.push(`${event.violatedDirective}: ${event.blockedURI || event.sourceFile}`);
    };
    
    document.addEventListener('securitypolicyviolation', violationHandler);
    
    setDebugInfo({
      hasWebpackNonce,
      webpackNonce: webpackNonce ? `${webpackNonce.substring(0, 8)}...` : undefined,
      hasScriptNonces: scriptsWithNonce.length > 0,
      hasStyleNonces: stylesWithNonce.length > 0,
      cspPolicyPresent,
      cspViolations: violations
    });
    
    return () => {
      document.removeEventListener('securitypolicyviolation', violationHandler);
    };
  }, []);

  // Only show in development unless explicitly requested
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 text-sm">Loading CSP debug info...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border border-gray-300 rounded-lg shadow-lg text-xs font-mono max-w-sm z-[9999]">
      <h3 className="font-bold mb-2">🔒 CSP Debug Info</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Webpack Nonce:</span>
          <span className={debugInfo.hasWebpackNonce ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.hasWebpackNonce ? `✓ ${debugInfo.webpackNonce}` : '✗ Missing'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Script Nonces:</span>
          <span className={debugInfo.hasScriptNonces ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.hasScriptNonces ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Style Nonces:</span>
          <span className={debugInfo.hasStyleNonces ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.hasStyleNonces ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>CSP Policy:</span>
          <span className={debugInfo.cspPolicyPresent ? 'text-green-600' : 'text-yellow-600'}>
            {debugInfo.cspPolicyPresent ? '✓ Meta Tag' : '⚠ Headers Only'}
          </span>
        </div>
      </div>
      
      {debugInfo.cspViolations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-red-600 font-bold">CSP Violations:</div>
          {debugInfo.cspViolations.slice(0, 3).map((violation, i) => (
            <div key={i} className="text-red-500 text-xs truncate">
              {violation}
            </div>
          ))}
          {debugInfo.cspViolations.length > 3 && (
            <div className="text-gray-500">...and {debugInfo.cspViolations.length - 3} more</div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to test inline styles
export function testInlineStyle(content: string) {
  const style = document.createElement('style');
  style.textContent = content;
  
  // Try to add nonce if available
  const nonce = (window as any).__webpack_nonce__;
  if (nonce) {
    style.setAttribute('nonce', nonce);
  }
  
  document.head.appendChild(style);
  
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
  
  console.log('🔍 Testing inline style:', content);
  console.log('🔐 Using nonce:', nonce ? `${nonce.substring(0, 8)}...` : 'No nonce');
}

// Console logging utility
export function logCSPStatus() {
  console.log('🔒 CSP Status Check');
  console.log('==================');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Webpack Nonce:', (window as any).__webpack_nonce__ ? '✓ Available' : '✗ Missing');
  console.log('Scripts with nonce:', document.querySelectorAll('script[nonce]').length);
  console.log('Styles with nonce:', document.querySelectorAll('style[nonce]').length);
  
  // Test if we can create a style element
  testInlineStyle('body { --csp-test: working; }');
} 