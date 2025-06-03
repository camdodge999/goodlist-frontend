#!/usr/bin/env node

/**
 * Generate proper SHA-256 hashes for inline styles
 * Run this script to get correct CSP hashes
 */

import crypto from 'crypto';

// Common inline styles that need to be hashed for CSP
const COMMON_INLINE_STYLES = {
  // Tailwind CSS utilities that might be inlined
  hiddenStyle: 'display: none;',
  loadingSpinner: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `,
  // Add more common styles as needed
};

// Generate SHA-256 hash for content
function generateSHA256Hash(content) {
  const hash = crypto.createHash('sha256').update(content.trim(), 'utf8').digest('base64');
  return `'sha256-${hash}'`;
}

console.log('Generating proper SHA-256 hashes for common inline styles:');
console.log('========================================================');

for (const [key, style] of Object.entries(COMMON_INLINE_STYLES)) {
  const hash = generateSHA256Hash(style);
  console.log(`${key}: ${hash},`);
}

console.log('========================================================');
console.log('Copy these hashes to KNOWN_STYLE_HASHES array in src/lib/csp-utils.ts');

// Also generate hashes for common Tailwind utilities
const commonTailwindStyles = [
  'display: none;',
  'position: relative;',
  'position: absolute;',
  'position: fixed;',
  'opacity: 0;',
  'opacity: 1;',
  'transform: translateX(-100%);',
  'transform: translateX(100%);',
  'transform: translateY(-100%);',
  'transform: translateY(100%);',
];

console.log('\nCommon Tailwind utility hashes:');
console.log('===============================');

for (const style of commonTailwindStyles) {
  const hash = generateSHA256Hash(style);
  console.log(`"${style}": ${hash},`);
} 