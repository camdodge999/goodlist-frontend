#!/usr/bin/env node

/**
 * Capture Inline Styles Script
 * Analyzes the built Next.js application to find inline styles
 * and generates proper CSP hashes for them
 * 
 * Run this script after building your application:
 * npm run build
 * node scripts/capture-inline-styles.mjs
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, '.next');
const cspUtilsPath = path.join(projectRoot, 'src/lib/csp-utils.ts');

// Common inline styles that Next.js might generate
const NEXTJS_COMMON_STYLES = [
  'display:none',
  'display: none',
  'position:absolute',
  'position: absolute',
  'position:relative',
  'position: relative',
  'position:fixed',
  'position: fixed',
  'opacity:0',
  'opacity: 0',
  'opacity:1',
  'opacity: 1',
  'visibility:hidden',
  'visibility: hidden',
  'visibility:visible',
  'visibility: visible',
  'transform:translateX(-100%)',
  'transform: translateX(-100%)',
  'transform:translateX(100%)',
  'transform: translateX(100%)',
  'transform:translateY(-100%)',
  'transform: translateY(-100%)',
  'transform:translateY(100%)',
  'transform: translateY(100%)',
  // Tailwind-generated styles
  'pointer-events:none',
  'pointer-events: none',
  'z-index:9999',
  'z-index: 9999',
];

// Generate SHA-256 hash for content
function generateSHA256Hash(content) {
  const hash = crypto.createHash('sha256').update(content.trim(), 'utf8').digest('base64');
  return `'sha256-${hash}'`;
}

// Find inline styles in HTML content
function findInlineStyles(htmlContent) {
  const inlineStyles = new Set();
  
  // Regex patterns to find inline styles
  const patterns = [
    // style attribute: style="content"
    /style\s*=\s*["']([^"']+)["']/g,
    // style tag: <style>content</style>
    /<style[^>]*>([^<]+)<\/style>/g,
    // style tag with nonce: <style nonce="...">content</style>
    /<style[^>]*nonce="[^"]*"[^>]*>([^<]+)<\/style>/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      const styleContent = match[1].trim();
      if (styleContent && styleContent.length > 0) {
        inlineStyles.add(styleContent);
      }
    }
  });
  
  return Array.from(inlineStyles);
}

// Analyze built files for inline styles
function analyzeBuiltFiles() {
  const inlineStyles = new Set();
  
  // Add common Next.js styles
  NEXTJS_COMMON_STYLES.forEach(style => inlineStyles.add(style));
  
  try {
    // Look for HTML files in .next directory
    const serverDir = path.join(buildDir, 'server');
    const staticDir = path.join(buildDir, 'static');
    
    if (fs.existsSync(serverDir)) {
      analyzeDirectory(serverDir, inlineStyles);
    }
    
    if (fs.existsSync(staticDir)) {
      analyzeDirectory(staticDir, inlineStyles);
    }
    
  } catch (error) {
    console.warn('⚠️  Could not analyze built files:', error.message);
    console.log('💡 Make sure to run "npm run build" first');
  }
  
  return Array.from(inlineStyles);
}

// Recursively analyze directory for HTML/JS files
function analyzeDirectory(dir, inlineStyles) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath, inlineStyles);
      } else if (file.endsWith('.html') || file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const styles = findInlineStyles(content);
          styles.forEach(style => inlineStyles.add(style));
        } catch (err) {
          // Skip files that can't be read
        }
      }
    });
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Generate hashes for all found styles
function generateHashesForStyles(styles) {
  const hashes = new Map();
  
  styles.forEach(style => {
    const hash = generateSHA256Hash(style);
    hashes.set(style, hash);
  });
  
  return hashes;
}

// Update CSP utils file with new hashes
function updateCSPUtilsFile(hashMap) {
  try {
    let content = fs.readFileSync(cspUtilsPath, 'utf8');
    
    // Find the essentialHashes array
    const essentialHashesStart = content.indexOf('const essentialHashes = [');
    if (essentialHashesStart === -1) {
      console.error('❌ Could not find essentialHashes array in csp-utils.ts');
      return;
    }
    
    const essentialHashesEnd = content.indexOf('];', essentialHashesStart);
    if (essentialHashesEnd === -1) {
      console.error('❌ Could not find end of essentialHashes array');
      return;
    }
    
    // Generate new hash array content
    const newHashes = Array.from(hashMap.values()).map(hash => 
      `      ${hash}, // Generated from actual inline styles`
    ).join('\n');
    
    // Replace the array content
    const beforeArray = content.substring(0, essentialHashesStart);
    const afterArray = content.substring(essentialHashesEnd + 2);
    
    const newContent = beforeArray + 
      'const essentialHashes = [\n' +
      '      // Generated hashes from actual inline styles\n' +
      newHashes + '\n' +
      '    ]' + 
      afterArray;
    
    fs.writeFileSync(cspUtilsPath, newContent);
    console.log('✅ Updated CSP utils file with generated hashes');
    
  } catch (error) {
    console.error('❌ Error updating CSP utils file:', error.message);
  }
}

// Main function
function main() {
  console.log('🔍 Analyzing built application for inline styles...');
  console.log('================================================');
  
  // Check if build exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Analyze for inline styles
  const inlineStyles = analyzeBuiltFiles();
  console.log(`📊 Found ${inlineStyles.length} potential inline styles`);
  
  if (inlineStyles.length === 0) {
    console.log('✅ No inline styles found - good CSP hygiene!');
    return;
  }
  
  // Generate hashes
  console.log('\n🔑 Generating CSP hashes...');
  const hashMap = generateHashesForStyles(inlineStyles);
  
  // Display results
  console.log('\n📋 Generated CSP Hashes:');
  console.log('========================');
  hashMap.forEach((hash, style) => {
    console.log(`Style: "${style.substring(0, 50)}${style.length > 50 ? '...' : ''}"`);
    console.log(`Hash:  ${hash}`);
    console.log('---');
  });
  
  // Option to update CSP utils file
  console.log('\n🛠️  Update Options:');
  console.log('1. Automatic: Update csp-utils.ts with these hashes');
  console.log('2. Manual: Copy hashes and add them manually');
  
  // For now, just show the hashes - you can uncomment the next line to auto-update
  // updateCSPUtilsFile(hashMap);
  
  console.log('\n💡 To apply these hashes:');
  console.log('   1. Copy the hashes above');
  console.log('   2. Add them to the essentialHashes array in src/lib/csp-utils.ts');
  console.log('   3. Or use: node scripts/csp-hash-helper.mjs --add "hash-here"');
}

main(); 