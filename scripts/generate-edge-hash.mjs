#!/usr/bin/env node

/**
 * Edge Runtime Compatible CSP Hash Generator
 * Generate SHA256 hashes using Web Crypto API (same as Edge Runtime)
 * 
 * Usage:
 *   node scripts/generate-edge-hash.mjs "your inline content here"
 *   node scripts/generate-edge-hash.mjs --file path/to/file.css
 *   node scripts/generate-edge-hash.mjs --interactive
 *   node scripts/generate-edge-hash.mjs --common
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate SHA256 hash using Web Crypto API (Edge Runtime compatible)
 */
async function generateHashEdge(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert to base64 manually (same as Edge Runtime)
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  
  const base64Hash = btoa(binary);
  return `'sha256-${base64Hash}'`;
}

/**
 * Display hash result
 */
function displayResult(content, hash, type = 'inline') {
  console.log('\n🔑 Edge Runtime Compatible CSP Hash Generated');
  console.log('═'.repeat(60));
  console.log(`Content Type: ${type}`);
  console.log(`Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  console.log(`Content Length: ${content.length} characters`);
  console.log(`SHA256 Hash: ${hash}`);
  console.log('═'.repeat(60));
  console.log('\n📋 Add to your CSP policy:');
  console.log(`style-src 'self' 'nonce-{nonce}' ${hash};`);
  console.log('\n🛠️  Add to middleware STATIC_STYLE_HASHES:');
  console.log(`  "${hash}", // ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
  console.log('\n🔧 Edge Runtime Compatible ✅');
  console.log('');
}

/**
 * Interactive mode
 */
async function interactiveMode() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🎯 Interactive Edge Runtime CSP Hash Generator');
  console.log('Type your inline CSS/JS content (press Enter twice to finish):');
  console.log('');

  let content = '';
  let emptyLines = 0;

  rl.on('line', (line) => {
    if (line.trim() === '') {
      emptyLines++;
      if (emptyLines >= 2) {
        rl.close();
        return;
      }
    } else {
      emptyLines = 0;
      content += line + '\n';
    }
  });

  rl.on('close', async () => {
    if (content.trim()) {
      const hash = await generateHashEdge(content.trim());
      displayResult(content.trim(), hash, 'interactive');
    } else {
      console.log('❌ No content provided');
    }
  });
}

/**
 * Process file content
 */
async function processFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf8');
    const hash = await generateHashEdge(content);
    displayResult(content, hash, `file: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Generate hashes for common patterns (Edge Runtime compatible)
 */
async function generateCommonHashes() {
  const commonPatterns = {
    'display: none;': 'Hide elements',
    'visibility: hidden;': 'Hide elements but keep space',
    'opacity: 0;': 'Transparent elements',
    'opacity: 1;': 'Fully visible elements',
    'position: relative;': 'Relative positioning',
    'position: absolute;': 'Absolute positioning',
    'position: fixed;': 'Fixed positioning',
    'transform: translateX(-100%);': 'Slide left animation',
    'transform: translateX(100%);': 'Slide right animation',
    '': 'Empty style tag',
  };

  console.log('🎨 Common CSS Pattern Hashes (Edge Runtime Compatible)');
  console.log('═'.repeat(70));
  
  const hashes = [];
  
  for (const [css, description] of Object.entries(commonPatterns)) {
    const hash = await generateHashEdge(css);
    console.log(`\n${description}:`);
    console.log(`CSS: ${css || '(empty)'}`);
    console.log(`Hash: ${hash}`);
    hashes.push({ css, hash, description });
  }

  console.log('\n📝 Ready-to-use array for middleware (Edge Runtime Compatible):');
  console.log('const STATIC_STYLE_HASHES = [');
  hashes.forEach(({ css, hash }) => {
    console.log(`  "${hash}", // ${css || '(empty)'}`);
  });
  console.log('];');
  
  console.log('\n🔧 Edge Runtime Compatible ✅');
  console.log('These hashes are generated using the same Web Crypto API as your middleware!');
}

/**
 * Verify hash compatibility with Edge Runtime
 */
async function verifyEdgeCompatibility(content) {
  try {
    const hash = await generateHashEdge(content);
    
    console.log('\n✅ Edge Runtime Compatibility Verified');
    console.log('═'.repeat(50));
    console.log(`✅ Web Crypto API: Available`);
    console.log(`✅ TextEncoder: Available`);
    console.log(`✅ crypto.subtle.digest: Working`);
    console.log(`✅ Base64 encoding: Working`);
    console.log(`✅ Generated hash: ${hash}`);
    console.log('');
    console.log('This hash will work in your Next.js Edge Runtime middleware! 🚀');
    
    return hash;
  } catch (error) {
    console.error('❌ Edge Runtime Compatibility Error:', error.message);
    process.exit(1);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🔒 Edge Runtime Compatible CSP Hash Generator

Usage:
  node scripts/generate-edge-hash.mjs "your inline content"
  node scripts/generate-edge-hash.mjs --file path/to/file.css
  node scripts/generate-edge-hash.mjs --interactive
  node scripts/generate-edge-hash.mjs --common
  node scripts/generate-edge-hash.mjs --verify "content"
  node scripts/generate-edge-hash.mjs --help

Examples:
  # Generate hash for inline style (Edge Runtime compatible)
  node scripts/generate-edge-hash.mjs "display: none;"
  
  # Generate hash for CSS file
  node scripts/generate-edge-hash.mjs --file src/styles/critical.css
  
  # Interactive mode
  node scripts/generate-edge-hash.mjs --interactive
  
  # Generate common pattern hashes
  node scripts/generate-edge-hash.mjs --common
  
  # Verify Edge Runtime compatibility
  node scripts/generate-edge-hash.mjs --verify "test content"

Features:
  ✅ Uses Web Crypto API (same as Next.js Edge Runtime)
  ✅ Compatible with middleware constraints
  ✅ Generates identical hashes to production
  ✅ No Node.js crypto dependencies
  ✅ Ready for Edge Runtime deployment

Options:
  --file       Generate hash for file content
  --interactive Enter interactive mode
  --common     Generate hashes for common CSS patterns
  --verify     Verify Edge Runtime compatibility
  --help       Show this help message
`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--interactive')) {
    await interactiveMode();
    return;
  }

  if (args.includes('--common')) {
    await generateCommonHashes();
    return;
  }

  if (args.includes('--verify')) {
    const verifyIndex = args.indexOf('--verify');
    const content = args[verifyIndex + 1] || 'test content';
    await verifyEdgeCompatibility(content);
    return;
  }

  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ Please provide a file path after --file');
      process.exit(1);
    }
    await processFile(filePath);
    return;
  }

  // Direct content input
  const content = args.join(' ');
  if (content) {
    const hash = await generateHashEdge(content);
    displayResult(content, hash, 'command line');
    
    // Also verify compatibility
    console.log('🔧 Verifying Edge Runtime compatibility...');
    await verifyEdgeCompatibility(content);
  } else {
    console.error('❌ Please provide content to hash');
    showHelp();
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
}); 